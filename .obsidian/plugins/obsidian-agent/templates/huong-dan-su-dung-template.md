---
title: Hướng dẫn sử dụng bộ template ghi chú
type: reference
status: evergreen
created: 2026-04-30
updated: 2026-04-30
llm_managed: true
tags: [meta, template, guide]
aliases: [template-guide, huong-dan-template, README]
---

# 📚 Hướng dẫn sử dụng bộ template ghi chú

> File này là **bản đồ** cho toàn bộ template trong folder template của bạn. Đọc khi không chắc nên dùng template nào, hoặc khi onboard người mới vào vault.

---

## 🎯 Triết lý chung

Vault này theo **2 tầng triết lý**:

1. **PARA + Zettelkasten Atomic** — note nhỏ, atomic, link dày đặc
2. **Problem-Driven Learning** — học để giải vấn đề (không học vu vơ)

→ Mọi template đều phục vụ 1 trong 2 mục đích:
- **Học để hiểu** (Atomic) — concept thuần
- **Học để giải** (Problem-Driven) — neo vào Problem Hub cụ thể

---

## 🌳 Decision tree — chọn template nào?

```
Tôi muốn tạo note về cái này...
│
├── Là KIẾN THỨC / KHÁI NIỆM?
│   ├── Định nghĩa "X là gì"                          → concept.md
│   ├── Quy trình "X làm thế nào" (HOW)               → problem-driven-method.md
│   ├── Luật bất biến "phải tuân theo gì" (DECIDE)    → problem-driven-principle.md
│   └── Phần mềm/template cụ thể (instance)           → problem-driven-tool.md
│
├── Là VẤN ĐỀ?
│   ├── Vấn đề mới đang gặp (cần giải)                → problem-driven-new-problem.md
│   ├── Triệu chứng/dấu hiệu (chưa phải vấn đề rõ)    → problem-driven-symptom.md
│   ├── Hub navigator cho 1 problem cluster           → problem-driven-hub.md
│   └── Hub cha cho nhiều hub con (area lớn)          → problem-driven-hub-cha.md
│
├── Là LOG / GHI CHÉP THEO THỜI GIAN?
│   ├── Nhật ký hằng ngày                             → daily-note.md
│   ├── Biên bản cuộc họp                             → meeting-note.md
│   └── Status update của 1 dự án                     → project-log.md
│
├── Là THỰC THỂ (người, sách, repo, tool)?
│   ├── Profile 1 người                               → people-profile.md
│   ├── Tóm tắt 1 cuốn sách                           → book-highlights.md
│   ├── Track 1 GitHub repo (open-source)             → github-repo.md
│   └── (tool đã có ở trên)
│
├── Là NAVIGATION / OUTPUT?
│   ├── Map of Content (bản đồ cluster)               → moc.md
│   └── Output viết theo Minto Pyramid                → minto-note.md
│
└── Là CAPTURE NHANH (chưa atomic, chưa biết phân loại)?
    └── Ghi chú nhanh                                 → ghi-chu-nhanh.md
```

---

## 📋 Mô tả chi tiết từng template

### Cluster 1: Knowledge — Hiểu / Làm / Decide / Tool

#### 1. `concept.md` — Khái niệm

**Trả lời câu hỏi:** "X **là gì**?"

**Khi nào dùng:**
- Học 1 khái niệm để hiểu (vd: "Cash flow là gì", "Wheel of Life là gì")
- Cần định nghĩa, bản chất, mechanism, scope
- Có thể neo Problem Hub (`problem:` field) hoặc để trống (concept thuần)

**Ví dụ tốt:**
- ✅ "Atomic Note" — định nghĩa concept Zettelkasten
- ✅ "Diminishing Returns" — định nghĩa kinh tế học
- ✅ "RAG (Retrieval Augmented Generation)" — concept AI

**KHÔNG dùng khi:**
- ❌ Note quy trình "Cách viết permanent note" (→ method)
- ❌ Note nguyên tắc "Mỗi note 1 ý" (→ principle)
- ❌ Note phần mềm "Obsidian" (→ tool)

**8 section:** Origin & Context → Essence → Examples → Mechanism → Scope → System position → Operationalization → Implications.

---

#### 2. `problem-driven-method.md` — Phương pháp

**Trả lời câu hỏi:** "X **làm thế nào**?" (HOW)

**Khi nào dùng:**
- Note quy trình các bước cụ thể
- Có input → output rõ
- Repeatable — dùng được nhiều lần

**Ví dụ tốt:**
- ✅ "Pomodoro Technique" — 25 phút làm + 5 phút nghỉ
- ✅ "5 Whys" — kỹ thuật truy nguyên nhân gốc
- ✅ "Cách viết cold email outreach" — bước 1-2-3
- ✅ "Cách audit cash flow tháng" — quy trình kế toán

**KHÔNG dùng khi:**
- ❌ "Customer Journey là gì" (→ concept)
- ❌ "Always be closing" (→ principle)
- ❌ "Salesforce CRM" (→ tool)

---

#### 3. `problem-driven-principle.md` — Nguyên tắc

**Trả lời câu hỏi:** "Khi quyết định, **phải tuân theo gì**?"

**Khi nào dùng:**
- Quy tắc bất biến để DECIDE (không phải hiểu, không phải làm)
- Áp dụng khi đứng trước nhiều lựa chọn
- Câu mệnh lệnh hoặc rule of thumb

**Ví dụ tốt:**
- ✅ "Cash is King" — luôn ưu tiên cash flow trước profit
- ✅ "Single Responsibility — mỗi module 1 việc"
- ✅ "Mỗi landing page chỉ có 1 CTA chính"
- ✅ "First Principles Thinking — break xuống nguyên lý gốc"

**KHÔNG dùng khi:**
- ❌ "Cash flow là gì" (→ concept) — note chỉ định nghĩa, không bắt buộc decide
- ❌ "Cách lập P&L" (→ method) — note quy trình
- ❌ Khi không có "câu mệnh lệnh" rõ → có thể là concept

**Test phân biệt với concept**: Principle có thể bắt đầu bằng "Phải/Luôn/Không bao giờ/Khi X thì Y". Concept không.

---

#### 4. `problem-driven-tool.md` — Công cụ

**Trả lời câu hỏi:** "Dùng phần mềm/template **cụ thể nào**?"

**Khi nào dùng:**
- Phần mềm có vendor, có pricing, có version (Notion, Obsidian, Mailchimp)
- Excel template, checklist cụ thể
- Physical tool (Bullet journal, Hobonichi planner)

**Ví dụ tốt:**
- ✅ "Notion" — SaaS workspace
- ✅ "Salesforce CRM" — tool quản lý sales pipeline
- ✅ "Excel template P&L Q4 2026" — template cụ thể
- ✅ "Bullet Journal" — physical tool

**KHÔNG dùng khi:**
- ❌ "Productivity tool là gì" (→ concept)
- ❌ "Cách dùng Notion để PKM" (→ method, dù tool là Notion)
- ❌ "Always have a backup" (→ principle)

**Quan trọng:** Tool note có Pricing, Pros/Cons, Alternatives, Integration — info để **DECIDE adopt hay drop**.

---

### Cluster 2: Problem-Driven — Vấn đề & Hub

#### 5. `problem-driven-new-problem.md` — Vấn đề mới

**Khi nào dùng:**
- Có 1 vấn đề rõ đang gặp, có outcome đo được
- Đã qua giai đoạn "triệu chứng mơ hồ" — biết rõ "muốn đạt gì nhưng đang kẹt"

**Ví dụ tốt:**
- ✅ "Vấn đề - Biên lợi nhuận thấp Q4 2026"
- ✅ "Vấn đề - Pipeline sale tỷ lệ chuyển đổi <5%"
- ✅ "Vấn đề - Mất cân bằng cá nhân (work 80%, health 20%)"

**KHÔNG dùng khi:**
- ❌ "Mình cảm thấy stress" — đây là **symptom**, chưa phải problem (dùng symptom template)
- ❌ "Hub về Marketing" — đây là hub area, không phải 1 problem cụ thể (dùng hub template)

**Test phân biệt với symptom**: Problem có Outcome đo được ("Giải xong = biên lợi nhuận ≥30%"). Symptom chỉ mô tả "thấy gì".

---

#### 6. `problem-driven-symptom.md` — Triệu chứng

**Khi nào dùng:**
- Mới phát hiện dấu hiệu, chưa rõ vấn đề gốc
- Mô tả "mình đang thấy gì", không phải "mình muốn giải gì"
- Sau khi điều tra → có thể nâng cấp thành problem

**Ví dụ tốt:**
- ✅ "Triệu chứng - Khó tập trung sáng" — chưa biết do thiếu ngủ / cafe / stress / điện thoại
- ✅ "Triệu chứng - Khách hủy đơn nhiều" — chưa biết do giá / chất lượng / dịch vụ

**Lifecycle:** Symptom → (điều tra) → Problem → (giải) → Solved.

---

#### 7. `problem-driven-hub.md` — Hub

**Khi nào dùng:**
- Có 3+ problem cùng 1 area cần navigation chung
- Vd: nhiều problem về Marketing → tạo "Hub - Marketing Q4 2026"

**Ví dụ tốt:**
- ✅ "Hub - Marketing Q4 2026" — chứa link 5 problem marketing
- ✅ "Hub - Health & Energy 2026" — chứa link problem sleep, exercise, diet

---

#### 8. `problem-driven-hub-cha.md` — Hub cha

**Khi nào dùng:**
- Area cực lớn, có nhiều hub con
- Vd: "Career" có hub con "Skills", "Network", "Branding", "Income"

**Ví dụ tốt:**
- ✅ "Hub cha - Career & Personal Growth" → 4 hub con
- ✅ "Hub cha - Business Operations 2026" → 7 hub con (Finance, Marketing, Sales, ...)

---

### Cluster 3: Log — Ghi chép theo thời gian

#### 9. `daily-note.md` — Nhật ký ngày

**Khi nào dùng:**
- Mỗi ngày 1 file (filename: `YYYY-MM-DD.md`)
- Capture nhanh ý tưởng, log tương tác, review

**Section:** Hôm nay gặp vấn đề gì? → 3 việc quan trọng → Capture → Học/Khái niệm → Problem→Action → Cần xử lý sau → Tổng kết 3 dòng.

---

#### 10. `meeting-note.md` — Họp

**Khi nào dùng:**
- Mọi cuộc họp với người khác (work, family, advisor)
- Filename: `Họp - <chủ đề> - YYYY-MM-DD.md`

**Quan trọng:** Mỗi quyết định PHẢI có Owner + Deadline → đẩy ngay vào TASKS.md.

---

#### 11. `project-log.md` — Log dự án

**Khi nào dùng:**
- 1 project có deadline, owner, milestones rõ
- Cập nhật **hằng tuần** (không phải hằng ngày — đó là daily note)

**Ví dụ tốt:**
- ✅ "Project - Triển khai ERP Odoo"
- ✅ "Project - Build personal website"

**KHÔNG dùng khi:**
- ❌ Note ý tưởng dự án chưa start (→ ghi chú nhanh / problem hub)

---

### Cluster 4: Entity — Thực thể

#### 12. `people-profile.md` — Người

**Khi nào dùng:**
- Người mình gặp >2 lần / có khả năng tương tác lâu dài
- Family, đồng nghiệp, mentor, client, partner, friend

**KHÔNG dùng khi:**
- ❌ Người gặp 1 lần, không follow-up (waste effort)
- ❌ Public figure không có quan hệ trực tiếp (đó là book/concept reference, không phải people)

**Quan trọng:** Section "Lịch sử tương tác" — review trước khi gặp lại để nhớ context.

---

#### 13. `book-highlights.md` — Sách

**Khi nào dùng:**
- Đọc xong 1 cuốn sách, muốn tóm tắt + giữ key ideas
- Có thể tạo trong lúc đang đọc (status: reading)

**Section quan trọng:** "Ý mình giữ lại để dùng" — promote thành atomic concept sau.

---

#### 13b. `github-repo.md` — GitHub repo (open-source)

**Khi nào dùng:**
- Track 1 repo open-source cụ thể với mục đích rõ (học pattern / install / adopt làm dependency / fork / bookmark)
- Cần lưu health signals (stars, last commit, license) để DECIDE adopt hay drop

**Ví dụ tốt:**
- ✅ "Repo: grammy" — Telegram bot framework, intent adopt-dep
- ✅ "Repo: llama.cpp" — học pattern inference, intent learn-pattern

**KHÁC `tool`**: tool = SaaS commercial (Notion, Salesforce); github-repo = codebase có thể clone/đọc/fork. `type: entity`, `subtype: github-repo`.

---

### Cluster 5: Output / Navigation

#### 14. `moc.md` — Map of Content

**Khi nào dùng:**
- Cluster có >10 atomic note → cần MOC navigate
- Tạo entry point cho người mới đọc cluster

**Lý do quan trọng:** Không có MOC = vault rối. Có MOC = vault có "lối đi".

---

#### 15. `minto-note.md` — Minto Pyramid

**Khi nào dùng:**
- Cần viết output thuyết phục theo Pyramid Principle
- Pitch, report, proposal, board memo

**KHÔNG phải template lưu kiến thức** — đây là template **OUTPUT** (viết để giao tiếp).

---

### Cluster 6: Inbox

#### 16. `ghi-chu-nhanh.md` — Capture nhanh

**Khi nào dùng:**
- Ý tưởng bất chợt, chưa rõ phân loại
- Đang đọc/nghe/xem cái gì → capture luôn để khỏi quên
- **Mặc định lưu vào `1.CAPTURE/`**

**Quy tắc:** Không capture quá 2 dòng. Sau 7 ngày phải promote (atomic / problem / archive) — không để inbox phình.

---

### Meta

#### 17. `quy-uoc-tao-note.md` — Reference taxonomy

**Đây KHÔNG phải template tạo note** — là tài liệu reference định nghĩa:
- Các giá trị `type` hợp lệ (concept, principle, method, tool, symptom, framework, log, hub)
- Các giá trị `status` (seed, growing, evergreen)
- Các giá trị `area` (brain, marketing, finance, ...)
- Action tags (#inbox, #to-clarify, #to-link, #to-summarize, #to-apply)
- Phân biệt Symptom vs Problem qua 2 câu hỏi

**Khi nào đọc:** Khi quên giá trị type/status/area nào hợp lệ.

---

## 🔍 Bảng so sánh nhanh — template dễ nhầm

### Concept vs Principle vs Method vs Tool

| | Concept | Method | Principle | Tool |
|---|---|---|---|---|
| **Câu hỏi** | "X là gì?" | "Làm thế nào?" | "Phải theo gì?" | "Dùng phần mềm gì?" |
| **Mục đích** | HIỂU | LÀM | DECIDE | CHỌN/MUA |
| **Form** | Mô tả | Quy trình các bước | Câu mệnh lệnh | Instance vendor |
| **Ví dụ** | "Pomodoro là gì" | "Cách áp Pomodoro" | "Mỗi sprint = 1 nhiệm vụ" | "TickTick app" |

### New Problem vs Symptom vs Hub

| | New Problem | Symptom | Hub |
|---|---|---|---|
| **Khi nào** | Đã rõ outcome | Chưa rõ nguyên nhân | Có 3+ problem cần group |
| **Test** | "Giải xong trông thế nào?" — trả lời được | "Mình đang thấy gì?" | "Đây là area gì?" |
| **Lifecycle** | Active → Solved | Symptom → Problem | Active → Archived |

### Daily vs Meeting vs Project Log

| | Daily | Meeting | Project Log |
|---|---|---|---|
| **Tần suất** | Hằng ngày | Mỗi cuộc họp | Hằng tuần |
| **Filename** | `2026-04-30.md` | `Họp - <topic>.md` | `Project - <name>.md` |
| **Có Action items?** | Optional | Bắt buộc | Có (milestones) |
| **Lifetime** | 1 ngày | 1 cuộc gặp | Cho đến khi xong project |

### MOC vs Hub

| | MOC | Hub |
|---|---|---|
| **Mục đích** | Navigate **kiến thức** (concept cluster) | Navigate **vấn đề** (problem cluster) |
| **Nội dung** | Concept / Method / Pattern | Problem / Symptom |
| **Vị trí** | Trong folder kiến thức | Trong folder problem hub |

---

## 🤖 Workflow tạo note với Bob

### Cách 1 — Explicit (rõ template)
```
"tạo concept Wheel of Life"
"tạo method 5 Whys"
"tạo principle Cash is King"
"tạo tool Notion"
"daily hôm nay"
"profile Anh Thắng"
"họp Anh Thắng - sales pipeline 30/4"
"project Triển khai ERP Odoo"
```
→ Bob load đúng template ngay, fill placeholder + content.

### Cách 2 — Implicit (Bob suggest)
```
"tao muốn note về [X]"
```
→ Bob hỏi context và suggest template phù hợp.

### Quy trình Bob auto thực hiện (6 bước)
1. `$$READ$$` template từ folder template của bạn (xem `templatesFolder`)
2. Replace `{{title}}`, `{{date}}`, `{{time}}` placeholder
3. Thêm `llm_managed: true` vào frontmatter
4. `$$WRITE$$` vào folder đích (theo type, xem routing-rules)
5. `$$APPEND$$` index.md + log.md
6. `$$MOVE$$` source từ Clippings/ → 1.CAPTURE/ (nếu có)

---

## 🚦 Quy tắc vàng — không vi phạm

1. **MỖI note CHỈ dùng 1 template** — không trộn (vd: không dùng concept + method trong cùng 1 file).
2. **Không vi phạm 8 section của concept** — Bob đã wire để giữ structure.
3. **Concept/Method/Principle/Tool đều CÓ THỂ neo Problem** (`problem:` optional) — không bắt buộc.
4. **Daily/Meeting/Project log có ngày tháng cụ thể** — filename phải có YYYY-MM-DD.
5. **Capture nhanh KHÔNG được phép tồn tại quá 7 ngày** — phải promote hoặc archive.
6. **Mọi template Bob tạo đều có `llm_managed: true`** — phân biệt với note user tự dùng Templater.

---

## 🔄 Khi nào upgrade từ template thấp lên template cao?

```
ghi-chu-nhanh (seed)
    ↓ (sau khi clarify đủ)
concept / method / principle / tool (atomic note)
    ↓ (khi tích luỹ đủ)
moc (navigation cluster)
    ↓ (cuối cùng, khi muốn share)
EXHIBIT artifact (4. EXHIBIT/)
```

Symptom → Problem → Solved cũng có lifecycle riêng (xem cluster 2).

---

## 📂 Folder đích theo template (routing summary)

> Định tuyến cụ thể theo `_agent/routing-rules.md` của vault BẠN (mỗi vault có cấu trúc riêng). Bảng dưới chỉ là gợi ý theo vai trò:

| Template | Đích (theo vai trò) |
|---|---|
| concept / method / principle / tool / framework | Folder kiến thức (nhóm theo `area`) |
| daily-note / meeting-note / project-log | Folder log / theo dõi theo thời gian |
| people-profile / github-repo / book-highlights | Folder resource (người / repo / sách) |
| moc | Cùng folder với cluster nó điều hướng |
| minto-note | Folder output / artifact |
| ghi-chu-nhanh | Folder capture (inbox) |
| problem-driven-* (hub / symptom) | Folder problem hub |

---

## 📚 Liên quan

**Cấu trúc:**
- [[quy-uoc-tao-note]] — taxonomy chi tiết (type/status/area/tags)
- [[CLAUDE]] — schema vault tổng

**Phụ thuộc:**
- [[routing-rules]] — quy tắc routing folder đích chi tiết
- [[workflows]] — workflow ingest/query/lint/express
- [[6-nhom-quan-he-note]] — taxonomy 6 nhóm quan hệ cho section Liên kết

**Cập nhật khi:**
- Có template mới được thêm
- Sửa schema/routing
- User feedback workflow chưa work
