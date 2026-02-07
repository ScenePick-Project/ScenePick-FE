export interface ContentBasicDTO {
  contentId: number;
  title: string;
  posterImageUrl: string;
  synopsis: string | null;
  genreList: string[];
  defaultSeasonNo?: number | null;
  seasonList?: SeasonDTO[];
}

export interface CreditDTO {
  creditId: number;
  name: string;
  charName: string;
  profileImageUrl: string;
}

export interface EpisodeDTO {
  episodeId: number;
  episodeNo: number;
  title: string;
  summary: string;
  stillImageUrl: string;
}

export interface EpisodeListDTO {
  episodeList: EpisodeDTO[];
}

export interface SeasonDTO {
  seasonId: number;
  seasonNo: number;
  name: string;
  overview: string;
  posterImageUrl: string;
}
