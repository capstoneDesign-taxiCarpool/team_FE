import { Party } from "./types";

export const optionsList: {
  name: keyof Party["options"];
  ko: string;
}[] = [
  {
    name: "sameGenderOnly",
    ko: "동성만",
  },
  {
    name: "costShareBeforeDropOff",
    ko: "내리기전N빵",
  },
  {
    name: "quietMode",
    ko: "조용히",
  },
  {
    name: "destinationChangeIn5Minutes",
    ko: "5분이내거리변경허용",
  },
];

export const formatOptions = (options: Party["options"]) => {
  let result = "";
  for (const option of optionsList) {
    if (options[option.name]) {
      result += `#${option.ko} `;
    }
  }
  if (result === "") return " - ";
  else return result;
};
