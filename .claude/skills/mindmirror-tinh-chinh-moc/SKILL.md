---
name: mindmirror-tinh-chinh-moc
description: Quét toàn bộ Kiến Thức Cốt Lõi Notes, tìm những note có up: trỏ về MOC nhưng chưa xuất hiện trong curated sections (callout blocks) của MOC đó, rồi thêm vào đúng section. Dùng cho notes tạo tay, chuyển từ Literature, hoặc import từ vault cũ — những notes không đi qua mindmirror-chac-loc. Trigger: "đồng bộ MOC sections", "sync MOC curated", "statement chưa vào MOC", "cập nhật section MOC", "mindmirror-tinh-chinh-moc", "moc-curate".
---

# Nexus MOC Curate — Đồng bộ Kiến Thức Cốt Lõi vào MOC Curated Sections

## Mục đích

MOC có 2 cơ chế hiển thị:
- **Dataview tự động** (`FROM [[]]`) — pull mọi note link tới MOC, không cần làm gì
- **Curated sections** (callout blocks: Luận điểm, Sai lầm, Hành vi...) — phải thêm tay, là phần người thực sự đọc và navigate

Khi Kiến Thức Cốt Lõi được tạo qua **mindmirror-chac-loc**, tôi tự thêm vào curated sections luôn. Nhưng với notes tạo tay hoặc chuyển từ nơi khác → curated sections bị bỏ sót. Skill này fix cái gap đó.

---

## BƯỚC 1 — Quét và phát hiện

**Song song:**
1. Đọc tất cả `.md` trong `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`
2. Với mỗi Kiến Thức Cốt Lõi, lấy danh sách MOC từ field `up:` trong frontmatter
3. Với mỗi MOC, đọc phần body (sau `---` thứ 2)
4. Kiểm tra: tên Kiến Thức Cốt Lõi có xuất hiện dưới dạng `[[tên]]` trong body MOC không?

**Kiến Thức Cốt Lõi bị thiếu = có `up: [[MOC X]]` nhưng `[[tên statement]]` không có trong body MOC X**

Bỏ qua:
- Kiến Thức Cốt Lõi không có `up:` → không biết MOC nào
- MOC trong `up:` không tồn tại → warning, skip
- Kiến Thức Cốt Lõi đã có trong bất kỳ section nào → không thêm lại

---

## BƯỚC 2 — Báo cáo theo từng MOC

```
🔍 Phát hiện {N} Kiến Thức Cốt Lõi chưa vào curated sections:

📌 MOC — Second Brain & PKM ({n} thiếu)
   • "Tên Kiến Thức Cốt Lõi A"
   • "Tên Kiến Thức Cốt Lõi B"

📌 02. MOC Hệ thống Zettelkasten ({n} thiếu)
   • "Tên Kiến Thức Cốt Lõi C"

✅ Đã đầy đủ: [tên các MOC không thiếu gì]

→ Đồng bộ tất cả?
  [Enter] = Sync hết, tôi tự chọn section
  [tên MOC] = Chỉ sync MOC đó
  [skip] = Chỉ xem báo cáo
```

---

## BƯỚC 3 — Xác định section cho từng Kiến Thức Cốt Lõi

Đọc nội dung Kiến Thức Cốt Lõi + đối chiếu các section có trong MOC. Chọn section theo heuristic:

**Đọc tên Kiến Thức Cốt Lõi và 2-3 từ khoá chính:**

| Tín hiệu trong tên/nội dung | Section ưu tiên |
|---|---|
| "sai lầm", "bẫy", "nhầm", "không phải", "tích trữ", "ảo giác", "từ bỏ" | Sai lầm & rào cản phổ biến |
| "cách", "thực hành", "viết lại", "xử lý", "hành động", "bước", "quy trình" | Hành vi & thực hành cốt lõi |
| "là gì", "định nghĩa", "khái niệm", "không phải ổ cứng", "extension" | Khái niệm cốt lõi |
| "tại sao", "sinh tồn", "quan trọng", "tương lai", "kỷ nguyên", "bất lợi" | Tại sao không thể thiếu |
| "AI", "LLM", "kỷ nguyên AI", "thay thế AI" | Second Brain trong kỷ nguyên AI (nếu section tồn tại) |
| Luận điểm mạnh, không fit rõ section nào | Luận điểm trung tâm |

Nếu MOC không có section khớp → thêm vào section có nhiều note nhất (section "chủ đạo" của MOC đó).

**Không hỏi lại user** — chọn và thêm ngay. Báo lại section đã chọn ở Bước 4.

---

## BƯỚC 4 — Thêm vào MOC và báo cáo

Với mỗi Kiến Thức Cốt Lõi, thêm `- [[Tên Kiến Thức Cốt Lõi]]` vào cuối danh sách trong section đã chọn.

Báo cáo sau khi xong:

```
✅ Đã đồng bộ {N} Kiến Thức Cốt Lõi vào {M} MOC:

📌 MOC — Second Brain & PKM
   + [[Tên Kiến Thức Cốt Lõi A]] → "Sai lầm & rào cản phổ biến"
   + [[Tên Kiến Thức Cốt Lõi B]] → "Luận điểm trung tâm"

📌 02. MOC Hệ thống Zettelkasten
   + [[Tên Kiến Thức Cốt Lõi C]] → "Hành vi & thực hành cốt lõi"

⚠️  Bỏ qua (không có up: hoặc MOC không tồn tại):
   • "Tên Kiến Thức Cốt Lõi D"
```

---

## Lưu ý kỹ thuật

- Chỉ check **body** của MOC (sau frontmatter) để tránh false positive
- Không duplicate — nếu đã có ở bất kỳ section nào → skip
- Không xoá hay di chuyển note đã có — chỉ thêm mới
- Nếu MOC dùng Dataview trong một section (ví dụ `FROM #ai`) → không thêm tay vào section đó, chọn section khác
- Kiến Thức Cốt Lõi có `up:` trỏ nhiều MOC → thêm vào tất cả MOC đó

---

## Phân biệt với mindmirror-dong-bo-moc

| | mindmirror-dong-bo-moc | mindmirror-tinh-chinh-moc |
|---|---|---|
| **Fix cái gì** | Frontmatter sai (tag, created field) | Curated sections trong MOC bị thiếu link |
| **Dùng khi** | Map Kiến Thức Cốt Lõi không hiện note | MOC không có note dù frontmatter đúng |
| **Output** | Note được fix frontmatter | MOC được thêm wikilinks |

---

## Tham chiếu
- Kiến Thức Cốt Lõi: `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`
- MOCs: `3. Chuyển Hoá/Bản Đồ/Bản Đồ Chủ Đề/`
- Skill liên quan: `mindmirror-chac-loc` (tự động curate khi tạo mới), `mindmirror-dong-bo-moc` (fix frontmatter)
