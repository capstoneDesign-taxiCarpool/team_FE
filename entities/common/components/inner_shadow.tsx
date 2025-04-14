import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

/**
 * @returns Inner shadow 컴포넌트 (광원 북서쪽)
 */
export default function InnerShadow({ radius = 30 }: { radius?: number }) {
  return (
    <Svg
      height="100%"
      width="100%"
      style={{ position: "absolute", zIndex: 2, borderRadius: `${radius}px` }}
    >
      <Defs>
        <LinearGradient id="top-shadow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="rgba(0, 0, 0, 0.4)" stopOpacity="1" />
          <Stop offset="1" stopColor="transparent" stopOpacity="0" />
        </LinearGradient>
        <RadialGradient id="left-corner-shadow" cx="90%" cy="110%" r="100%" fx="90%" fy="110%">
          <Stop offset="0.6" stopColor="transparent" stopOpacity="0" />
          <Stop offset="1" stopColor="rgba(0, 0, 0, 0.4)" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Rect x="10px" y="0" width="100%" height="5px" fill="url(#top-shadow)" />
      <Rect x="0" y="0" width="10px" height="10px" fill="url(#left-corner-shadow)" />
    </Svg>
  );
}
