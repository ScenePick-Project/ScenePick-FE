import { useEffect, useState } from "react";
import { InfoTab } from "@features/contentDetail/components/InfoTab.tsx";
import { Tabs } from "@components/ui/Tabs.tsx";
import { CreditTab } from "@features/contentDetail/components/CreditTab.tsx";
import { EpisodeTab } from "@features/contentDetail/components/EpisodeTab.tsx";
import type {
  ContentBasicDTO,
  SeasonDTO,
} from "@features/contentDetail/types/contentDetailTypes.ts";

const CONTENT_TABS = [
  { id: "info", label: "작품 정보" },
  { id: "credits", label: "출연진" },
  { id: "episode", label: "에피소드/장면" },
  { id: "review", label: "리뷰" },
] as const;

type TabId = (typeof CONTENT_TABS)[number]["id"];

type ContentTabsProps = {
  contentId: number;
  content?: ContentBasicDTO;
  seasons: SeasonDTO[];
  selectedSeason: SeasonDTO | null;
  selectedSeasonNo: number | null;
  isContentLoading: boolean;
  isTv: boolean;
  isSeasonLoading: boolean;
};

export const ContentTabs = ({
  contentId,
  content,
  seasons,
  selectedSeason,
  selectedSeasonNo,
  isContentLoading,
  isTv,
  isSeasonLoading,
}: ContentTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const visibleTabs = isTv
    ? CONTENT_TABS
    : CONTENT_TABS.filter((tab) => tab.id !== "episode");

  useEffect(() => {
    if (!isTv && activeTab === "episode") {
      setActiveTab("info");
    }
  }, [activeTab, isTv]);

  return (
    <div>
      <Tabs
        items={visibleTabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      <div className="py-10">
        {activeTab === "info" && (
          <InfoTab
            content={content}
            season={selectedSeason}
            isSeasonLoading={isSeasonLoading}
            hasSeasons={seasons.length > 0}
          />
        )}

        {activeTab === "credits" && (
          <CreditTab
            contentId={contentId}
            seasonNo={isTv ? selectedSeasonNo : undefined}
            isContentLoading={isContentLoading}
            isSeasonLoading={isSeasonLoading}
          />
        )}

        {activeTab === "episode" && (
          <EpisodeTab
            contentId={contentId}
            seasonNo={selectedSeasonNo}
            isContentLoading={isContentLoading}
            isSeasonLoading={isSeasonLoading}
          />
        )}
        {activeTab === "review" && (
          <div className="text-gray-500">리뷰가 아직 없습니다.</div>
        )}
      </div>
    </div>
  );
};
