import styled from "styled-components/native";

export const FloadContainer = styled.View<{ attachTop: boolean }>((props) => ({
  position: "absolute",
  ...(props.attachTop ? { top: 20 } : { bottom: 20 }),
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
}));

export const ColContainer = styled.View<{ gap?: number }>((props) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: props.gap ?? 10,
}));

export const RowContainer = styled.View<{ gap?: number }>((props) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: props.gap ?? 10,
}));
