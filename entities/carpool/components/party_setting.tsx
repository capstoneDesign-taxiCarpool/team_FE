import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import { ColContainer, RowContainer } from "@/entities/carpool/components/containers";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";
import { OutShadow } from "@/entities/common/components/shadows";
import datetimeFormat from "@/entities/common/util/datetime_format";
import { FontSizes } from "@/entities/common/util/style_var";

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
            <TouchableOpacity onPress={() => router.push("/carpool/find_track")}>
              <MediumText>{departure?.name ?? "-"}</MediumText>
            </TouchableOpacity>
          </OutShadow>
          <IconSymbol name="arrow.2.circlepath.circle" size={24} color="#000" />
          <OutShadow>
            <TouchableOpacity onPress={() => router.push("/carpool/find_track")}>
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
