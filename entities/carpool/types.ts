export interface Party {
  partyId?: number;
  when2go?: number;
  departure?: LocationInfo;
  destination?: LocationInfo;
  maxMembers: number;
  curMembers: number;
  estimatedFare: number;
  comment?: string;
  options: {
    sameGenderOnly: boolean;
    costShareBeforeDropOff: boolean;
    quietMode: boolean;
    destinationChangeIn5Minutes: boolean;
  };
}

// 서버 원본 응답 형태 (options 중첩 + ISO 문자열 시간)
export interface RawPartyResponse {
  id: number;
  hostMemberId?: number;
  options: {
    sameGenderOnly: boolean;
    costShareBeforeDropOff: boolean;
    quietMode: boolean;
    destinationChangeIn5Minutes: boolean;
  };
  startDateTime: string; // ISO
  comment: string;
  currentParticipantCount: number;
  maxParticipantCount: number;
  startPlace: LocationInfo;
  savingsCalculated: boolean;
  endPlace: LocationInfo;
  estimatedFare: number;
}

// 기존 프론트 사용 형태 (플랫 옵션 + timestamp 시간)
export interface PartyResponse {
  id: number;
  sameGenderOnly: boolean;
  costShareBeforeDropOff: boolean;
  quietMode: boolean;
  hostMemberId?: number;
  destinationChangeIn5Minutes: boolean;
  startDateTime: number; // timestamp(ms)
  comment: string;
  currentParticipantCount: number;
  savingsCalculated: boolean;
  maxParticipantCount: number;
  startPlace: LocationInfo;
  endPlace: LocationInfo;
  estimatedFare: number;
}

export const mapRawParty = (raw: RawPartyResponse): PartyResponse => ({
  id: raw.id,
  sameGenderOnly: raw.options.sameGenderOnly,
  costShareBeforeDropOff: raw.options.costShareBeforeDropOff,
  quietMode: raw.options.quietMode,
  hostMemberId: raw.hostMemberId,
  destinationChangeIn5Minutes: raw.options.destinationChangeIn5Minutes,
  startDateTime: new Date(raw.startDateTime).getTime(),
  comment: raw.comment,
  savingsCalculated: raw.savingsCalculated,
  currentParticipantCount: raw.currentParticipantCount,
  maxParticipantCount: raw.maxParticipantCount,
  startPlace: raw.startPlace,
  endPlace: raw.endPlace,
  estimatedFare: raw.estimatedFare,
});

export interface LocationInfo {
  name: string;
  roadAddressName?: string;
  x: number;
  y: number;
}
