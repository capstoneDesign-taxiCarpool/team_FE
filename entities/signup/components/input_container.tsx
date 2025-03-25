import styled from "styled-components/native";

import Label from "@/entities/common/components/label";
import { Colors } from "@/entities/common/util/style_var";

export default function InputContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Container>
      <Label title={title} />
      <InputGroup>
        <InputGroupDiv>{children}</InputGroupDiv>
      </InputGroup>
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0rem",
  borderBottomColor: Colors.black,
  borderBottomWidth: 1,
});
const InputGroup = styled.View({
  flexGrow: 1,
});
const InputGroupDiv = styled.View({
  margin: "auto",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.5rem",
  textAlign: "center",
});
