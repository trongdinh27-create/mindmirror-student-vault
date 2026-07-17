# Skills — năng lực nạp-theo-yêu-cầu của {{botName}}

> Manifest các skill. {{botName}} đọc block AUTO:SKILLS dưới đây trong system prompt (luôn nạp, tí hon). Body đầy đủ nằm ở `_agent/skills/<file>` — chỉ nạp khi {{botName}} emit `$$LOAD_SKILL: <name>$$`.
> Thêm skill mới = thêm 1 file `_agent/skills/<name>.md` + 1 dòng vào bảng dưới. KHÔNG cần sửa code.

<!-- AUTO:SKILLS:START -->
| Skill | Trigger | Mô tả | File |
|---|---|---|---|
| ingest | ingest / tạo note / concept / daily / profile / vấn đề | Nạp nguồn rõ ràng thành wiki note; có guard trước WRITE/MOVE | ingest.md |
| template-system | (auto kèm ingest — load cùng) | Chọn template, schema note, naming, frontmatter và vệ sinh link | template-system.md |
| query | câu hỏi / tìm / so sánh / giải thích từ vault | Hỏi đáp chỉ đọc từ vault với budget SEARCH/READ và confidence/gap | query.md |
| express | express [topic] / tạo artifact từ vault | Tạo draft/artifact từ vault note; chỉ save khi được duyệt | express.md |
| mocfix | chuẩn hoá MOC / /mocfix | Dựng lại 1 MOC theo template (nearest-ancestor, đọc-dẫn) | mocfix.md |
| lint | lint wiki / kiểm tra sức khoẻ | Kiểm tra sức khỏe deterministic qua $$LINT$$; mặc định report-only | lint.md |
| ingest-batch | ingest ≥3 file / quét Clippings | Batch ingest nhiều note song song | ingest-batch.md |
| notebooklm | hỏi NotebookLM / tra source sâu | Gọi NotebookLM MCP tools | notebooklm.md |
| kanban | thêm task / done / report task / liệt kê task | Quản lý Kanban board — **gate**: chỉ hoạt động khi `tasksFile` đã set trong profile (qua BƯỚC 5 onboarding hoặc `$$SAVE_PROFILE$$` thủ công). Nếu chưa set → trợ lý phải hỏi user trước khi thao tác. | kanban.md |
<!-- AUTO:SKILLS:END -->
