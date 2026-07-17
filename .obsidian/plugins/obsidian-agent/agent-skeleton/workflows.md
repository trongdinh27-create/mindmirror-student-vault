# Workflows — 4 quy trình cốt lõi

> Nội dung chi tiết 4 workflow nằm trong **skill lazy-load** (`_agent/skills/`). File này KHÔNG nạp vào system prompt mỗi lượt — trợ lý nạp đúng workflow cần qua `$$LOAD_SKILL$$`. Đây là bản đồ pointer + quy ước chung.

---

## 4 workflow → skill tương ứng

| Workflow | Trigger | Skill (nạp qua `$$LOAD_SKILL: <name>$$`) |
|---|---|---|
| **INGEST** — nạp tài liệu mới → wiki atomic note | "ingest [X]", "tạo note/concept/daily/profile/vấn đề" | `ingest` (+ `template-system`); ≥3 file → `ingest-batch` |
| **QUERY** — hỏi đáp từ wiki, tổng hợp đa nguồn | câu hỏi bất kỳ về kiến thức trong vault | `query` |
| **LINT** — kiểm tra sức khoẻ wiki (deterministic) | "lint wiki" / "kiểm tra sức khoẻ" | `lint` |
| **EXPRESS** — produce artifact từ vault → OUTPUT | "express [topic]" / "tạo artifact từ X" | `express` |

Phụ trợ: `mocfix` (chuẩn hoá 1 MOC), `notebooklm` (tra NotebookLM), `kanban` (quản task). Manifest đầy đủ: `_agent/skills.md`.

---

## Quan hệ giữa 4 workflow

```
INGEST (raw → wiki atomic)
   ↓
QUERY (wiki atomic → answer + maybe synthesis)
   ↓
EXPRESS (atomic notes → artifact in OUTPUT)
   ↓
LINT (health check toàn vault định kỳ)
```

→ INGEST liên tục (khi có CAPTURE mới) · QUERY ad-hoc · EXPRESS chu kỳ (weekly/monthly) · LINT định kỳ (weekly/monthly).

---

## Quy ước log.md (áp dụng MỌI workflow)

Format mỗi dòng — **append-only, KHÔNG sửa dòng cũ** (sai → append dòng đính chính):

```
YYYY-MM-DD HH:MM | <ACTION> | <subject> | <details>
```

**ACTION:** `INGEST` · `QUERY` · `LINT` · `LINT-FIX` · `EXPRESS` · `MOC-RESTRUCTURE` · `MANUAL` (user tự sửa) · `SKIPPED` · `STRUCTURE` · `RESTRUCTURE` · `SETUP` · `MAINT-SYNC`.
