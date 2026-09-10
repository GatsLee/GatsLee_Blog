import ProductFlow from "./ProductFlow";
import { FEATURE_SECTION, type ProductFeature, type ProductType } from "@/lib/product";

/**
 * 핵심 기능. 타입마다 라벨과 목업 배치가 다르다(IA_PD_002).
 * 앱은 단계마다 모바일 목업 최대 2컷, 웹은 웹 목업 1컷, 에이전트는 목업 없이 글만.
 */
export default function ProductFeatures({
  type,
  features,
  flowUrl,
}: {
  type: ProductType;
  features: ProductFeature[];
  flowUrl: string;
}) {
  const section = FEATURE_SECTION[type];
  if (features.length === 0 && !(section.flowInside && flowUrl)) return null;

  const shotGrid = type === "app" ? "sm:grid-cols-2" : "grid-cols-1";

  return (
    <section className="mb-20">
      <p className="editorial-label text-brand mb-3">{section.kicker}</p>
      <h2
        className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-10"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {section.heading}
      </h2>

      {section.flowInside && <ProductFlow url={flowUrl} heading={section.heading} bare />}

      <div className="space-y-14">
        {features.map((feature, i) => (
          <div key={i}>
            {feature.shots && feature.shots.length > 0 && (
              <div className={`grid ${shotGrid} gap-4 mb-6`}>
                {feature.shots.slice(0, type === "app" ? 2 : 1).map((src, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={j}
                    src={src}
                    alt={`${feature.label} ${j + 1}`}
                    className="w-full rounded-lg card-border"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
            <p className="editorial-label text-brand mb-2">{feature.label}</p>
            {feature.sub && (
              <h3
                className="text-lg font-bold text-foreground tracking-tight mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {feature.sub}
              </h3>
            )}
            {feature.body && (
              <p className="text-[15px] text-secondary leading-[1.8] max-w-2xl">{feature.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
