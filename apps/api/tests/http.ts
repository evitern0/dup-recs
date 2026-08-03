export interface UserPayload {
  id: string;
  username: string;
  email?: string;
}

export interface AuthPayload {
  user: UserPayload;
  token: string;
}

export interface GroupPayload {
  group: {
    id: string;
    name: string;
  };
}

export interface InvitationPayload {
  invitation: {
    id: string;
    groupId: string;
    token: string;
    status: string;
  };
}

export interface MembershipPayload {
  membership: {
    groupId: string;
    userId: string;
    role?: string;
  };
}

export interface PostPayload {
  post: {
    id: string;
    description?: string;
  };
}

export interface CommentPayload {
  comment: {
    id: string;
    postId: string;
    body: string;
  };
}

export interface TimelinePayload {
  posts: Array<{
    id: string;
    description: string;
  }>;
  nextCursor?: string | null;
}

export interface UserPostsPayload {
  user: UserPayload;
  posts: Array<{
    id: string;
    description?: string;
  }>;
}

export interface AlbumSearchPayload {
  results: Array<{
    albumMusicBrainzId: string;
    albumTitle: string;
    artistName: string;
    releaseYear: string;
    albumArtUrl: string;
  }>;
}

export interface ErrorPayload {
  error: string;
}

export async function jsonOf<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
