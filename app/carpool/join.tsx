import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Text } from "react-native";
import styled from "styled-components/native";

import PartyCardList from "@/entities/carpool/components/party_card_list";
import PartySetting from "@/entities/carpool/components/party_setting";
import useStartEndPoint from "@/entities/carpool/hooks/use_start_end_point";
import { LocationInfo, PartyResponse } from "@/entities/carpool/types";
import { fetchInstance } from "@/entities/common/util/axios_instance";

const formatDate = (date: number) =>
  new Date(
    new Date(date).getTime() + new Date(date).getTimezoneOffset() * 60000 + 32400000,
  ).toISOString();

const getPartyListUrl = (
  when2go?: number,
  departure?: LocationInfo,
  destination?: LocationInfo,
) => {
  if (Number(Boolean(when2go)) + Number(Boolean(departure)) + Number(Boolean(destination)) < 2)
    // 출발시간, 출발지, 도착지 중 하나이하로 선택한 경우
    return `/api/party?page=0&size=1000000&`;

  const when2goStr = when2go ? `userDepartureTime=${formatDate(when2go)}&` : "";
  const departureStr = departure
    ? `userDepartureLat=${departure.y}&userDepartureLng=${departure.x}&`
    : "";
  const destinationStr = destination
    ? `userDestinationLat=${destination.y}&userDestinationLng=${destination.x}&`
    : "";
  return `/api/party/custom?${when2goStr}${departureStr}${destinationStr}page=0&size=1000000`;
};

export default function Join() {
  const [when2go, setWhen2go] = useState<number | undefined>(undefined);
  const { departure, destination } = useStartEndPoint();

  const { isPending, data: partys } = useQuery<PartyResponse[]>({
    queryKey: ["parties", when2go, departure, destination],
    queryFn: () =>
      fetchInstance()
        .get(getPartyListUrl(when2go, departure, destination))
        .then((res) => res.data.content)
        .catch(() => []),
  });

  return (
    <Container>
      <Header>{`카풀
참여하기`}</Header>
      <PartySetting
        when2go={when2go}
        setWhen2go={setWhen2go}
        departure={departure}
        destination={destination}
      />
      {isPending ? <Text>Loading...</Text> : <PartyCardList partys={partys ?? []} />}
    </Container>
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
  flex: 1,
});
