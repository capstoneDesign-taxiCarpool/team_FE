import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styled from "styled-components/native";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import { Colors } from "@/entities/common/util/style_var";

export default function FindTrack() {
  const [location, setLocation] = useState<Location.LocationObjectCoords>({
    latitude: 37.868897,
    longitude: 127.744994,
    altitude: 0,
    accuracy: 0,
    altitudeAccuracy: 0,
    heading: 0,
    speed: 0,
  });

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      // 현재 위치 가져오기
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    } catch (error) {
      console.error("위치를 가져오는데 실패했습니다:", error);
    }
  };

  return (
    <Container>
      {/* 상단 위치 표시줄 */}
      <LocationBar>
        <LocationContent>
          <LocationText>강원대 정문</LocationText>
        </LocationContent>
        <SwapBtn onPress={fetchLocation}>
          <IconSymbol name="arrow.2.circlepath.circle" size={24} color={Colors.black} />
        </SwapBtn>
        <LocationContent>
          <LocationText>현재 위치</LocationText>
        </LocationContent>
      </LocationBar>

      {/* 지도 */}
      <Map
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={"현재 위치"}
          description="여기가 당신의 현재 위치입니다."
        />
      </Map>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
});

const Map = styled(MapView)({
  flex: 1,
  width: "100%",
  height: "100%",
});

// 위치 표시줄 스타일
const LocationBar = styled.View({
  position: "absolute",
  top: 20,
  left: 20,
  right: 20,
  zIndex: 10,
  backgroundColor: "white",
  borderRadius: 16,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowRadius: 4,
  elevation: 5,
  flexDirection: "column",
  alignContent: "center",
  gap: 10,
});

const SwapBtn = styled.TouchableOpacity({
  width: "fit-content",
});

const LocationContent = styled.View({
  paddingHorizontal: 20,
  paddingVertical: 15,
});

const LocationText = styled.Text({
  fontSize: 16,
  textAlign: "center",
  fontWeight: "bold",
});
