import { TouchableOpacity } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "../util/style_var";
import { IconSymbol, IconSymbolName } from "./Icon_symbol";
import { OutShadow } from "./shadows";

type Props = {
  title: string;
  icon: IconSymbolName;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  isToRight?: boolean; // 전체 width 기준 오른쪽 정렬을 할 것인가? TODO: 실제 구현 필요
};

export default function BasicButton({
  title,
  icon,
  onPress,
  disabled = false,
  color = Colors.side,
  isToRight = false,
}: Props) {
  return (
    <Container isToRight={isToRight}>
      <OutShadow>
        <TouchableOpacity onPress={onPress} disabled={disabled}>
          <StyledButton activeColor={color} disabled={disabled}>
            <Title>{title}</Title>
            <IconSymbol name={icon} size={24} color={Colors.white} />
          </StyledButton>
        </TouchableOpacity>
      </OutShadow>
    </Container>
  );
}

const Container = styled.View<{ isToRight: boolean }>((props) =>
  props.isToRight
    ? {
        display: "flex",
        alignItems: "flex-end",
        width: "100%",
      }
    : {},
);

const StyledButton = styled.View<{ activeColor: string; disabled: boolean }>((props) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
  padding: "5px 8px 5px 15px",
  background: props.disabled ? Colors.gray : props.activeColor,
  borderRadius: "30px",
}));
const Title = styled.Text({
  color: Colors.white,
  fontSize: FontSizes.medium,
  fontWeight: "bold",
});
