import { View } from "react-native";

import { Colors } from "@/entities/common/util/style_var";

export const OutShadow = ({
  children,
  arialabel,
  flexGrow = 0,
  color = Colors.white,
  borderRadius = 30,
  padding = 0,
}: {
  children: React.ReactNode;
  arialabel?: string;
  flexGrow?: number;
  color?: string;
  borderRadius?: number;
  padding?: number;
}) => {
  return (
    <View
      aria-label={arialabel}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        backgroundColor: color,
        flexGrow: flexGrow,
        position: "relative",
        borderRadius: borderRadius,
        padding: padding,
      }}
    >
      {children}
    </View>
  );
};

export const InShadow = ({
  children,
  arialabel,
  flexGrow = 0,
  color = Colors.white,
  borderRadius = 30,
  padding = 0,
}: {
  children: React.ReactNode;
  arialabel?: string;
  flexGrow?: number;
  color?: string;
  borderRadius?: number;
  padding?: number;
}) => {
  return (
    <View
      aria-label={arialabel}
      style={{
        boxShadow: [
          {
            offsetX: 0,
            offsetY: 4,
            blurRadius: 4,
            spreadDistance: 0,
            color: "rgba(0,0,0,0.3)",
            inset: true,
          },
        ],
        flexGrow: flexGrow,
        backgroundColor: color,
        position: "relative",
        borderRadius: borderRadius,
        padding: padding,
      }}
    >
      {children}
    </View>
  );
};
