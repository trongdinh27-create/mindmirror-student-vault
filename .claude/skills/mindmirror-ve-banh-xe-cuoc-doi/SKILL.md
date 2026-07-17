---
name: mindmirror-ve-banh-xe-cuoc-doi
description: Đọc điểm Wheel of Life trong 4 Tổng Kết Tuần gần nhất, tính avg score mỗi chiều cạnh, render biểu đồ radar (mermaid hoặc SVG). Lưu vào 5. Hộp Công Cụ/Excalidraw/. Trigger khi user nói "vẽ wheel of life", "biểu đồ radar", "tôi đang ở đâu", hoặc auto cuối tháng trong monthly-review.
---

# Wheel of Life Render — Biểu Đồ Radar Cuộc Đời

## Mục đích
Nhìn 1 phát thấy 8 chiều cuộc đời cân bằng hay lệch — vintage tool nhưng cực hiệu quả.

## Khi được trigger

### Bước 1: Load data

Đọc 4 Weekly Note gần nhất:
- `2. Tinh Lọc/Tổng Kết Tuần/{year}-W{ww}.md`

Trong mỗi file, lấy section **"Wheel of Life — Tuần này"** → extract score của mỗi chiều cạnh trong mỗi tuần.

### Bước 2: Tính average

Cho mỗi chiều trong 8:
- avg_score = mean(scores trong 4 tuần)
- Convert % → 1–10 scale (vd 80% → 8/10)

### Bước 3: Render SVG radar chart (phương pháp chính)

Radar là *data chart* — SVG vẽ radar THẬT (đa giác 8 trục), không dùng mermaid
`xychart-beta` (vốn chỉ là bar chart, không phải radar). Chạy script Python sau,
điền `SChuyển HoáS` theo thứ tự 8 chiều:

```python
import math

TITLE  = "Wheel of Life — {Tháng/Năm}"
AXES   = ["Sức Khỏe","Tài Chính","Sự Nghiệp","Gia Đình","Học Tập","Tinh Thần","Sở Thích","Đóng Góp"]
SChuyển HoáS = [0,0,0,0,0,0,0,0]           # avg_score 0–10 mỗi chiều, đúng thứ tự AXES
OUT    = "5. Hộp Công Cụ/Excalidraw/wheel-of-life-{YYYY-MM}.svg"

CX, CY, R = 300, 320, 220            # tâm + bán kính
N = len(AXES)
def pt(i, val):                      # toạ độ điểm trên trục i với giá trị val (0–10)
    a = -math.pi/2 + 2*math.pi*i/N   # bắt đầu từ đỉnh, xoay theo chiều kim đồng hồ
    r = R * val/10
    return CX + r*math.cos(a), CY + r*math.sin(a)

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="640" font-family="sans-serif">']
svg.append(f'<text x="{CX}" y="40" text-anchor="middle" font-size="22" font-weight="700">{TITLE}</text>')
# lưới đồng tâm 2/4/6/8/10
for ring in range(1, 6):
    pts = " ".join(f"{x:.1f},{y:.1f}" for x,y in (pt(i, ring*2) for i in range(N)))
    svg.append(f'<polygon points="{pts}" fill="none" stroke="#d0d0d0" stroke-width="1"/>')
# trục + nhãn
for i, name in enumerate(AXES):
    x,y = pt(i, 10)
    svg.append(f'<line x1="{CX}" y1="{CY}" x2="{x:.1f}" y2="{y:.1f}" stroke="#d0d0d0"/>')
    lx,ly = pt(i, 11.4)
    anc = "middle" if abs(lx-CX)<20 else ("start" if lx>CX else "end")
    svg.append(f'<text x="{lx:.1f}" y="{ly:.1f}" text-anchor="{anc}" font-size="13">{name}</text>')
    svg.append(f'<text x="{lx:.1f}" y="{ly+16:.1f}" text-anchor="{anc}" font-size="12" fill="#888">{SChuyển HoáS[i]}/10</text>')
# đa giác dữ liệu
poly = " ".join(f"{x:.1f},{y:.1f}" for x,y in (pt(i, SChuyển HoáS[i]) for i in range(N)))
svg.append(f'<polygon points="{poly}" fill="#4a90d9" fill-opacity="0.35" stroke="#2b6cb0" stroke-width="2.5"/>')
for i in range(N):
    x,y = pt(i, SChuyển HoáS[i])
    svg.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="#2b6cb0"/>')
svg.append('</svg>')

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(svg))
print("✅ SVG radar:", OUT)
```

Ưu điểm: xem được trong Obsidian (embed `![[...svg]]`), scannable trong 5 giây,
đẹp hơn bar chart, không phụ thuộc plugin.

### Bước 5: Sinh analysis

Tạo file `5. Hộp Công Cụ/Excalidraw/wheel-of-life-{YYYY-MM}.md`:

```markdown
---
tags: [wheel-of-life, snapshot]
month: {YYYY-MM}
data-source: 4 weekly alignment reports
created: {YYYY-MM-DD}
---

# 🎡 Wheel of Life — {Tháng năm}

## Biểu đồ
![[wheel-of-life-{YYYY-MM}.svg]]

(hoặc embed mermaid)

## Bảng số liệu

| Chiều cạnh | Avg score | So với tháng trước |
|---|---|---|
| 💪 Sức Khỏe | {N}/10 | {arrow} |
| 💰 Tài Chính | {N}/10 | {arrow} |
| ... | ... | ... |

## 📊 Quan sát

### Chiều mạnh nhất
- **{Tên}:** {N}/10 — tại sao mạnh?

### Chiều yếu nhất
- **{Tên}:** {N}/10 — pattern dẫn đến drift?

### Mất cân bằng đáng chú ý
- Khoảng cách lớn nhất giữa 2 chiều: {X} và {Y} chênh {N} điểm.
- Nguy cơ: {dự đoán dài hạn nếu không điều chỉnh}.

## 🎯 Đề xuất
- 1 chiều cần đầu tư thêm tháng tới: __
- 1 chiều có thể giảm focus để dồn năng lượng: __

## 🔗 Liên kết
- 4 weekly alignment báo cáo: ...
- Theme năm: [[01 Năm - Theme {year}]]
- Wheel tháng trước: [[wheel-of-life-{YYYY-MM-1}]]
```

### Bước 6: Confirm

"Wheel of Life {tháng năm} đã render. Mở để xem biểu đồ + phân tích."

## Quy tắc

- **Cần ≥4 weekly alignment** mới render. Ít hơn = không đủ data.
- **Tháng > Tuần.** Wheel zoom out để thấy trend dài, không phải spike ngắn.
- **Visual > Text.** Biểu đồ phải scannable trong 5 giây.

## Tham chiếu
- Thiết kế: `🧭 Bản Đồ Cuộc Đời - Skills.md` (mục 7)
- Concept gốc: Paul J. Meyer's Wheel of Life
