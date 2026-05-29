# rhwp agent-mode 브리지 (필요한 rhwp 수정분)

`rhwp-gui-agent` 스킬은 `rhwp-studio`의 **agent-mode 브리지**(`?agent=1` → `window.__rhwpAgent`)와 GUI 스모크 테스트에 의존합니다. 이 두 가지는 upstream [edwardkim/rhwp](https://github.com/edwardkim/rhwp) 에는 **포함되어 있지 않은 수정분**이라, 스킬을 실제로 동작시키려면 직접 추가해야 합니다.

> 이 브리지는 **관찰·자동화용 범용 훅**입니다. 모방·대화형 문서작성 에이전트(비공개)와는 독립적이며, 그 코드를 포함하지 않습니다.

## 포함 파일

| 파일 | 역할 | 둘 위치 |
|------|------|---------|
| `agent-bridge.snippet.ts` | `?agent=1`일 때 `window.__rhwpAgent`를 노출하는 브리지 + iframe postMessage API | `rhwp-studio/src/main.ts` 에 통합 |
| `agent-gui-full-smoke.mjs` | 브리지를 사용하는 GUI 스모크 테스트 (Puppeteer) | `rhwp-studio/e2e/` 에 복사 |

## 통합 방법

1. **브리지 추가** — `agent-bridge.snippet.ts` 의 `installAgentBridge()` 정의와 호출, 그리고 postMessage 핸들러를 `rhwp-studio/src/main.ts` 에 붙여넣습니다. 위치는 `initialize()` 가 `initPromise` 로 호출된 **이후**여야 합니다. 이 스니펫은 main.ts의 기존 심볼(`initPromise`, `getContext`, `registry`, `dispatcher`, `wasm`, `initializeDocument`, `createNewDocument`)을 사용합니다.

2. **스모크 테스트 배치** — `agent-gui-full-smoke.mjs` 를 `rhwp-studio/e2e/` 로 복사합니다. (스킬의 `scripts/run-gui-smoke.sh` 가 `rhwp-studio` 에서 `node e2e/agent-gui-full-smoke.mjs` 를 실행합니다.)

3. **동작 확인** — `?agent=1` 로 연 페이지에서 `window.__rhwpAgent.ready()` 가 resolve되면 브리지가 활성화된 것입니다.

## 노출 API (`window.__rhwpAgent`)

- `ready()` — wasm 초기화 완료 Promise
- `context()` — 현재 문서/편집 상태
- `commands()` — 사용 가능한 명령 ID 목록
- `dispatch(id, params)` — 명령 실행
- `loadBytes(bytes, fileName)` / `loadSample(path)` — 문서 로드
- `createNewDocument()` — 새 문서
- `exportHwp()` / `exportHwpx()` — 내보내기
- `pageCount()` / `fileName()` — 상태 조회

부모 페이지에서는 iframe `postMessage`(`{ type: 'rhwp-request', id, method, params }`)로도 `ready/loadFile/pageCount/getPageSvg/exportHwp/exportHwpx/exportHwpVerify` 를 호출할 수 있습니다.
