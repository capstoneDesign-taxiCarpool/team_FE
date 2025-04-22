import { Image, TextInput } from "react-native";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";

export default function PartySetting() {
  return (
    <Container>
      <RowContainer>
        <Label title="출발 시간" />
        <TextInput placeholder="출발 시간" />
      </RowContainer>
      <RowContainer>
        <Image source={VerticalRoad} />
        <Container>
          <TextInput placeholder="출발지" />
          <IconSymbol name="arrow.2.circlepath.circle" size={24} color="#000" />
          <TextInput placeholder="도착지" />
        </Container>
      </RowContainer>
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  alignContent: "center",
  gap: "10px",
});
const RowContainer = styled.View({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
});
