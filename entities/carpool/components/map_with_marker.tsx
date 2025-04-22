import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import styled from "styled-components/native";

import { LocationInfo } from "../types";

export default function MapWithMarker({
  markers = [],
  departure,
  destination,
}: {
  markers?: LocationInfo[];
  departure?: LocationInfo;
  destination?: LocationInfo;
}) {
  return (
    <Map provider={PROVIDER_GOOGLE} showsUserLocation={true}>
      {markers.map((loc, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: loc.lat,
            longitude: loc.lng,
          }}
          title={loc.name}
          description={""}
        />
      ))}
      {departure && (
        <Marker
          coordinate={{
            latitude: departure.lat,
            longitude: departure.lng,
          }}
          title={departure.name}
          pinColor="blue"
          description={"출발지"}
        />
      )}
      {destination && (
        <Marker
          coordinate={{
            latitude: destination.lat,
            longitude: destination.lng,
          }}
          title={destination.name}
          pinColor="red"
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
