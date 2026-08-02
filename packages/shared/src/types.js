export const userShape = {
  id: 'string',
  email: 'string',
  username: 'string',
  createdAt: 'string'
};

export const groupShape = {
  id: 'string',
  name: 'string',
  createdAt: 'string'
};

export const postShape = {
  id: 'string',
  groupId: 'string',
  userId: 'string',
  albumMusicBrainzId: 'string',
  albumTitle: 'string',
  artistName: 'string',
  releaseYear: 'string',
  albumArtUrl: 'string',
  description: 'string',
  createdAt: 'string'
};

export const commentShape = {
  id: 'string',
  postId: 'string',
  userId: 'string',
  body: 'string',
  createdAt: 'string'
};
