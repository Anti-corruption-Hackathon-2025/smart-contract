/**
 * BASIC IMPLEMENTATION OF TENDER SYSTEM BASED ON BLOCKCHAIN FOR
 * ANTI-CORRUPTION HACKATHON 2025. ALL RIGHTS RESERVED.
 */

import shim from "fabric-shim";
import { Organization, Tender, TenderPosition } from "./interfaces";
import { TenderPositiontInterception } from "./interception";

class TenderChaincode implements shim.ChaincodeInterface {
  private _textEncoder = new TextEncoder();
  private _textDecoder = new TextDecoder();
  private _interception = new TenderPositiontInterception();

  /**
   * Serializes given data
   * 
   * @param data Data to be serialized
   * @returns Serialized data
   */
  private _SerializeData(data: any): Uint8Array {
    return this._textEncoder.encode(JSON.stringify(data));
  }

  private _DeserializeData<T = any>(data: Uint8Array): T {
    return JSON.parse(this._textDecoder.decode(data));
  }

  public async CreateTender(stub: shim.ChaincodeStub): Promise<shim.ChaincodeResponse> {
    const call = stub.getFunctionAndParameters();

    // TODO: validate the input before processing
    const tender = JSON.parse(call.params[0]) as Tender;

    // Construct tender hash
    const tenderCompositeKey = stub.createCompositeKey("tender", [String(tender["lot_number"])]);
    const existingTenderBytes = await stub.getState(tenderCompositeKey);

    // Prevent the tender from being created twice
    if (existingTenderBytes.length !== 0)
      return shim.error("Tender already exists with these parameters");

    const serializedTender = this._SerializeData(tender);

    // Save the tender
    await stub.putState(tenderCompositeKey, serializedTender);

    // Return the created tender
    return shim.success(serializedTender);
  }

  public async CreateTenderPosition(stub: shim.ChaincodeStub): Promise<shim.ChaincodeResponse> {
    const call = stub.getFunctionAndParameters();

    const tenderLotNumber = call.params[0];
    const organization = JSON.parse(call.params[1]) as Organization;
    const price = call.params[2];

    const tenderCompositeKey = stub.createCompositeKey("tender", [tenderLotNumber]);

    const targetTenderBytes = await stub.getState(tenderCompositeKey);
    if (targetTenderBytes.length === 0)
      return shim.error("Tender not found");

    const tender = this._DeserializeData<Tender>(targetTenderBytes);

    if (tender.consumer.address === organization.address)
      return shim.error("Tender organization address cannot be equal to participating organization address");

    const interceptionRoutes = this._interception.getInterceptionRoute(tender, organization);
    if (interceptionRoutes.length > 1)
      return shim.error("Tender organization intercepts with participating organization");

    const tenderPositionsCompositeKey = stub.createCompositeKey("tender-positions", [tenderLotNumber]);
    const tenderPositionsBytes = await stub.getState(tenderPositionsCompositeKey);
    const tenderPositions: TenderPosition[] = tenderPositionsBytes.length
      ? this._DeserializeData(tenderPositionsBytes)
      : [];

    const positionOrganizationsWithSameAddress = tenderPositions
        .filter((position) => position.organization.address === organization.address);

    if (positionOrganizationsWithSameAddress.length !== 0)
      return shim.error("Organization with the same address cannot participate");

    if (tender.cea !== organization.cea)
      return shim.error("Tender CEA does not match to organization CEA");

    const now = Date.now();
    const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;

    if ((now - organization.date) < thirtyDaysInMilliseconds)
      return shim.error("Tender participant organization date is less than 30 days")

    const position: TenderPosition = {organization, price: Number(price)};
    tenderPositions.push(position);

    await stub.putState(tenderPositionsCompositeKey, this._SerializeData(tenderPositions));

    return shim.success();
  }

  public async GetTender(stub: shim.ChaincodeStub) {
    const call = stub.getFunctionAndParameters();

    const tenderLotNumber = call.params[0];
    const tenderCompositeKey = stub.createCompositeKey("tender", [tenderLotNumber]);

    const targetTenderBytes = await stub.getState(tenderCompositeKey);
    if (targetTenderBytes.length === 0)
      return shim.error("Tender not found");

    return shim.success(targetTenderBytes);
  }

  public async GetTenders(stub: shim.ChaincodeStub) {
    const tendersIterator = await stub.getStateByPartialCompositeKey("tender", []);

    const tendersToReturn: Uint8Array[] = [];

    let currentTender;
    while ((currentTender = await tendersIterator.next())) {
      if (currentTender.done) break;
        tendersToReturn.push(this._DeserializeData(currentTender.value.value));
    }
         
    await tendersIterator.close()

    return shim.success(this._SerializeData(tendersToReturn));
  }

  public async GetTenderPositions(stub: shim.ChaincodeStub) {
    const call = stub.getFunctionAndParameters();

    const tenderLotNumber = call.params[0];

    const tenderPositionsCompositeKey = stub.createCompositeKey("tender-positions", [tenderLotNumber]);
    const tenderPositionsBytes = await stub.getState(tenderPositionsCompositeKey);

    if (tenderPositionsBytes.length === 0)
      return shim.success(this._SerializeData([]));

    return shim.success(tenderPositionsBytes);
  }

  public async Init(stub: shim.ChaincodeStub): Promise<shim.ChaincodeResponse> {
    return shim.success();
  }

  public async Invoke(stub: shim.ChaincodeStub): Promise<shim.ChaincodeResponse> {
    const call = stub.getFunctionAndParameters();

    switch (call.fcn) {
      case "CreateTender":
        return this.CreateTender(stub);
      case "CreateTenderPosition":
        return this.CreateTenderPosition(stub);
      case "GetTenders":
        return this.GetTenders(stub);
      case "GetTender":
        return this.GetTender(stub);
      case "GetTenderPositions":
        return this.GetTenderPositions(stub);
      default:
        return shim.error("Invalid method");
    }
  }
}

shim.start(new TenderChaincode());