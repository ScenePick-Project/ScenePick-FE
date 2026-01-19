export const Logo = () => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-blue-500 rounded-tl-sm" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-blue-500 rounded-tr-sm" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-blue-500 rounded-bl-sm" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-blue-500 rounded-br-sm" />
      </div>

      <div className="text-2xl tracking-tight flex items-baseline">
        <span className="font-medium text-slate-500">Scene</span>
        <span className="font-black text-slate-900 ml-0.5 relative">Pick</span>
      </div>
    </div>
  );
};
