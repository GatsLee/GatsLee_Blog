# CLI에서 웹 서비스로: 평가 도구의 프로덕션 진화

**카테고리:** devlog
**태그:** CLI, web-service, HTMX, monitoring, APScheduler
**프로젝트:** LLMEval → ModelPulse

---

## 요약

터미널에서 돌리던 LLM 평가 CLI를 웹 대시보드로 진화시켰습니다. 스케줄링, 시각화, 알림을 추가하면서 겪은 설계 변화를 정리했습니다.

---

## CLI의 한계

LLMEval은 `llmeval run task.yaml`로 실행하는 CLI입니다. 잘 동작하지만, 실제로 운영하다 보니 한계가 보이기 시작했습니다.

- 정기 실행을 위해 시스템 cron을 직접 관리해야 했습니다
- 결과를 비교하려면 SQLite를 직접 쿼리해야 했습니다
- 품질이 서서히 떨어져도 알아차리기 어려웠습니다

모니터링이 필요했습니다. CLI 위에 웹을 얹기로 했습니다.

## ModelPulse: 웹으로의 확장

| 기능 | LLMEval (CLI) | ModelPulse (Web) |
|------|---------------|-------------------|
| 실행 | 수동 (터미널) | 자동 (APScheduler) |
| 결과 확인 | SQLite 쿼리 | Chart.js 대시보드 |
| 알림 | 없음 | Slack webhook |
| 상태 관리 | Stateless | Stateful (실행 이력) |

핵심 설계 원칙은 하나였습니다. LLMEval의 runner, evaluator, profiler 모듈을 그대로 import하고, 새로 만드는 건 스케줄링 + UI + 알림뿐.

## HTMX를 선택한 이유

React나 Vue를 또 쓰기엔 이 프로젝트에는 과했습니다. 대시보드는 서버에서 데이터를 가져와 보여주는 게 전부입니다.

HTMX로 서버 렌더링 HTML을 부분 교체하면 실시간 느낌을 줄 수 있었습니다. Jinja2 템플릿 + HTMX 조합으로 프론트엔드 빌드 스텝이 제로가 되었습니다. `npm install` 같은 건 없습니다.

```html
<!-- 파이프라인 실행 버튼 -->
<button hx-post="/api/pipeline/run"
        hx-target="#result-panel"
        hx-swap="innerHTML">
  Run Evaluation
</button>
```

## 품질 회귀 감지

가장 실용적인 기능이었습니다. 이전 3회 실행의 평균 점수 대비 15% 이상 하락하면 Slack으로 알림을 보냅니다.

모델 업데이트, 프롬프트 변경, 인프라 문제 — 원인이 뭐든 품질 저하를 빠르게 포착할 수 있게 되었습니다.

## 배운 점

- CLI를 모듈 구조로 잘 만들어두면 웹 서비스 확장이 정말 쉬웠습니다. 새로 짠 코드는 전체의 30% 정도였습니다
- HTMX는 대시보드 용도에 충분했습니다. 복잡한 인터랙션이 필요 없다면 프론트엔드 프레임워크 없이도 괜찮았습니다
- 모니터링은 결국 "평가의 시간 축 확장"이었습니다. 한 번 측정하는 것과 계속 측정하는 것은 차원이 다른 인사이트를 줍니다
