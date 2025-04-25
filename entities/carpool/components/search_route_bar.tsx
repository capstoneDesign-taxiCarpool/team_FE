import { Image, Text } from "react-native";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { LocationInfo } from "@/entities/carpool/types";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import { Colors } from "@/entities/common/util/style_var";

import { ColContainer, FloadContainer, RowContainer } from "./containers";

/**
 * @returns 출발지, 도착지 검색창
 */
export default function SearchRouteBar({
  startLocation,
  endLocation,
  swap,
  setSearchingLocationType,
}: {
  startLocation?: LocationInfo;
  endLocation?: LocationInfo;
  swap: () => void;
  setSearchingLocationType: React.Dispatch<React.SetStateAction<"start" | "end" | null>>;
}) {
  return (
    <Container>
      <FloadContainer attachTop={true}>
        <RowContainer>
          <Image source={VerticalRoad} />
          <ColContainer>
            <LocationText onPress={() => setSearchingLocationType("start")}>
              <Text>{startLocation?.name ?? "출발지"}</Text>
            </LocationText>
            <SwapBtn onPress={swap}>
              <IconSymbol name="arrow.2.circlepath.circle" size={24} color={Colors.black} />
            </SwapBtn>
            <LocationText onPress={() => setSearchingLocationType("end")}>
              <Text>{endLocation?.name ?? "도착지"}</Text>
            </LocationText>
          </ColContainer>
        </RowContainer>
      </FloadContainer>
    </Container>
  );
}

const Container = styled.View({
  position: "absolute",
  width: "100%",
  height: "100%",
});
const SwapBtn = styled.TouchableOpacity({
  width: "fit-content",
});
const LocationText = styled.TouchableHighlight({
  textAlign: "center",
  fontWeight: "bold",
});
