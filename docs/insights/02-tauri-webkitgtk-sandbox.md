# Tauri 2 + React 19로 데스크톱 앱 만들기: WebKitGTK 샌드박스와의 싸움

**카테고리:** devlog
**태그:** Tauri, React, desktop-app, WebKitGTK, Vite
**프로젝트:** PageNode

---

## 요약

Tauri로 데스크톱 앱을 만들다가 Linux의 WebKitGTK 샌드박스가 localhost fetch를 차단하는 문제를 만났습니다. Vite dev proxy 패턴으로 해결했습니다.

---

## PageNode이란

PageNode는 PDF에서 개념을 추출해 지식 그래프로 시각화하는 데스크톱 앱입니다. Tauri 2 + React 19 프론트엔드에 Python FastAPI 백엔드를 사이드카로 붙인 구조입니다.

Electron 대신 Tauri를 선택한 이유는 간단합니다. 번들 크기가 작고 시스템 리소스를 훨씬 적게 씁니다.

## 문제를 만나다

개발 중에 프론트엔드에서 `fetch('http://localhost:8000/api/...')`를 호출했는데, 요청이 도달하지 않았습니다. 브라우저 콘솔도 아니고 네트워크 탭에서도 단서가 부족했습니다.

원인은 WebKitGTK 샌드박스였습니다. Tauri는 시스템 웹뷰를 사용하는데, Linux에서는 WebKitGTK가 보안 정책에 따라 localhost로의 네트워크 요청을 제한합니다. Electron이라면 Chromium을 내장하고 있어서 이런 문제가 없지만, Tauri는 OS 보안 정책을 그대로 받습니다.

## 해결: Vite dev proxy

프론트엔드와 백엔드를 같은 오리진으로 만들면 됩니다. Vite dev server에 프록시를 설정해서 `/api/*` 요청을 백엔드 포트로 포워딩했습니다.

```js
// vite.config.ts
server: {
  proxy: {
    '/api': `http://localhost:${backendPort}`
  }
}
```

이렇게 하면 프론트엔드 입장에서는 같은 호스트에 요청하는 것이므로 샌드박스 제약을 우회할 수 있습니다. 덤으로 CORS 문제도 자연스럽게 해결되었습니다.

## dev.sh로 개발 환경 자동화

백엔드 포트를 동적으로 할당하고, `.env.development.local` 파일에 기록하도록 했습니다. 스크립트가 백엔드를 `setsid`로 별도 세션에서 실행하고, PID 파일로 라이프사이클을 관리합니다.

```bash
# scripts/dev.sh (핵심 흐름)
BACKEND_PORT=$(find_free_port)
echo "VITE_BACKEND_PORT=$BACKEND_PORT" > .env.development.local
setsid python backend/main.py --port $BACKEND_PORT &
echo $! > .backend.pid
npm run tauri dev
```

개발자는 `./scripts/dev.sh` 한 줄이면 백엔드와 프론트엔드가 동시에 뜹니다.

## 배운 점

- Tauri는 가볍지만 OS 웹뷰의 제약을 항상 감안해야 했습니다
- 프록시 패턴은 샌드박스뿐 아니라 CORS 문제도 동시에 해결해주었습니다
- setsid + PID 파일 조합은 프로세스 관리의 가장 간단하면서도 확실한 방법이었습니다
