import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styled from "styled-components/native";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import { Colors } from "@/entities/common/util/style_var";

import { getReverseGeocoding } from "../api";
import { LocationInfo } from "../types";

/**
 * 지도에 마커 표시
 * - departure, destination, showAddMarkerButton을 활용하기 위해서는 setDeparture, setDestination이 필요
 */
export default function MapWithMarker({
  markers = [],
  selectedIndex,
  setSelectedIndex,
  departure,
  destination,
  showAddMarkerButton = false,
  setDeparture,
  setDestination,
}: {
  markers?: LocationInfo[];
  selectedIndex?: number;
  setSelectedIndex?: React.Dispatch<React.SetStateAction<number | undefined>>;
  departure?: LocationInfo;
  destination?: LocationInfo;
  showAddMarkerButton?: boolean;
  setDeparture?: React.Dispatch<React.SetStateAction<LocationInfo | undefined>>;
  setDestination?: React.Dispatch<React.SetStateAction<LocationInfo | undefined>>;
}) {
  const mapRef = useRef<MapView>(null);
  const [center, setCenter] = useState<{ latitude: number; longitude: number }>({
    latitude: 37.868897,
    longitude: 127.744994,
  });
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && markers.length > 0 && selectedIndex === undefined) {
      // 선택된 마커가 없고, 마커가 하나 이상일 때 첫 번째 마커를 선택
      setSelectedIndex!(0);
    }
    if (isFocused && markers.length > 0 && selectedIndex !== undefined && markers[selectedIndex]) {
      // 마커가 선택되었을 때,
      // 해당 마커로 지도를 이동
      const selectedMarker = markers[selectedIndex];
      mapRef.current?.animateToRegion(
        {
          latitude: selectedMarker.y,
          longitude: selectedMarker.x,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        1000,
      );
    }
  }, [markers, selectedIndex, setSelectedIndex, isFocused]);

  if (!isFocused) {
    return <Container />;
  }

  return (
    <Container>
      <Map
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={(region) =>
          setCenter({ latitude: region.latitude, longitude: region.longitude })
        }
        onLongPress={async (event) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          const place = await getReverseGeocoding(latitude, longitude);
          const newMarker: LocationInfo = {
            name: place?.name ?? `사용자 지정 ${departure ? "도착지" : "출발지"}`,
            roadAddressName: place?.roadAddressName,
            x: longitude,
            y: latitude,
          };
          if (departure) {
            setDestination!(newMarker);
          } else {
            setDeparture!(newMarker);
          }
        }}
      >
        {markers.map((loc, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: loc.y,
              longitude: loc.x,
            }}
            title={loc.name}
            pinColor={Colors.darkGray}
            description={loc.roadAddressName}
            onPress={() => {
              if (setSelectedIndex) {
                setSelectedIndex(index);
              }
            }}
          />
        ))}

        {departure && (
          <Marker
            draggable
            coordinate={{
              latitude: departure.y,
              longitude: departure.x,
            }}
            title={departure.name}
            pinColor={Colors.side}
            description={"출발지(꾹 누른 상태로 이동 가능)"}
            onDragEnd={async (e) => {
              if (setDeparture) {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                const place = await getReverseGeocoding(latitude, longitude);
                setDeparture({
                  name: place?.name ?? "사용자 지정 출발지",
                  roadAddressName: place?.roadAddressName,
                  x: longitude,
                  y: latitude,
                });
              }
            }}
          />
        )}
        {destination && (
          <Marker
            draggable
            coordinate={{
              latitude: destination.y,
              longitude: destination.x,
            }}
            title={destination.name}
            pinColor={Colors.main}
            description={"도착지(꾹 누른 상태로 이동 가능)"}
            onDragEnd={async (e) => {
              if (setDestination) {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                const place = await getReverseGeocoding(latitude, longitude);
                setDestination({
                  name: place?.name ?? "사용자 지정 도착지",
                  roadAddressName: place?.roadAddressName,
                  x: longitude,
                  y: latitude,
                });
              }
            }}
          />
        )}
      </Map>
      {showAddMarkerButton && (
        <>
          <AddMarkerButton
            onPress={async () => {
              // Handle adding a new marker at the center location
              const { latitude, longitude } = center;
              const place = await getReverseGeocoding(latitude, longitude);
              const newMarker: LocationInfo = {
                name: place?.name ?? `사용자 지정 ${departure ? "도착지" : "출발지"}`,
                roadAddressName: place?.roadAddressName,
                x: longitude,
                y: latitude,
              };
              if (departure) {
                setDestination!(newMarker);
              } else {
                setDeparture!(newMarker);
              }
            }}
          >
            <IconSymbol name="mappin.circle.fill" size={30} color="white" />
          </AddMarkerButton>
        </>
      )}
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  position: "relative",
  width: "100%",
  height: "100%",
});
const Map = styled(MapView)({
  flex: 1,
  width: "100%",
  height: "100%",
});
const AddMarkerButton = styled(TouchableOpacity)({
  position: "absolute",
  bottom: 20,
  right: 20,
  backgroundColor: Colors.darkGray,
  zIndex: 10,
  borderRadius: 30,
  padding: 10,
  alignItems: "center",
  justifyContent: "center",
});
