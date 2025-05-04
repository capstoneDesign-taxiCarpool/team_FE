import { TouchableHighlight } from "react-native";
import styled from "styled-components/native";

import { Colors } from "../util/style_var";
import { IconSymbol, IconSymbolName } from "./Icon_symbol";

type Props = {
  icon: IconSymbolName;
  onPress: () => void;
};

export default function CircleButton({ icon, onPress }: Props) {
  return (
    <TouchableHighlight onPress={onPress}>
      <StyledButton>
        <IconSymbol name={icon} size={24} color={Colors.white} />
      </StyledButton>
    </TouchableHighlight>
  );
}

const StyledButton = styled.View({
  padding: "20px",
  background: Colors.side,
  borderRadius: "60px",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
});
