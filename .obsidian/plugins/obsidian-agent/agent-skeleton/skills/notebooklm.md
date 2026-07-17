---
name: notebooklm
trigger: "hỏi NotebookLM | tra source sâu"
desc: Gọi NotebookLM MCP tools (chỉ khi đã bật trong settings)
llm_managed: true
---

# Skill: NOTEBOOKLM MCP TOOLS

Gọi khi cần tra cứu source sâu từ NotebookLM của user. (Chỉ khả dụng khi đã bật NotebookLM trong settings plugin.)

Cú pháp generic: `$$NLM_TOOL: <tool_name>$$<args_json>$$END_NLM_TOOL$$`
`args_json` là object JSON các tham số tool. Object rỗng `{}` nếu không có tham số.

**Tools hữu ích nhất:**
- `notebook_list` — liệt kê notebook user có. Args: `{}`
- `notebook_query` — hỏi 1 notebook (semantic, có citations). Args: `{notebook_id, query}`
- `notebook_describe` — chi tiết 1 notebook. Args: `{notebook_id}`
- `cross_notebook_query` — hỏi đồng thời nhiều notebook. Args: `{notebook_ids: [...], query}`
- `source_describe` — chi tiết 1 source. Args: `{notebook_id, source_id}`
- `source_get_content` — lấy full text 1 source (PDF/article). Args: `{notebook_id, source_id}`
- `notebook_search` — search trong nội dung notebook. Args: `{notebook_id, query}`

Tools đầy đủ (35): notebook_list/create/get/describe/rename/delete/query/search, cross_notebook_query, notebook_share_*, notebook_duplicate, source_add/list_drive/describe/get_content/rename/delete/sync_drive, studio_create/revise/status/delete, download_artifact, export_artifact, note_create/list/update/delete, research_start/import/status, batch, pipeline, tag, refresh_auth, save_auth_tokens, server_info.

**QUAN TRỌNG:**
- KHÔNG gọi tool destructive (notebook_delete, source_delete, studio_delete, note_delete) trừ khi user explicit yêu cầu.
- KHÔNG gọi notebook_create / source_add / studio_create / note_create tự động — chỉ khi user explicit.
- Workflow INGEST với NotebookLM: trước WRITE wiki note, gọi notebook_list để identify notebook phù hợp → notebook_query với câu hỏi cụ thể → dùng answer + citations để enrich section 1 (Nguồn gốc) và section 4 (Cấu tạo). Cite source path từ notebook vào frontmatter `sources:`.
- Lệnh đầu tiên trong session có thể delay ~2s (lazy-start subprocess Python).
- Nếu tool fail với 'auth'/'cookie'/'expired' → báo user chạy 'nlm login' lại trong terminal.
