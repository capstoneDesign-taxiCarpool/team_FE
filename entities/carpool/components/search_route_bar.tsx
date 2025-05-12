import { Image } from "react-native";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { LocationInfo } from "@/entities/carpool/types";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import { OutShadow } from "@/entities/common/components/shadows";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

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
          <ColContainer2>
            <OutShadow>
              <LocationText onPress={() => setSearchingLocationType("start")}>
                <MediumText>{startLocation?.name ?? "-"}</MediumText>
              </LocationText>
            </OutShadow>
            <SwapBtn onPress={swap}>
              <IconSymbol name="arrow.2.circlepath.circle" size={24} color={Colors.black} />
            </SwapBtn>
            <OutShadow>
              <LocationText onPress={() => setSearchingLocationType("end")}>
                <MediumText>{endLocation?.name ?? "-"}</MediumText>
              </LocationText>
            </OutShadow>
          </ColContainer2>
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

const ColContainer2 = styled(ColContainer)({
  flexGrow: 1,
  alignItems: "normal",
});

const SwapBtn = styled.TouchableOpacity({
  width: "fit-content",
});
const LocationText = styled.TouchableOpacity({
  textAlign: "center",
  fontWeight: "bold",
});

const MediumText = styled.Text({
  fontSize: FontSizes.medium,
  textAlign: "center",
  padding: 6,
});
