import styled from "styled-components/native";

import { Colors, FontSizes } from "../util/style_var";

export default function Label({ title }: { title: string }) {
  return <StyledText>{title}</StyledText>;
}

const StyledText = styled.Text({
  color: Colors.main,
  fontSize: FontSizes.large,
  fontWeight: "bold",
  minWidth: "100px",
  padding: "3px",
});
