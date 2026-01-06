export interface ContentBasicDTO {
  contentId: number;
  title: string;
  posterImageUrl: string;
  synopsis: string;
  genres: string[];
}

export interface PersonDTO {
  personId: number;
  name: string;
  charName: string;
  profileImageUrl: string;
}

export interface PersonListDTO {
  persons: PersonDTO[];
}

export interface EpisodeDTO {
  episodeId: number;
  episodeNo: number;
  title: string;
  summary: string;
}

export interface EpisodeListDTO {
  episodes: EpisodeDTO[];
}
