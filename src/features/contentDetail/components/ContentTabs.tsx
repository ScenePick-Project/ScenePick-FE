import { useState } from "react";
import { InfoTab } from "@features/contentDetail/components/InfoTab.tsx";
import { Tabs } from "@components/ui/Tabs.tsx";
import { CastTab } from "@features/contentDetail/components/CastTab.tsx";

const CONTENT_TABS = [
  { id: "info", label: "작품 정보" },
  { id: "cast", label: "출연진" },
  { id: "episode", label: "에피소드/장면" },
  { id: "review", label: "리뷰" },
] as const;

type TabId = (typeof CONTENT_TABS)[number]["id"];

export const ContentTabs = ({ contentId }: { contentId: number }) => {
  const [activeTab, setActiveTab] = useState<TabId>("info");

  return (
    <div>
      <Tabs
        items={CONTENT_TABS}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />

      <div className="py-10">
        {activeTab === "info" && <InfoTab contentId={contentId} />}

        {activeTab === "cast" && <CastTab contentId={contentId} />}

        {activeTab === "episode" && (
          <div className="text-gray-500">에피소드 정보 준비 중...</div>
        )}
        {activeTab === "review" && (
          <div className="text-gray-500">리뷰가 아직 없습니다.</div>
        )}
      </div>
    </div>
  );
};
