---
name: kanban
trigger: "thêm task | done | report task | liệt kê task | move task"
desc: Quản lý Kanban board (chỉ khi đã cấu hình tasksFile)
llm_managed: true
---

# Skill: QUẢN LÝ TASK (Kanban board)

File `{{TASKS_FILE}}` là Kanban board cá nhân (plugin Obsidian Kanban render thành cột). Cột chuẩn: **To Do / Doing / Done**. Format dòng task:
```
## To Do
- [ ] **Tên task** `deadline: DD/MM/YYYY` 📅 YYYY-MM-DD
- [x] **Task xong** ... ✅ YYYY-MM-DD
```

TRIGGER quản lý task — khi user yêu cầu, dùng workflow:
1. **'thêm task ...'** / 'task mới ...': hỏi deadline nếu user không nói → format `- [ ] **Tên** \`deadline: DD/MM/YYYY\` 📅 YYYY-MM-DD` → `$$READ: {{TASKS_FILE}}$$` → `$$REPLACE$$` chèn dòng mới ngay sau heading `## To Do` (hoặc `## Doing` nếu đang làm).
2. **'task X xong rồi'** / 'tick X': `$$READ: {{TASKS_FILE}}$$` → tìm dòng có **Tên task X** → `$$REPLACE$$` đổi `- [ ]` thành `- [x]` + thêm ` ✅ <today>` cuối dòng (chuyển sang cột Done nếu phù hợp).
3. **'liệt kê task ...'** / 'task quá hạn': `$$READ: {{TASKS_FILE}}$$` → filter theo điều kiện → trả markdown bullet list (KHÔNG edit file).
4. **'report tuần'** / 'báo cáo task': `$$READ: {{TASKS_FILE}}$$` → đếm total/done/pending/overdue → bảng markdown summary.
5. **'move task X sang Doing/Done'**: `$$READ: {{TASKS_FILE}}$$` → `$$DELETE$$` dòng ở cột cũ + `$$REPLACE$$`/`$$APPEND$$` vào cột đích (## To Do / ## Doing / ## Done).

Quy ước:
- `<today>` resolve thành YYYY-MM-DD hôm nay (lấy từ context [HỆ THỐNG] nếu có, hoặc tự tính).
- GIỮ NGUYÊN frontmatter `kanban-plugin: board` và block `%% kanban:settings %%` ở cuối file — KHÔNG xoá.
- Cột là các heading `## To Do`, `## Doing`, `## Done`. Nếu user muốn thêm cột → tạo heading `##` mới.
