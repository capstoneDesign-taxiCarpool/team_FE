import { Party } from "./types";

export const formatOptions = (options: Party["options"]) => {
  const result =
    (options.sameGenderOnly ? "#동성만 " : "") +
    (options.costShareBeforeDropOff ? "#내리기전N빵 " : "") +
    (options.quietMode ? "#조용히 " : "") +
    (options.destinationChangeIn5Minutes ? "#5분이내거리변경허용" : "");
  if (result === "") return " - ";
  else return result;
};
