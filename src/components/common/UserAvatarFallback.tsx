import { cn } from "@/lib/utils.ts";

interface UserAvatarFallbackProps {
  className?: string;
}

export const UserAvatarFallback = ({
  className,
}: UserAvatarFallbackProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%] fill-current">
        <path d="M12 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM5.25 19.5A5.25 5.25 0 0 1 10.5 14.25h3A5.25 5.25 0 0 1 18.75 19.5v.75h-13.5v-.75Z" />
      </svg>
    </div>
  );
};
