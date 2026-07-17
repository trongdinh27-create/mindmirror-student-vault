---
name: mindmirror-chac-loc
description: Nhận bất kỳ đoạn văn bản nào (bài viết, ghi chú thô, transcript, suy nghĩ dài) và tự động chắt lọc thành Kiến Thức Cốt Lõi Notes trong Chuyển Hoá/Dots/Kiến Thức Cốt Lõi/. Khác với mindmirror-thu-hoach (interactive, từng câu một) — mindmirror-chac-loc phân tích toàn bộ text, rút ra TẤT CẢ luận điểm cốt lõi, tạo nhiều Kiến Thức Cốt Lõi cùng lúc với auto-link. Trigger: "chắt lọc", "distill", "rút ra statements", "biến đoạn này thành notes", "extract statements từ đây", "phân tích và lưu vào core".
---

# Nexus Distill — Text → Kiến Thức Cốt Lõi Notes (Batch Mode)

## Mục đích

Biến đoạn văn bản thô (dù dài hay ngắn) thành Kiến Thức Cốt Lõi Notes sẵn sàng dùng trong Chuyển Hoá — **không cần đối thoại nhiều bước, không cần user gõ lại từng ý**. Skill này làm hết: phân tích, chắt lọc, đặt tên, tạo file, gắn link.

> **Khác với các skill khác:**
> - `mindmirror-thu-hoach` = Stockpile mode, từng quote một, hỏi Mini-Tinh Lọc sau mỗi quote
> - `mindmirror-chac-loc` = **Batch distill** — đưa cả đoạn văn, rút ra nhiều Kiến Thức Cốt Lõi cùng lúc, tự động hoàn toàn

---

## BƯỚC 1 — Nhận và phân tích text

Nhận bất kỳ định dạng đầu vào nào:
- Bài viết / bài đăng mạng xã hội
- Đoạn sách / podcast transcript
- Ghi chú thô, suy nghĩ dài chưa tổ chức
- Cuộc trò chuyện đã sao chép

**Phân tích nội dung, tìm:**
1. **Luận điểm** — quan điểm có thể defend được, không phải sự kiện đơn thuần
2. **Phân biệt cốt lõi** — điểm tương phản làm rõ ranh giới giữa hai khái niệm
3. **Hệ quả đáng nhớ** — kết luận không hiển nhiên từ một quan sát
4. **Câu hỏi chẩn đoán** — câu hỏi phân biệt được trạng thái A vs B

Bỏ qua:
- Thông tin thực tế thuần túy (ngày tháng, số liệu không kèm nhận định)
- Câu dẫn nhập, câu kết mang tính hình thức
- Ví dụ minh họa (giữ lại làm "Bằng chứng" trong Kiến Thức Cốt Lõi)

---

## BƯỚC 2 — Đề xuất Kiến Thức Cốt Lõi candidates

Sau khi phân tích, đề xuất danh sách Kiến Thức Cốt Lõi dưới dạng **câu khẳng định hoàn chỉnh**:

```
📋 Tìm thấy {N} luận điểm có thể thành Kiến Thức Cốt Lõi:

1. "{Câu khẳng định — luận điểm 1}"
2. "{Câu khẳng định — luận điểm 2}"
3. "{Câu khẳng định — luận điểm 3}"
...

→ Tạo tất cả, hay bỏ cái nào?
  [Enter] = Tạo tất cả
  [1,3] = Chỉ tạo số 1 và 3
  [sửa X] = Sửa tên Kiến Thức Cốt Lõi số X trước khi tạo
```

**Quy tắc đặt tên Kiến Thức Cốt Lõi (bắt buộc):**
- Có chủ ngữ + vị ngữ rõ ràng
- Thể hiện quan điểm / phân biệt / hệ quả — không chỉ mô tả
- Ngắn gọn nhưng đủ ý (10-20 từ lý tưởng)
- ❌ "PKM và tích trữ thông tin"
- ✅ "Tích trữ thông tin không phải là Quản lý Tri thức"

---

## BƯỚC 3 — Tạo Kiến Thức Cốt Lõi Notes (song song)

Với mỗi Kiến Thức Cốt Lõi được chọn, tạo file tại `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`:

```markdown
---
up:
  - "[[MOC phù hợp — auto-detect]]"
created: YYYY-MM-DD
tags: [statement, core, {domain-tags-tự-detect}]
source: "{nguồn nếu rõ — hoặc để trống}"
distilled-from: "{tiêu đề hoặc mô tả ngắn của text gốc}"
---

## Luận điểm

{2-4 câu — viết lại bằng lời của user, KHÔNG copy-paste từ text gốc. Nắm bắt tinh thần, không sao chép chữ.}

## Bằng chứng / Ví dụ

{Trích dẫn hoặc ví dụ từ text gốc làm minh chứng cho luận điểm — đây là nơi duy nhất được copy gần nguyên văn.}

## Ứng dụng thực tế

{Suy ra từ context của text: khi nào áp dụng luận điểm này? Hành động cụ thể là gì? Nếu không rõ → "Cần test — chưa xác định ứng dụng cụ thể."}

## Liên kết

{≥3 wikilinks — auto-scan, xem Bước 4}
```

---

## BƯỚC 4 — Auto-Link Scan

Scan vault song song với việc tạo file. Tìm notes liên quan trong:

```
3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/   → title keyword matching
3. Chuyển Hoá/Bản Đồ/Bản Đồ Chủ Đề/         → domain mapping → điền vào "up:"
3. Chuyển Hoá/Tri Thức/Concepts/     → shared topic
3. Chuyển Hoá/Tri Thức/Framework/   → cùng lĩnh vực
2. Tinh Lọc/Kiến Thức Nguồn/  → cùng tác giả/nguồn
```

**Ưu tiên link:**
1. Kiến Thức Cốt Lõi cùng chủ đề trực tiếp (conflict, complement, extend)
2. Concept / Framework là nền tảng của Kiến Thức Cốt Lõi
3. MOC chứa Kiến Thức Cốt Lõi (gắn vào `up:`)

Chèn tự động, không hỏi. Báo cáo số links sau khi xong.

---

## BƯỚC 5 — Báo cáo kết quả

Sau khi tạo xong tất cả:

```
✅ Đã tạo {N} Kiến Thức Cốt Lõi Notes:

1. [[Tên Kiến Thức Cốt Lõi 1]] — {N} links
2. [[Tên Kiến Thức Cốt Lõi 2]] — {N} links
...

📁 Vị trí: 3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/
🔗 Tổng links: {tổng số wikilinks đã gắn}

Tiếp theo:
[1] Distill thêm — paste đoạn văn khác
[2] Xem chi tiết một Kiến Thức Cốt Lõi cụ thể
[3] Upgrade một Kiến Thức Cốt Lõi thành Kiến Tạo — gọi mindmirror-xu-ly
```

---

## Validate trước khi save (mỗi Kiến Thức Cốt Lõi)

- [ ] Tên file là câu khẳng định có chủ ngữ + vị ngữ
- [ ] Section "Luận điểm" viết lại bằng lời mới, không copy-paste nguyên văn text gốc
- [ ] `distilled-from:` điền thông tin nguồn
- [ ] Có ≥3 wikilinks trong section Liên kết
- [ ] `up:` có ít nhất 1 MOC

---

## Phân biệt với các skill liên quan

| | mindmirror-chac-loc | mindmirror-thu-hoach |
|---|---|---|
| **Input** | Đoạn văn dài bất kỳ | Từng quote ngắn |
| **Output** | Nhiều Kiến Thức Cốt Lõi cùng lúc | 1 Kiến Thức Cốt Lõi / lần |
| **Tốc độ** | Nhanh, ít hỏi | Trung bình, hỏi Mini-Tinh Lọc |
| **Mini-Tinh Lọc** | Không (rút ra từ text) | Có (bắt buộc) |
| **Dùng khi** | Có sẵn đoạn văn muốn chắt lọc | Đang đọc và capture từng ý |

---

## Tham chiếu
- Template: `5. Hộp Công Cụ/Template/Template - Kiến Thức Cốt Lõi.md`
- Skill đầy đủ: `mindmirror-xu-ly`
- Stockpile mode: `mindmirror-thu-hoach`
- MOC Home: `3. Chuyển Hoá/Bản Đồ/Bản Đồ Chủ Đề/Bản Đồ Chủ Đề — Tổng Quan.base`
