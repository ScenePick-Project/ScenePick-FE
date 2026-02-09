export interface ContentBasicDto {
  contentId: number;
  title: string;
  posterImageUrl: string;
  synopsis: string | null;
  genreList: string[];
  defaultSeasonNo?: number | null;
  seasonList?: SeasonDto[];
}

export interface CreditDto {
  creditId: number;
  name: string;
  charName: string;
  profileImageUrl: string;
}

export interface EpisodeDto {
  episodeId: number;
  episodeNo: number;
  title: string;
  summary: string;
  stillImageUrl: string;
}

export interface EpisodeListDto {
  episodeList: EpisodeDto[];
}

export interface SeasonDto {
  seasonId: number;
  seasonNo: number;
  name: string;
  overview: string;
  posterImageUrl: string;
}
