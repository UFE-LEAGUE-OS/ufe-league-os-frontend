import apiClient from './apiClient.js';

export type FollowContentType = 'CLUB' | 'LEAGUE' | 'UNION' | 'COMPETITION';

export interface FollowApi {
  id: number;
  content_type: FollowContentType;
  object_id: number;
  object_name: string;
  created_at: string;
}

export interface FollowListApi {
  club_count: number;
  league_count: number;
  union_count: number;
  competition_count: number;
  clubs: FollowApi[];
  leagues: FollowApi[];
  unions: FollowApi[];
  competitions: FollowApi[];
}

export async function getMyFollows(): Promise<FollowListApi> {
  const response = await apiClient.get<FollowListApi>('/accounts/follow/');
  return response.data;
}

export async function followEntity(
  contentType: FollowContentType,
  objectId: number,
): Promise<FollowApi> {
  const response = await apiClient.post<FollowApi>('/accounts/follow/', {
    content_type: contentType,
    object_id: objectId,
  });

  return response.data;
}

export async function unfollowEntity(
  contentType: FollowContentType,
  objectId: number,
): Promise<void> {
  await apiClient.delete('/accounts/follow/', {
    data: {
      content_type: contentType,
      object_id: objectId,
    },
  });
}

export const followClub = (clubId: number) => followEntity('CLUB', clubId);
export const unfollowClub = (clubId: number) => unfollowEntity('CLUB', clubId);
