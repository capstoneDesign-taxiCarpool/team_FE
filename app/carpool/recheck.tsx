import styled from "styled-components/native";

import MapWithMarker from "@/entities/carpool/components/map_with_marker";
import PartyCard from "@/entities/carpool/components/party_card";
import BasicButton from "@/entities/common/components/button_basic";

export default function Recheck() {
  return (
    <Container>
      <PartyCard
        when2go={9393939}
        departure={{ name: "출발지", lat: 0, lng: 0 }}
        destination={{ name: "도착지", lat: 0, lng: 0 }}
        maxMembers={4}
        curMembers={2}
        options={["NO_TALKING"]}
        buttons={<BasicButton title="참여하기" icon="bubble.left.fill" onPress={() => {}} />}
      />
      <MapWithMarker
        departure={{ name: "출발지", lat: 0, lng: 0 }}
        destination={{ name: "도착지", lat: 10, lng: 10 }}
      />
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
});
