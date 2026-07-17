---
name: mindmirror-tong-hop-tuan
description: Tổng hợp tuần tự động từ Nhật Ký Ngày. Tự biết tuần hiện tại từ ngày hệ thống, đọc daily notes trong khoảng tuần đó, tổng hợp thành Weekly Note có cấu trúc và lưu vào vault. Phát hiện gap nếu tuần trước bị bỏ qua. Trigger khi user nói "tổng hợp tuần", "weekly synthesis", "tổng kết tuần này", "review tuần", "tôi muốn xem lại tuần này".
---

# Weekly Synthesis — Tổng Hợp Tuần Tự Động

## Mục đích
Đọc toàn bộ Nhật Ký Ngày trong tuần → tổng hợp thành Weekly Note có cấu trúc → lưu vào vault → gợi ý cập nhật Me.md nếu có thay đổi quan trọng.

---

## BƯỚC 0 — Xác định tuần cần tổng hợp

Lấy ngày hiện tại từ hệ thống. Tính:
- **Thứ Hai của tuần hiện tại** = ngày bắt đầu
- **Hôm nay hoặc Chủ Nhật** = ngày kết thúc (lấy cái nào nhỏ hơn)
- **Mã tuần** = YYYY-WXX (theo ISO week)

Nếu user chỉ định tuần khác (ví dụ: "tuần trước", "tuần W23") → điều chỉnh date range theo yêu cầu.

```
Ví dụ: Hôm nay 2026-06-07 (Chủ Nhật)
→ Tuần: 2026-W23
→ Date range: 2026-06-01 đến 2026-06-07
```

**Kiểm tra gap**: Scan `2. Tinh Lọc/Tổng Kết Tuần/` — tuần nào chưa có Weekly Note? Nếu có gap → hỏi user: *"Tuần [W22] chưa có tổng hợp. Bạn muốn tôi làm luôn không?"*

---

## BƯỚC 1 — Đọc Nhật Ký Ngày

Tìm và đọc tất cả Nhật Ký Ngày trong date range tại `2. Tinh Lọc/Nhật Ký Ngày/YYYY-MM-DD.md`.

Với mỗi ngày, trích xuất:

| Field | Lấy từ đâu |
|---|---|
| Intentions đã hoàn thành | Section "Sáng — Intention", checkbox `[x]` |
| Files đã tạo | Section "Tối — Review → Đã tạo ra" |
| Insights | Section "Nhận ra hôm nay" |
| Cảm xúc | Section "Cảm xúc hôm nay" |
| Biết ơn | Section "Biết ơn hôm nay" |
| Dimensions được feed | Field `dimension` trong các notes được tạo ngày đó |

Ghi nhận ngày nào **không có Daily Note** → đánh dấu là gap.

---

## BƯỚC 2 — Tổng hợp nội dung

Từ dữ liệu đọc được, tổng hợp theo cấu trúc:

### 2a. Output chính trong tuần
- Liệt kê tất cả files/notes đã tạo (từ các "Tối — Review")
- Nhóm theo loại: Illustrations / Framework / Permanent Notes / Kiến Thức Nguồn / Efforts

### 2b. Top 3 Insights tuần
- Chọn 3 insight quan trọng nhất từ tất cả các ngày
- Ưu tiên: insight xuất hiện lặp lại nhiều ngày > insight ngày cuối tuần > insight ngày đầu tuần

### 2c. Pattern cảm xúc
- Nhận diện pattern: ngày nào năng lượng cao / thấp / flat
- Có trigger gì gây cảm xúc tiêu cực không?
- Tổng thể tuần: ascending / descending / volatile / stable

### 2d. Wheel of Life — Dimensions được feed
- Liệt kê dimensions nào xuất hiện trong notes tuần này
- Dimensions nào **không được feed** → đánh dấu đỏ

### 2e. Thay đổi đáng cập nhật Me.md
- Có milestone mới không? (thương hiệu, quyết định lớn, mối quan hệ mới)
- Có mindset shift rõ ràng không?
- Có thông tin bối cảnh thay đổi không?

---

## BƯỚC 3 — Tạo Weekly Note

Lưu tại: `2. Tinh Lọc/Tổng Kết Tuần/YYYY-WXX.md`

```markdown
---
week: YYYY-WXX
date-range: YYYY-MM-DD đến YYYY-MM-DD
tags: [weekly-review, mine]
dimensions-fed: [list các dimension được feed]
---

# Tuần YYYY-WXX — [Tiêu đề 1 câu mô tả tuần]

> [1 câu tóm tắt tinh thần của tuần]

---

## Output tuần này

**Tổng số: ~X files được tạo ra trong X ngày làm việc thật sự**

### Illustrations (X)
- [[...]]
- [[...]]

### Framework (X)
- [[...]]

### Permanent Notes (X)
- [[...]]

### Kiến Thức Nguồn (X)
- [[...]]

### Projects / Efforts
- [[...]]

---

## Top 3 Insights

1. **[Insight 1]** — *(Ngày X)*
   > [Trích dẫn hoặc mô tả ngắn]

2. **[Insight 2]** — *(Ngày X)*

3. **[Insight 3]** — *(Ngày X)*

---

## Pattern cảm xúc

- **Năng lượng cao nhất:** Ngày X — [lý do]
- **Ngày flat/khó:** Ngày X — [lý do]
- **Tổng thể:** [ascending / stable / volatile]

---

## Wheel of Life — Tuần này

✅ Được feed: [list dimensions]
⚠️ Bị bỏ đói: [list dimensions không có note]

---

## Sẵn sàng nâng lên Chuyển Hoá?

- [ ] [[Note cần xem xét nâng lên Permanent Note]]
- [ ] [[Insight cần trở thành Kiến Thức Cốt Lõi]]

---

## Tuần tới — Intention

- 
- 
```

---

## BƯỚC 4 — Kiểm tra cập nhật Me.md

Sau khi tạo Weekly Note, hỏi user:

> *"Tôi thấy tuần này có [X thay đổi đáng chú ý]. Bạn có muốn cập nhật Me.md không?"*

Chỉ đề xuất cập nhật khi có ít nhất 1 trong:
- Thương hiệu / sản phẩm thay đổi
- Mối quan hệ quan trọng mới
- Quyết định lớn đã được đưa ra
- Nỗi sợ hoặc mục tiêu thay đổi rõ rệt

---

## BƯỚC 5 — Báo cáo kết thúc

```
✅ Weekly Synthesis hoàn tất

📅 Tuần: YYYY-WXX (DD/MM → DD/MM)
📝 Nhật Ký Ngày đọc: X/7 ngày [ghi chú gap nếu có]
📦 Output tuần: X files
💡 Insights: 3 đã tổng hợp
🎯 Dimensions được feed: X/15
⚠️ Dimensions bị bỏ đói: [list]

Đã lưu: 2. Tinh Lọc/Tổng Kết Tuần/YYYY-WXX.md
```
