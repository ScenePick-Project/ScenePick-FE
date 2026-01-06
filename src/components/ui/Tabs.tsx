interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: readonly TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export const Tabs = ({ items, activeId, onChange }: TabsProps) => {
  return (
    <nav className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap">
      {items.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-6 py-4 text-sm font-bold transition-all relative
              ${isActive ? "text-black" : "text-gray-400 hover:text-gray-600"}
            `}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
