import { useRouter } from "expo-router";
import React, { useState } from "react";
import styled from "styled-components/native";

import MapWithMarker from "@/entities/carpool/components/map_with_marker";
import SearchRouteBar from "@/entities/carpool/components/search_route_bar";
import SearchSpotBar from "@/entities/carpool/components/search_spot_bar";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import { LocationInfo } from "@/entities/carpool/types";
import CircleButton from "@/entities/common/components/button_circle";

export default function FindTrack() {
  const router = useRouter();
  const setPartyState = usePartyStore((state) => state.setPartyState);
  const departure = usePartyStore((state) => state.departure);
  const destination = usePartyStore((state) => state.destination);

  // 현재 출발지, 도착지
  const [startLocation, setStartLocation] = useState<LocationInfo | undefined>(departure);
  const [endLocation, setEndLocation] = useState<LocationInfo | undefined>(destination);

  // 검색 중인 장소들 정보(출발지/도착지, 검색된 장소들, 검색된 장소들 중 선택된 인덱스)
  const [searchingLocationType, setSearchingLocationType] = useState<"start" | "end" | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<LocationInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

  return (
    <Container>
      {searchingLocationType === null ? (
        <SearchRouteBar
          startLocation={startLocation}
          endLocation={endLocation}
          swap={() => {
            setStartLocation(endLocation);
            setEndLocation(startLocation);
          }}
          setSearchingLocationType={setSearchingLocationType}
        />
      ) : (
        <SearchSpotBar
          location={searchingLocationType === "start" ? startLocation : endLocation}
          setLocation={searchingLocationType === "start" ? setStartLocation : setEndLocation}
          searchedLocation={searchedLocation}
          setSearchedLocation={setSearchedLocation}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          quitSearch={() => setSearchingLocationType(null)}
        />
      )}

      <MapWithMarker
        markers={searchedLocation}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        departure={startLocation}
        destination={endLocation}
      />

      {searchingLocationType === null && (
        <CompleteBtnContainer>
          <CircleButton
            icon="checkmark"
            onPress={() => {
              setPartyState({
                departure: startLocation,
                destination: endLocation,
              });
              router.back();
            }}
          />
        </CompleteBtnContainer>
      )}
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
});

// 완료 버튼
const CompleteBtnContainer = styled.View({
  position: "absolute",
  bottom: 10,
  width: "100%",
  display: "flex",
  alignItems: "center",
});
