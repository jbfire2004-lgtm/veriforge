export type HubProfileSkillDto = {
  skill: string;
  level?: string | null;
  endorsementCount: number;
};

export type HubProfileTrainingDto = {
  name: string;
  status: string;
  expiresAt?: string | null;
};

export type HubProfileExperienceDto = {
  projectId?: number;
  projectName: string;
  role?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type HubProfileDto = {
  id: string;
  userId: number;
  workerId?: number | null;
  displayName: string;
  headline?: string | null;
  about?: string | null;
  photoUrl?: string | null;
  location?: { city?: string | null; region?: string | null };
  primaryTrade?: string | null;
  visibility: string;
  profileCompleteness: number;
  reputationScore: number;
  skills: HubProfileSkillDto[];
  training: HubProfileTrainingDto[];
  experience: HubProfileExperienceDto[];
  connectionStatus: 'none' | 'pending' | 'connected' | 'self';
  pendingConnectionId?: string | null;
  incomingConnectionRequest?: boolean;
  openToWork?: boolean;
};

export type HubProfileCardDto = {
  userId: number;
  displayName: string;
  headline?: string | null;
  photoUrl?: string | null;
  primaryTrade?: string | null;
};

export type UpdateHubProfileDto = {
  headline?: string;
  about?: string;
  photoUrl?: string;
  locationCity?: string;
  locationRegion?: string;
  primaryTrade?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS' | 'COMPANY';
};
