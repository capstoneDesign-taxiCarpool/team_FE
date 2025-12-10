import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import styled from "styled-components/native";

import sadFace from "@/assets/images/sad_face.svg";
import BasicButton from "@/entities/common/components/button_basic";
import CircleButton from "@/entities/common/components/button_circle";

import PartyCard from "../../common/components/party_card";
import usePartyStore from "../store/usePartyStore";
import { mapRawParty, PartyResponse, RawPartyResponse } from "../types";

export default function PartyCardList({ partys }: { partys: RawPartyResponse[] }) {
  const router = useRouter();
  const setPartyState = usePartyStore((state) => state.setPartyState);

  const route2recheck = (party: PartyResponse) => {
    setPartyState({
      partyId: party.id,
      when2go: party.startDateTime,
      departure: party.startPlace,
      destination: party.endPlace,
      maxMembers: party.maxParticipantCount,
      curMembers: party.currentParticipantCount,
      options: {
        sameGenderOnly: party.sameGenderOnly,
        costShareBeforeDropOff: party.costShareBeforeDropOff,
        quietMode: party.quietMode,
        destinationChangeIn5Minutes: party.destinationChangeIn5Minutes,
      },
      comment: party.comment,
    });
    router.push("/carpool/recheck");
  };
  const route2recruit = () => {
    setPartyState({ partyId: undefined, isHandOveredData: true });
    router.push("/carpool/recruit");
  };

  const mapped = partys.map(mapRawParty);

  if (mapped.length === 0) {
    return (
      <View>
        <Text>검색 결과가 없습니다</Text>
        <Image source={sadFace} />
        <Text>{`내가 원하는 조건으로 카풀을 생성해보세요.
        1분이면 충분해요!`}</Text>
        <CircleButton icon="checkmark" onPress={route2recruit} />
      </View>
    );
  }

  return (
    <Container>
      <PartyCardListContainer>
        {mapped.map((v) => {
          return (
            <PartyCard
              key={v.id}
              when2go={v.startDateTime}
              departure={v.startPlace}
              destination={v.endPlace}
              maxMembers={v.maxParticipantCount}
              estimatedFare={v.estimatedFare}
              hostGender={v.hostGender}
              curMembers={v.currentParticipantCount}
              options={{
                sameGenderOnly: v.sameGenderOnly,
                costShareBeforeDropOff: v.costShareBeforeDropOff,
                quietMode: v.quietMode,
                destinationChangeIn5Minutes: v.destinationChangeIn5Minutes,
              }}
              buttons={
                <BasicButton
                  title="자세히"
                  icon="magnifyingglass.circle"
                  onPress={() => route2recheck(v)}
                  isToRight={true}
                />
              }
            />
          );
        })}
      </PartyCardListContainer>
    </Container>
  );
}

const Container = styled.ScrollView({
  flex: 1,
  marginHorizontal: -20,
  paddingHorizontal: 20,
});

const PartyCardListContainer = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: 10,
});
