# GitHub Facts — `uyenne06`

> Nguồn sự thật duy nhất cho nội dung portfolio. Snapshot lấy ngày **2026-11-06** bằng `gh` CLI.
> Mỗi dòng ghi rõ **nguồn** (repo + file / API endpoint). Thông tin thiếu hoặc mâu thuẫn được đánh dấu `TODO`.
>
> Ký hiệu nguồn:
> - `API:user` = `gh api user` · `API:social` = `gh api user/social_accounts`
> - `PR` = profile README `uyenne06/uyenne06/README.md`
> - `GQL:contrib` = GraphQL `contributionsCollection` (12 tháng gần nhất)
> - `API:commits` = `repos/{repo}/commits?author=uyenne06` (nhánh mặc định) · `API:contributors` = `repos/{repo}/contributors`

---

## 1. Hồ sơ cá nhân

| Trường | Giá trị | Nguồn |
|---|---|---|
| Username | `uyenne06` | API:user |
| Họ tên | Nguyen Huynh Hoang Uyen | API:user |
| Bio | _(trống)_ | API:user |
| Vai trò (headline) | Frontend Developer · Software Engineering Student at FPT University | PR (capsule header) |
| Công ty | FPT University | API:user |
| Vị trí | Ho Chi Minh (City, VN) · UTC+7 | API:user, PR (badge) |
| Email công khai | hoanguyen91011@gmail.com | API:user; cũng có trong `uyenne06/math-util/README.md` |
| Hireable | `true` | API:user |
| Blog / website | _(trống)_ | API:user |
| Instagram | https://www.instagram.com/_eunice.u/ | API:social, PR |
| Facebook | https://www.facebook.com/hoang.uyen.723746 | API:social, PR |
| LinkedIn | `TODO` (PR có comment “thêm LinkedIn / Email nếu có”) | PR |
| Avatar | https://avatars.githubusercontent.com/u/225663442?v=4 | API:user |
| Tài khoản tạo lúc | 2025-08-10 | API:user |
| Followers / Following | 4 / 4 | API:user |
| Quote | “Small details make the difference between an interface that works and one that people love.” | PR |

### Kinh nghiệm & học vấn (theo profile README)

| Mục | Nội dung | Nguồn | Ghi chú |
|---|---|---|---|
| Thực tập | Frontend Developer Intern · VNZ Company (vnzdna technology, org `TaskCoper`) | PR “Experience” | `TODO`: PR ghi `06/2025 – Present` kèm comment “kiểm tra lại năm bắt đầu (2025 hay 2026)” → **cần bạn xác nhận** |
| Học vấn | B.Sc. Software Engineering · FPT University HCMC · In Progress | PR “Roles & Education” | Không có năm nhập học/tốt nghiệp → không hiển thị năm |
| Team | Thành viên team HKBDU | PR | `TODO`: PR có comment “ghi rõ vai trò của Uyên trong HKBDU” |
| Team project | Frontend Developer · SAVICO AI | PR | Có commit thật (xem §3) |

### Nguyên tắc làm việc (“How I Build”, nguồn: PR)
Components first · Type-safe end to end · Every state matters · Tested and automated.
Focus areas: Component Architecture, Design Systems, Responsive UI, State Management, i18n and Theming, Testing.

---

## 2. Danh sách repo của `uyenne06`

| Repo | Public? | Fork? | Ngôn ngữ chính | Homepage | Pushed | Ghi chú | Nguồn |
|---|---|---|---|---|---|---|---|
| `uyenne06` | public | – | – | – | 2026-10-31 | Profile README | `gh repo list` |
| `BMT-Landing-Page` | public | không | TypeScript | – | 2026-10-27 | Site BMT Decor | `gh repo list` |
| `math-util` | public | không | Java | – | 2026-10-17 | | `gh repo list` |
| `savico-ai-preview` | public | không | TypeScript | – | 2026-09-24 | desc: “SAVICO AI preview deployment” | `gh repo list` |
| `savico-ai` | public | **fork** của `kat-minh/savico-ai` | TypeScript | https://savico-ai.vercel.app | 2026-09-10 | | `gh repo list`, `repos/uyenne06/savico-ai .parent` |
| `vite-app` | public | không | TypeScript | – | 2026-08-13 | | `gh repo list` |
| `final-test` | public | không | – | – | 2026-08-13 | **Repo rỗng** → loại | `repos/.../contents` (404 empty) |
| `RitualCatalog` | public | không | TypeScript | https://ritual-catalog-rosy.vercel.app | 2026-08-06 | | `gh repo list` |
| `SEAL_Hackathon` | **private** | không | C# | https://seal-hackathon-lime.vercel.app | 2026-08-07 | Không README | `gh repo list` |
| `K20-MERN` | **private** | không | JavaScript | – | 2026-05-08 | Không README, chỉ có `F1/`, `note/` | `gh repo list` |

Pinned repos: **không có** (GraphQL `pinnedItems` rỗng). Stars/forks: tất cả = 0.

---

## 3. Phân tích từng dự án (có đóng góp thật)

Số commit = commit trên nhánh mặc định có author `uyenne06` (`API:commits`), đối chiếu `API:contributors` và `GQL:contrib`.

### 3.1 Pegaxus — `HKBDU/pegaxus-fe`
| | |
|---|---|
| Mục đích | Hệ thống quản lý logistics vận chuyển ngựa đua xuyên biên giới & kiểm dịch (đồ án SWP391): booking, lập tuyến, hồ sơ tuân thủ, hóa đơn. — `README.md` |
| Tính năng | Customer portal (hồ sơ ngựa, booking, lịch sử trạng thái); transport planning (tuyến chính / dự phòng / quay về); map assets & fleet; compliance (dossier, quarantine, customs evidence); personnel; accounts & billing có phân quyền theo vai trò. — `README.md` “Capabilities” |
| Tech stack | React 19, TypeScript 6, Vite 8, React Router 7, TanStack Query/Table, Axios, Zustand, React Hook Form, Zod, Tailwind CSS 4, Radix UI, Bootstrap, MapLibre GL, react-map-gl, React PDF/PDF.js, React Three Fiber + drei + three, GSAP, SignalR, MSW, Playwright, Oxlint, Prettier — `package.json` |
| Đóng góp | **148 commit** (hạng 2/5 contributor: PasserineVKK 217, uyenne06 148, NgoHoangThaiDuong 139…) — API:commits, API:contributors |
| Links | Repo https://github.com/HKBDU/pegaxus-fe · Demo https://pegaxus-fe.vercel.app — `repos/HKBDU/pegaxus-fe .homepage` |
| Điểm nổi bật | Landing page 3D (mô hình ngựa GLB, R3F) — `src/features/home/` · CI “Quality” GitHub Actions — `README.md` badge · License Apache-2.0 — `README.md` |

### 3.2 SAVICO AI — `kat-minh/savico-ai` (fork: `uyenne06/savico-ai`, preview: `uyenne06/savico-ai-preview`)
| | |
|---|---|
| Mục đích | Người dùng chụp ảnh lô đất, nhập nhu cầu → nhận bản vẽ, phối cảnh, dự toán chi phí, hồ sơ thi công do AI sinh. Luồng 3 bước Nhập liệu → Dự toán → Hồ sơ thi công; 11 màn hình. — `README.md` |
| Tech stack | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Radix UI, CVA, TanStack Query, Zustand, React Hook Form + Zod, Axios, next-intl (vi/en), next-themes, Sonner, motion, Ant Design, @react-pdf/renderer; tooling: Husky, lint-staged, commitlint, knip, eslint-plugin-boundaries — `package.json`, `README.md` |
| Kiến trúc | `app/[locale]/(landing|auth|dashboard)`, `features/`, `shared/`, `i18n/`, `proxy.ts`; env validate bằng Zod; mock auth/API flags — `README.md` |
| Đóng góp | **27 commit** ở `kat-minh/savico-ai` (hạng 2/5) + **16 commit** ở `savico-ai-preview` — API:commits, API:contributors |
| Links | Demo https://savico-ai.vercel.app · Repo https://github.com/kat-minh/savico-ai · Preview repo https://github.com/uyenne06/savico-ai-preview |

### 3.3 BMT Decor landing site — `uyenne06/BMT-Landing-Page` (upstream: `hdyui/BMT_FE`)
| | |
|---|---|
| Mục đích | Website “BMT Decor — Thiết kế và thi công trọn gói”: dịch vụ thiết kế nội thất, thi công xây dựng, cải tạo tại TP.HCM. — `app/layout.tsx` metadata |
| Trang | about, services, projects, news, careers, contact, quotation, capability-profile, admin — cây `app/` & `features/` |
| Tech stack | Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn, Base UI, CVA, motion/framer-motion, embla-carousel, page-flip, TanStack Table, next-themes, Sonner, cmdk — `package.json` |
| Đóng góp | **86 commit** ở `uyenne06/BMT-Landing-Page` + **94 commit** ở `hdyui/BMT_FE` (12 tháng) — API:contributors, GQL:contrib |
| Links | Repo https://github.com/uyenne06/BMT-Landing-Page · Demo (upstream) https://bmt-fe-six.vercel.app — `repos/hdyui/BMT_FE .homepage` |
| Ghi chú | README là template create-next-app (không mô tả dự án). `TODO`: có phải đây là dự án tại VNZ Company không? (xem §5) |

### 3.4 Meetly — `HKBDU/Meetly`
| | |
|---|---|
| Mục đích | Ứng dụng lên lịch nhóm real-time (lấy cảm hứng từ When2meet): tạo poll, kéo-tô lưới thời gian, heatmap trực tiếp qua WebSocket. — `README.md` |
| Tech stack | FE: React, Vite, TypeScript, Tailwind CSS, shadcn, TanStack Query, Zustand, React Hook Form + Zod, SignalR client — `frontend/package.json`. BE: .NET 8 Web API, SignalR, EF Core, PostgreSQL 16, Docker Compose, GitHub Actions — `README.md` |
| Đóng góp | **39 commit** (hạng 2/5) — API:commits, API:contributors |
| Links | Repo https://github.com/HKBDU/Meetly · Demo https://meetly-soon.vercel.app |

### 3.5 RitualCatalog — `uyenne06/RitualCatalog`
| | |
|---|---|
| Mục đích | Web app catalog “ritual”: đăng nhập/đăng ký, catalog + trang chi tiết, CRUD quản lý ritual, quản lý user, route guard. — suy từ cây `src/features/{auth,ritual}` (README là template Vite → `TODO` 1 câu mô tả) |
| Tech stack | React 19, Vite, TypeScript, React Router 7, TanStack Query, Zustand, Axios, React Hook Form + Zod, shadcn/Radix, next-themes, Sonner, Playwright — `package.json` |
| CI/CD | GitHub Actions `ci.yml` (pnpm install → lint → build trên Node 20) + `notify-fail.yml`; deploy Vercel — `.github/workflows/` |
| Đóng góp | **16 commit** (duy nhất contributor) — API:contributors |
| Links | Repo https://github.com/uyenne06/RitualCatalog · Demo https://ritual-catalog-rosy.vercel.app |

### 3.6 Math Utility — `uyenne06/math-util`
| | |
|---|---|
| Mục đích | Maven project mô phỏng một phần thư viện Math của JDK; unit test JUnit theo TDD & DDT; CI GitHub Actions. — `README.md` |
| Tech stack | Java, Maven, JUnit Jupiter 5.10.2 — `pom.xml`; workflow `ci-script.yml` — `.github/workflows/` |
| Đóng góp | 10 commit (12 tháng) — GQL:contrib |
| Links | https://github.com/uyenne06/math-util |

### 3.7 Vite App — `uyenne06/vite-app`
| | |
|---|---|
| Mục đích | Template khởi tạo React + TypeScript + Vite + shadcn/ui. — `README.md` |
| Tech stack | React 19, Vite, Tailwind v4, shadcn, Base UI, ESLint, Prettier + prettier-plugin-tailwindcss — `package.json` |
| Đóng góp | 2 commit — GQL:contrib |

---

## 4. Số liệu GitHub Activity (12 tháng gần nhất, nguồn: GQL:contrib)

| Chỉ số | Giá trị |
|---|---|
| Tổng contributions (calendar) | **597** |
| Commit | 463 |
| Pull request | 102 |
| Issue | 22 |
| PR review | 2 |

Commit theo repo (top): pegaxus-fe 148 · hdyui/BMT_FE 94 · BMT-Landing-Page 86 · Meetly 39 · savico-ai 27 · savico-ai-preview 16 · RitualCatalog 16 · hdyui/PiedTeam_Challenge 12 · math-util 10 · hdyui/VNZ_Challenge 7.

Ngôn ngữ (bytes, `repos/{repo}/languages`) trên các repo có đóng góp: TypeScript chiếm áp đảo (pegaxus 4.66 MB, savico-ai 4.94 MB, BMT 1.59 MB, Meetly 0.25 MB…), sau đó CSS, JavaScript, C# (Meetly backend 106 KB), Java (math-util 2.7 KB).

> Lưu ý: profile README ghi “7 Public Repositories / 5+ React-Next.js Products / 2 Organizations”. Thực tế API trả về `public_repos = 8` (gồm repo profile và repo rỗng `final-test`). Portfolio sẽ **tính số liệu trực tiếp từ API**, không chép số từ README.

---

## 5. Số liệu đóng góp chi tiết (snapshot 2026-11-06)

| Repo | Commit (contributors API, gồm merge) | Commit không-merge (stats API) | PR mở / merged (search API) | Tuần hoạt động | Khoảng thời gian |
|---|---|---|---|---|---|
| HKBDU/pegaxus-fe | 148 | 49 | 41 / 33 | 6 | 2026-09-20 → 2026-10-25 |
| hdyui/BMT_FE | 94 (GQL:contrib) | 41 | 37 / 36 | 9 | 2026-07-26 → 2026-09-27 |
| uyenne06/BMT-Landing-Page | 86 | 38 | 0 / 0 | 8 | 2026-07-26 → 2026-09-20 |
| HKBDU/Meetly | 39 | 29 | 11 / 4 | 3 | 2026-09-06 → 2026-09-20 |
| kat-minh/savico-ai | 27 | 22 | 8 / 8 | 4 | 2026-09-13 → 2026-10-04 |
| uyenne06/savico-ai-preview | 16 | 11 | 4 / 3 | 2 | 2026-09-13 → 2026-09-20 |
| uyenne06/RitualCatalog | 16 | 16 | 0 / 0 | 2 | 2026-07-26 → 2026-08-02 |
| uyenne06/math-util | 10 (GQL) | 9 | 0 / 0 | 1 | 2026-10-11 |

Nguồn: `repos/{r}/contributors`, `repos/{r}/stats/contributors`, `search/issues?q=repo:{r}+type:pr+author:uyenne06[+is:merged]`.
Số dòng thêm/xoá có trong stats API nhưng **không hiển thị** vì bị thổi phồng bởi lockfile/asset (vd. BMT +273k).

## 6. Quyết định của chủ portfolio (xác nhận 2026-11-06)

| # | Quyết định | Nguồn |
|---|---|---|
| 1 | **BMT Decor** (`uyenne06/BMT-Landing-Page` + `hdyui/BMT_FE`) là dự án làm tại **VNZ Company**. Không dùng `TaskCoper/bmt-fe`. | Chủ portfolio xác nhận trong chat |
| 2 | Thực tập VNZ bắt đầu **06/2026** – hiện tại. | Chủ portfolio xác nhận |
| 3 | Vai trò trong Pegaxus, Meetly, SAVICO AI: **Frontend Developer**. | Chủ portfolio xác nhận |
| 4 | RitualCatalog: web về **nghi lễ cúng kiếng** (tên, giờ thực hiện, ngày âm/dương lịch, độ khó, nội dung, tham khảo, danh mục, “hot”). Mục đích: học bản chất React — gọi API qua service/BaseService, `useDebounce`, phân trang, đồng bộ `searchParams`/filter params lên URL, TanStack Query; và học CI/CD: workflow `ci.yml` (lint + build) + `notify-fail.yml` gửi **thông báo Discord khi CI thất bại**; deploy Vercel. | Chủ portfolio + `src/features/ritual/type.ts`, `pages/RitualsCatalog.tsx`, `shared/hooks/useDebounce.ts`, `.github/workflows/*` |
| 5 | LinkedIn: https://www.linkedin.com/in/nguy%E1%BB%85n-hu%E1%BB%B3nh-ho%C3%A0ng-uy%C3%AAn-7472b5353/ | Chủ portfolio cung cấp |
| 6 | **Không** đưa SEAL_Hackathon, K20-MERN, SmartHome IoT, OCR Testing, `TaskCoper/bmt-fe`, final-test, vite-app. | Chủ portfolio đồng ý |

> Ghi chú: chủ portfolio mô tả Discord “khi deploy thành công”, nhưng code (`notify-fail.yml`, điều kiện `conclusion == 'failure'`) gửi khi CI **thất bại** → portfolio ghi theo code.
