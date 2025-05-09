import { TouchableHighlight } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "../util/style_var";
import { IconSymbol, IconSymbolName } from "./Icon_symbol";

type Props = {
  title: string;
  icon: IconSymbolName;
  onPress: () => void;
  disabled?: boolean;
};

export default function BasicButton({ title, icon, onPress, disabled = false }: Props) {
  return (
    <TouchableHighlight onPress={onPress} disabled={disabled}>
      <StyledButton disabled={disabled}>
        <Title>{title}</Title>
        <IconSymbol name={icon} size={24} color={Colors.white} />
      </StyledButton>
    </TouchableHighlight>
  );
}

const StyledButton = styled.View<{ disabled: boolean }>((props) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.3rem 0.5rem 0.3rem 0.7rem",
  background: props.disabled ? Colors.gray : Colors.side,
  borderRadius: "30px",
}));
const Title = styled.Text({
  color: Colors.white,
  fontSize: FontSizes.medium,
  fontWeight: "bold",
});
