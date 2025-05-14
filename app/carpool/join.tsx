import { useQuery } from "@tanstack/react-query";
import { Text } from "react-native";
import styled from "styled-components/native";

import { ColContainer, RowContainer } from "@/entities/carpool/components/containers";
import PartyCardList from "@/entities/carpool/components/party_card_list";
import PartySetting from "@/entities/carpool/components/party_setting";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { LocationInfo, Party } from "@/entities/carpool/types";
import Label from "@/entities/common/components/label";
import { InShadow } from "@/entities/common/components/shadows";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { FontSizes } from "@/entities/common/util/style_var";

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

  const { isPending, data: partys } = useQuery<Party[]>({
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
            partyId: 1,
            when2go: 1746411122462,
            departure: {
              name: "출발지!",
              x: 37.868897,
              y: 127.744994,
            },
            destination: {
              name: "도착지",
              x: 37.8757750717447,
              y: 127.745011033429,
            },
            maxMembers: 4,
            curMembers: 2,
            options: {
              sameGenderOnly: true,
              costShareBeforeDropOff: false,
              quietMode: true,
              destinationChangeIn5Minutes: false,
            },
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
            options: {
              sameGenderOnly: false,
              costShareBeforeDropOff: false,
              quietMode: false,
              destinationChangeIn5Minutes: false,
            },
          },
          {
            partyId: 3,
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
            options: {
              sameGenderOnly: false,
              costShareBeforeDropOff: false,
              quietMode: false,
              destinationChangeIn5Minutes: false,
            },
          },
        ];
      }
    },
  });

  return (
    <Container>
      <PartySetting />
      <ColContainer>
        <RowContainer>
          <Label title="동승자" />
          <InShadow flexGrow={1}>
            <StyledTextInput placeholder="없음" keyboardType="numeric" />
          </InShadow>
        </RowContainer>
      </ColContainer>
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

const StyledTextInput = styled.TextInput({
  padding: "6px 12px",
  fontSize: FontSizes.medium,
  margin: "auto",
});
