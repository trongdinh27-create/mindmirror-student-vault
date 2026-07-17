---
title: Quy ước tạo note — taxonomy (type / status / area / tags)
type: reference
status: evergreen
tags: [meta, taxonomy, reference]
aliases: [quy-uoc-tao-note, taxonomy]
---

# Quy ước tạo note — Taxonomy

> Tài liệu reference định nghĩa các giá trị hợp lệ cho frontmatter, khớp với bộ template trong folder template. Đọc khi quên giá trị `type` / `status` / `area` nào hợp lệ.

---

## `type` — loại note (khớp 18 template)

| `type` | Template | Ý nghĩa |
|---|---|---|
| `concept` | concept | Khái niệm — "X là gì" |
| `method` | problem-driven-method | Phương pháp — "làm thế nào" (HOW) |
| `methodology` | prompt-template | Phương pháp/quy trình tái dùng đóng gói được (vd prompt template) |
| `principle` | problem-driven-principle | Nguyên tắc — "phải tuân theo gì" (DECIDE) |
| `tool` | problem-driven-tool | Công cụ / phần mềm cụ thể (SaaS, app) |
| `symptom` | problem-driven-symptom | Triệu chứng — dấu hiệu chưa rõ nguyên nhân |
| `hub` | problem-driven-new-problem / -hub / -hub-cha | Vấn đề / trung tâm điều hướng vấn đề |
| `framework` | minto-note | Khung tư duy / output có cấu trúc |
| `log` | daily-note / meeting-note / project-log | Ghi chép theo thời gian |
| `entity` | people-profile / github-repo | Thực thể (người, repo…) — có `subtype` nếu cần |
| `summary` | book-highlights | Tóm tắt nguồn (sách, bài viết) |
| `moc` | moc | Map of Content — bản đồ điều hướng cluster |
| `seed` | ghi-chu-nhanh | Capture thô, chưa atomic |
| `reference` | (file meta này) | Tài liệu tham chiếu / quy ước |

---

## `status` — theo nhóm template

- **concept / method / methodology / principle / symptom / moc / seed / framework**: `seed` → `growing` → `evergreen`
- **tool**: `trying` | `active` | `dropped` | `replaced`
- **summary (book)**: `reading` | `done` | `abandoned`
- **meeting (log)**: `scheduled` | `done` | `cancelled` | `rescheduled`
- **project (log)**: `active` | `paused` | `done` | `killed`
- **people (entity)**: `active` | `dormant` | `archived`
- **github-repo (entity)**: `bookmark` | `trying` | `adopted` | `forked` | `dropped`
- **hub**: `seed` | `growing` (active) → archive khi solved

---

## `area` — lĩnh vực (OPTIONAL, tuỳ chỉnh theo bạn)

Gợi ý generic — thay bằng lĩnh vực của riêng bạn:

`brain` · `learning` · `productivity` · `writing` · `problem-solving` · `marketing` · `sales` · `finance` · `data` · `ai` · `automation` · `dev-tool` · `leadership` · `health`

> `area` để trống được (note thuần học để hiểu). Điền khi muốn nhóm theo lĩnh vực.

---

## Tags

### Theo hành động cần làm
- `#inbox` — chưa xử lý
- `#to-clarify` — cần làm rõ
- `#to-link` — cần thêm liên kết
- `#to-summarize` — cần chắt lọc
- `#to-apply` — cần thử áp dụng

### Theo chủ đề (topic tags — ví dụ, tự đặt)
- `#learning` · `#psychology` · `#writing` · `#productivity` · `#second-brain`

---

## Frontmatter mẫu

### Note kiến thức (concept / method / principle / tool)
```yaml
---
title: {{title}}
type: concept        # concept | method | principle | tool | framework
status: seed         # seed | growing | evergreen
area: ""             # OPTIONAL
problem: ""          # OPTIONAL: "[[Vấn đề - ...]]"
tags: []
aliases: []
created: {{date:YYYY-MM-DD}}
---
```

### Note vấn đề / hub
```yaml
---
type: hub
status: growing
problem: ""
tags: [problem-solving]
created: {{date:YYYY-MM-DD}}
---
```

---

## Symptom vs Problem — phân biệt bằng 2 câu hỏi

### ✅ Symptom (Triệu chứng)
**Dấu hiệu đang gặp**, mô tả "điều đang xảy ra".
- Thường là **cảm nhận / biểu hiện**
- Có thể là **hậu quả** của nhiều nguyên nhân khác nhau

**Câu hỏi:** "Mình đang thấy gì?" · "Nó xuất hiện khi nào?"
Ví dụ: "Viết lộn xộn" → mô tả biểu hiện.

### ✅ Problem (Vấn đề)
**Nguyên nhân gốc / nút thắt cần tháo** hoặc một **mục tiêu bị kẹt**.
- Có thể chuyển thành **đề bài giải quyết**
- Có tiêu chí "giải xong" rõ

**Câu hỏi:** "Mình muốn đạt gì nhưng đang bị kẹt?" · "Giải xong thì trông thế nào?" (Outcome)
Ví dụ: "Thiếu hệ thống ôn tập" → problem (giải xong = nhớ lâu hơn).

### Checklist phân biệt nhanh (10 giây)
✅ **Symptom**: câu bắt đầu bằng "Mình thấy…" / "Mình hay bị…" / "Mình bị rối/đơ…"
✅ **Problem**: "Nguyên nhân là…" / "Mình thiếu…" / "Cần một cách để…" / "Mục tiêu là… nhưng…"
