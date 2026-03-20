function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl z-50">
      <div className="flex flex-col items-center gap-6">
        {/* glowing spinner */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-2xl animate-pulse"></div>

          <div className="w-16 h-16 border-[3px] border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>

        {/* text */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-emerald-400 font-medium tracking-wide">
            Preparing your groceries
          </p>

          <p className="text-xs text-neutral-400">Please wait a moment...</p>
        </div>

        {/* loading dots */}
        <div className="flex gap-2 mt-1">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:.2s]"></span>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:.4s]"></span>
        </div>
      </div>
    </div>
  );
}

export default Loading;
