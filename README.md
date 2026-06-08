# rhwp Agent Skills

<div align="right">

**한국어** | [English](README.en.md)

</div>

[rhwp](https://github.com/edwardkim/rhwp) — Rust/WebAssembly 기반 HWP/HWPX 뷰어·에디터 — 를 AI 에이전트가 다룰 수 있도록 스킬화(skill)한 모음입니다.

<p align="center">
  <img src="docs/rhwp-agent-lab.png" alt="사람이 손으로 쓴 문서(왼쪽)를 에이전트가 인식하고 rhwp 스킬로 작성한 결과(오른쪽)" width="900">
</p>

<p align="center"><sub>
왼쪽은 사람이 손으로 쓴 원문, 오른쪽은 에이전트가 그 문서를 인식해 rhwp 스킬로 작성한 결과입니다.
</sub></p>

> 🚧 **개발 진행 중** — `rhwp Agent Skills`는 공개를 위해 정리 중이며, 이 스킬 위에서 동작하는 **rhwp-Agent**(사람이 쓴 문서를 인식해 작성하는 모방·대화형 문서작성 에이전트)는 **비공개로 학습·개발 중**입니다.

---

## 🔎 개요

한글 문서(HWP/HWPX)는 국내에서 널리 쓰이지만 프로그래밍 방식으로 다루기는 까다롭습니다. rhwp는 이를 Rust로 파싱·렌더링하고 WebAssembly로 빌드해 브라우저에서 동작하는 HWP 편집기(`rhwp-studio`)로 구현한 프로젝트입니다.

rhwp Agent Skills는 이 `rhwp-studio`를 사람이 아니라 AI 에이전트가 조작·검증할 수 있도록 정리한 스킬입니다.

이 스킬을 토대로, 사람과 에이전트가 함께 문서를 작성하는 시스템을 개발하고 있습니다. 위 화면처럼 사람이 손으로 쓴 원문을 에이전트가 인식하고, rhwp 스킬을 사용해 문서로 작성하며, 이렇게 문서를 작성하는 에이전트를 학습시키고 있습니다. 다만 이 저장소는 그 시스템과 에이전트의 구체 내용은 공개하지 않으며, **rhwp를 스킬화한 부분만** 공개합니다.

## 🧩 스킬 개요

`rhwp-gui-agent` 스킬은 에이전트가 `rhwp-studio`를 GUI 수준에서 조작·검증·확장하도록 돕습니다. 대략 다음을 다룹니다.

- 편집기 구동, 새 문서 생성, HWP/HWPX 열기·저장
- 메뉴·도구 상자·서식 도구 모음·대화상자를 직접 조작한 글자/문단/표/도형 서식 적용
- `?agent=1` 자동화 브리지를 통한 문서 상태 점검 및 내보내기 결과 검증
- 메뉴·도구·대화상자·`hwpctl` 액션을 정리한 기능 맵 레퍼런스
- GUI 스모크 테스트 스크립트

세부 절차는 [`skills/rhwp-gui-agent/SKILL.md`](skills/rhwp-gui-agent/SKILL.md) 와 [`references/feature-map.md`](skills/rhwp-gui-agent/references/feature-map.md) 에 정리되어 있습니다.

`?agent=1` 자동화 브리지(`window.__rhwpAgent`)는 upstream rhwp에 없는 수정분이라 [`bridge/`](skills/rhwp-gui-agent/bridge/) 에 스니펫·스모크 테스트·통합 안내로 함께 제공합니다.

## 🚀 사용 방법

이 스킬은 [rhwp](https://github.com/edwardkim/rhwp) 저장소와 함께 사용합니다.

1. rhwp 저장소를 받아 WASM을 빌드하고 `rhwp-studio`를 구동합니다.
2. **agent-mode 브리지 적용** — upstream rhwp에는 `?agent=1` 브리지가 없으므로, [`skills/rhwp-gui-agent/bridge/`](skills/rhwp-gui-agent/bridge/) 의 안내대로 브리지(`window.__rhwpAgent`)와 스모크 테스트를 `rhwp-studio`에 추가합니다.
3. 브라우저에서 `?agent=1` 모드로 엽니다. 이 모드가 아니면 브리지가 노출되지 않습니다.
4. 스킬을 읽는 에이전트 도구에 `skills/rhwp-gui-agent/SKILL.md` 를 등록하면, 에이전트가 GUI를 직접 조작하며 문서 작업을 수행·검증합니다.

빌드·구동 명령과 셀렉터·API는 [`SKILL.md`](skills/rhwp-gui-agent/SKILL.md) 를 참고하세요.

## 🙏 리스펙

- 이 작업은 [**rhwp**](https://github.com/edwardkim/rhwp) 의 Rust+WASM 한글 문서 파서·렌더러 위에서 이루어집니다. rhwp 프로젝트가 없었다면 불가능했으며, 그 노력에 깊이 감사드립니다.
- HWP/HWPX 포맷과 한글 워드프로세서 생태계를 만들어온 [**한글과컴퓨터(Hancom)**](https://www.hancom.com/) 에 경의를 표합니다. 이 작업은 한컴 제품을 대체하기 위함이 아니라, 한글 문서가 AI 시대에도 잘 다뤄질 수 있도록 돕기 위한 시도입니다.

## 📞 문의

- 이용 (ryonglee@kisti.re.kr)

## 👨‍💻 개발자 그룹

KISTI **BLUESKY** 팀 — *Harmonizing Human and AI Collaboration* · [github.com/leeryong/KISTI_BLUESKY](https://github.com/leeryong/KISTI_BLUESKY)

- 이용 (ryonglee@kisti.re.kr)
- 장래영 (raezero@kisti.re.kr)
- 구자현 (jahyeongu@kisti.re.kr)

## 📚 활용 공개 소스

- [rhwp](https://github.com/edwardkim/rhwp) — Rust/WASM 기반 HWP/HWPX 뷰어·에디터
