import { Image, TextInput } from "react-native";
import styled from "styled-components/native";

import VerticalRoad from "@/assets/images/vertical_road.png";
import PartyCardList from "@/entities/carpool/party_card_list";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";

export default function Join() {
  return (
    <Container>
      <GroupContainer>
        <RowContainer>
          <Label title="출발 시간" />
          <TextInput placeholder="출발 시간" />
        </RowContainer>
        <RowContainer>
          <Image source={VerticalRoad} />
          <GroupContainer>
            <TextInput placeholder="출발지" />
            <IconSymbol name="arrow.2.circlepath.circle" size={24} color="#000" />
            <TextInput placeholder="도착지" />
          </GroupContainer>
        </RowContainer>
      </GroupContainer>
      <GroupContainer>
        <RowContainer>
          <Label title="동승자" />
          <TextInput placeholder="없음" />
        </RowContainer>
      </GroupContainer>
      <PartyCardList
        partys={[
          {
            partyId: 1,
            when2go: 1234567890,
            departure: {
              name: "출발지",
              lat: 0,
              lng: 0,
            },
            destination: {
              name: "도착지",
              lat: 0,
              lng: 0,
            },
            maxMembers: 4,
            curMembers: 2,
            options: ["NO_TALKING", "SAME_SEX"],
          },
          {
            partyId: 2,
            when2go: 1234567890,
            departure: {
              name: "출발지2",
              lat: 0,
              lng: 0,
            },
            destination: {
              name: "도착지2",
              lat: 0,
              lng: 0,
            },
            maxMembers: 4,
            curMembers: 2,
            options: [],
          },
        ]}
      />
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
});
const GroupContainer = styled.View({
  display: "flex",
  flexDirection: "column",
  alignContent: "center",
  gap: "10px",
});
const RowContainer = styled.View({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
});
