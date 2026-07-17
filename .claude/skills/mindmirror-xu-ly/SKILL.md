---
name: mindmirror-xu-ly
description: Pipeline Thu Thập → Tinh Lọc → Chuyển Hoá → Kiến Tạo tự động. Nhận bất kỳ đầu vào nào (trích dẫn sách, trải nghiệm, ý tưởng, cuộc trò chuyện), đọc Nhật Ký Ngày để hiểu bối cảnh cá nhân, xử lý qua 4 tầng MindMirror, và tạo ra sản phẩm Kiến Tạo với wikilink tự động. Trigger khi user đưa đầu vào kèm "xử lý theo nexus", "đưa vào nexus", "process this", "biến thành bài viết", hoặc khi user paste trích dẫn/ý tưởng/kinh nghiệm.
---

# Nexus Process — Pipeline Thu Thập → Tinh Lọc → Chuyển Hoá → Kiến Tạo

## Mục đích
Biến bất kỳ đầu vào thô nào thành sản phẩm tri thức hoàn chỉnh, cá nhân hoá theo bối cảnh cuộc sống thực tế của user, với wikilink tự động đến các note liên quan trong vault.

---

## BƯỚC 0 — Context Scan (Luôn chạy trước)

Trước khi xử lý bất cứ thứ gì, **đọc 7 Nhật Ký Ngày gần nhất** tại `2. Tinh Lọc/Nhật Ký Ngày/`:

```
Tìm file: YYYY-MM-DD.md — lấy 7 file mới nhất theo tên
```

Từ Nhật Ký Ngày, trích xuất:

| Signal | Cách đọc | Dùng để |
|---|---|---|
| **Dự án đang chạy** | Section "Today", links đến Kiến Tạo folder | Kết nối Kiến Tạo output với effort đang active |
| **Người quan trọng** | Tên người xuất hiện lặp lại | Cá nhân hoá ví dụ và context |
| **Trạng thái cảm xúc** | Section "Fleeling/Cảm xúc" | Điều chỉnh tone bài viết |
| **Themes đang nổi** | Section "Insight", Notes được kích hoạt | Liên kết Chuyển Hoá notes liên quan |
| **Câu hỏi chưa giải** | Dấu "?" hoặc từ "chưa rõ", "cần test" | Dùng làm angle cho Kiến Tạo |

> ⚠️ **Quan trọng**: Nhật Ký Ngày thường ghi ngắn và thô — đọc giữa các dòng. Ví dụ: "một người cố vấn gợi ý về AI" không có nghĩa người đó phản đối PKM — cần đọc toàn đoạn để hiểu đúng.

Sau khi đọc xong, tạo **User Context Summary** (nội bộ, không hiển thị):
```
- Đang tập trung: [project/theme]
- Người liên quan: [tên + quan hệ + ngữ cảnh]
- Tone hiện tại: [analytical | reflective | energetic | uncertain]
- Câu hỏi đang mở: [nếu có]
```

---

## BƯỚC 1 — Nhận diện đầu vào

Xác định **loại input** từ nội dung user cung cấp:

| Loại | Dấu hiệu | Processing path |
|---|---|---|
| `quote` | Có dấu ngoặc kép, đề cập sách/tác giả | → Literature Note trong Tinh Lọc |
| `experience` | Kể việc đã làm, gặp ai, cảm thấy gì | → Literature Note trong Tinh Lọc |
| `conversation` | Đề cập cuộc trò chuyện với ai đó | → Literature Note + kết nối với People Note |
| `idea` | Ý tưởng chưa rõ, câu hỏi mở | → Fleeting Note → hỏi thêm trước khi Tinh Lọc |
| `observation` | Nhận xét về thị trường/xã hội/xu hướng | → Literature Note trong Tinh Lọc |

Nếu không rõ → hỏi: *"Đây là trích dẫn từ nguồn ngoài hay trải nghiệm cá nhân của bạn?"*

**Hỏi thêm (nếu thiếu):**
- Nếu là `quote`: Tên sách/nguồn? Tác giả? → tạo Literature Note mới hoặc thêm vào Literature Note đã có
- Nếu là `experience/conversation`: Với ai? Bối cảnh nào? (nếu chưa rõ từ Nhật Ký Ngày)
- **Kiến Tạo format mong muốn?** → `fb-post` / `article` / `newsletter` / `framework` (default: `fb-post`)

---

## BƯỚC 2 — Thu Thập

Tạo Fleeting Note tại `1. Thu Thập/`:

```markdown
---
created: YYYY-MM-DD
tags: [raw, fleeting, {detected-domain-tags}]
status: unprocessed
type: {quote|experience|conversation|idea|observation}
---

# FN — {slug 4-6 từ} — YYYY-MM-DD

{Nội dung gốc user cung cấp — giữ nguyên, không chỉnh}

---
*Capture: {timestamp}. Chưa xử lý.*

#process-now
```

**Filename**: `FN — {slug} — YYYY-MM-DD.md`

---

## BƯỚC 3 — Tinh Lọc

### Nếu input là `quote` → Literature Note

Tìm xem đã có Literature Note cho cuốn sách/nguồn này chưa:
- Nếu có → **thêm vào** note đó (đừng tạo mới)
- Nếu chưa → tạo mới tại `2. Tinh Lọc/Kiến Thức Nguồn/{Tên sách}/{Tên sách} (book).md`

```markdown
---
up: [[+ About Tinh Lọc]]
author: {tác giả}
year: {năm}
tags: [mine, source, book, {domain}]
status: đang đọc
created: YYYY-MM-DD
---

# {Tên Sách} — {Tác Giả}

## Tóm tắt 1 câu
{Viết lại bằng lời user — không copy blurb}

## Trích dẫn đáng chú ý

> "{Quote gốc}"
> — {Nguồn/chương}

**Tôi đọc thấy gì từ đây:**
{Diễn giải theo góc nhìn user — kết nối với User Context Summary}

## Ý chính đã tinh lọc
- {Ý 1 — viết lại bằng lời user}
- {Ý 2}

## Liên kết
- [[MOC liên quan nếu tìm được]]
```

### Nếu input là `experience/conversation` → Literature Note

Tạo tại `2. Tinh Lọc/Kiến Thức Nguồn/EN — {slug}.md`:

```markdown
---
up: [[+ About Tinh Lọc]]
created: YYYY-MM-DD
tags: [mine, resource, {domain}]
context: {context từ Nhật Ký Ngày nếu có}
people: [{tên người liên quan}]
---

# EN — {Tiêu đề mô tả kinh nghiệm}

## Bối cảnh
{Từ Nhật Ký Ngày + input user — ngắn, đủ để hiểu sau 6 tháng}

## Điều đã xảy ra
{Kể lại}

## Tôi nghĩ gì
{Phân tách: phần nào đúng / phần nào tôi không đồng ý / điều gì bất ngờ}

## Insight cốt lõi
> {1-2 câu cô đọng nhất}

## Liên kết
- [[FN nguồn gốc]]
- [[Note liên quan nếu tìm được]]
```

> **Cá nhân hoá từ Nhật Ký Ngày**: Nếu người được nhắc trong conversation đã xuất hiện trong Nhật Ký Ngày gần đây → reference bối cảnh đó. Nếu chủ đề này đang là theme đang nổi trong Nhật Ký Ngày → nêu rõ mối liên hệ.

---

## BƯỚC 4 — Chuyển Hoá

### 4a. Tạo 2-3 Kiến Thức Cốt Lõi candidates

Từ Tinh Lọc note vừa tạo, đề xuất 2-3 Kiến Thức Cốt Lõi (câu khẳng định hoàn chỉnh):

```
Đề xuất Kiến Thức Cốt Lõi cho topic này:

1. "{Câu khẳng định hoàn chỉnh 1}" — [góc nhìn: vấn đề]
2. "{Câu khẳng định hoàn chỉnh 2}" — [góc nhìn: cơ chế]  
3. "{Câu khẳng định hoàn chỉnh 3}" — [góc nhìn: ứng dụng]

Bạn chọn Kiến Thức Cốt Lõi nào để tạo? (có thể chọn nhiều, hoặc sửa tên)
```

> **Quy tắc đặt tên Kiến Thức Cốt Lõi**: Phải có chủ ngữ + vị ngữ. Không được là tên topic. Phải thể hiện **quan điểm** — không phải sự kiện trung lập.

### 4b. Tạo Kiến Thức Cốt Lõi đã được chọn

Tại `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/{câu khẳng định}.md`:

```markdown
---
up: [[MOC liên quan]]
created: YYYY-MM-DD
tags: [statement, core, {domain}]
source: [[Tinh Lọc note nguồn gốc]]
---

# {Câu khẳng định}

## Luận điểm
{2-5 câu — viết từ góc nhìn user, cá nhân hoá theo User Context}

## Bằng chứng / Ví dụ
- {Từ quote/kinh nghiệm user vừa cung cấp}
- {Từ vault nếu có note liên quan — tìm và reference}

## Ứng dụng thực tế
{Kết nối với dự án/effort user đang chạy từ Nhật Ký Ngày}

## Liên kết
- {≥3 wikilinks — xem BƯỚC 5}
```

### 4c. Kiểm tra MOC

Scan `3. Chuyển Hoá/Bản Đồ/` — có MOC nào phù hợp không?
- Nếu có → thêm link Kiến Thức Cốt Lõi mới vào MOC đó
- Nếu chưa có nhưng đây là lần thứ 3+ ghi về chủ đề này → gợi ý tạo MOC mới

---

## BƯỚC 5 — Auto-Link Scan

**Luôn chạy sau khi tạo Kiến Thức Cốt Lõi và trước khi tạo Kiến Tạo.**

Scan toàn vault tìm notes liên quan:

```
Folders cần scan:
- 3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/     → keywords trong title
- 3. Chuyển Hoá/Tri Thức/Framework/     → shared topic
- 3. Chuyển Hoá/Bản Đồ/                → MOC cùng domain
- 2. Tinh Lọc/Kiến Thức Nguồn/    → cùng tác giả hoặc chủ đề
- 4. Kiến Tạo/                     → Kiến Tạo projects đang active liên quan
```

**Scoring**:
- +3: title note khác có shared keyword với Kiến Thức Cốt Lõi title
- +2: body note khác đề cập chủ đề chính
- +1: cùng tag domain
- +1: đã xuất hiện trong Nhật Ký Ngày gần đây (Notes được kích hoạt)

Lấy top 5-8, **tự động chèn vào** section Liên kết của Kiến Thức Cốt Lõi (không cần hỏi — autolink là tính năng mặc định của skill này).

Báo cáo ngắn sau khi link: *"Đã tự động link: [[Note A]], [[Note B]], [[Note C]]"*

---

## BƯỚC 6 — Kiến Tạo

Tạo draft Kiến Tạo dựa trên Kiến Thức Cốt Lõi(s) vừa tạo + User Context.

**Detect Kiến Tạo format** (từ user hoặc default `fb-post`):

### Format: `fb-post` (~400-600 từ)

```
Cấu trúc: Hook (1-2 câu mạnh) → Steelman (1 đoạn) → Counterpoint → Insight cốt lõi → Ứng dụng → CTA
Tone: Cá nhân, đối thoại trực tiếp với độc giả
```

### Format: `article` (~1000-1500 từ)

```
Cấu trúc: Hook → Phần 1 (đặt vấn đề) → Phần 2 (phân tích) → Phần 3 (giải pháp) → Kết
Tone: Phân tích sâu, dẫn chứng đa chiều
```

### Format: `newsletter` (~700-900 từ)

```
Cấu trúc: Opener (cá nhân) → Insight chính → 3 takeaways → 1 câu hỏi để suy nghĩ
Tone: Ấm, như viết thư cho bạn thân quan tâm đến chủ đề
```

### Format: `framework`

```
Cấu trúc: Tiêu đề câu hỏi → Vấn đề → Framework (3-5 bước/nguyên tắc) → Ví dụ áp dụng → Checklist
Tone: Thực tế, actionable
```

**Cá nhân hoá từ User Context**:
- Nếu tone = `reflective` → mở bằng khoảnh khắc cá nhân thực tế
- Nếu tone = `analytical` → mở bằng câu hỏi hoặc data
- Nếu tone = `energetic` → mở bằng bold claim
- Kết hợp tên người thực tế từ Nhật Ký Ngày nếu phù hợp (thay "người bạn" bằng tên thật)

**Lưu tại**: `4. Kiến Tạo/Simmering/{Tên Project}/`

**Frontmatter Kiến Tạo**:
```yaml
---
up: [[MOC liên quan]]
created: YYYY-MM-DD
tags: [mint, {format}, {domain}]
status: draft
format: {fb-post|article|newsletter|framework}
platform: {Facebook|Newsletter|Website}
sources:
  - [[Kiến Thức Cốt Lõi 1]]
  - [[Kiến Thức Cốt Lõi 2]]
  - [[Tinh Lọc note nguồn gốc]]
---
```

**Auto-link trong body**: Khi đề cập concept đã có trong vault → tự động chèn `[[wikilink]]` inline.

---

## BƯỚC 7 — Báo cáo kết thúc

Sau khi hoàn thành, report ngắn:

```
✅ Nexus Process hoàn tất

📥 Thu Thập:   1. Thu Thập/FN — {slug}.md
📖 Tinh Lọc:  2. Tinh Lọc/{loại}/{tên}.md
💎 Chuyển Hoá:  3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/{câu khẳng định}.md
🌱 Kiến Tạo:  4. Kiến Tạo/Simmering/{project}/{tên}.md

🔗 Auto-linked: {N} notes liên quan

💡 Gợi ý tiếp theo:
- {Nếu có Kiến Thức Cốt Lõi thứ 2 chưa viết → gợi ý}
- {Nếu Kiến Tạo cần ảnh minh hoạ → nhắc}
- {Nếu có MOC cần cập nhật → nhắc}
```

---

## Validate trước khi save mỗi file

- [ ] Thu Thập: có frontmatter `created` + `status: unprocessed` + `#process-now`
- [ ] Tinh Lọc: có `up:` link, có section Insight cốt lõi, có ít nhất 1 wikilink
- [ ] Kiến Thức Cốt Lõi: tên là câu khẳng định có chủ ngữ + vị ngữ, có ≥3 wikilink, có section Ứng dụng
- [ ] Kiến Tạo: có `sources:` trong frontmatter linking về Kiến Thức Cốt Lõi gốc, có `status: draft`

---

## Tham số tuỳ chọn

User có thể chỉ định:

| Tham số | Giá trị | Mặc định |
|---|---|---|
| `--depth` | `quick` / `full` / `deep` | `full` |
| `--format` | `fb-post` / `article` / `newsletter` / `framework` | `fb-post` |
| `--context` | số ngày Nhật Ký Ngày cần đọc | `7` |
| `--no-mint` | bỏ qua tầng Kiến Tạo | không bật |
| `--statements` | số Kiến Thức Cốt Lõi cần tạo | `1` (hỏi chọn từ 2-3 đề xuất) |

**Chế độ `--depth quick`**: Chỉ tạo Thu Thập + 1 Kiến Thức Cốt Lõi + Kiến Tạo — bỏ qua chi tiết Tinh Lọc. Dùng khi cần output nhanh trong 5 phút.

**Chế độ `--depth deep`**: Ngoài full còn tạo thêm Framework note nếu phát hiện pattern/quy trình mới, và cập nhật MOC liên quan.

---

## Tham chiếu
- Framework: `3. Chuyển Hoá/Tri Thức/Framework/Framework - Hệ Thống Chuyển Hoá — Cấu Trúc Và Vận Hành.md`
- Ví dụ luồng: `4. Kiến Tạo/Simmering/Bài Viết — Second Brain/`
- Nhật Ký Ngày: `2. Tinh Lọc/Nhật Ký Ngày/YYYY-MM-DD.md`
