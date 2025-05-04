import { Organization, Tender, Node } from "./interfaces";
import { nodes } from "./dummy";

export class TenderPositiontInterception {
  public findNodeByPINFL(pinfl: number): Node | null {
    const visited = new Set();
    const stack: Node[] = [...nodes];
  
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node || visited.has(node!.pinfl)) continue;
  
      if (node.pinfl === pinfl)
        return node;
  
      visited.add(node.pinfl);
  
      // Traverse both children and parents
      for (const neighbor of [...node.children, ...node.parents]) {
        if (!visited.has(neighbor.pinfl)) {
          stack.push(neighbor);
        }
      }
    }
  
    return null;
  }

  public getInterceptionRoute(tender: Tender, organization: Organization): Node[] {
    const startingPointNode = this.findNodeByPINFL(tender.consumer.creator.pinfl);
    const endingPointNode = this.findNodeByPINFL(organization.creator.pinfl);

    const queue = [[startingPointNode]];
    const visited = new Set();
  
    while (queue.length > 0) {
      const path = queue.shift();
      const node = path![path!.length - 1];
  
      if (node!.pinfl === endingPointNode!.pinfl)
        return path! as Node[];
  
      if (!visited.has(node!.pinfl)) {
        visited.add(node!.pinfl);
  
        for (const child of node!.children) {
          if (!visited.has(child.pinfl)) {
            queue.push([...path!, child]);
          }
        }
      }
    }
  
    return [];
  }
}

const interception = new TenderPositiontInterception();

const organization = { tin: 12345678901234, name: "Insurance Company", creator: {name: "Jasur Hasanov", pinfl: 77665544332212}, address: "Muminov Street 4AA", cea: 12345, date: 957415079000}
const tender = {"lot_number":59382741,"consumer":{"tin":12345678901234,"creator":{"name":"Aziz","pinfl":12345678901234},"address":"Muminov Street 4A","cea":10320,"date":1652026510000},"start_date":1746202510000,"end_date":1746720910000,"start_price":100000000,"cea":10320,"items":[{"quantity":500,"unit":"шт","categories":["computer"],"price":4000000}]}

console.log(interception.getInterceptionRoute(tender, organization))