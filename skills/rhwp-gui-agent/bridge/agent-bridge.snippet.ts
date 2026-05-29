// rhwp-studio agent-mode bridge (required modification)
// ----------------------------------------------------------------------------
// upstream rhwp(edwardkim/rhwp)에는 이 브리지가 없습니다. 이 스킬을 사용하려면
// rhwp-studio의 `src/main.ts`에 아래 코드를 추가해야 합니다.
//
// 통합 방법:
//   1) `src/main.ts` 안, `initialize()`가 `initPromise`로 호출된 뒤 위치에
//      `installAgentBridge()` 정의와 호출을 추가한다.
//   2) 아래 코드는 main.ts의 기존 심볼에 의존한다:
//        initPromise, getContext, registry, dispatcher, wasm,
//        initializeDocument, createNewDocument
//      (모두 rhwp-studio main.ts에 이미 존재한다.)
//   3) 페이지를 `?agent=1` 로 열었을 때에만 `window.__rhwpAgent`가 노출된다.
//      `?agent=1`이 없으면 사람용 편집기로만 동작한다.
//
// 이 브리지는 관찰/자동화용 범용 훅이며, 모방·대화형 문서작성 에이전트(비공개)와는
// 독립적이다.

function installAgentBridge(): void {
  const params = new URLSearchParams(window.location.search);
  if (params.get('agent') !== '1') return;

  (window as any).__rhwpAgent = {
    ready: () => initPromise,
    context: () => getContext(),
    commands: () => registry.getAllIds(),
    dispatch: (id: string, params?: Record<string, unknown>) => dispatcher.dispatch(id, params),
    loadBytes: async (bytes: number[] | Uint8Array, fileName = 'document.hwp') => {
      await initPromise;
      const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      const docInfo = wasm.loadDocument(data, fileName);
      await initializeDocument(docInfo, `${fileName} - ${docInfo.pageCount}페이지`);
      return docInfo;
    },
    loadSample: async (samplePath: string) => {
      await initPromise;
      const cleanPath = String(samplePath || '').replace(/^\/+/, '');
      if (!cleanPath || cleanPath.includes('..')) {
        throw new Error(`Invalid sample path: ${samplePath}`);
      }
      const resp = await fetch(`/samples/${cleanPath}`);
      if (!resp.ok) throw new Error(`Sample fetch failed: ${resp.status}`);
      const bytes = new Uint8Array(await resp.arrayBuffer());
      const docInfo = wasm.loadDocument(bytes, cleanPath.split('/').pop() || 'sample.hwp');
      await initializeDocument(docInfo, `${cleanPath} - ${docInfo.pageCount}페이지`);
      return docInfo;
    },
    createNewDocument: async () => {
      await initPromise;
      await createNewDocument();
      return getContext();
    },
    exportHwp: () => Array.from(wasm.exportHwp()),
    exportHwpx: () => Array.from(wasm.exportHwpx()),
    pageCount: () => wasm.pageCount,
    fileName: () => wasm.fileName,
  };
}

installAgentBridge();

// ── iframe 연동 API (postMessage) ──
// 부모 페이지에서 postMessage로 에디터를 제어할 수 있다.
// 요청: { type: 'rhwp-request', id, method, params }
// 응답: { type: 'rhwp-response', id, result?, error? }
window.addEventListener('message', async (e) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;

  // 기존 hwpctl-load 호환
  if (msg.type === 'hwpctl-load' && msg.data) {
    try {
      await initPromise;
      const bytes = new Uint8Array(msg.data);
      const docInfo = wasm.loadDocument(bytes, msg.fileName || 'document.hwp');
      await initializeDocument(docInfo, `${msg.fileName || 'document'} — ${docInfo.pageCount}페이지`);
      e.source?.postMessage({ type: 'rhwp-response', id: msg.id, result: { pageCount: docInfo.pageCount } }, { targetOrigin: '*' });
    } catch (err: any) {
      e.source?.postMessage({ type: 'rhwp-response', id: msg.id, error: err.message || String(err) }, { targetOrigin: '*' });
    }
    return;
  }

  // rhwp-request: 범용 API
  if (msg.type !== 'rhwp-request' || !msg.method) return;
  const { id, method, params } = msg;
  const reply = (result?: any, error?: string) => {
    e.source?.postMessage({ type: 'rhwp-response', id, result, error }, { targetOrigin: '*' });
  };

  try {
    switch (method) {
      case 'ready':
        await initPromise;
        reply(true);
        break;
      case 'loadFile': {
        await initPromise;
        const bytes = new Uint8Array(params.data);
        const docInfo = wasm.loadDocument(bytes, params.fileName || 'document.hwp');
        await initializeDocument(docInfo, `${params.fileName || 'document'} — ${docInfo.pageCount}페이지`);
        reply({ pageCount: docInfo.pageCount });
        break;
      }
      case 'pageCount':
        await initPromise;
        reply(wasm.pageCount);
        break;
      case 'getPageSvg':
        await initPromise;
        reply(wasm.renderPageSvg(params.page ?? 0));
        break;
      case 'exportHwp':
        await initPromise;
        reply(Array.from(wasm.exportHwp()));
        break;
      case 'exportHwpx':
        await initPromise;
        reply(Array.from(wasm.exportHwpx()));
        break;
      case 'exportHwpVerify':
        await initPromise;
        reply(JSON.parse(wasm.exportHwpVerify()));
        break;
      default:
        reply(undefined, `Unknown method: ${method}`);
    }
  } catch (err: any) {
    reply(undefined, err.message || String(err));
  }
});
