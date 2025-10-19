import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { ColContainer, RowContainer } from "@/entities/common/components/containers";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";
import { OutShadow } from "@/entities/common/components/shadows";
import datetimeFormat from "@/entities/common/util/datetime_format";
import { FontSizes } from "@/entities/common/util/style_var";

import usePartyStore from "../store/usePartyStore";
import { LocationInfo } from "../types";

/**
 * @returns 출발 시간 + 출발경로 입력
 */
export default function PartySetting({
  when2go,
  setWhen2go,
  departure,
  destination,
}: {
  when2go?: number;
  setWhen2go: (when2go: number) => void;
  departure?: LocationInfo;
  destination?: LocationInfo;
}) {
  const router = useRouter();
  const setPartyState = usePartyStore((state) => state.setPartyState);

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (selectedDate === undefined) {
      return;
    }

    const tenMinutesLater = new Date();
    tenMinutesLater.setMinutes(new Date().getMinutes() + 10);
    if (selectedDate < tenMinutesLater) {
      Alert.alert("출발 시간을 현재 시간 + 10분 이후로 설정해주세요.");
      return;
    }

    setWhen2go(selectedDate.getTime());
  };
  const route2FindTrack = () => {
    setPartyState({ departure, destination, isHandOveredData: true });
    router.push("/carpool/find_track");
  };
  const swap = () => {
    setPartyState({ departure: destination, destination: departure, isHandOveredData: true });
  };

  return (
    <Container>
      <RowContainer>
        <Label title="출발 시간" />
        <OutShadow flexGrow={1} borderRadius={10}>
          <DateTimePicker
            value={when2go ? new Date(when2go) : new Date()}
            mode="datetime"
            locale="ko-KR"
            minimumDate={new Date()}
            onChange={onChange}
            accentColor={Colors.main}
          />
        </OutShadow>
      </RowContainer>
      <ColContainer gap={10} alignItems="stretch">
        <Label title="경로 설정" />
        <RowContainer>
          <Image source={VerticalRoad} />
          <ColContainer2>
            <OutShadow>
              <TouchableOpacity onPress={route2FindTrack}>
                <MediumText>{departure?.name ?? "-"}</MediumText>
              </TouchableOpacity>
            </OutShadow>
            <SwapBtn onPress={swap}>
              <IconSymbol name="arrow.2.circlepath.circle" size={24} color={Colors.black} />
            </SwapBtn>
            <OutShadow>
              <TouchableOpacity onPress={route2FindTrack}>
                <MediumText>{destination?.name ?? "-"}</MediumText>
              </TouchableOpacity>
            </OutShadow>
          </ColContainer2>
        </RowContainer>
      </ColContainer>
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "15px",
});
const ColContainer2 = styled(ColContainer)({
  flexGrow: 1,
  alignItems: "stretch",
});

const SwapBtn = styled.TouchableOpacity({
  width: "100%",
  display: "flex",
  justifyContent: "center",
});
const MediumText = styled.Text({
  fontSize: FontSizes.medium,
  textAlign: "center",
  padding: 6,
});
