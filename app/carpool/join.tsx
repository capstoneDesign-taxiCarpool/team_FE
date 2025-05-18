import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";
import styled from "styled-components/native";

import PartyCardList from "@/entities/carpool/components/party_card_list";
import PartySetting from "@/entities/carpool/components/party_setting";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { LocationInfo, PartyResponse } from "@/entities/carpool/types";
import { fetchInstance } from "@/entities/common/util/axios_instance";

const getPartyListUrl = (
  when2go?: number,
  departure?: LocationInfo,
  destination?: LocationInfo,
) => {
  const when2goStr = when2go ? `when2go=${when2go}&` : "";
  const departureStr = departure ? `departure=${departure.name}&` : "";
  const destinationStr = destination ? `destination=${destination.name}&` : "";
  return `/api/party/custom?${when2goStr}${departureStr}${destinationStr}page=0&size=10`;
};

export default function Join() {
  const when2go = usePartyStore((state) => state.when2go);
  const departure = usePartyStore((state) => state.departure);
  const destination = usePartyStore((state) => state.destination);

  const { isPending, data: partys } = useQuery<PartyResponse[]>({
    queryKey: [when2go, departure, destination],
    queryFn: async () => {
      try {
        const res = await fetchInstance().get(getPartyListUrl(when2go, departure, destination));
        return res.data;
      } catch (err) {
        console.log(err);
        // TODO: 에러 처리
        return [
          {
            id: 1,
            startDateTime: 1746411122462,
            startPlace: {
              name: "출발지!",
              x: 37.868897,
              y: 127.744994,
            },
            endPlace: {
              name: "도착지",
              x: 37.8757750717447,
              y: 127.745011033429,
            },
            comment: "안녕하세요",
            maxParticipantCount: 4,
            currentParticipantCount: 2,
            sameGenderOnly: true,
            costShareBeforeDropOff: false,
            quietMode: true,
            destinationChangeIn5Minutes: false,
          },
        ];
      }
    },
  });

  return (
    <Container>
      <PartySetting />
      {isPending ? <Text>Loading...</Text> : <PartyCardList partys={partys ?? []} />}
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
  padding: 20,
  flex: 1,
});
