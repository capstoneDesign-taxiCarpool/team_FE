import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";

import sadFace from "@/assets/images/sad_face.svg";
import BasicButton from "@/entities/common/components/button_basic";
import CircleButton from "@/entities/common/components/button_circle";

import usePartyStore from "../store/usePartyStore";
import { Party } from "../types";
import PartyCard from "./party_card";

export default function PartyCardList({ partys }: { partys: Party[] }) {
  const router = useRouter();
  const setPartyState = usePartyStore((state) => state.setPartyState);

  const route2recheck = (party: Party) => {
    setPartyState({
      partyId: party.partyId,
      when2go: party.when2go,
      departure: party.departure,
      destination: party.destination,
      maxMembers: party.maxMembers,
      curMembers: party.curMembers,
      options: party.options,
      comment: party.comment,
    });
    router.push("/carpool/recheck");
  };
  const route2recruit = () => {
    setPartyState({ partyId: undefined, isHandOveredData: true });
    router.push("/carpool/recruit");
  };

  if (partys.length === 0) {
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
    <View>
      {partys.map((v) => {
        return (
          <PartyCard
            key={v.partyId}
            when2go={v.when2go}
            departure={v.departure}
            destination={v.destination}
            maxMembers={v.maxMembers}
            curMembers={v.curMembers}
            options={v.options}
            buttons={
              <BasicButton
                title="자세히"
                icon="magnifyingglass.circle"
                onPress={() => route2recheck(v)}
                isToRight
              />
            }
          />
        );
      })}
    </View>
  );
}
