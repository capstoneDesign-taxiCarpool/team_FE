import { View } from "react-native";

import BasicButton from "../../common/components/button_basic";
import { Party } from "../types";
import PartyCard from "./party_card";

export default function PartyCardList({ partys }: { partys: Party[] }) {
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
                onPress={() => {}}
                isToRight
              />
            }
          />
        );
      })}
    </View>
  );
}
