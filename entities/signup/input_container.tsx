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
    <Container>
      {handleClick && <HandleClick onPress={handleClick} />}
      <Label title={title} />
      <InputGroup>
        <InputGroupDiv>{children}</InputGroupDiv>
      </InputGroup>
    </Container>
  );
}

const HandleClick = styled.Pressable({
  position: "absolute",
  right: 0,
  top: 0,
  zIndex: 2,
  width: "100%",
  height: "100%",
});
const Container = styled.View({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.3rem 0rem",
  borderBottomColor: Colors.darkGray,
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
