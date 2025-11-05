import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import styled from "styled-components/native";

import PartyCardList from "@/entities/carpool/components/party_card_list";
import PartySetting from "@/entities/carpool/components/party_setting";
import useStartEndPoint from "@/entities/carpool/hooks/use_start_end_point";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { LocationInfo, RawPartyResponse } from "@/entities/carpool/types";
import useBeforeBack from "@/entities/common/hooks/useBeforeBack";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { getISOString } from "@/entities/common/util/datetime_format";
import { FontSizes } from "@/entities/common/util/style_var";

const getPartyListUrl = (
  when2go?: number,
  departure?: LocationInfo,
  destination?: LocationInfo,
) => {
  if (Number(Boolean(when2go)) + Number(Boolean(departure)) + Number(Boolean(destination)) < 2)
    // 출발시간, 출발지, 도착지 중 하나이하로 선택한 경우
    return `/api/party?page=0&size=1000000&`;

  const when2goStr = when2go ? `userDepartureTime=${getISOString(when2go)}&` : "";
  const departureStr = departure
    ? `userDepartureLat=${departure.y}&userDepartureLng=${departure.x}&`
    : "";
  const destinationStr = destination
    ? `userDestinationLat=${destination.y}&userDestinationLng=${destination.x}&`
    : "";
  console.log(`/api/party/custom?${when2goStr}${departureStr}${destinationStr}page=0&size=1000000`);
  return `/api/party/custom?${when2goStr}${departureStr}${destinationStr}page=0&size=1000000`;
};

export default function Join() {
  const [when2go, setWhen2go] = useState<number | undefined>(undefined);
  const { departure, destination } = useStartEndPoint();
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const clearExceptId = usePartyStore((state) => state.clearExceptId);
  useBeforeBack(() => clearExceptId());

  useEffect(() => {
    fetchInstance()
      .get("/api/member/me")
      .then((res) => setUserId(res.data.id))
      .catch(() => setUserId(undefined));
  }, []);

  const { isPending, data: partys } = useQuery<RawPartyResponse[]>({
    queryKey: ["parties", when2go, departure, destination],
    queryFn: () =>
      fetchInstance(true)
        .get(getPartyListUrl(when2go, departure, destination))
        .then((res) =>
          res.data.content.filter((party: RawPartyResponse) => party.hostMemberId !== userId),
        )
        .catch(() => []),
  });

  return (
    <Container>
      <PartySetting
        when2go={when2go}
        setWhen2go={setWhen2go}
        departure={departure}
        destination={destination}
      />
      <Info>
        설정한 출발 시간과 경로에 맞추어 카풀이 정렬됩니다. (출발시간, 출발지, 도착지 중 2개 이상
        선택해주세요.){" "}
      </Info>
      {isPending ? <Text>Loading...</Text> : <PartyCardList partys={partys ?? []} />}
    </Container>
  );
}

const Info = styled.Text({
  fontSize: FontSizes.small,
  color: "#666666",
  marginBottom: -20,
  marginTop: -20,
  textAlign: "center",
});
const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
  padding: 20,
  flex: 1,
});
