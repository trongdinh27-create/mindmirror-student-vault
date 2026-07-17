---
name: mindmirror-loc-phien
description: Phân tích note từ buổi họp, hội thảo, thuyết trình — lọc xem nội dung nào liên quan đến tri thức và dự án của người dùng, tư vấn có nên đi sâu không, có nên lưu không, và nếu liên quan thì gợi ý Kiến Tạo action cụ thể. Trigger khi user nói "phân tích buổi họp", "lọc hội thảo", "tôi vừa tham gia buổi", "meeting này liên quan không", "có nên lưu note này không", "session-filter", "/session-filter", hoặc paste note buổi họp/hội thảo kèm yêu cầu phân tích.
---

# Session Filter — Lọc & Phân Tích Note Buổi Họp / Hội Thảo

## Mục đích
Biến note thô từ buổi họp, hội thảo, thuyết trình thành quyết định rõ ràng:
- **Cái gì liên quan** → lưu vào đâu, làm gì tiếp theo
- **Cái gì không liên quan** → bỏ hay giữ reference
- **Có nên đi sâu vào lĩnh vực đó không** → tư vấn thẳng

---

## Khi được trigger

User cung cấp một trong các dạng sau:
- Link file note trong vault (Literature Note hoặc Raw note về một buổi)
- Paste nội dung ghi chú từ buổi họp/hội thảo
- Đặt câu hỏi về một buổi đã tham gia ("buổi hôm nay có liên quan không?")

---

## Quy Trình Xử Lý

### Bước 1 — Load Context Của người dùng

Đọc `Me.md` và scan `4. Kiến Tạo/1. Đang Làm/` để nắm:

**Tri thức cốt lõi của người dùng (4 vòng tròn):**
```
1. PKM / Second Brain / MindMirror
2. Visual Thinking / Framework trực quan
3. Phật pháp Theravada + Tâm lý con người
4. AI / Công nghệ ứng dụng
```

**Tệp khách hàng mục tiêu:** Chủ doanh nghiệp tri thức — ham học, muốn phát triển bản thân, hoạt động trong thời đại số.

**Dự án Active hiện tại** (đọc từ `4. Kiến Tạo/1. Đang Làm/`):
- Tên project
- Trạng thái và mục tiêu ngắn gọn của từng project

> Nếu không đọc được `4. Kiến Tạo/1. Đang Làm/`, dùng danh sách dự án phổ biến đã biết:
> Các MOC/dự án riêng của người dùng trong vault hiện tại

**Tạo Context Summary nội bộ (không hiển thị):**
```
- Domains cốt lõi: [danh sách 4 domains]
- Projects Active: [tên + mục tiêu ngắn]
- Nỗi đau khách hàng đang address: [từ Me.md]
```

---

### Bước 2 — Đọc & Phân Tích Note

Nếu user cung cấp file path → đọc file đó.
Nếu user paste nội dung → dùng trực tiếp.

Extract từng **chủ đề / topic / insight / tool / người** xuất hiện trong note.

Gán cho mỗi item:
- **Category**: Knowledge | Tool | Business Model | Person | Trend | Other
- **Domain tags**: PKM | Visual Thinking | AI | Tâm lý | Kinh doanh | Lĩnh vực khác

---

### Bước 3 — Scoring Độ Liên Quan

Chấm từng topic theo thang **3 cấp**:

| Cấp | Ý nghĩa | Điều kiện |
|---|---|---|
| 🔴 **Core** | Trực tiếp thuộc 4 domains cốt lõi hoặc đang active trong Kiến Tạo | Giao điểm rõ ràng với PKM / Visual Thinking / AI / Tâm lý + tệp khách hàng |
| 🟡 **Adjacent** | Liên quan gián tiếp — có thể khai thác nhưng không phải ưu tiên | Hữu ích cho khách hàng hoặc dự án nhưng không phải core expertise |
| ⚫ **Noise** | Không liên quan — khác ngành, khác audience, khác mục tiêu | Không có giao điểm rõ ràng |

**Tiêu chí scoring chi tiết:**

- +3 nếu topic thuộc 4 domains cốt lõi
- +2 nếu topic liên quan đến nỗi đau khách hàng mục tiêu (chủ DN tri thức)
- +2 nếu topic có thể ứng dụng trực tiếp vào ≥1 dự án Active
- +1 nếu topic liên quan đến người trong mạng lưới của người dùng
- +1 nếu đây là xu hướng AI/tech đang lên và người dùng chưa biết
- -2 nếu topic thuộc ngành hoàn toàn khác (thẩm mỹ, xây dựng, pháp lý...) mà không có AI/PKM angle

**Tổng điểm:**
- 4+ → 🔴 Core
- 2-3 → 🟡 Adjacent
- 0-1 → ⚫ Noise

---

### Bước 4 — Output Phân Tích

Trình bày theo format sau:

---

**📋 Buổi: [Tên buổi]**
**Ngày: [ngày]**
**Người tổ chức/diễn giả: [nếu có]**

---

#### Bản đồ nội dung

| Topic / Chủ đề | Category | Relevance | Ghi chú |
|---|---|---|---|
| [Topic 1] | [Knowledge/Tool/...] | 🔴/🟡/⚫ | [Liên quan đến dự án nào / vì sao không liên quan] |
| [Topic 2] | ... | ... | ... |

---

#### Verdict tổng thể

**Mức độ liên quan chung:** [🔴 High / 🟡 Medium / ⚫ Low]

**Tóm tắt thẳng:**
[2-3 câu đánh giá thực chất — cái gì đáng giá, cái gì là noise, bối cảnh tại sao bạn đến buổi này]

---

#### Có nên đi sâu vào lĩnh vực này không?

**[Tên lĩnh vực]:** [Có / Không / Có điều kiện]

Lý do: [1-2 câu — thẳng thắn dựa trên mục tiêu cốt lõi của người dùng]

> Nếu có nhiều lĩnh vực khác nhau trong buổi → trả lời từng lĩnh vực riêng.

---

#### Nên lưu note này không?

**Phán quyết:** [Lưu làm Literature Note / Lưu vào Thu Thập để xử lý sau / Archive — không cần xử lý / Bỏ]

**Lý do:** [1 câu]

---

#### Hành động tiếp theo (chỉ khi có topic 🔴 Core)

| # | Hành động | Liên kết đến dự án | Ưu tiên |
|---|---|---|---|
| 1 | [Cụ thể — không chung chung] | [[Tên Kiến Tạo project]] | Cao/Trung bình/Thấp |
| 2 | ... | ... | ... |

Tối đa 3 hành động — không hơn.

---

### Bước 5 — Xử lý Note (Chỉ khi được xác nhận)

Sau khi user đọc phân tích, hỏi:
> *"Bạn muốn tôi lưu note này theo đề xuất không?"*

**Nếu user đồng ý lưu làm Literature Note:**

Tạo file tại `2. Tinh Lọc/Kiến Thức Nguồn/` với format:

```markdown
---
up:
  - "[[MOC liên quan nếu tìm được]]"
created: YYYY-MM-DD
tags: [literature-note, session]
source: [Tên buổi / tên người trình bày]
domain: [Lĩnh vực chính]
relevance: core | adjacent | noise
---

# LN — [Tên buổi] — YYYY-MM-DD

## Bối cảnh
[Ai tổ chức, bạn tham gia với mục đích gì, ai còn tham gia]

## Nội dung cốt lõi
[Chỉ lấy phần 🔴 Core và 🟡 Adjacent — bỏ ⚫ Noise]

## Insight của bạn
[Viết lại bằng lời bạn — không copy nguyên văn]

## Liên kết hành động
[Link đến Kiến Tạo project nếu có → [[tên project]]]
```

**Nếu user chọn Archive (không xử lý):**
- Giữ note gốc trong `2. Tinh Lọc/Kiến Thức Nguồn/` nhưng đánh tag `low-relevance`
- Không tạo Kiến Thức Cốt Lõi, không link lên Chuyển Hoá

**Nếu user chọn Bỏ:**
- Move file gốc vào `.trash/` nếu đang trong vault
- Không tạo note mới

---

### Bước 6 — Kiến Tạo Bridge (Chỉ khi có 🔴 Core topic)

Nếu có topic Core liên quan đến dự án Active → hỏi:
> *"Topic [X] liên quan trực tiếp đến [[Tên Kiến Tạo project]]. Bạn muốn tôi thêm một task cụ thể vào đó không?"*

Nếu user đồng ý:
- Đọc file Kiến Tạo project đó
- Thêm vào section phù hợp (Action Items / Ideas / Resources) một dòng cụ thể

---

## Nguyên tắc phân tích

**Không phán xét việc bạn đi buổi đó vì sao** — chỉ phân tích nội dung và liên quan.

**Ưu tiên thực dụng:** Câu hỏi cốt lõi luôn là *"Cái này giúp bạn build MindMirror / phục vụ khách hàng của bạn không?"* — không phải "Cái này thú vị không?"

**Tách biệt quan hệ và tri thức:** Nếu bạn đi vì nể một người tổ chức quen biết → nói thẳng điều đó trong nhận xét, không che. Đây là pattern bạn cần nhận ra.

**Adjacent không phải priority:** Topic 🟡 Adjacent là *option* — chỉ theo đuổi khi Core đã chắc. Đừng để Adjacent kéo attention khỏi Core.

**Noise không phải thất bại:** Đi một buổi mà không có gì liên quan không có nghĩa là sai — nhưng cần nhận ra để lần sau quyết định thông minh hơn.

---

## Tone & Style

- Nói thẳng — không nịnh, không vòng vo
- Dùng bảng và số liệu — người dùng tư duy framework
- Kết luận trước, lý do sau
- Nhắc pattern ngầm nếu phát hiện (ví dụ: hay đi những buổi không liên quan vì nể người quen)

---

## Tham chiếu

- Me.md — profile và 4 domains cốt lõi
- `4. Kiến Tạo/1. Đang Làm/` — dự án đang chạy
- `4. Kiến Tạo/2. Lĩnh vực/` — dự án thường xuyên
- `2. Tinh Lọc/Kiến Thức Nguồn/` — nơi lưu note buổi
- CLAUDE.md — cấu trúc vault và quy tắc lưu note
