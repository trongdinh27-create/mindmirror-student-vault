---
name: mindmirror-moc-thanh-canvas
description: Biến một MOC (Map of Content) thành bản đồ trực quan JSON Canvas (.canvas) — mỗi Kiến Thức Cốt Lõi/note thành 1 file-node, MOC ở trung tâm, mỗi cluster/section thành 1 group, quan hệ up:/wikilink thành edge. Xem toàn cảnh tri thức một lĩnh vực trong 1 màn hình. Trigger khi user nói "MOC này thành canvas", "vẽ canvas cho [chủ đề]", "bản đồ trực quan MOC", "moc thành sơ đồ", "/moc-canvas".
---

# MOC → JSON Canvas — Bản Đồ Trực Quan Tri Thức

## Mục đích
MOC dạng markdown đọc tuyến tính. Canvas cho thấy **cấu trúc không gian**: cụm nào dày, note nào cô lập, lĩnh vực nào đang mỏng. Một màn hình = toàn cảnh.

> Nền tảng cú pháp: skill `/json-canvas`. Tuân thủ spec node/edge, ID 16-hex, validate references.

---

## BƯỚC 1 — Xác định MOC nguồn

Nhận tên/đường dẫn MOC từ user (thường trong `3. Chuyển Hoá/Bản Đồ/Bản Đồ Chủ Đề/`).
Nếu thiếu → hỏi: *"MOC nào? (tên hoặc path trong Core/Maps/)"*

Đọc file MOC.

---

## BƯỚC 2 — Trích cấu trúc

Parse MOC thành cây 2 tầng:

- **Clusters** = các heading (`## ...`) hoặc callout sections trong MOC.
- **Notes** = mọi wikilink `[[...]]` nằm dưới mỗi cluster.

Với mỗi note, resolve đường dẫn thật (ưu tiên `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`, rồi Framework, Kiến Thức Nguồn). Note không resolve được → vẫn tạo node nhưng đánh dấu (màu đỏ preset "1") để user biết link gãy.

Nếu MOC không có heading → coi toàn bộ wikilink là 1 cluster "Tất cả".

---

## BƯỚC 3 — Sinh file .canvas

Dùng script Python sau (điều chỉnh `MOC_TITLE`, `CLUSTERS`, `OUT_PATH`). Script tự tính toạ độ radial, sinh ID hex, và ghi JSON hợp lệ.

```python
import json, os, secrets, math

MOC_TITLE = "{Tên MOC}"
OUT_PATH  = "3. Chuyển Hoá/Bản Đồ/{Tên MOC}.canvas"

# CLUSTERS: mỗi cluster = (tên cluster, [ (tên note, path hoặc None nếu gãy) , ... ])
CLUSTERS = [
    ("Cluster A", [("Note 1", "3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/Note 1.md"), ("Note 2", None)]),
    # ...
]

def nid():  # 16-char hex id
    return secrets.token_hex(8)

nodes, edges = [], []

# --- MOC trung tâm ---
moc_id = nid()
nodes.append({"id": moc_id, "type": "text", "x": -160, "y": -60,
              "width": 320, "height": 120,
              "text": f"# 🗺️ {MOC_TITLE}", "color": "6"})

n = len(CLUSTERS)
R = 900                      # bán kính vòng cluster
NOTE_W, NOTE_H = 260, 90     # kích thước file-node
for i, (cname, notes) in enumerate(CLUSTERS):
    ang = (2 * math.pi * i) / max(n, 1)
    cx = int(R * math.cos(ang))
    cy = int(R * math.sin(ang))

    # bố trí notes trong cluster thành cột dọc
    rows = len(notes)
    gh = max(rows * (NOTE_H + 30) + 80, 160)
    gw = NOTE_W + 80
    gx, gy = cx - gw // 2, cy - gh // 2
    group_id = nid()
    nodes.append({"id": group_id, "type": "group", "x": gx, "y": gy,
                  "width": gw, "height": gh, "label": cname, "color": str((i % 6) + 1)})

    first_note_id = None
    for j, (nname, npath) in enumerate(notes):
        node_id = nid()
        ny = gy + 60 + j * (NOTE_H + 30)
        nx = gx + 40
        if npath and os.path.exists(npath):
            nodes.append({"id": node_id, "type": "file", "x": nx, "y": ny,
                          "width": NOTE_W, "height": NOTE_H, "file": npath})
        else:
            nodes.append({"id": node_id, "type": "text", "x": nx, "y": ny,
                          "width": NOTE_W, "height": NOTE_H,
                          "text": f"[[{nname}]] ⚠️ link gãy", "color": "1"})
        if first_note_id is None:
            first_note_id = node_id

    # edge MOC → cluster (nối tới note đầu cluster)
    if first_note_id:
        edges.append({"id": nid(), "fromNode": moc_id, "toNode": first_note_id,
                      "toEnd": "arrow", "label": cname})

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump({"nodes": nodes, "edges": edges}, f, ensure_ascii=False, indent=2)

print(f"✅ Canvas: {OUT_PATH} — {len(nodes)} nodes, {len(edges)} edges")
```

---

## BƯỚC 4 — Validate (bắt buộc, theo /json-canvas)

- [ ] JSON parse được.
- [ ] Mọi `id` unique (nodes + edges).
- [ ] Mọi `fromNode`/`toNode` trỏ tới node tồn tại.
- [ ] File-node có `file`, text-node có `text`.
- [ ] Không có literal `\\n` trong text (dùng `\n` thật).

```bash
python3 -c "import json;d=json.load(open('3. Chuyển Hoá/Bản Đồ/{Tên MOC}.canvas'));ids={n['id'] for n in d['nodes']};assert all(e['fromNode'] in ids and e['toNode'] in ids for e in d['edges']);print('OK',len(d['nodes']),'nodes')"
```

---

## BƯỚC 5 — Cập nhật MOC gốc + báo cáo

Thêm vào cuối MOC dòng: `🗺️ Bản đồ canvas: [[{Tên MOC}.canvas]]`

Báo cáo:
```
✅ Canvas đã tạo: 3. Chuyển Hoá/Bản Đồ/{Tên MOC}.canvas
   {N} node ({X} note, {Y} link gãy đánh dấu đỏ), {Z} cluster.
📌 Mở trong Obsidian để kéo/sắp xếp. Node đỏ = link cần sửa.
```

## Quy tắc

- **File-node > text-node.** Ưu tiên embed note thật (`type: file`) để click mở được; chỉ dùng text-node cho link gãy.
- **Radial layout.** MOC ở tâm, cluster toả vòng tròn — dễ thấy cân đối/lệch.
- **Không xoá canvas cũ.** Nếu đã có → hỏi overwrite hay tạo bản `-v2`.
- **Canvas là snapshot.** Chạy lại khi MOC đổi nhiều; không tự sync realtime.
