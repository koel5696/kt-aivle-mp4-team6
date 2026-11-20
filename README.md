# 📚 걷기가 서재 — AI 표지 생성 도서관리 시스템

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
| Mock Server | json-server 0.17.4 (로컬 REST API, devDependency) |
| AI | OpenAI API — GPT Image 2 |
| 협업 | GitHub (이슈 · PR 템플릿, GitHub Actions CI: lint → build) |
| 배포 | Vercel (프론트엔드만 배포, json-server는 로컬 실행) |

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

#### 도서 목록 조회
- 등록된 도서를 카드 형태로 한눈에 확인
- 카드에 **표지 · 제목 · 등록일** 표시 (표지가 없으면 기본 이미지)
- 카드 클릭 시 상세 페이지로 이동

#### 도서 상세 조회
- **표지(없으면 기본 이미지) · 제목 · 작성일 · 수정일 · 본문** 표시
- `[수정]` `[삭제]` `[AI 표지 생성]` 버튼 제공

#### 신규 도서 등록
- `[새 도서 등록]` 버튼 → 제목 · 내용 입력 폼
- 제목이나 내용이 공백이면 **"제목을 입력해 주세요"** / **"내용을 입력해 주세요"** 안내 후 저장 막음
- `createdAt` / `updatedAt` 자동 기록
- 저장하면 목록 페이지로 이동하고, 새 도서가 목록에 바로 추가됨

#### 도서 수정
- `[수정]` 클릭 시 기존 제목 · 내용이 폼에 자동으로 채워짐
- 저장 시 `updatedAt`(수정일) 갱신
- 저장 완료 후 상세 페이지로 이동

#### 도서 삭제
- `[삭제]` 클릭 시 **"정말 삭제할까요?"** 확인창 표시
- 확인하면 목록에서 즉시 사라짐

#### AI 표지 이미지 생성
- 상세 페이지에서 OpenAI API Key 입력 (password 타입, 코드에 저장하지 않음)
- 본문에서 키워드를 추출해 프롬프트 자동 구성
  - 예: 「새벽 3시의 편의점」 → 새벽, 편의점, 외로움, 따뜻한 조명
- GPT Image API 호출 → `b64_json`을 Data URL로 변환 → 미리보기

#### 재생성 및 표지 저장
- 마음에 들지 않으면 `[다시 생성]`, 마음에 들면 `[표지 저장]`
- 저장 시 `coverImageUrl` 필드만 `PATCH`로 저장
- 상세 페이지와 목록 카드에 표지 즉시 반영

### 공통 · 부가 기능

| 기능 | 설명 |
|---|---|
| 공통 레이아웃 | 헤더(로고) + 네비게이션(목록 / 새 도서 등록) |
| 생성 옵션 | 화질(low / medium / high) 선택, 생성 시 비용 발생 안내 |
| 🔥 검색 · 필터 (도전) | 제목 키워드 검색 |
| 🔥 유효성 강화 (도전) | 길이 제한 및 입력 에러 메시지 표시 |

<br>

## ⚠️ 예외 처리

| 상황 | 화면 처리 |
|---|---|
| json-server가 꺼져 있음 | **"서버에 연결할 수 없습니다"** 에러 메시지 표시 |
| 등록된 도서가 없음 | **"아직 등록된 도서가 없어요"** 빈 목록 화면 + `[새 도서 등록]` 버튼 |
| 데이터 불러오는 중 | 로딩 표시 |
| API Key가 없거나 틀림 (401) | 표지 생성을 막고 API Key를 다시 입력하라고 안내 |
| 이미지 생성 중 · 실패 (429, 네트워크 오류 등) | 생성 중에는 버튼 비활성화 + 로딩 표시, 실패 시 `[다시 시도]` 버튼 표시 |
| 없는 id의 상세 페이지 접근 (404) | **"도서를 찾을 수 없습니다"** + `[목록으로]` 버튼 |

<br>

## 🖥 화면 구성

| 경로 | 화면 | 설명 |
|---|---|---|
| `/` | 도서 목록 | 카드 목록, `[새 도서 등록]` 버튼 |
| `/books/new` | 도서 등록 | 제목 · 내용 입력 폼 |
| `/books/:id` | 도서 상세 | 도서 정보, 수정 · 삭제 · AI 표지 생성 |
| `/books/:id/edit` | 도서 수정 | 기존 값이 채워진 수정 폼 |

**화면 흐름**
```
목록 ──카드 클릭──▶ 상세 ──[수정]──▶ 수정 ──저장──▶ 상세
 │                  ├──[삭제]──▶ "정말 삭제할까요?" ──확인──▶ 목록
 │                  └──[AI 표지 생성]──▶ 미리보기 ──[표지 저장]──▶ 상세
 │                                         └──[다시 생성]──▶ 미리보기
 └──[새 도서 등록]──▶ 등록 ──저장──▶ 목록
```

<br>

## 🔄 사용자 시나리오

> 김작가가 「새벽 3시의 편의점」을 등록하고 AI 표지를 만드는 흐름

| 단계 | 시나리오 | API |
|---|---|---|
| 1. 목록 확인 | 웹에 접속하면 내가 등록한 도서들이 카드로 보이고, 각 카드에 표지 · 제목 · 등록일이 표시된다. | `GET /books` |
| 2. 신규 등록 | `[새 도서 등록]`을 누르고 제목 「새벽 3시의 편의점」과 내용을 입력해 저장한다. 제목이나 내용이 공백이면 "제목을 입력해 주세요" 안내가 뜨고 저장되지 않는다. 저장하면 목록에 바로 추가된다. | `POST /books` |
| 3. 상세 조회 | 카드를 클릭하면 상세 페이지로 이동한다. 표지(아직 없으면 기본 이미지), 작성일, 수정일, 본문이 보인다. | `GET /books/:id` |
| 4. AI 표지 생성 | API Key를 입력하고 `[AI 표지 생성]`을 누른다. 본문에서 키워드(새벽, 편의점, 외로움, 따뜻한 조명)를 뽑아 이미지를 만들고 미리보기로 보여준다. | `POST` OpenAI Image API |
| 5. 재생성 · 저장 | 마음에 안 들면 `[다시 생성]`, 마음에 들면 `[표지 저장]`을 누른다. 저장하면 상세와 목록 카드에 표지가 바로 반영된다. | `PATCH /books/:id` |
| 6. 수정 | `[수정]`을 누르면 기존 제목과 내용이 폼에 자동으로 채워진다. 결말을 고쳐 저장하면 수정일이 갱신된다. | `PATCH /books/:id` |
| 7. 삭제 | 연습용으로 올린 글에서 `[삭제]`를 누르면 "정말 삭제할까요?" 확인창이 뜬다. 확인하면 목록에서 즉시 사라진다. | `DELETE /books/:id` |

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
| `title` | string | 도서 제목 (필수) |
| `author` | string | 저자 |
| `content` | string | 도서 내용 (필수, AI 프롬프트 키워드 추출에 활용) |
| `coverImageUrl` | string | 표지 이미지 Data URL (초기값 `""`) |
| `createdAt` | string | 등록일 · 작성일 (ISO 8601) |
| `updatedAt` | string | 수정일 (ISO 8601) |

<br>

## 🔌 API 명세

### json-server — `http://localhost:3000`

| 기능 | Method | Endpoint | Request Body | 성공 응답 | 시나리오 |
|---|---|---|---|---|---|
| 목록 조회 | `GET` | `/books` | - | `200` 도서 배열 | 1 |
| 상세 조회 | `GET` | `/books/:id` | - | `200` 도서 객체 (없으면 `404`) | 3 |
| 도서 등록 | `POST` | `/books` | `{ title, author, content, coverImageUrl: "", createdAt, updatedAt }` | `201` 생성된 도서 (id 포함) | 2 |
| 표지 저장 | `PATCH` | `/books/:id` | `{ coverImageUrl }` | `200` 수정된 도서 | 5 |
| 도서 수정 | `PATCH` | `/books/:id` | 변경된 필드 + `updatedAt` | `200` 수정된 도서 | 6 |
| 도서 삭제 | `DELETE` | `/books/:id` | - | `200` | 7 |

> 수정 · 표지 저장은 교안대로 바뀐 필드만 보내는 `PATCH`를 사용합니다.

### OpenAI Image API — 시나리오 4

| 항목 | 값 |
|---|---|
| Method | `POST` |
| URL | `https://api.openai.com/v1/images/generations` |
| Headers | `Content-Type: application/json`, `Authorization: Bearer {API_KEY}` |
| Body | `model: "gpt-image-2"`, `prompt`, `n: 1`, `size: "1024x1536"`, `quality`, `output_format: "png"` |
| Response | `data[0].b64_json` → `data:image/png;base64,{b64_json}` 로 변환 |
| 에러 | `401` API Key 확인 · `429` 잠시 후 재시도 |

<br>

## 🚀 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/koel5696/kt-aivle-mp4-team6.git
cd kt-aivle-mp4-team6

# 2. 패키지 설치 (json-server 0.17.4 포함, 전역 설치 불필요)
npm install

# 3. json-server 실행 (터미널 1)
npm run server   # = json-server --watch db.json --port 3000
# → http://localhost:3000/books

# 4. React 개발 서버 실행 (터미널 2)
npm run dev
# → http://localhost:5173
```

> ⚠️ 두 서버를 **동시에** 실행해야 합니다.
> ⚠️ OpenAI API Key는 화면의 입력창에 직접 입력하며, 코드나 GitHub에 절대 올리지 않습니다.
> 💡 Windows PowerShell에서 `npm` 실행이 보안 오류로 막히면 `npm.cmd install`, `npm.cmd run server`, `npm.cmd run dev` 처럼 `npm.cmd`로 실행합니다.

### Vercel 배포본 사용 시

- 배포본은 화면(프론트엔드)만 올라가 있고, 데이터는 브라우저에서 **내 PC의 `http://localhost:3000`(json-server)** 으로 요청합니다.
- 따라서 배포본을 열기 전에 로컬에서 `npm run server`를 실행해 두어야 하며, Chrome의 "이 기기의 다른 앱 및 서비스에 액세스" 권한 요청에서 **허용**을 눌러야 합니다.
- 데이터는 각자 PC의 `db.json`에 저장되므로 팀원끼리 공유되지 않습니다.

<br>

## 📁 폴더 구조

```
kt-aivle-mp4-team6/
├── .github/               # 이슈 · PR 템플릿, CI 워크플로우
├── db.json                # json-server 데이터
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.png        # 파비콘
│   └── logo.png           # 헤더 로고
└── src/
    ├── App.jsx            # 라우터 설정
    ├── main.jsx           # BrowserRouter 적용
    ├── index.css          # 공통 스타일 (레이아웃 · 카드 · 폼)
    ├── api/
    │   └── books.js       # API_BASE 상수, 공통 request + GET / POST / PATCH / DELETE 함수
    ├── data/
    │   └── mockBooks.js   # 1일차 Mock 데이터 (현재 미사용)
    ├── components/
    │   ├── Header.jsx     # 로고 + 네비게이션
    │   └── BookCard.jsx   # 목록 카드
    ├── styles/
    │   └── Header.css     # 헤더 로고 스타일
    └── pages/
        ├── BookList.jsx   # 목록 (GET /books)
        ├── BookDetail.jsx # 상세 · 삭제 (GET · DELETE /books/:id)
        ├── BookCreate.jsx # 등록 폼 (POST /books)
        └── BookEdit.jsx   # 수정 폼 (PATCH /books/:id)
```

<br>

## 📅 개발 일정

| 일차 | 목표 | 주요 작업 | 진행 상황 |
|---|---|---|---|
| Day 1 | 기획 + 뼈대 | 요구사항 · db.json · UI 스케치, Vite + json-server 세팅, Mock 렌더링 | ✅ 완료 |
| Day 2 | CRUD 완성 | GET 조회 연동, POST / PATCH / DELETE 연동, 폼 상태관리 | 🚧 CRUD API 연동 뼈대 완료 |
| Day 3 | AI + 발표 | GPT Image 연동, 표지 저장, 에러 처리, 발표자료 | ⏳ 예정 |

<br>

## 🤝 협업 규칙

- 기능별 브랜치에서 작업: `feat/list`, `feat/detail`, `feat/form`, `feat/ai-cover` …
- PR 생성 → 검토 담당(박시온) 확인 후 `main`에 merge
- 커밋 메시지: `feat:` 기능 추가 / `fix:` 버그 수정 / `style:` 스타일 / `docs:` 문서
- `node_modules`, `.env`는 커밋 금지 (`.gitignore` 확인)
