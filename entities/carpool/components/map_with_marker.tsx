import { useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styled from "styled-components/native";

import { Colors } from "@/entities/common/util/style_var";

import { LocationInfo } from "../types";

export default function MapWithMarker({
  markers = [],
  selectedIndex,
  setSelectedIndex,
  departure,
  destination,
}: {
  markers?: LocationInfo[];
  selectedIndex?: number;
  setSelectedIndex?: React.Dispatch<React.SetStateAction<number | undefined>>;
  departure?: LocationInfo;
  destination?: LocationInfo;
}) {
  const mapRef = useRef<MapView>(null);

  // 마커가 선택되었을 때, 해당 마커로 맵을 이동
  useEffect(() => {
    if (markers.length > 0 && selectedIndex !== undefined && markers[selectedIndex]) {
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
  }, [markers, selectedIndex]);

  return (
    <Map
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 37.868897,
        longitude: 127.744994,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
      showsUserLocation={true}
      showsMyLocationButton={false}
    >
      {markers.map((loc, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: loc.y,
            longitude: loc.x,
          }}
          pinColor={Colors.side}
          title={loc.name}
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
          coordinate={{
            latitude: departure.y,
            longitude: departure.x,
          }}
          title={departure.name}
          pinColor={Colors.side}
          description={"출발지"}
        />
      )}
      {destination && (
        <Marker
          coordinate={{
            latitude: destination.y,
            longitude: destination.x,
          }}
          title={destination.name}
          pinColor={Colors.main}
          description={"도착지"}
        />
      )}
    </Map>
  );
}

const Map = styled(MapView)({
  flex: 1,
  width: "100%",
  height: "100%",
});
