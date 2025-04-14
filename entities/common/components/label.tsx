import styled from "styled-components/native";

import { Colors, FontSizes } from "../util/style_var";
import InnerShadow from "./inner_shadow";

export default function Label({ title }: { title: string }) {
  return (
    <StyledLabel aria-label={`${title} 입력 라벨`}>
      <InnerShadow />
      <StyledText>{title}</StyledText>
    </StyledLabel>
  );
}

const StyledLabel = styled.View({
  position: "relative",
  backgroundColor: Colors.main,
  borderRadius: "30px",
});
const StyledText = styled.Text({
  color: Colors.white,
  fontSize: FontSizes.medium,
  fontWeight: "bold",
  minWidth: "100px",
  textAlign: "center",
  padding: "5px 15px",
});
