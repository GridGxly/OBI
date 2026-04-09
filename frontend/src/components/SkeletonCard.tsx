export default function SkeletonCard() {
  return (
    <div
      className="w-full rounded-[14px] overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.04)",
        padding: "20px 22px",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col gap-2 flex-1 mr-4">
          <div
            className="h-4 rounded-md animate-pulse"
            style={{ width: "65%", background: "rgba(255,255,255,0.04)" }}
          />
          <div
            className="h-2.5 rounded animate-pulse"
            style={{ width: "40%", background: "rgba(255,255,255,0.025)" }}
          />
        </div>
        <div
          className="w-12 h-12 rounded-[10px] shrink-0 animate-pulse"
          style={{ background: "rgba(255,255,255,0.03)" }}
        />
      </div>

      <div
        className="h-14 rounded-[10px] animate-pulse"
        style={{ background: "rgba(255,255,255,0.02)" }}
      />
    </div>
  );
}
