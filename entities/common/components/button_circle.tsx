import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { Colors } from "../util/style_var";
import { IconSymbol, IconSymbolName } from "./Icon_symbol";
import { OutShadow } from "./shadows";

type Props = {
  icon: IconSymbolName;
  onPress: () => void;
};

export default function CircleButton({ icon, onPress }: Props) {
  return (
    <Container>
      <TouchableOpacity onPress={onPress}>
        <OutShadow color={Colors.side} borderRadius={60} padding={20}>
          <IconSymbol name={icon} size={24} color={Colors.white} />
        </OutShadow>
      </TouchableOpacity>
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  alignItems: "center",
});
