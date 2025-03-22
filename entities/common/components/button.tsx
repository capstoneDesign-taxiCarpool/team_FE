import { TouchableHighlight } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "../util/style_var";
import { IconSymbol, IconSymbolName } from "./Icon_symbol";

type Props = {
  title: string;
  icon: IconSymbolName;
  onPress: () => void;
};

export default function Button({ title, icon, onPress }: Props) {
  return (
    <TouchableHighlight onPress={onPress}>
      <StyledButton>
        <Title>{title}</Title>
        <IconSymbol name={icon} size={24} color={Colors.white} />
      </StyledButton>
    </TouchableHighlight>
  );
}

const StyledButton = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.3rem 0.5rem 0.3rem 0.7rem",
  background: Colors.side,
  borderRadius: "30px",
});
const Title = styled.Text({
  color: Colors.white,
  fontSize: FontSizes.medium,
  fontWeight: "bold",
});
