import { Platform } from "react-native";

export const Colors = {
  main: "#253393",
  main2: "rgba(36, 51, 148, 0.69)",
  side: "#c45623",
  white: "#fefefe",
  black: "#2C2C2C",
  gray: "#BDBDBD",
  darkGray: "#828282",
};

export const FontSizes =
  Platform.OS === "web"
    ? {
        small: "12px",
        medium: "14px",
        large: "16px",
        large2: "24px",
      }
    : {
        small: "12px",
        medium: "14px",
        large: "16px",
        large2: "24px",
      };
