---
name: ingest
trigger: "ingest | tạo note | lưu note | concept | daily | profile | vấn đề | meeting | book | repo"
requires: "template-system"
mutates: true
default_read_limit: "source + template + 2 note liên quan"
desc: "Nạp nguồn rõ ràng thành wiki note; có máy trạng thái và chốt chặn trước WRITE/MOVE"
llm_managed: true
---

# Skill: INGEST

## Mục Tiêu

Biến một source rõ ràng thành một hoặc nhiều wiki note có `llm_managed: true`, đồng thời giữ ranh giới nguồn thô và tránh route sai.

## Phạm Vi

- Mặc định xử lý 1 source. Nếu user yêu cầu từ 3 file trở lên, load `ingest-batch`.
- Source có thể là file path, active note, pasted text, nội dung URL đã được cung cấp, hoặc batch user chỉ định rõ.
- Dùng `_agent/templates.md` để chọn template.
- Dùng `_agent/routing-rules.md` chỉ để chọn destination folder sau khi mode ingest đã được chọn.
- Load `template-system` trước khi sinh hoặc ghi nội dung note.

## Máy Trạng Thái

```md
BẮT_ĐẦU
  -> XÁC_ĐỊNH_SOURCE
  -> PHÂN_LOẠI_NOTE_TYPE
  -> CHỌN_TEMPLATE
  -> CHỌN_DESTINATION
  -> TÌM_NOTE_CŨ
  -> QUYẾT_ĐỊNH_TẠO_HAY_CẬP_NHẬT
  -> ĐỌC_SOURCE_VÀ_TEMPLATE
  -> SINH_NOTE
  -> KIỂM_TRA_CHẤT_LƯỢNG
  -> WRITE_HOẶC_ĐỀ_XUẤT
  -> CẬP_NHẬT_INDEX_LOG
  -> MOVE_SOURCE_NẾU_ĐƯỢC_PHÉP
  -> KẾT_THÚC
```

## Chốt Chặn

- Nếu thiếu source, hỏi source trước khi dùng tool.
- Nếu template chưa rõ, dừng trước WRITE và hỏi lại hoặc trả về kết quả chỉ phân loại.
- Nếu destination chưa rõ, dừng trước WRITE và hỏi lại; không đoán folder sâu.
- Nếu note liên quan đã tồn tại nhưng là note user-managed hoặc thiếu `llm_managed: true`, không sửa; chỉ đề xuất bước tiếp theo.
- Nếu source không nằm trong `Clippings/`, không tự move trừ khi user yêu cầu archive/move rõ ràng.
- Không tạo folder top-level hoặc folder lớp 2 khi chưa được user duyệt.

## Ngân Sách

- Tìm note hiện có: emit tối đa 2 lệnh `$$SEARCH: <từ khóa>$$`.
- Đọc file: emit `$$READ: <source-path>$$`, `$$READ: {{TEMPLATES_FOLDER}}/<template>.md$$`, và tối đa 2 lệnh `$$READ: <related-note-path>$$`.
- Lấy dòng chính xác trong file lớn: nếu cần sửa một dòng `_agent/index.md` hoặc file lớn khác, emit `$$FIND: <path>$$<từ khóa>$$END_FIND$$` trước để lấy text cũ.
- Ghi file: chỉ emit `$$WRITE: <path>$$...$$END_WRITE$$` khi source, template, destination và quyền sở hữu đã rõ.
- Reply cuối: tối đa 8 bullet.

## Quy Trình

1. Nếu `template-system` chưa có trong context, emit `$$LOAD_SKILL: template-system$$`.
2. Xác định source chính xác và note type dự kiến.
3. Chọn template từ `_agent/templates.md`; nếu không đủ tự tin, hỏi lại.
4. Chọn destination từ `_agent/routing-rules.md`; nếu confidence thấp, hỏi lại.
5. Tìm note liên quan trước khi tạo mới bằng `$$SEARCH: <từ khóa>$$`.
6. Đọc source và template bằng `$$READ: <source-path>$$` và `$$READ: {{TEMPLATES_FOLDER}}/<template>.md$$`.
7. Sinh note theo cấu trúc template và schema rule.
8. Quality gate:
   - frontmatter bám template;
   - có `llm_managed: true` với wiki note {{botName}} tạo;
   - `sources:` dùng plain string;
   - không có body wikilink trỏ vào `1.CAPTURE/`;
   - body link dùng bare wiki basename.
9. Tạo note mới bằng `$$WRITE: <folder-dich>/<ten-file>.md$$<frontmatter + body>$$END_WRITE$$`, hoặc update hẹp bằng `$$REPLACE: <path>$$<text cũ chính xác>$$WITH$$<text mới>$$END_REPLACE$$` chỉ khi chốt chặn đã pass. Text cũ phải lấy từ context đã đọc, `$$READ: <path>$$`, hoặc `$$FIND: <path>$$<từ khóa>$$END_FIND$$`; không đoán text cũ.
10. Với note mới, emit `$$APPEND: _agent/index.md$$<entry 1 dòng>$$END_APPEND$$`; với mọi mutation, emit `$$APPEND: _agent/log.md$$<log entry>$$END_APPEND$$`.
11. Chỉ khi source nằm trong `Clippings/`, emit `$$MOVE: Clippings/<file>$$1.CAPTURE/<file>$$END_MOVE$$`.

## Không Làm

- Không scan toàn vault.
- Không đọc full `_agent/index.md` hoặc `_agent/folders.md` cho ingest thông thường.
- Không mutation note user-managed.
- Không write note dang dở chỉ để “làm tiếp cho xong”.
- Không biến câu hỏi casual thành note; khi nhập nhằng, mặc định là query.

## Hợp Đồng Output

Báo cáo:
- created / updated / skipped;
- path;
- template;
- source;
- move action nếu có;
- gap còn lại.

## Kiểm Chứng

Ingest chỉ hoàn tất khi mọi mutation đã được log, mọi note mới có thể tìm từ `_agent/index.md`, và note pass quality gate về source/link/schema.
