# Multichain Address Lab

Ethereum, BSC, TRON 주소의 잔액과 표준 HD 파생 결과를 확인하는 읽기 전용 SvelteKit 웹앱입니다.

## 보안 범위

- `/balance`는 공개 RPC에 주소만 전송합니다.
- `/derive`는 `connect-src 'none'` CSP를 사용하며 외부 연결을 하지 않습니다.
- 송금, 서명, 트랜잭션 생성, Wallet provider 연결 기능은 없습니다.
- 실제 자산이 있는 mnemonic 또는 private key를 입력하지 마세요.

## 로컬 실행

```bash
bun ci
bun run dev
```

## 검증

```bash
bun run lint
bun run check
bun test
bunx playwright install chromium
bun run test:e2e
bun run build
bun run verify:bundle
```

## GitHub Pages

저장소의 Pages source를 GitHub Actions로 설정한 뒤 `main`에 push하면 자동 배포됩니다. 프로젝트 사이트의 하위 경로는 workflow의 `BASE_PATH`로 설정됩니다.
