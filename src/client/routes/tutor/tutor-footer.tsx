export function TutorFooter({ className = "" }: { className?: string }) {
  return (
    <div className={`mt-10 pb-6 text-center shrink-0 ${className}`}>
      <div className="inline-flex items-center gap-2 text-zinc-600 text-xs select-none">
        <span className="w-8 h-px bg-zinc-800" />
        Fad Tutor · STEAM-IE Smart Education Lab
        <span className="w-8 h-px bg-zinc-800" />
      </div>
    </div>
  );
}
