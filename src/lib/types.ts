export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  coverColor: string;
  playCount: number;
  isFavorite: boolean;
};

export type GenreSummary = {
  genre: string;
  count: number;
};

export type PlaylistSummary = {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  trackCount: number;
};

export type PlaylistWithTracks = PlaylistSummary & {
  tracks: Track[];
};

export type PlaylistMenuItem = {
  label: string;
  value: string;
  active: boolean;
};

export type ActionResult = { ok: true } | { ok: false; error: string };
