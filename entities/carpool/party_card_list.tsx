import React from "react";
import { Text, View } from "react-native";
import styled from "styled-components/native";

import { Party } from "@/entities/common/store/usePartyStore";

import BasicButton from "../common/components/button_basic";
import { IconSymbol } from "../common/components/Icon_symbol";

export default ({ partys }: { partys: Party[] }) => {
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
};

type Buttons = {
  buttons: React.ReactNode;
};

const PartyCard = ({
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  options,
  buttons,
}: Omit<Party, "partyId"> & Buttons) => {
  return (
    <Container>
      <Path>
        <Text>{departure?.name}</Text>
        <IconSymbol name="arrow.right" />
        <Text>{destination?.name}</Text>
      </Path>
      <Instructor>
        <IconSymbol name="clock" />
        <Text>{when2go}</Text>
      </Instructor>
      <Instructor>
        <IconSymbol name="person.3" />
        <Text>
          {curMembers} / {maxMembers}
        </Text>
      </Instructor>
      <Instructor>
        <Text>{options.length > 0 ? `#${options[0]}` : ""}</Text>
      </Instructor>
      {buttons}
    </Container>
  );
};

const Container = styled.View({
  marginTop: "10px",
});
const Path = styled.View({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
});
const Instructor = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
});
