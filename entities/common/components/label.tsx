import styled from "styled-components/native";

import { Colors, FontSizes } from "../util/style_var";
import { InShadow } from "./shadows";

export default function Label({ title }: { title: string }) {
  return (
    <InShadow arialabel={`${title} 입력 라벨`} color={Colors.main} borderRadius={30}>
      <StyledText>{title}</StyledText>
    </InShadow>
  );
}

const StyledText = styled.Text({
  color: Colors.white,
  fontSize: FontSizes.medium,
  fontWeight: "bold",
  minWidth: "100px",
  textAlign: "center",
  padding: "6px 15px",
});
