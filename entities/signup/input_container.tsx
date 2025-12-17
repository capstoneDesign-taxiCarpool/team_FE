import styled from "styled-components/native";

import Label from "@/entities/common/components/label";
import { Colors } from "@/entities/common/util/style_var";

export default function InputContainer({
  title,
  children,
  handleClick,
}: {
  title: string;
  children: React.ReactNode;
  handleClick?: () => void;
}) {
  return (
    <Container onPress={handleClick}>
      <Label title={title} />
      <InputGroup>
        <InputGroupDiv>{children}</InputGroupDiv>
      </InputGroup>
    </Container>
  );
}

const Container = styled.Pressable({
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  gap: 10,
  paddingVertical: 8,
  borderBottomColor: Colors.darkGray,
  borderBottomWidth: 1,
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
