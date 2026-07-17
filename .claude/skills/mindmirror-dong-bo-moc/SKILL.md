---
name: mindmirror-dong-bo-moc
description: Quét toàn bộ file trong 3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/, tìm note thiếu tag "statement" hoặc frontmatter không đúng format, và fix để Map Kiến Thức Cốt Lõi Dataview tự động nhận diện. Dùng khi chuyển note từ Literature/Thu Thập sang Kiến Thức Cốt Lõi mà Map không cập nhật. Trigger: "đồng bộ map statements", "sync map statements", "cập nhật map statements", "note chưa vào map", "moc-sync", "mindmirror-dong-bo-moc", "map statements không cập nhật", "fix statement tags".
---

# Nexus MOC Sync — Fix Kiến Thức Cốt Lõi Notes cho Map Kiến Thức Cốt Lõi

## Mục đích

Khi tạo note thủ công hoặc chuyển note từ Literature/Thu Thập sang `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`, note đó thường **không tự xuất hiện trong Map Kiến Thức Cốt Lõi** vì còn giữ frontmatter cũ (sai tag, sai field name, sai format ngày).

Skill này scan toàn bộ Kiến Thức Cốt Lõi folder, phát hiện và fix các lỗi frontmatter để Dataview query `FROM #statement` nhận diện đúng.

---

## Nguyên nhân Map Kiến Thức Cốt Lõi không cập nhật

Map Kiến Thức Cốt Lõi dùng Dataview query:
```
FROM #statement
WHERE created >= date(today) - dur(30 days)
```

Note bị bỏ sót khi:
1. **Thiếu tag `statement`** — vẫn còn `tags: [literature-note]` hoặc không có tag
2. **Dùng field `date` thay vì `created`** — Dataview không nhận diện cho date filter
3. **Sai format ngày** — `10/06/2026` thay vì `2026-06-10` (ISO 8601)
4. **Thiếu frontmatter hoàn toàn** — note thô chưa được format

---

## BƯỚC 1 — Quét Kiến Thức Cốt Lõi folder

Đọc tất cả `.md` file trong `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`.

Với mỗi file, kiểm tra frontmatter:

| Kiểm tra | Lỗi nếu |
|---|---|
| `tags` có chứa `statement` | Không có hoặc chỉ có `literature-note`, `core`... |
| Có field `created` | Không có, hoặc chỉ có `date` |
| `created` đúng format ISO | Dạng `DD/MM/YYYY` hoặc `MM-DD-YYYY` |
| Có `up:` trỏ về MOC | Trống hoặc không có |

---

## BƯỚC 2 — Báo cáo phát hiện

```
🔍 Kết quả quét {N} Kiến Thức Cốt Lõi Notes:

⚠️  Cần fix ({M} note):
  • "Tên note A" — thiếu tag [statement]
  • "Tên note B" — field "date" thay vì "created"
  • "Tên note C" — format ngày sai: 10/06/2026

✅ Đúng format ({K} note): không cần fix

→ Fix tất cả?
  [Enter] = Fix hết
  [skip] = Chỉ xem báo cáo
```

Nếu tất cả đúng:
```
✅ Tất cả {N} Kiến Thức Cốt Lõi đúng format — Map Kiến Thức Cốt Lõi sẽ tự cập nhật.
```

---

## BƯỚC 3 — Fix frontmatter (nếu user đồng ý)

Với mỗi note cần fix, cập nhật frontmatter:

**Fix tag:**
```yaml
# Trước
tags: [literature-note]

# Sau  
tags: [statement, core]
```

**Fix field name:**
```yaml
# Trước
date: 2026-06-10

# Sau
created: 2026-06-10
```

**Fix format ngày:**
```yaml
# Trước
created: 10/06/2026

# Sau
created: 2026-06-10
```

**Giữ nguyên các field khác** — chỉ sửa những gì cần thiết, không overwrite nội dung.

---

## BƯỚC 4 — Báo cáo kết quả

```
✅ Đã fix {M} Kiến Thức Cốt Lõi Notes:

  • "Tên note A" — đã thêm tag [statement, core]
  • "Tên note B" — đã đổi "date" → "created"
  • "Tên note C" — đã fix format ngày

📊 Map Kiến Thức Cốt Lõi sẽ tự nhận diện {M} note mới khi Obsidian refresh.

Tiếp theo:
  → Mở Map Kiến Thức Cốt Lõi và nhấn Ctrl+R để Dataview re-index nếu chưa thấy cập nhật
```

---

## Lưu ý

- **Không xoá nội dung** — chỉ sửa frontmatter
- **Không đổi tên file** — chỉ fix metadata bên trong
- Nếu note không có frontmatter → hỏi user trước khi thêm vào (tránh overwrite nội dung đặc biệt)
- Sau khi fix, note tự xuất hiện trong Map Kiến Thức Cốt Lõi mà không cần làm gì thêm

---

## Tham chiếu
- Bản Đồ Kiến Thức Cốt Lõi: `3. Chuyển Hoá/Bản Đồ/Bản Đồ Kiến Thức Cốt Lõi.base`
- Kiến Thức Cốt Lõi folder: `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`
- Format chuẩn: xem CLAUDE.md → Frontmatter chuẩn → Kiến Thức Cốt Lõi
