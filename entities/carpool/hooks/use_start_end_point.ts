import { useEffect, useState } from "react";

import usePartyStore from "../store/usePartyStore";
import { LocationInfo } from "../types";

/**
 * 전역 상태의 isHandOverdDate가 true라면,
 * 출발지와 도착자의 상태를 동기화해서 리턴
 * @returns 출발지와 도착지 상태 & set 함수
 */
export default function useStartEndPoint() {
  const [departure, setDeparture] = useState<LocationInfo | undefined>(undefined);
  const [destination, setDestination] = useState<LocationInfo | undefined>(undefined);
  const isHandOveredData = usePartyStore((state) => state.isHandOveredData);
  const setPartyState = usePartyStore((state) => state.setPartyState);
  useEffect(() => {
    if (isHandOveredData) {
      setDeparture(usePartyStore.getState().departure);
      setDestination(usePartyStore.getState().destination);
      setPartyState({ isHandOveredData: false });
    }
  }, [isHandOveredData, setPartyState]);

  return { departure, setDeparture, destination, setDestination };
}
