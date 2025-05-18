import * as Location from "expo-location";
import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import styled from "styled-components/native";

import { LocationInfo } from "@/entities/carpool/types";
import BasicButton from "@/entities/common/components/button_basic";
import { fetchInstance } from "@/entities/common/util/axios_instance";
import { FontSizes } from "@/entities/common/util/style_var.native";

import { ColContainer, FloadContainer } from "../../common/components/containers";

const fetchCurLocation = async (
  setCurLocation: React.Dispatch<React.SetStateAction<Location.LocationObjectCoords>>,
) => {
  try {
    // 위치 권한 요청
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    // 현재 위치 가져오기
    const currentLocation = await Location.getCurrentPositionAsync({});
    setCurLocation(currentLocation.coords);
  } catch (error) {
    console.error("위치를 가져오는데 실패했습니다:", error);
  }
};
const searchLocation = debounce(
  (
    text: string,
    lat: number,
    long: number,
    setSearchResult: React.Dispatch<React.SetStateAction<LocationInfo[]>>,
  ) => {
    fetchInstance()
      .get(`/api/map/search?keyword=${text}&x=${long}&y=${lat}`)
      .then((res) => {
        setSearchResult(res.data.places);
      })
      .catch(() => {
        // TODO: 에러 처리
      });
  },
  500,
);

/**
 * 장소 검색 쿼리를 입력받고, 검색 결과를 리스트와 지도마커로 보여줌
 * 하나의 결과가 클릭되면(selectedIndex) 자세한 정보를 보여줌
 * selectedIndex를 출발지/도착지에 저장하고 검색창 숨김
 * @returns 장소 검색 창
 */
export default function SearchSpotBar({
  location,
  setLocation,
  searchedLocation,
  setSearchedLocation,
  selectedIndex,
  setSelectedIndex,
  quitSearch,
}: {
  location?: LocationInfo;
  setLocation: React.Dispatch<React.SetStateAction<LocationInfo | undefined>>;
  searchedLocation: LocationInfo[];
  setSearchedLocation: React.Dispatch<React.SetStateAction<LocationInfo[]>>;
  selectedIndex?: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  quitSearch: () => void;
}) {
  // 현재 위치, 출발지, 도착지 상태 관리
  const [curLocation, setCurLocation] = useState<Location.LocationObjectCoords>({
    latitude: 37.868897,
    longitude: 127.744994,
    altitude: 0,
    accuracy: 0,
    altitudeAccuracy: 0,
    heading: 0,
    speed: 0,
  });
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    fetchCurLocation(setCurLocation);
    if (location) {
      setQuery(location.name);
      setSearchedLocation([location]);
      setSelectedIndex(0);
    }
  }, [location, setSearchedLocation, setSelectedIndex]);

  return (
    <Container>
      <FloadContainer attachTop={true}>
        <LocationSearch
          placeholder="장소를 검색하세요"
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            searchLocation(v, curLocation.latitude, curLocation.longitude, setSearchedLocation);
          }}
        />
      </FloadContainer>
      <FloadContainer attachTop={false}>
        <LocationInfoCards>
          <ColContainer>
            {searchedLocation.map((v, i) => (
              <LocationInfoCard
                key={i}
                onPress={() => setSelectedIndex(i)}
                isSelectedIndex={selectedIndex === i}
              >
                <LocationName>{v.name}</LocationName>
                <Text>{v.roadAddressName}</Text>
                {selectedIndex === i && (
                  <BasicButton
                    icon="mappin.and.ellipse"
                    title="포인트로 설정"
                    isToRight={true}
                    onPress={() => {
                      setLocation(searchedLocation[i]);
                      setSearchedLocation([]);
                      quitSearch();
                    }}
                  />
                )}
              </LocationInfoCard>
            ))}
          </ColContainer>
        </LocationInfoCards>
      </FloadContainer>
    </Container>
  );
}

const Container = styled.View({
  position: "absolute",
  width: "100%",
  height: "100%",
});

const LocationSearch = styled.TextInput({
  padding: 10,
  borderRadius: 8,
  borderWidth: 1,
});

const LocationInfoCards = styled.ScrollView({
  maxHeight: "250px",
});
const LocationInfoCard = styled.Pressable<{ isSelectedIndex: boolean }>((props) => ({
  padding: 10,
  width: "100%",
  ...(props.isSelectedIndex && { backgroundColor: "rgba(0, 0, 0, 0.1)", borderRadius: 8 }),
}));
const LocationName = styled.Text({
  fontSize: FontSizes.large,
});
