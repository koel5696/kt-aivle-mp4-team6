# 📚 AI 표지 생성 도서관리 시스템

> KT AIVLE School AI 트랙 02반 6조 · 미니프로젝트 4차
> 도서를 등록·조회·수정·삭제하고, OpenAI GPT Image로 도서 내용에 어울리는 표지를 자동 생성하는 React 웹 애플리케이션

<br>

## 👥 팀원 및 역할

| 이름 | 역할 | 담당 |
|---|---|---|
| 오승현 | PM · 기획 (조장) | 과제 총괄, 요구사항 정의, 저장소 관리, 등록/수정 폼 |
| 정유정 | UI · 레이아웃 | 페이지 구조 설계, 라우팅, 공통 컴포넌트, PPT 제작 |
| 김윤기 | CRUD 연동 | json-server 세팅, 목록/상세/등록/수정/삭제 API 연동, 서기 |
| 강태영 | OpenAI 연동 | GPT Image API 호출, API Key UI, 표지 저장, PPT 제작 |
| 박시온 | 스타일링 · QA | CSS, 로딩/에러 상태 UI, E2E 테스트, 코드 리뷰 |
| 윤민수 | 발표 · 문서 | README 작성, 발표자료 정리, 데모 시연 |

<br>

## 🛠 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React 19, Vite, React Router, fetch API |
| Mock Server | json-server 0.17.4 (로컬 REST API) |
| AI | OpenAI API — GPT Image 2 |
| 협업 | GitHub |
| 배포 | Vercel (예정) |

<br>

## 🏗 서비스 구성도

```
[React App (Vite)] ──fetch GET/POST/PATCH/DELETE──▶ [json-server :3000] ──▶ db.json
        │
        └──fetch POST (API Key + prompt)──▶ [OpenAI GPT Image]
                 ◀── b64_json 응답 ──┘
        b64_json → Data URL 변환 → PATCH /books/:id (coverImageUrl)
```

<br>

## ✨ 주요 기능

### 핵심 기능 (필수)

#### F-01. 도서 목록 조회
- 등록된 도서를 카드 형태로 한눈에 확인
- 카드에 **표지 썸네일 · 제목 · 저자 · 등록일** 표시
- 표지가 없으면 기본 이미지 표시
- 카드 클릭 시 상세 페이지로 이동

#### F-02. 도서 상세 조회
- **표지 · 제목 · 저자 · 본문 · 작성일 · 수정일** 표시
- `[수정]` `[삭제]` `[AI 표지 생성]` 버튼 제공

#### F-03. 신규 도서 등록
- 제목 · 저자 · 내용 입력 폼
- 공백 입력 금지 유효성 검사
- `createdAt` / `updatedAt` 자동 기록
- 등록 완료 후 목록 페이지로 이동

#### F-04. 도서 수정
- 수정 페이지 진입 시 기존 정보 자동 불러오기
- 변경된 필드만 `PATCH`로 전송, `updatedAt` 갱신
- 저장 완료 후 상세 페이지로 이동

#### F-05. 도서 삭제
- 삭제 전 확인창 표시
- 삭제 즉시 목록에서 제거

#### F-06. AI 표지 이미지 생성
- API Key 입력 (password 타입, 코드에 저장하지 않음)
- 도서 제목 · 내용을 조합해 프롬프트 자동 구성
- GPT Image API 호출 → `b64_json`을 Data URL로 변환 → 미리보기
- 마음에 들지 않으면 재생성 가능

#### F-07. 표지 저장 및 반영
- 생성된 표지를 `coverImageUrl` 필드만 `PATCH`로 저장
- 상세 페이지 · 목록에 즉시 반영

### 공통 · 부가 기능

| ID | 기능 | 설명 |
|---|---|---|
| C-01 | 공통 레이아웃 | 헤더(로고) + 네비게이션(목록 / 신규 등록) |
| C-02 | 상태 처리 | 로딩 중 · 에러 · 빈 목록 화면, AI 생성 중 버튼 비활성화 |
| C-03 | 에러 안내 | 401 → API Key 확인 / 429 → 잠시 후 재시도 / 네트워크 오류 알림 |
| C-04 | 생성 옵션 | 화질(low / medium / high) 선택, 생성 시 비용 발생 안내 |
| A-01 | 🔥 검색 · 필터 (도전) | 제목 · 저자 키워드 검색 |
| A-02 | 🔥 유효성 강화 (도전) | 길이 제한 및 입력 에러 메시지 표시 |

<br>

## 🖥 화면 구성

| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | 도서 목록 | 카드 목록, 신규 등록 버튼 |
| `/books/new` | 도서 등록 | 제목 · 저자 · 내용 입력 폼 |
| `/books/:id` | 도서 상세 | 도서 정보, 수정 · 삭제 · AI 표지 생성 |
| `/books/:id/edit` | 도서 수정 | 기존 값이 채워진 수정 폼 |

**화면 흐름**
```
목록 ──카드 클릭──▶ 상세 ──[수정]──▶ 수정 ──저장──▶ 상세
 │                  ├──[삭제]──▶ 확인 ──▶ 목록
 │                  └──[AI 표지 생성]──▶ 생성 · 미리보기 ──저장──▶ 상세
 └──[신규 등록]──▶ 등록 ──저장──▶ 목록
```

<br>

## 🔄 사용자 시나리오

1. 목록 페이지 접속 → 등록된 도서 확인
2. `신규 등록` → 제목 · 저자 · 내용 입력 후 저장
3. 등록한 도서 카드 클릭 → 상세 정보 확인
4. `AI 표지 생성` → API Key 입력 → 표지 생성 · 미리보기
5. 표지 저장 → 상세 · 목록에 표지 반영
6. `수정` → 내용 변경 후 저장
7. `삭제` → 확인 후 목록에서 제거

<br>

## 🗂 데이터 구조 (db.json)

```json
{
  "books": [
    {
      "id": 1,
      "title": "별빛 아래의 서점",
      "author": "홍길동",
      "content": "작은 마을 서점의 1년을 담은 에세이",
      "coverImageUrl": "",
      "createdAt": "2026-11-20T09:00:00.000Z",
      "updatedAt": "2026-11-20T09:00:00.000Z"
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | number | 도서 식별자 (json-server 자동 부여) |
| `title` | string | 도서 제목 |
| `author` | string | 저자 |
| `content` | string | 도서 내용 (AI 프롬프트 생성에 활용) |
| `coverImageUrl` | string | 표지 이미지 Data URL (초기값 `""`) |
| `createdAt` | string | 등록일 (ISO 8601) |
| `updatedAt` | string | 수정일 (ISO 8601) |

<br>

## 🔌 API 명세

### json-server (`http://localhost:3000`)

| 기능 | Method | Endpoint | Request Body |
|---|---|---|---|
| 목록 조회 | `GET` | `/books` | - |
| 상세 조회 | `GET` | `/books/:id` | - |
| 도서 등록 | `POST` | `/books` | 전체 필드 (id 제외) |
| 도서 수정 | `PATCH` | `/books/:id` | 변경된 필드 + `updatedAt` |
| 도서 삭제 | `DELETE` | `/books/:id` | - |
| 표지 저장 | `PATCH` | `/books/:id` | `{ coverImageUrl }` |

### OpenAI Image API

| 항목 | 값 |
|---|---|
| Method | `POST` |
| URL | `https://api.openai.com/v1/images/generations` |
| Headers | `Content-Type: application/json`, `Authorization: Bearer {API_KEY}` |
| Body | `model: "gpt-image-2"`, `prompt`, `n: 1`, `size: "1024x1536"`, `quality`, `output_format: "png"` |
| Response | `data[0].b64_json` → `data:image/png;base64,{b64_json}` 로 변환 |

<br>

## 🚀 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/{organization}/kt-aivle-mp4-team6.git
cd kt-aivle-mp4-team6

# 2. 패키지 설치
npm install
npm install -g json-server@0.17.4   # json-server 전역 설치 (최초 1회)

# 3. json-server 실행 (터미널 1)
json-server --watch db.json --port 3000   # 또는 npm run server
# → http://localhost:3000/books

# 4. React 개발 서버 실행 (터미널 2)
npm run dev
# → http://localhost:5173
```

> ⚠️ 두 서버를 **동시에** 실행해야 합니다.
> ⚠️ OpenAI API Key는 화면의 입력창에 직접 입력하며, 코드나 GitHub에 절대 올리지 않습니다.

<br>

## 📁 폴더 구조

```
kt-aivle-mp4-team6/
├── db.json                # json-server 데이터
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx            # 라우터 설정
    ├── main.jsx           # BrowserRouter 적용
    ├── index.css          # 공통 스타일
    ├── api/
    │   └── books.js       # API URL 상수, fetch 함수 (2일차)
    ├── data/
    │   └── mockBooks.js   # 1일차 Mock 데이터
    ├── components/
    │   ├── Header.jsx     # 로고 + 네비게이션
    │   └── BookCard.jsx   # 목록 카드
    └── pages/
        ├── BookList.jsx
        ├── BookDetail.jsx
        ├── BookCreate.jsx
        └── BookEdit.jsx
```

<br>

## 📅 개발 일정

| 일차 | 목표 | 주요 작업 |
|---|---|---|
| Day 1 | 기획 + 뼈대 | 요구사항 · db.json · UI 스케치, Vite + json-server 세팅, Mock 렌더링 |
| Day 2 | CRUD 완성 | GET 조회 연동, POST / PATCH / DELETE 연동, 폼 상태관리 |
| Day 3 | AI + 발표 | GPT Image 연동, 표지 저장, 에러 처리, 발표자료 |

<br>

## 🤝 협업 규칙

- 기능별 브랜치에서 작업: `feat/list`, `feat/detail`, `feat/form`, `feat/ai-cover` …
- PR 생성 → 검토 담당(박시온) 확인 후 `main`에 merge
- 커밋 메시지: `feat:` 기능 추가 / `fix:` 버그 수정 / `style:` 스타일 / `docs:` 문서
- `node_modules`, `.env`는 커밋 금지 (`.gitignore` 확인)
