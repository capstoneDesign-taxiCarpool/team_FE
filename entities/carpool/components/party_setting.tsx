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
  // datetime picker mode state
  const [mode, setMode] = useState<null | "date" | "time">(null);

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    if (selectedDate === undefined) {
      setMode(null);
      return;
    }
    if (
      mode === "date" &&
      selectedDate.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0) &&
      (when2go === undefined || new Date(when2go).getHours() < new Date().getHours())
    ) {
      // 날짜 변경 시, 시간이 현재 시간보다 이전이면 시간을 현재 시간 + 10분으로 설정
      selectedDate.setHours(new Date().getHours(), new Date().getMinutes() + 20, 0, 0);
    }

    const tenMinutesLater = new Date();
    tenMinutesLater.setMinutes(new Date().getMinutes() + 10);
    if (selectedDate < tenMinutesLater) {
      setMode(null);
      Alert.alert("출발 시간을 현재 시간 + 10분 이후로 설정해주세요.");
      return;
    }

    setMode(null);
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
      {mode && (
        <DateTimePicker
          value={when2go ? new Date(when2go) : new Date()}
          mode={mode}
          locale="ko-KR"
          minimumDate={new Date()}
          onChange={onChange}
          accentColor={Colors.main}
        />
      )}
      <RowContainer>
        <Label title="출발 시간" />
        <OutShadow flexGrow={1} borderRadius={10}>
          <TouchableOpacity onPress={() => setMode("date")}>
            <MediumText>{datetimeFormat(when2go, "date")}</MediumText>
          </TouchableOpacity>
        </OutShadow>
        <OutShadow flexGrow={1} borderRadius={10}>
          <TouchableOpacity onPress={() => setMode("time")}>
            <MediumText>{datetimeFormat(when2go, "time")}</MediumText>
          </TouchableOpacity>
        </OutShadow>
      </RowContainer>
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
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});
const ColContainer2 = styled(ColContainer)({
  flexGrow: 1,
  alignItems: "normal",
});

const SwapBtn = styled.TouchableOpacity({
  width: "fit-content",
});
const MediumText = styled.Text({
  fontSize: FontSizes.medium,
  textAlign: "center",
  padding: 6,
});
