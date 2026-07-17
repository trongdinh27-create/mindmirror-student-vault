---
name: mindmirror-nhan-vat
description: Nghiên cứu toàn diện về một nhân vật ảnh hưởng và tạo People Note chuẩn vault. Tự động web search, tổng hợp tiểu sử, hành trình tìm ra con đường, hệ thống mentor, tư tưởng cốt lõi, và viết phần "Ảnh hưởng đến người dùng" cá nhân hoá. Lưu vào 2. Tinh Lọc/Kiến Thức Nguồn/People/ và Map People tự cập nhật qua Dataview. Trigger khi user nói "nghiên cứu về [người]", "tìm hiểu về [người]", "tạo note về [người]", "nexus people [người]", "/mindmirror-nhan-vat".
---

# Atlas People Research — Nghiên Cứu Nhân Vật Ảnh Hưởng

## Mục đích
Biến tên một nhân vật ảnh hưởng thành một People Note đầy đủ, cá nhân hoá, sẵn sàng dùng trong vault — không phải Wikipedia copy, mà là ghi chú *từ góc nhìn của người dùng*.

---

## BƯỚC 0 — Xác nhận đầu vào

Nhận tên nhân vật từ user. Hỏi nếu thiếu thông tin cần thiết:

- **Tên nhân vật**: bắt buộc
- **Góc nhìn nghiên cứu** (optional): *"Bạn muốn tập trung vào khía cạnh nào — triết lý, business, methodology, hay toàn diện?"* — mặc định: **toàn diện**
- **Độ sâu** (optional): `quick` (tiểu sử + 3 khái niệm) / `full` (mặc định) / `deep` (thêm phân tích so sánh với nhân vật khác trong vault)

Sau khi xác nhận → thông báo: *"Bắt đầu nghiên cứu [Tên]. Tôi sẽ search và tổng hợp, sau đó tạo note đầy đủ."*

---

## BƯỚC 1 — Web Research (Chạy tối thiểu 3 search queries)

Chạy **song song** 3 nhóm query sau:

### Query nhóm 1 — Tiểu sử & Hành trình
```
"{Tên}" biography "who is" background story origin
```

### Query nhóm 2 — Người ảnh hưởng & Mentor
```
"{Tên}" influences mentors "who inspired" how found path philosophy
```

### Query nhóm 3 — Tư tưởng & Đóng góp cốt lõi
```
"{Tên}" key concepts framework teachings methodology books
```

**Nếu cần sâu hơn** → chạy thêm query thứ 4:
```
"{Tên}" criticism controversy impact legacy 2024 2025
```

**Đọc sâu nguồn cụ thể:** khi cần đọc trọn 1 trang (bài phỏng vấn, blog cá nhân, trang tiểu sử), dùng **defuddle** (`defuddle parse <url> --md`) thay vì WebFetch để lấy markdown sạch, đỡ tốn token. URL `.md` → WebFetch thẳng. Xem skill `/defuddle`.

**Tổng hợp từ search results:**
- Ghi chú những chi tiết *không phổ biến* (ít được nhắc đến) — đây là những điểm thú vị nhất
- Chú ý câu chuyện đằng sau sự thành công — đặc biệt là khủng hoảng, thất bại, và khoảnh khắc bước ngoặt
- Tìm xem ai là người thực sự ảnh hưởng đến họ (không chỉ người nổi tiếng họ nhắc đến trong marketing)

---

## BƯỚC 2 — Scan vault để cá nhân hoá

Trước khi viết note, scan vault để tìm kết nối:

```
Tìm trong:
- 2. Tinh Lọc/Kiến Thức Nguồn/People/     → nhân vật nào trong vault liên quan?
- 3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/             → có Kiến Thức Cốt Lõi nào liên quan đến tư tưởng người này?
- 3. Chuyển Hoá/Tri Thức/Framework/             → framework nào trong vault tương đồng?
- 2. Tinh Lọc/Nhật Ký Ngày/ (7 ngày gần nhất) → người dùng đang quan tâm đến điều gì?
```

Tạo **Research Context** (nội bộ):
```
- Nhân vật liên quan trong vault: [danh sách]
- Tư tưởng tương đồng với người dùng: [3-5 điểm]
- Điểm khác biệt thú vị: [2-3 điểm]
- Liên kết với dự án đang chạy: [nếu có từ Nhật Ký Ngày]
```

---

## BƯỚC 3 — Tạo People Note

Tạo file tại: `2. Tinh Lọc/Kiến Thức Nguồn/People/{Tên Đầy Đủ}.md`

### Template chuẩn:

```markdown
---
tags:
  - people
  - {domain-tag-1}
  - {domain-tag-2}
born: {YYYY}
died: {YYYY hoặc để trống nếu còn sống}
nationality: {quốc gia}
domain: [{Domain 1}, {Domain 2}, {Domain 3}]
dates: "{YYYY} - {nay hoặc YYYY}"
role: "{Chức danh/vai trò chính} — {Mô tả ngắn}"
---

# {Tên} · {Một câu mô tả bản chất cốt lõi của người này}

> *"{Câu quote đặc trưng nhất}"*

---

## Tiểu sử

### Những năm đầu đời
{Bối cảnh, gia đình, học vấn — chú ý những yếu tố định hình tư duy}

### Sự nghiệp
{Hành trình theo timeline — bao gồm cả thất bại và bước ngoặt}

---

## Con đường tìm ra chính mình — Tại sao {Tên} đến đây?

{Phân tích: họ không đến từ kế hoạch hay may mắn thuần túy — điều gì thực sự đẩy họ đến đây?}

**{3-4 lực kéo chính}:**
- Lực 1: ...
- Lực 2: ...
- Lực 3: ...

---

## Những người ảnh hưởng — Hệ thống mentor

### {Tên Mentor 1} — {Vai trò ảnh hưởng}
**Ảnh hưởng:** {Mô tả ngắn}
{Chi tiết ảnh hưởng cụ thể}

### {Tên Mentor 2} — {Vai trò ảnh hưởng}
...

---

## Thành tựu nổi bật

| Thành tựu | Năm | Ý nghĩa |
|---|---|---|
| {Thành tựu 1} | {Năm} | {Tại sao quan trọng} |

---

## Tư tưởng cốt lõi — {N} khái niệm quan trọng nhất

### 1. {Tên Concept}
{Giải thích — viết như đang giải thích cho một người thông minh chưa biết}

### 2. {Tên Concept}
...

---

## Câu nói truyền cảm hứng

> *"{Quote 1}"*

> *"{Quote 2}"*

---

## Ảnh hưởng đến tôi — người dùng Docon

{Viết từ góc nhìn người dùng — KHÔNG PHẢI tóm tắt lại những gì đã nói. Phải trả lời:
- Điều gì ở người này làm người dùng thấy khác biệt so với những người đã biết?
- Khái niệm nào cộng hưởng với hành trình PKM / MindMirror / công việc thực tế?
- Điều gì người dùng sẽ áp dụng hoặc đã thay đổi cách nghĩ?}

---

## Đọc thêm / Học thêm

- **"{Sách 1}"** ({Năm}) — {Mô tả ngắn, bắt đầu từ đâu}
- **"{Sách 2}"** ({Năm}) — ...
- {Podcast/Course/Link quan trọng}

---

## Liên kết

- [[Bản Đồ Nhân Vật]]
- {Liên kết đến nhân vật khác trong vault}
- {Liên kết đến Framework/Kiến Thức Cốt Lõi liên quan}
- {Liên kết đến Bản Đồ Cuộc Đời nếu liên quan}
```

---

## BƯỚC 4 — Kiểm tra chất lượng trước khi lưu

Checklist trước khi save:

- [ ] **Tag `people`** có trong frontmatter → Dataview sẽ tự pull vào Map People
- [ ] **`dates`** có giá trị → dùng để sort trong Map People
- [ ] **`role`** có giá trị → hiển thị trong bảng Dataview
- [ ] **Tiêu đề H1** có subtitle sau dấu `·` — không chỉ là tên
- [ ] **Con đường tìm ra chính mình** — phần này phải có phân tích, không chỉ kể lại sự kiện
- [ ] **Mentor section** — mỗi mentor phải có **ảnh hưởng cụ thể** (không phải "người truyền cảm hứng chung chung")
- [ ] **Ảnh hưởng đến người dùng** — phải cá nhân hoá, không được là tóm tắt lại note
- [ ] **≥3 wikilinks** trong section Liên kết
- [ ] Có ít nhất 1 link đến nhân vật khác **đã có trong vault**

---

## BƯỚC 5 — Báo cáo kết thúc

Sau khi tạo xong, report:

```
✅ People Note đã tạo

📁 File: 2. Tinh Lọc/Kiến Thức Nguồn/People/{Tên}.md
🔗 Map People: tự cập nhật qua Dataview (tag #people)

🧩 Đã link với vault:
- {Note A liên quan}
- {Note B liên quan}

💡 Gợi ý tiếp theo:
- {Nếu có 5+ notes cùng domain → gợi ý tạo MOC}
- {Nếu có tư tưởng đáng chắt lọc thành Kiến Thức Cốt Lõi → gợi ý}
- {Nếu liên quan đến dự án đang chạy → nhắc}
```

---

## Quy tắc viết — Phân biệt note tốt và note tệ

| Note tệ | Note tốt |
|---|---|
| Copy-paste từ Wikipedia | Viết lại bằng ngôn ngữ người dùng |
| Chỉ liệt kê sự kiện | Phân tích tại sao, như thế nào |
| Mentor = danh sách tên | Mentor = cụ thể họ dạy gì và thay đổi gì |
| "Ảnh hưởng đến người dùng" = tóm tắt | "Ảnh hưởng đến người dùng" = điều gì người dùng sẽ làm khác đi |
| Không có wikilink | Link đến ít nhất 3 note trong vault |
| Viết chung chung | Cộng hưởng với hành trình PKM / MindMirror cụ thể |

---

## Tham số tuỳ chọn

| Tham số | Giá trị | Mặc định |
|---|---|---|
| `--depth` | `quick` / `full` / `deep` | `full` |
| `--focus` | `philosophy` / `business` / `methodology` / `all` | `all` |
| `--compare` | tên nhân vật trong vault để so sánh | không bật |

**`--depth quick`**: Tiểu sử ngắn + 3 khái niệm + Ảnh hưởng đến người dùng. Dùng cho nhân vật tham khảo phụ.

**`--depth deep`**: Thêm section phân tích so sánh với 1-2 nhân vật đã có trong vault, và gợi ý Kiến Thức Cốt Lõi Note từ tư tưởng của người này.

---

## Tham chiếu
- Template: `5. Hộp Công Cụ/Template/Template - People.md`
- Ví dụ note chuẩn: `2. Tinh Lọc/Kiến Thức Nguồn/People/Alex Hormozi.md`
- Map People: `3. Chuyển Hoá/Bản Đồ/Bản Đồ Nhân Vật.base`
