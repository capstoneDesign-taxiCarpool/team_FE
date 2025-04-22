export interface Party {
  partyId?: number;
  when2go?: number;
  departure?: LocationInfo;
  destination?: LocationInfo;
  maxMembers: number;
  curMembers: number;
  comment?: string;
  options: ("NO_TALKING" | "SAME_SEX" | "PAY_IN_TAXI")[];
}

export interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
}
