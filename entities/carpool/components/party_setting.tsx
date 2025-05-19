import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, TouchableOpacity } from "react-native";
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
  setWhen2go: React.Dispatch<React.SetStateAction<number | undefined>>;
  departure?: LocationInfo;
  destination?: LocationInfo;
}) {
  const router = useRouter();
  const setPartyState = usePartyStore((state) => state.setPartyState);
  // datetime picker mode state
  const [mode, setMode] = useState<null | "date" | "time">(null);

  const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
    setMode(null);
    setWhen2go(Number(selectedDate ?? new Date()));
  };
  const route2FindTrack = () => {
    setPartyState({ departure, destination, isHandOveredData: true });
    router.push("/carpool/find_track");
  };

  return (
    <Container>
      {mode && (
        <DateTimePicker
          value={when2go ? new Date(when2go) : new Date()}
          mode={mode}
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
          <IconSymbol name="arrow.2.circlepath.circle" size={24} color="#000" />
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

const MediumText = styled.Text({
  fontSize: FontSizes.medium,
  textAlign: "center",
  padding: 6,
});
