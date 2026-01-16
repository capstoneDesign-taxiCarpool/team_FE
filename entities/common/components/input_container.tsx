import styled from "styled-components/native";

import { Colors } from "@/entities/common/util/style_var";

export default function InputContainer({
  title,
  children,
  handleClick,
  variant = "underline",
}: {
  title: string;
  children: React.ReactNode;
  handleClick?: () => void;
  variant?: "underline" | "box";
}) {
  return (
    <Container onPress={handleClick} variant={variant}>
      <Label>{title}</Label>
      <InputGroup>
        <InputGroupDiv>{children}</InputGroupDiv>
      </InputGroup>
    </Container>
  );
}

const Container = styled.Pressable<{ variant: "underline" | "box" }>(({ variant }) => ({
  width: "100%",
  gap: 5,
  backgroundColor: "#f5f5f5",
  minHeight: 75,
  borderRadius: 12,
  paddingVertical: 10,
  paddingHorizontal: 10,
  ...(variant === "underline"
    ? {}
    : {
        backgroundColor: Colors.white,
        borderRadius: 30,
        paddingHorizontal: 5,
        paddingVertical: 5,
      }),
}));

const Label = styled.Text({
  fontSize: 14,
  fontWeight: "600",
  color: "black",
  marginBottom: 6,
});

const InputGroup = styled.View({
  flexGrow: 1,
});

const InputGroupDiv = styled.View({
  alignItems: "center",
  flexDirection: "row",
  gap: 6,
  justifyContent: "flex-end",
});
