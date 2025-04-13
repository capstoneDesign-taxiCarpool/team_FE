import React from "react";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

export default function Join() {
  return (
    <MapView
      style={{ flex: 1 }}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        latitude: 42,
        longitude: 30,
        latitudeDelta: 1,
        longitudeDelta: 1,
      }}
    />
  );
}
