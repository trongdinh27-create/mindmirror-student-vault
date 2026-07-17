---
name: mindmirror-cap-nhat-daily-note
description: Nhận biên bản cuộc họp đã phân tích → tự động tìm/tạo daily note ngày tương ứng → cập nhật 3 section: "Trong ngày — Capture" (tóm tắt meeting + link LN), "Tối — Review" (ghi lại đã làm gì), "Nhận ra hôm nay" (5–8 insights dạng bullet point có bold title). Trigger khi user nói "cập nhật daily note", "lưu vào nhật ký", "thêm vào daily note", hoặc tự động chạy sau khi phân tích file ghi âm xong.
---

# Cập Nhật Daily Note Sau Phân Tích Ghi Âm

## Mục đích

Sau khi có biên bản cuộc họp → tự động update daily note tương ứng để daily note phản ánh đúng những gì xảy ra trong ngày và không mất insight quan trọng.

---

## Thông tin cần có trước khi chạy

- **Biên bản đã phân tích** (từ file ghi âm/transcript đã xử lý hoặc text có sẵn)
- **Ngày của cuộc họp** (lấy từ biên bản — trường "Ngày:")
- **Tên LN file đã lưu** (nếu có — dùng để tạo wikilink)

---

## BƯỚC 1 — Xác định daily note

**Path chuẩn:** `2. Tinh Lọc/Nhật Ký Ngày/YYYY-MM-DD.md`

- Nếu file đã tồn tại → đọc nội dung hiện tại
- Nếu chưa tồn tại → tạo mới với cấu trúc đầy đủ:

```markdown
---
date: YYYY-MM-DD
title:
week: YYYY-WXX
tags:
  - daily-note
  - mine
---

### Sáng — Intention

**Hôm nay muốn tạo ra hoặc hoàn thành:**
- [ ] 
- [ ] 
- [ ] 

---

### Trong ngày — Capture

*(Ghi nhanh mọi thứ vào đây hoặc vào Thu Thập. Không cần format. Tối về xử lý.)*

- 

---

### Tối — Review

**Đã tạo ra hoặc hoàn thành:**
- 

---

### Nhận ra hôm nay

*(Insight, bài học, quan sát đáng ghi lại)*

- 

### Cảm xúc hôm nay

*(Hôm nay cảm thấy thế nào? Tại sao?)*

- 

### Biết ơn hôm nay

- 

### Ảnh nổi bật hôm nay

*(Một khoảnh khắc, con người, hoặc chi tiết đáng nhớ)*


### Habits hôm nay

- [ ] Thói quen quan trọng nhất
- [ ] Vận động / chăm sóc sức khỏe
- [ ] Học tập / đọc / viết
```

---

## BƯỚC 2 — Cập nhật "Trong ngày — Capture"

Append vào cuối section (không xóa nội dung cũ):

```
- Họp ~[X] phút với [tên người/tổ chức] — [1 câu mô tả chủ đề chính]
  → [[LN — Biên Bản ... — YYYY-MM-DD]]
```

Nếu LN chưa được lưu → bỏ qua dòng wikilink.

---

## BƯỚC 3 — Cập nhật "Tối — Review"

Append bullet point mô tả việc đã làm:

```
- Phân tích biên bản [tên cuộc họp], tạo file [[LN — ...]]
```

---

## BƯỚC 4 — Cập nhật "Nhận ra hôm nay"

Append section con với nhãn nguồn + 5–8 insights:

```markdown
**[Từ buổi [họp/gặp] với [tên người/tổ chức]]**

- **[Tiêu đề insight ngắn gọn]:** [Giải thích 1–2 câu — tại sao quan trọng, ý nghĩa thực tiễn.]

- **[Tiêu đề insight 2]:** ...
```

**Quy tắc viết insight:**
- Phải là bài học / nguyên tắc / quan sát — không phải tóm tắt fact
- Lead với bold title → giải thích ý nghĩa thực tiễn (không chỉ mô tả "điều gì xảy ra")
- Ưu tiên những gì bất ngờ, counter-intuitive (phản trực giác), hoặc thay đổi cách nhìn
- Mỗi insight phải có thể áp dụng ngoài bối cảnh cuộc họp đó

---

## BƯỚC 5 — Thông báo

Sau khi cập nhật xong:

> "✓ Đã cập nhật daily note [YYYY-MM-DD] — thêm X insights vào 'Nhận ra hôm nay'."

---

## Nguyên tắc

- **Không xóa nội dung cũ** — chỉ append vào cuối mỗi section
- **Insight > Fact** — "Khách hàng tự tính ROI là tín hiệu chốt sale" tốt hơn "Anh Thịnh tính 3 tỷ/tháng"
- **Một nguồn, một section con** — nếu cùng ngày có 2 cuộc họp, tạo 2 section con riêng biệt
- **Ngày cuộc họp = ngày daily note** — không dùng ngày phân tích nếu khác
