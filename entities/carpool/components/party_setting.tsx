import { useRouter } from "expo-router";
import { Image, Text, TextInput, TouchableHighlight } from "react-native";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { RowContainer } from "@/entities/carpool/components/containers";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";

/**
 * @returns 출발 시간 + 출발경로 입력
 */
export default function PartySetting() {
  const router = useRouter();

  return (
    <Container>
      <RowContainer>
        <Label title="출발 시간" />
        <TextInput placeholder="출발 시간" />
      </RowContainer>
      <RowContainer>
        <Image source={VerticalRoad} />
        <Container>
          <TouchableHighlight onPress={() => router.push("/carpool/find_track")}>
            <Text>출발지</Text>
          </TouchableHighlight>
          <IconSymbol name="arrow.2.circlepath.circle" size={24} color="#000" />
          <TouchableHighlight onPress={() => router.push("/carpool/find_track")}>
            <Text>도착지</Text>
          </TouchableHighlight>
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
