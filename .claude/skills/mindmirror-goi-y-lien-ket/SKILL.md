---
name: mindmirror-goi-y-lien-ket
description: Cho một note (Kiến Thức Cốt Lõi/Source/MOC/FN), scan vault tìm ≥3 wikilink liên quan để paste vào section "🔗 Kết nối với". Đây là người trợ lý cốt lõi để vault không bị cô lập. Trigger khi user nói "tìm note liên quan", "gợi ý link", "kết nối note này với gì", hoặc auto sau khi tạo Kiến Thức Cốt Lõi/Source.
---

# Link Suggester — Gợi Ý Liên Kết

## Mục đích
Tránh "isolated notes" — đảm bảo mỗi note có ≥3 wikilink ra/vào.

## Khi được trigger

1. **Xác định note cần gợi ý** (path do user cung cấp hoặc note đang mở).
2. **Đọc nội dung note**, trích xuất:
   - Tiêu đề
   - Keywords trong title + body
   - Tags trong frontmatter
   - Domain (xây dựng / PKM / sức khỏe / v.v.)
3. **Scan vault** trong các folder:
   - `Atlas/Dots/Kiến Thức Cốt Lõi/`
   - `Atlas/Dots/Sources/`
   - `Atlas/Dots/People/`
   - `Atlas/Dots/Things/`
   - `Atlas/Maps/`
4. **Score relevance** mỗi candidate:
   - +3 nếu có shared tag
   - +2 nếu shared keyword trong title
   - +1 nếu shared keyword trong body
5. **Lấy top 5–8 candidate**, present cho user:

```
Đề xuất liên kết cho '{tên note}':

1. [[Atomic Habits (book)]] — match: thói quen, hành vi
2. [[Thói quen tốt dễ duy trì khi gắn với bối cảnh cụ thể]] — match: thói quen
3. [[MOC Phát Triển Bản Thân]] — match: domain
4. ...

Chọn 3+ link để chèn (vd: 1,2,4):
```

6. **Chèn vào section "🔗 Kết nối với"** của note gốc, format:

```markdown
## 🔗 Kết nối với
- [[Note 1]]
- [[Note 2]]
- [[Note 3]]
```

7. **Confirm:** "Đã chèn {N} link. Note '{tên}' hiện có tổng {M} wikilink."

## Quy tắc

- **Tối thiểu 3 link.** Nếu vault chưa đủ candidate, gợi ý user tạo Kiến Thức Cốt Lõi bổ sung.
- **Không tự chèn ngẫu nhiên.** Luôn để user confirm.
- **Ưu tiên link 2 chiều** — nếu note B chưa link đến note A, gợi ý update B.

## Tham chiếu
- Triết lý hệ thống: `+ About MindMirror.md`
- Hướng dẫn bắt đầu: `0. Bắt Đầu/00. BẮT ĐẦU Ở ĐÂY.md`
