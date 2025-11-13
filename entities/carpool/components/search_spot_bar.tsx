import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native"; // ✅ Keyboard import
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
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
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
      .then((res) => setSearchResult(res.data.places))
      .catch(() => {});
  },
  500,
);

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

  const handleSearch = (text?: string) => {
    const keyword = text ?? query;
    if (keyword.trim().length === 0) return;
    setQuery(keyword);
    searchLocation(keyword, curLocation.latitude, curLocation.longitude, setSearchedLocation);

    Keyboard.dismiss(); // ✅ 검색 후 키보드 내리기
  };

  const quickPlaces = ["강원대학교", "남춘천역", "춘천시외버스터미널"];

  return (
    <Container>
      <FloadContainer attachTop={true}>
        <SearchBarContainer>
          <LocationSearch
            placeholder="장소를 검색하세요"
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              searchLocation(v, curLocation.latitude, curLocation.longitude, setSearchedLocation);
            }}
            onSubmitEditing={() => handleSearch()} // ✅ 엔터 눌러도 검색+키보드 닫기
            returnKeyType="search"
          />
          <SearchBtn onPress={() => handleSearch()}>
            <Ionicons name="search" size={22} color="#333" />
          </SearchBtn>
        </SearchBarContainer>

        {/* 빠른 검색 버튼 */}
        <QuickButtonsRow>
          {quickPlaces.map((place) => (
            <QuickButton key={place} onPress={() => handleSearch(place)}>
              <QuickButtonText>{place}</QuickButtonText>
            </QuickButton>
          ))}
        </QuickButtonsRow>
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

const SearchBarContainer = styled(View)({
  flexDirection: "row",
  alignItems: "center",
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 6,
});

const LocationSearch = styled.TextInput({
  flex: 1,
  padding: 6,
  fontSize: FontSizes.medium,
});

const SearchBtn = styled(TouchableOpacity)({
  padding: 6,
});

const QuickButtonsRow = styled.View({
  flexDirection: "row",
  justifyContent: "space-around",
  marginTop: 17,
});

const QuickButton = styled.TouchableOpacity({
  backgroundColor: "#f0f0f0",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 16,
  elevation: 2,
});

const QuickButtonText = styled.Text({
  fontSize: FontSizes.medium,
  fontWeight: "500",
  color: "#333",
});

const LocationInfoCards = styled.ScrollView({
  maxHeight: "150px",
});

const LocationInfoCard = styled.Pressable<{ isSelectedIndex: boolean }>((props) => ({
  padding: 10,
  width: "100%",
  ...(props.isSelectedIndex && { backgroundColor: "rgba(0, 0, 0, 0.1)", borderRadius: 8 }),
}));

const LocationName = styled.Text({
  fontSize: FontSizes.large,
});
