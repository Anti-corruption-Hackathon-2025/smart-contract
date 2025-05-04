import { Node } from "./interfaces";

export const nodes: Node[] = [
  {
    type: null,
    gender: "male",
    firstname: "Aziz",
    lastname: "Nurmuhammedov",
    pinfl: 12345678901234,
    children: [
      {
        type: "sibling",
        gender: "male",
        firstname: "Jasur",
        lastname: "Hasanov",
        pinfl: 77665544332211,
        children: [],
        parents: []
      },
      {
        type: "sibling",
        gender: "male",
        firstname: "O'ktam",
        lastname: "Hasanov",
        pinfl: 34567890123456,
        children: [],
        parents: []
      },
    ],
    parents: []
  },
  {
    type: null,
    gender: "female",
    firstname: "Barno",
    lastname: "To'xtayeva",
    pinfl: 88990011223344,
    children: [],
    parents: []
  }
];