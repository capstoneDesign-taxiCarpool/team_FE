export interface Party {
  partyId?: number;
  when2go?: number;
  departure?: LocationInfo;
  destination?: LocationInfo;
  maxMembers: number;
  curMembers: number;
  comment?: string;
  options: {
    sameGenderOnly: boolean;
    costShareBeforeDropOff: boolean;
    quietMode: boolean;
    destinationChangeIn5Minutes: boolean;
  };
}

export interface LocationInfo {
  name: string;
  roadAddressName?: string;
  x: number;
  y: number;
}
