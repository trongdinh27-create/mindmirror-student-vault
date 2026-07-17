---
name: express
trigger: "express | tạo artifact | viết article | viết framework | viết deck | memo | publish | output từ vault"
requires: ""
mutates: false
default_read_limit: "3-8 source note"
desc: "Biến vault note thành artifact; mặc định draft, chỉ save khi được duyệt"
llm_managed: true
---

# Skill: EXPRESS

## Mục Tiêu

Tạo draft publishable hoặc artifact đã được duyệt từ các vault note đủ trưởng thành.

## Phạm Vi

- Topic phải xác định được.
- Output type phải rõ hoặc cần hỏi: pattern, synthesis, framework, article, deck, memo, SOP, social post, video script.
- Audience phải rõ hoặc cần hỏi: board, customer, public, internal, self hoặc audience được user nêu.
- Source note: đọc 3-8 note bằng `$$READ: <path>$$`; artifact final thường cần ít nhất 5 source note hữu ích.
- Lưu vào `4.OUTPUT/` cần user approve rõ.

## Máy Trạng Thái

```md
BẮT_ĐẦU
  -> XÁC_ĐỊNH_TOPIC
  -> TÌM_SOURCE_NOTE
  -> KIỂM_TRA_ĐỘ_TRƯỞNG_THÀNH
  -> XÁC_NHẬN_LOẠI_OUTPUT
  -> XÁC_NHẬN_AUDIENCE
  -> PHÁC_THẢO_OUTLINE
  -> VIẾT_DRAFT_ARTIFACT
  -> TỰ_REVIEW
  -> USER_DUYỆT_LƯU
  -> WRITE_OUTPUT
  -> CẬP_NHẬT_INDEX_LOG
  -> KẾT_THÚC
```

## Chốt Chặn

- Nếu tìm được dưới 5 source note hữu ích, chỉ tạo draft/outline hoặc đề xuất query/ingest trước; không save artifact final.
- Nếu thiếu output type, hỏi trước khi viết full artifact.
- Nếu thiếu audience, hỏi trước khi viết full artifact.
- Nếu user nói “viết” nhưng không nói “save/lưu/tạo file”, chỉ tạo draft trong chat.
- Nếu artifact đã tồn tại, đề xuất version mới hoặc update plan; không overwrite âm thầm.
- Không xem methodology note kiểu “cách viết X” là artifact final.

## Ngân Sách

- Tìm kiếm: tối đa 3 lệnh `$$SEARCH: <topic>$$`.
- Đọc file: 3-8 lệnh `$$READ: <path>$$`.
- Lấy dòng chính xác trong index/MOC lớn: nếu cần sửa một dòng bằng REPLACE, emit `$$FIND: <path>$$<từ khóa>$$END_FIND$$` trước.
- Ghi file: 0 cho tới khi có approval save rõ; khi save dùng `$$WRITE: <path>$$...$$END_WRITE$$`.
- Độ dài draft: mặc định concise; chỉ mở rộng khi user yêu cầu.

## Quy Trình

1. Xác định topic, output type và audience từ input.
2. Emit `$$SEARCH: <topic/từ khóa>$$` để tìm atomic note/MOC liên quan.
3. Emit `$$READ: <path>$$` để đọc source note trong budget.
4. Kiểm tra độ trưởng thành và độ đủ nguồn.
5. Draft outline trước.
6. Draft artifact dựa trên source note.
7. Self-review về structure, clarity, audience fit và source grounding.
8. Nếu user approve save, emit `$$WRITE: 4.OUTPUT/<subfolder>/<file>.md$$<artifact>$$END_WRITE$$`, rồi emit `$$APPEND: _agent/index.md$$<entry>$$END_APPEND$$` và `$$APPEND: _agent/log.md$$<log entry>$$END_APPEND$$`. Nếu cần update MOC bằng REPLACE, lấy old text bằng `$$READ: <moc-path>$$` hoặc `$$FIND: <moc-path>$$<từ khóa>$$END_FIND$$` trước.

## Không Làm

- Không save vào `4.OUTPUT/` nếu chưa được duyệt.
- Không scan toàn vault để gom source.
- Không viết artifact dài nếu user chỉ cần outline nhanh.
- Không giả vờ đủ source khi note nguồn chưa đủ.

## Hợp Đồng Output

Với draft:
- output type;
- audience;
- source note đã dùng;
- draft/outline;
- confidence và gap.

Với artifact đã save:
- path;
- source note;
- summary index/log update;
- rủi ro còn lại.

## Kiểm Chứng

Express hoàn tất khi output được grounding bằng source note, audience/format rõ ràng, và artifact đã lưu có frontmatter gồm `sources`, `audience`, `status`.
