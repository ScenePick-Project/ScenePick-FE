export interface HomeContent {
  contentId: number;
  title: string;
  posterImageUrl: string;
  contentType: "MOVIE" | "TV";
}

export interface HomeRecommendationsResponse {
  recommendationType: "RANDOM";
  contentList: HomeContent[];
}
