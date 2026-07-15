[← Back to Pillioo Overview](https://github.com/pillioo#readme)
# Pillioo Frontend
## Overview

Pillioo Frontend는 의약품 안전 이벤트와 티켓 처리 과정을 화면에서 확인하고, 약사 검토 업무를 수행할 수 있도록 제공하는 web client입니다.
Safety Inbox, Ticket Workspace, Pharmacist Review, Evidence, Report, History, ticket-scoped chat 화면을 통해 백엔드 워크플로우 결과를 사용자에게 제공합니다.

---

Pillioo Frontend is a web client that allows users to review pharmaceutical safety events, ticket workflows, evidence, reports, and pharmacist review actions through a unified interface.
Safety Inbox, Ticket Workspace, Pharmacist Review, Evidence, Report, History, and ticket-scoped chat present backend workflow results in a user-friendly form.

## Main Screens

| Screen | Responsibility |
|---|---|
| Product Entrance | Pillioo 서비스 진입 및 핵심 흐름 소개 |
| Safety Inbox | 의약품 안전 이벤트와 티켓 목록 확인 |
| Ticket Workspace | Overview, Inventory, Evidence, Report, History 탭 제공 |
| Pharmacist Review | 보고서 검토, 승인, 반려 및 수정 |
| Event Upload | 리콜 이벤트 입력 및 티켓 생성 |
| User Guide | 사용 흐름 안내 |
| Ask Pillioo | 현재 티켓의 상태와 근거를 기반으로 질의 |

## Project Structure

```text
pillioo-client/
├─ src/
│  ├─ api/
│  ├─ assets/
│  ├─ components/
│  ├─ data/
│  ├─ hooks/
│  ├─ lib/
│  ├─ pages/
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
├─ public/
├─ package.json
├─ vite.config.ts
└─ vercel.json
```

| Path | Responsibility |
|---|---|
| `src/pages/` | 주요 화면과 route-level UI |
| `src/components/` | 공통 UI 및 Ticket Workspace 구성 요소 |
| `src/api/` | Backend API client와 typed service function |
| `src/hooks/` | 화면 상태와 데이터 조회 보조 hook |
| `src/lib/` | Ticket presentation 및 공통 변환 로직 |
| `src/data/` | 화면 preview 및 정적 표시 데이터 |
| `src/index.css` | 전역 styling |

## Getting Started

```powershell
cd pillioo-client
npm install
npm run dev
```

Vite development server를 통해 frontend application을 실행합니다.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

환경변수가 설정되지 않은 local development에서는 `vite.config.ts`의 proxy 설정을 사용할 수 있습니다.

## API Integration

Frontend는 ticket 중심으로 backend API를 호출합니다.

| Area | Frontend Behavior |
|---|---|
| Safety Inbox | 이벤트 및 티켓 목록 조회 |
| Ticket Workspace | 티켓 상세, 재고 영향, 근거, 보고서 및 감사 이력 조회 |
| Pharmacist Review | 승인, 반려 및 수정 요청 |
| Chat | 현재 티켓을 기준으로 질문 전송 및 응답 표시 |
| Dashboard | 운영 요약 및 검토 대상 상태 표시 |

API request와 response type은 `src/api/`에서 관리합니다.

## Build and Validation

```powershell
npm run lint
npm run build
```
