---
name: template-system
trigger: "(auto kèm ingest)"
requires: ""
mutates: false
default_read_limit: "chỉ template đã chọn"
desc: "Chọn template, schema note, naming, frontmatter và vệ sinh link"
llm_managed: true
---

# Skill: TEMPLATE SYSTEM

## Mục Tiêu

Làm nguồn sự thật duy nhất cho việc load template, schema note, naming, frontmatter, cite source và vệ sinh link.

## Phạm Vi

- Dùng kèm ingest và mọi workflow tạo wiki/output note.
- Catalog template: `_agent/templates.md`.
- File template nằm trong `{{TEMPLATES_FOLDER}}/`.

## Chọn Template

- Match intent user với `_agent/templates.md`.
- Nếu không có match đủ tự tin, hỏi trước khi write.
- Không tự thiết kế template mới khi đáng lẽ phải load template user đã tạo.

## Naming Rule

- File do {{botName}} tạo dùng `kebab-case-khong-dau.md`.
- Giữ nguyên tên file user tạo trừ khi user yêu cầu rename.
- Tiêu đề trong note có thể dùng tiếng Việt có dấu.
- Hỏi trước khi tạo folder top-level hoặc folder lớp 2.

## Frontmatter Rule

Mọi wiki note {{botName}} tạo phải bám template đã chọn và có `llm_managed: true`.

Các field phổ biến khi template hỗ trợ:

```yaml
---
title: "Tiêu đề tiếng Việt có dấu"
type: concept | method | principle | synthesis | summary | entity | claim | pattern | framework | moc | log | checklist
area: ""
sources:
  - "path-or-citation-as-plain-string"
created: YYYY-MM-DD
updated: YYYY-MM-DD
llm_managed: true
tags: []
aliases: []
---
```

Artifact output có thể thêm:

```yaml
methodology_used: "[[methodology-note]]"
audience: public | customer | board | internal | self
status: draft | final | iterating | archived
```

## Source Và Link Rule

- `sources:` luôn dùng plain string, không dùng `[[wikilink]]`.
- Không viết body wikilink trỏ vào raw source dưới `1.CAPTURE/`.
- Body link nối các wiki note bằng bare wikilink: `[[basename]]`.
- Không thêm section body `## Nguồn`, `## Sources`, hoặc `## References` nếu source đã nằm trong frontmatter.

## Quy Trình Fill Template

1. Đọc template đã chọn bằng `$$READ: {{TEMPLATES_FOLDER}}/<template>.md$$`.
2. Replace placeholder:
   - `{{title}}`;
   - `{{date:DD-MM-YYYY}}`;
   - `{{date:YYYY-MM-DD}}`;
   - `{{time:HH:mm}}`.
3. Thêm/cập nhật `llm_managed: true`.
4. Giữ nguyên section cố định của template.
5. Với hybrid template, giữ section khóa và chỉ điều chỉnh section tùy biến theo source.
6. Xóa heading tùy biến rỗng thay vì bịa nội dung.
7. Cập nhật `updated:` thành ngày hiện tại.

## Neo Problem

- `problem: ""` có thể để trống với note học/concept thuần.
- Chỉ fill problem khi user nêu problem/hub rõ ràng hoặc template thuộc nhóm problem-driven.
- Không tự bịa problem anchor.

## Quality Gate

Trước WRITE, verify:
- đã dùng template đã chọn;
- có frontmatter bắt buộc;
- source string là plain string;
- không có body link trỏ vào `1.CAPTURE/`;
- không còn optional heading rỗng;
- note đủ self-contained để đọc mà không cần mở lại source thô.
