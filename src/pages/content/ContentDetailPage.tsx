import { useParams } from "react-router-dom";
import { ContentHeader } from "@features/contentDetail/components/ContentHeader.tsx";
import { ContentTabs } from "@features/contentDetail/components/ContentTabs.tsx";

const ContentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const contentId = Number(id);

  return (
    <div className="animate-in fade-in duration-700 min-h-screen pt-24 pb-20 px-8 max-w-7xl mx-auto">
      <ContentHeader contentId={contentId} />

      <section className="mt-20 border-t border-gray-100 pt-10">
        <ContentTabs contentId={contentId} />
      </section>
    </div>
  );
};

export default ContentDetailPage;
