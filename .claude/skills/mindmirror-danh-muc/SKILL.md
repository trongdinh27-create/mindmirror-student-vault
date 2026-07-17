---
name: mindmirror-danh-muc
description: >
  Tạo Registry dashboard (Obsidian Bases — file .base) cho bất kỳ folder nào
  trong Core/Dots — Kiến Thức Cốt Lõi, Framework, hoặc folder tùy chỉnh.
  Tự động: (1) tạo/cập nhật file .base trong Core/Maps/, (2) sửa template
  Templater để note mới luôn có đúng tag + created, (3) batch-fix các note cũ
  thiếu tag.
trigger:
  - "tạo registry cho"
  - "registry cho folder"
  - "làm registry"
  - "setup dots registry"
  - "tạo bảng tổng quan cho"
  - "dots registry"
---

# Skill: mindmirror-danh-muc (Bases)

Tạo Registry dạng **Obsidian Bases** (file `.base`, native — không cần plugin) + fix template cho một folder trong `3. Chuyển Hoá/Tri Thức/`.

> Nền tảng cú pháp: skill `/obsidian-bases`. Khi viết file `.base`, tham chiếu skill đó cho filter/formula/view chuẩn.

---

## BƯỚC 1 — Xác định folder và tag

### 1.1 Đọc input từ user

User sẽ nhắn tên folder. Ví dụ:
- "tạo registry cho Concepts"
- "làm registry cho Framework"
- "tạo bảng tổng quan cho Methodologies"

Extract tên folder từ câu của user.

### 1.2 Tra cứu tag mặc định

| Folder | Tag chính | Template file |
|--------|-----------|---------------|
| Kiến Thức Cốt Lõi | `statement` | `Template - Kiến Thức Cốt Lõi.md` |
| Framework | `framework` | `Template - Framework.md` |

Nếu folder không có trong bảng trên → hỏi user:
> Tag chính cho folder `{FolderName}` là gì? (ví dụ: `tool`, `person`, `project`)

### 1.3 Xác nhận đường dẫn vault

Vault root là thư mục chứa `.obsidian/` (chính là working directory). Folder Core nằm trực tiếp ở root: `3. Chuyển Hoá/Tri Thức/{FolderName}/`.

Kiểm tra folder tồn tại:
```bash
ls "3. Chuyển Hoá/Tri Thức/{FolderName}/"
```

---

## BƯỚC 2 — Kiểm tra template

### 2.1 Tìm template file

Kiểm tra Templater config để biết template nào đang được gán cho folder:
```bash
cat ".obsidian/plugins/templater-obsidian/data.json"
```

Tìm entry có `"folder": "3. Chuyển Hoá/Tri Thức/{FolderName}"`.

### 2.2 Đọc template hiện tại

```bash
cat "5. Hộp Công Cụ/Template/{template_file}"
```

Kiểm tra template có đủ 3 điều kiện:
- [ ] `tags:` chứa tag chính của folder (ví dụ `[concept, core]`)
- [ ] Có `created: <% tp.date.now("YYYY-MM-DD") %>`
- [ ] Không có `date:` thay cho `created:`

### 2.3 Sửa template nếu thiếu

Nếu thiếu bất kỳ điều kiện nào, viết lại template với frontmatter chuẩn:

```markdown
---
up: 
created: <% tp.date.now("YYYY-MM-DD") %>
tags: [{TAG}, core]
source: 
---

# <% tp.file.title %>

{BODY_THEO_LOAI}
```

**Body template theo loại:**

- **Concepts**: `## Định nghĩa của tôi` / `## Khác với thông thường ở điểm nào?` / `## Ứng dụng` / `## Liên kết`
- **Framework**: `## Mục đích` / `## Các thành phần` / `## Cách dùng` / `## Liên kết`
- **Methodologies**: `## Là gì` / `## Các bước` / `## Khi nào dùng` / `## Liên kết`
- **Custom**: `## Ghi chú` / `## Ứng dụng` / `## Liên kết`

Nếu template file chưa tồn tại, tạo mới và thêm vào Templater config.

---

## BƯỚC 3 — Batch-fix notes thiếu tag

### 3.1 Tìm notes thiếu tag

```bash
cd "3. Chuyển Hoá/Tri Thức/{FolderName}/"
grep -rL "^tags:.*{TAG}" .
```

### 3.2 Báo cáo cho user

> Tìm thấy **{N}** notes thiếu tag `{TAG}`.
> Tôi sẽ thêm `{TAG}` vào frontmatter của tất cả notes này.
> Xác nhận tiếp tục không?

### 3.3 Thêm tag bằng Python

Chạy script Python để thêm tag vào frontmatter của mỗi file thiếu:

```python
import os, re

FOLDER = "3. Chuyển Hoá/Tri Thức/{FolderName}/"
TAG = "{TAG}"

for fname in os.listdir(FOLDER):
    if not fname.endswith('.md'):
        continue
    path = os.path.join(FOLDER, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if not content.startswith('---'):
        continue
    parts = content.split('---', 2)
    if len(parts) < 3:
        continue
    fm = parts[1]
    if re.search(r'^tags:', fm, re.MULTILINE):
        # tags field exists but missing tag — append to list
        fm = re.sub(
            r'^(tags:\s*\[)([^\]]*?)(\])',
            lambda m: m.group(1) + (m.group(2) + ', ' if m.group(2).strip() else '') + TAG + m.group(3),
            fm, flags=re.MULTILINE
        )
    else:
        # No tags field — add before closing ---
        fm = fm.rstrip('\n') + f'\ntags: [{TAG}, core]\n'
    new_content = '---' + fm + '---' + parts[2]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
```

Báo số file đã update.

---

## BƯỚC 4 — Tạo Registry (file .base)

### 4.1 Xác định path output

File Base: `3. Chuyển Hoá/Bản Đồ/{FolderName} Registry.base`

Nếu đã tồn tại → hỏi user: overwrite hay skip?

> **Ghi chú migration:** nếu tồn tại registry Dataview cũ (`{FolderName} Registry.md`
> chứa các block ```dataview```) → tạo file `.base` mới song song, rồi hỏi user có
> muốn archive file `.md` cũ vào `.trash/` không. **Archive, không xoá** (nguyên tắc vault).

### 4.2 Viết file .base

Base lọc theo tag chính, hiển thị 3 view. Map đúng frontmatter Kiến Thức Cốt Lõi/Framework
của vault (`created`, `source`, `up`). Chỉnh `{TAG}` và `{FolderName}` cho phù hợp.

```yaml
filters:
  and:
    - file.hasTag("{TAG}")
    - 'file.ext == "md"'

formulas:
  co_nguon: 'if(source, "✓", "—")'
  so_ngay: '(now() - file.ctime).days'

properties:
  file.name:
    displayName: "{FolderName}"
  created:
    displayName: "Ngày tạo"
  source:
    displayName: "Nguồn"
  up:
    displayName: "MOC"
  formula.co_nguon:
    displayName: "Nguồn?"
  formula.so_ngay:
    displayName: "Tuổi (ngày)"

views:
  # 1) Tất cả — bảng đầy đủ
  - type: table
    name: "Tất cả"
    order:
      - file.name
      - created
      - source
      - up

  # 2) Mới thêm 30 ngày qua
  - type: table
    name: "Mới (30 ngày)"
    filters:
      and:
        - '(now() - file.ctime).days <= 30'
    order:
      - file.name
      - created
      - formula.so_ngay
      - source

  # 3) Nhóm theo nguồn gốc
  - type: cards
    name: "Theo nguồn"
    groupBy:
      property: source
      direction: ASC
    order:
      - file.name
      - created
```

Validate YAML trước khi ghi (xem quy tắc quoting trong `/obsidian-bases`):
- Formula chứa dấu `"` → bọc toàn bộ bằng dấu `'`.
- Trừ 2 ngày trả về Duration → truy cập `.days` trước khi so sánh/round.
- Mọi `formula.X` trong `order`/`properties` phải có định nghĩa trong `formulas`.

### 4.3 (Tùy chọn) Tạo MOC wrapper embed Base

Nếu user muốn có 1 trang MOC dạng `.md` để thêm mô tả/curated sections thủ công,
tạo `3. Chuyển Hoá/Bản Đồ/{FolderName} Registry.md` embed base:

```markdown
---
created: {TODAY}
tags: [map, registry, core]
---

# {FolderName} Registry

Tổng quan toàn bộ {FolderName} trong Chuyển Hoá — tự động cập nhật khi có note mới.

![[{FolderName} Registry.base]]
```

### 4.4 Kiểm tra phiên bản Obsidian hỗ trợ Bases

Bases là tính năng native từ Obsidian 1.9+. Không cần cài plugin.
Nếu Base không render → nhắc user cập nhật Obsidian lên bản mới nhất và bật
core plugin "Bases" trong Settings → Core plugins.

---

## BƯỚC 5 — Báo cáo kết quả

Tóm tắt những gì đã làm:

```
✅ Registry đã tạo: 3. Chuyển Hoá/Bản Đồ/{FolderName} Registry.base
✅ Template đã cập nhật: tags [{TAG}, core] + created field
✅ {N} notes cũ đã được thêm tag `{TAG}`
✅ (nếu có) Registry Dataview cũ đã archive vào .trash/

📌 Mở file .base trong Obsidian để xem dashboard (3 view: Tất cả / Mới 30 ngày / Theo nguồn).
   Từ giờ note mới trong 3. Chuyển Hoá/Tri Thức/{FolderName}/ sẽ tự xuất hiện trong bảng.
```

Nếu có lỗi ở bước nào → báo rõ bước nào lỗi và nguyên nhân.
