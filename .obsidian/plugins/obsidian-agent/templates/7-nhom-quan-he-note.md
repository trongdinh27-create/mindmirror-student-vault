---
title: "7 nhóm quan hệ — tham chiếu cho liên kết note"
type: reference
status: evergreen
area: knowledge-management
sources:
  - "Synthesis từ WordNet semantic relations, Kant categories (relation), Aristotle 4 causes, system dynamics causal loop"
created: 2026-06-04
updated: 2026-06-04
llm_managed: true
tags: [reference, linking, zettelkasten, relation-types]
aliases: ["7 nhóm quan hệ note", "quan hệ note"]
---
# 7 nhóm quan hệ — tham chiếu cho liên kết note
> 🧭 **Source of truth** cho quan hệ semantic giữa các note trong vault. Khi viết link `[[note A]] → [[note B]]`, chọn 1 trong 7 nhóm dưới để justify. Edge không gán được nhóm → cân nhắc bỏ link.
## 🔒 Bảng 7 nhóm
| #   | Nhóm                                             | Ký hiệu  | Verb tiếng Việt                                 | Tính chất                                 | Ví dụ                                   |
| --- | ------------------------------------------------ | -------- | ----------------------------------------------- | ----------------------------------------- | --------------------------------------- |
| 1   | **Cấu trúc** (Structural)                        | ⊃        | "thuộc về / là phần của / là instance của"      | Hierarchical, không định hướng nhân quả   | `framework ⊃ component`                 |
| 2   | **Nhân quả** (Causal)                            | →        | "gây ra / dẫn đến / kích hoạt"                  | Directional, tạo chuỗi nguyên nhân-hệ quả | `nguyên nhân → hệ quả`                  |
| 3   | **Tác động định lượng** (Quantitative influence) | ↑ / ↓    | "làm tăng / làm giảm / khuếch đại / triệt tiêu" | Directional + có dấu (+/-)                | `A ↑ B` (A làm tăng B)                  |
| 4   | **Đối lập** (Opposition)                         | ⊥        | "đối lập với / mâu thuẫn / loại trừ lẫn nhau"   | Symmetric, không định hướng               | `X ⊥ Y`                                 |
| 5   | **Tương đồng** (Similarity)                      | ≈ / ↔    | "tương tự / tương đương / cùng họ với"          | Symmetric, có thể có chiều khác biệt      | `A ≈ B (khác về scale)`                 |
| 6   | **Phụ thuộc** (Dependency)                       | ⇐ / →use | "cần / phụ thuộc vào / áp dụng vào"             | Directional precondition                  | `A ⇐ B (A cần B làm tiền đề)`           |
| 7   | **Mục tiêu** (Teleological / Goal)               | ⇢        | "để / nhằm / phục vụ cho / hướng đến"           | Directional intent, hướng tương lai       | `tracking events ⇢ optimize conversion` |
## 🔒 Cách phân biệt các cặp dễ nhầm
### Nhân quả (→) vs Mục tiêu (⇢)
- **Nhân quả**: A đã/đang gây ra B trong thực tế. *Quá khứ/hiện tại.*
- **Mục tiêu**: A được tạo ra **nhằm** đạt B. *Intent, hướng tương lai.*
- Test: thay verb "gây ra" vs "để". Vd: "A/B test → conversion tăng" (nhân quả, mô tả kết quả) vs "A/B test ⇢ optimize conversion" (mục tiêu, mô tả intent).
### Nhân quả (→) vs Tác động định lượng (↑/↓)
- **Nhân quả**: định tính, A khiến B xảy ra.
- **Tác động định lượng**: định lượng, A khiến B **nhiều hơn/ít hơn**. Có dấu.
- Khi nói "A làm B tăng" → dùng `↑` chứ không phải `→`.
### Cấu trúc (⊃) vs Phụ thuộc (⇐)
- **Cấu trúc**: A là phần của B (whole-part). Trừ A đi B vẫn còn (nhưng thiếu).
- **Phụ thuộc**: A cần B để tồn tại/hoạt động. Trừ B đi A sụp đổ.
- Test: "A có thể tồn tại độc lập với B không?" — có (chỉ là không trọn vẹn) → cấu trúc; không → phụ thuộc.
### Đối lập (⊥) vs Tương đồng có chiều khác biệt (≈)
- **Đối lập**: loại trừ logic. A đúng thì B sai (hoặc ngược lại).
- **Tương đồng khác biệt**: cùng nhóm nhưng khác scale/aspect. Không loại trừ.
- Vd: `mutex ⊥ shared state` (đối lập) vs `Redis ≈ Memcached` (tương đồng, khác feature set).
## 🔒 Quy tắc dùng
- Mỗi edge note phải gán **đúng 1 nhóm**. Nhiều nhóm → tách thành 2 link.
- Edge không gán được → cân nhắc bỏ. Vault Zettel không cần "link cho có".
- Mỗi link nên có comment ngắn justify nhóm: `[[note-b]] — nhân quả: A gây ra X trong context Y`.
- Khi viết MOC, không cần ghi rõ nhóm cho mọi link — nhưng các link quan trọng (vd "khái niệm gốc", "ví dụ điển hình") nên ghi.
## 🌊 Anti-pattern cần tránh
- **Backlink rác**: link 2 note "chỉ vì cùng chủ đề" mà không thuộc 1 trong 7 nhóm.
- **Mục tiêu lạm dụng**: gán ⇢ cho mọi link vì cảm thấy "có ích". Mục tiêu phải có chủ thể intent rõ.
- **Định lượng không có dấu**: viết `A ↑ B` mà không nói rõ "tăng bao nhiêu, theo cơ chế nào".
## 🌊 Nguồn gốc (lịch sử khái niệm)
7 nhóm này là **synthesis** từ nhiều truyền thống, không từ 1 paper:
1. **WordNet (Princeton, Miller 1985+)** — hypernym/meronym (cấu trúc), antonym (đối lập), synonym (tương đồng), entailment (phụ thuộc).
2. **Aristotle 4 causes (Categories, ~350 TCN)** — efficient cause (nhân quả) + final cause (mục tiêu).
3. **Kant 12 categories (1781)** — substance/causality/community trong nhóm Relation.
4. **System Dynamics (Forrester, MIT 1956+)** — ký hiệu `↑/↓` định lượng từ causal loop diagram.
5. **Knowledge Representation (Sowa Conceptual Graphs 1984, OWL/RDF 2004)** — phân biệt directional/symmetric.
## 🔒 Tham chiếu chéo
- Skill `_agent/skills/ingest.md` — khi tạo note mới, gán đúng 1 nhóm quan hệ cho mỗi link ra.
- Skill `_agent/skills/template-system.md` — vệ sinh link; ưu tiên typed link khi note có ≥3 link ra.
- Skill `_agent/skills/mocfix.md` — khi dựng MOC, các link quan trọng nên ghi rõ nhóm.
