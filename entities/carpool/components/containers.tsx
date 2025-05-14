import { View } from "react-native";
import styled from "styled-components/native";

export const FloadContainer = ({
  children,
  attachTop,
}: {
  children: React.ReactNode;
  attachTop: boolean;
}) => {
  return (
    <View
      style={{
        position: "absolute",
        ...(attachTop ? { top: 20 } : { bottom: 20 }),
        left: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: "white",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowRadius: 4,
        elevation: 5,
        padding: 20,
      }}
    >
      {children}
    </View>
  );
};

export const ColContainer = styled.View<{ gap?: number; alignItems?: string }>((props) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: props.alignItems ?? "center",
  gap: props.gap ?? 10,
}));

export const RowContainer = styled.View<{ gap?: number; justifyContent?: string }>((props) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: props.justifyContent ?? "center",
  alignItems: "center",
  gap: props.gap ?? 10,
}));
