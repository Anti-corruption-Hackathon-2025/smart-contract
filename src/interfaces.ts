export interface Node {
  type: "husband" | "wife" | "children" | "sibling" | null;
  gender: "male" | "female";
  firstname: string;
  lastname: string;
  pinfl: number;
  children: Node[];
  parents: Node[];
}

export interface Person {
  name: string;
  pinfl: number;
}

export interface Organization {
  tin: number;
  creator: Person;
  address: string;
  cea: number;
  date: number;
}

export interface TenderItem {
  quantity: number;
  unit: string;
  categories: string[];
  price: number;
}

export interface Tender {
  lot_number: number;
  consumer: Organization;
  start_date: number;
  end_date: number;
  start_price: number;
  cea: number;
  items: TenderItem[];
}

export interface TenderPosition {
  organization: Organization;
  price: number;
}