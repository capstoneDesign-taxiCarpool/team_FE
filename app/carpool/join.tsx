import { TextInput } from "react-native";
import styled from "styled-components/native";

import PartyCardList from "@/entities/carpool/components/party_card_list";
import PartySetting from "@/entities/carpool/components/party_setting";
import Label from "@/entities/common/components/label";

export default function Join() {
  return (
    <Container>
      <PartySetting />
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
              x: 0,
              y: 0,
            },
            destination: {
              name: "도착지",
              x: 0,
              y: 0,
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
              x: 0,
              y: 0,
            },
            destination: {
              name: "도착지2",
              x: 0,
              y: 0,
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
