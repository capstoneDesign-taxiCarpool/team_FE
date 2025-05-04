import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableHighlight } from "react-native";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { RowContainer } from "@/entities/carpool/components/containers";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";

/**
 * @returns 출발 시간 + 출발경로 입력
 */
export default function PartySetting() {
  const router = useRouter();
  const [mode, setMode] = useState<null | "date" | "time">(null);
  const when2go = usePartyStore((state) => state.when2go);
  const departure = usePartyStore((state) => state.departure);
  const destination = usePartyStore((state) => state.destination);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setMode(null);
    setPartyState({ when2go: Number(selectedDate ?? new Date()) });
    console.log("selectedDate", new Date(selectedDate ?? 0));
  };

  return (
    <Container>
      {mode && (
        <DateTimePicker
          value={when2go ? new Date(when2go) : new Date()}
          mode={mode}
          is24Hour={true}
          onChange={onChange}
        />
      )}
      <RowContainer>
        <Label title="출발 시간" />
        <DateTimePickerBtn onPress={() => setMode("date")}>날짜</DateTimePickerBtn>
        <DateTimePickerBtn onPress={() => setMode("time")}>시간</DateTimePickerBtn>
      </RowContainer>
      <RowContainer>
        <Image source={VerticalRoad} />
        <Container>
          <TouchableHighlight onPress={() => router.push("/carpool/find_track")}>
            <Text>{departure?.name ?? "출발지"}</Text>
          </TouchableHighlight>
          <IconSymbol name="arrow.2.circlepath.circle" size={24} color="#000" />
          <TouchableHighlight onPress={() => router.push("/carpool/find_track")}>
            <Text>{destination?.name ?? "도착지"}</Text>
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

const DateTimePickerBtn = styled.TouchableOpacity({
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
});
