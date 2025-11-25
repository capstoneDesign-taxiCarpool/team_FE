import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";
import styled from "styled-components/native";

// SF Symbols -> Material Icons
const MAPPING = {
  "arrow-back-outline": "arrow-back",
  "arrow-back": "arrow-back",
  "chatbubble-ellipses": "chat",
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "bubble.left.fill": "chat",
  settings: "settings",
  "person.circle": "account-circle",
  "magnifyingglass.circle": "search",
  "arrow.2.circlepath.circle": "swap-vert",
  "arrow.right": "arrow-forward",
  clock: "access-time",
  "person.3": "people",
  checkmark: "check",
  "minus.circle": "remove-circle-outline",
  "plus.circle": "add-circle-outline",
  "mappin.and.ellipse": "place",
  calendar: "event",
  gearshape: "settings",
  trash: "delete",
  "mappin.circle.fill": "add-location-alt",
} as Partial<
  Record<
    import("expo-symbols").SymbolViewProps["name"],
    React.ComponentProps<typeof MaterialIcons>["name"]
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color = "#2C2C2C",
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return <StyledMaterialIcons color={color} size={size} name={MAPPING[name] || "help-outline"} />;
}

const StyledMaterialIcons = styled(MaterialIcons)({
  textAlign: "center",
});
