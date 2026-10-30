-- 프로젝트 상세의 헤드라인·소개·대표 시각 자료·주요 사용자·문제와 가설·핵심 결정 (IA_AD_00301, IA_PD_002)
ALTER TABLE "Product" ADD COLUMN "detail" TEXT NOT NULL DEFAULT '{}';
