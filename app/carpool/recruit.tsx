import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import styled from "styled-components/native";

import ExtraSetting from "@/entities/carpool/components/extra_setting";
import PartySetting from "@/entities/carpool/components/party_setting";
import useStartEndPoint from "@/entities/carpool/hooks/use_start_end_point";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import CircleButton from "@/entities/common/components/button_circle";
import useBeforeBack from "@/entities/common/hooks/useBeforeBack";

export default function Recruit() {
  const router = useRouter();

  const [when2go, setWhen2go] = useState<number | undefined>(undefined);
  const { departure, destination } = useStartEndPoint();
  const setPartyState = usePartyStore((state) => state.setPartyState);
  const clearExceptId = usePartyStore((state) => state.clearExceptId);

  useBeforeBack(() => clearExceptId());

  return (
    <KeyboardAvoidingView behavior="padding">
      <ScrollView>
        <Container>
          <Header>{`카풀
모집하기`}</Header>
          <PartySetting
            when2go={when2go}
            setWhen2go={setWhen2go}
            departure={departure}
            destination={destination}
          />
          <ExtraSetting />
          <CircleButton
            icon="checkmark"
            onPress={() => {
              if (!when2go || !departure || !destination) {
                Alert.alert(
                  `${!when2go ? "출발 시간" : ""}${!when2go && !departure && !destination ? ", " : ""}${!departure ? "출발지" : ""}${!departure && !destination ? ", " : ""}${!destination ? "도착지" : ""} 정보를 입력해주세요.`,
                );
                return;
              }
              setPartyState({ partyId: undefined, when2go, departure, destination });
              router.push("/carpool/recheck");
            }}
          />
        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const Header = styled.Text({
  fontSize: 36,
  fontWeight: "bold",
  marginBottom: 5,
});

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
  padding: 20,
});
