/** 서비스 플로우. Figma 임베드 하나. 에이전트 타입에서는 핵심 기능 안으로 들어간다. */
export default function ProductFlow({
  url,
  heading,
  bare = false,
}: {
  url: string;
  heading: string;
  bare?: boolean;
}) {
  if (!url) return null;

  const frame = (
    <div className="aspect-[16/10] w-full">
      <iframe
        src={url}
        title={heading}
        className="w-full h-full rounded-lg card-border"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );

  if (bare) return <div className="mb-12">{frame}</div>;

  return (
    <section className="mb-20">
      <p className="editorial-label text-brand mb-3">FLOW</p>
      <h2
        className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-8"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {heading}
      </h2>
      {frame}
    </section>
  );
}
