# 클라우드 API 없이 로컬 LLM 평가 파이프라인 만들기

**카테고리:** devlog
**태그:** LLM, evaluation, Ollama, pynvml, hardware-profiling
**프로젝트:** LLMEval

---

## 요약

OpenAI API를 한 번도 쓰지 않고, 로컬 환경에서 LLM의 품질과 하드웨어 성능을 동시에 측정하는 평가 파이프라인을 만들었습니다.

---

## 왜 만들었나

LLM을 평가할 때 보통 GPT-4를 judge로 씁니다. 하지만 매번 API 비용이 들고, 네트워크 상태에 따라 결과가 달라질 수도 있습니다. 로컬에서 모든 걸 완결짓고 싶었습니다.

## 구조

LLMEval은 YAML 파일 하나로 평가를 정의합니다. Jinja2 템플릿에 입력 데이터를 넣어 프롬프트를 생성하고, Ollama streaming API로 모델을 돌립니다.

평가는 6개의 evaluator가 담당합니다.

- **exact_match**: 정답과 정확히 일치하는지
- **ROUGE-1/2/L**: 텍스트 겹침 수준
- **LLM judge**: 로컬 모델이 1-5점으로 채점
- **embedding similarity**: 의미적 유사도
- **faithfulness / fluency**: 사실 충실도와 자연스러움

동시에 백그라운드 스레드에서 10ms 간격으로 GPU 상태를 샘플링합니다. pynvml과 psutil을 사용해서 VRAM, GPU 사용률, 온도, 전력 소비를 기록합니다.

## 로컬 judge의 불안정성

로컬 모델을 judge로 쓰면 같은 프롬프트에도 점수가 들쭉날쭉합니다. 처음에는 꽤 당황했습니다.

해결은 단순했습니다. 같은 평가를 3번 돌리고 중앙값을 취했습니다. 분산이 1.5 이상이면 경고 플래그를 남기도록 했습니다. 완벽하진 않지만 클라우드 API 없이도 쓸 만한 수준이 되었습니다.

## VRAM spillover 감지

GPU VRAM이 부족하면 시스템 RAM으로 넘어가는데, 이때 토큰 생성 속도(t/s)가 급격히 떨어집니다. pynvml로 VRAM 사용량을 추적하면서 동시에 시스템 RAM 증가 패턴을 감지하면, spillover가 발생했는지 자동으로 알 수 있습니다.

처음에는 VRAM 임계값을 수동으로 설정했는데, 모델마다 다르니까 관리가 어려웠습니다. Isolation Forest로 바꾸니 모델에 관계없이 이상 패턴을 잡아주었습니다.

## 배운 점

- nvidia-smi를 파싱하는 것보다 pynvml을 직접 호출하는 게 10배 이상 빨랐습니다
- Isolation Forest는 수작업 규칙보다 훨씬 유연하게 이상을 탐지했습니다
- 평가 체계 없이 LLM 프로젝트를 운영하는 건, 속도계 없이 운전하는 것과 비슷하다고 느꼈습니다
