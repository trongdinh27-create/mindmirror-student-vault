---
name: ingest-batch
trigger: "ingest ≥3 file | quét Clippings | ingest tất cả"
desc: Batch ingest nhiều note song song (concurrency=2)
llm_managed: true
---

# Skill: INGEST_BATCH

DÙNG KHI USER MUỐN INGEST ≥3 NOTE 1 LÚC (vd: 'ingest tất cả Gestalt clipping', 'quét hết Clippings/').

Cú pháp:
```
$$INGEST_BATCH$$
[
  {
    "src": "Clippings/source-1.md",
    "dst": "3. PHÁT TRIỂN.../sub-folder/ten-kebab.md",
    "type": "concept",
    "title": "Tiêu đề tiếng Việt có dấu",
    "tags": ["tag1", "tag2"],
    "indexEntry": "- [[ten-kebab]] — mô tả 1 dòng — concept — created: YYYY-MM-DD",
    "logEntry": "YYYY-MM-DD HH:MM | INGEST | Tiêu đề | template: 8-section | created: 3. PHÁT TRIỂN.../ten-kebab.md"
  }
  ... (mỗi entry 1 file)
]
$$END_INGEST_BATCH$$
```

Plugin sẽ làm AUTOMATICALLY cho TẤT CẢ entries trong array (concurrency=2):
1. Đọc src → call LLM headless với template 8-section + source content → nhận wiki body markdown
2. WRITE wiki body vào dst (tự create folder cha)
3. APPEND indexEntry vào _agent/index.md (mutex serialize)
4. APPEND logEntry vào _agent/log.md (mutex serialize)
5. MOVE src → 1.CAPTURE/<basename> (giữ basename gốc)
→ Trả về summary: ✅ N/M thành công, ❌ failed list

**KHI NÀO DÙNG INGEST_BATCH vs SINGLE INGEST:**
- ≥3 file Clippings cùng topic → INGEST_BATCH (1 turn, parallel) ⭐
- 1-2 file → single INGEST (skill ingest, multi-command 6 lệnh trong 1 reply)

**TRÁCH NHIỆM CỦA BẠN khi dùng INGEST_BATCH:**
- Tự routing dst theo type + topic (đọc _agent/routing-rules.md nếu chưa rõ)
- Tự đặt tên kebab (kebab-case-khong-dau)
- Tự viết indexEntry (1 dòng mô tả) + logEntry (theo format chuẩn)
- Tự suy ra type + tags từ tên file source
- LƯU Ý: Plugin tự gọi LLM để generate body — KHÔNG cần bạn viết body trong spec, chỉ cần metadata.
- SAU KHI plugin gửi `[HỆ THỐNG BÁO INGEST_BATCH KẾT QUẢ]`: BẮT BUỘC viết 1 báo cáo gọn cho user (Markdown bullet list): tổng số OK/fail, list từng note đã tạo (link wiki `[[basename]]`), nếu có fail thì nêu lý do. KHÔNG được im lặng kết thúc turn.

📁 ROUTING FOLDER ĐÍCH: tự suy đích dựa trên _agent/routing-rules.md (đã sinh riêng cho vault này). Nếu chưa rõ folder đích, `$$READ: _agent/routing-rules.md$$` trước khi quyết định.
