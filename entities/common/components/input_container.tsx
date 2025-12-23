import styled from "styled-components/native";

import Label from "@/entities/common/components/label";
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
      <Label title={title} />
      <InputGroup>
        <InputGroupDiv>{children}</InputGroupDiv>
      </InputGroup>
    </Container>
  );
}

const Container = styled.Pressable<{ variant: "underline" | "box" }>(({ variant }) => ({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  gap: 10,
  paddingVertical: 8,
  ...(variant === "underline"
    ? {
        borderBottomColor: Colors.darkGray,
        borderBottomWidth: 1,
      }
    : {
        backgroundColor: Colors.white,
        borderRadius: 30,
        paddingHorizontal: 5,
        paddingVertical: 5,
      }),
}));

const InputGroup = styled.View({
  flexGrow: 1,
});

const InputGroupDiv = styled.View({
  alignItems: "center",
  flexDirection: "row",
  gap: 6,
  justifyContent: "flex-end",
});
