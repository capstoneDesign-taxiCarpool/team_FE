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

export interface PartyResponse {
  id: number;
  sameGenderOnly: boolean;
  costShareBeforeDropOff: boolean;
  quietMode: boolean;
  destinationChangeIn5Minutes: boolean;
  startDateTime: number;
  comment: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  startPlace: LocationInfo;
  endPlace: LocationInfo;
}

export interface LocationInfo {
  name: string;
  roadAddressName?: string;
  x: number;
  y: number;
}
