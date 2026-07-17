# Định Tuyến Mode — Query / Ingest / Lint / Express

Dùng file này để chọn luồng chính trước khi load skill. Mỗi yêu cầu chỉ nên có một skill chính, cộng thêm skill phụ thuộc bắt buộc nếu có.

---

## Chính Sách Mặc Định

- Khi intent nhập nhằng, mặc định chọn `query`.
- Không mutation file nếu user chưa yêu cầu rõ một luồng có mutation.
- Không scan toàn vault theo mặc định.
- Không load nhiều thân luồng nếu không có quan hệ phụ thuộc rõ.
- Khi cần sửa một dòng trong file lớn như `_agent/index.md` hoặc `_agent/folders.md`, dùng `$$FIND: <path>$$<từ khóa>$$END_FIND$$` để lấy dòng nguyên văn trước; không đọc full file nếu chỉ cần một dòng.
- Trước mọi `$$REPLACE$$`, phải có text cũ chính xác từ context hiện có, `$$READ: <path>$$`, hoặc `$$FIND: <path>$$<từ khóa>$$END_FIND$$`.
- Nếu độ tin cậy routing thấp, trả về kết quả phân loại / câu hỏi làm rõ trước khi mutation.

---

## Luật Routing

```md
NẾU user hỏi, tìm, so sánh, giải thích, tóm tắt hoặc suy luận từ vault
THÌ mode = query
LOAD = emit `$$LOAD_SKILL: query$$`
SCOPE = tìm bằng `$$SEARCH: <từ khóa>$$`, đọc tối đa 3 note bằng `$$READ: <path>$$`
MUTATION = false
DO NOT = write, log, ingest, express, read CAPTURE trừ khi cần verify nguồn gốc
OUTPUT = câu trả lời + wikilink + confidence + gap

NẾU user yêu cầu tạo/lưu/ingest/chuyển/nhập một source vào vault
THÌ mode = ingest
LOAD = emit `$$LOAD_SKILL: ingest$$` và `$$LOAD_SKILL: template-system$$`
SCOPE = file rõ ràng, pasted text, active note hoặc batch đã chọn
MUTATION = true
DO NOT = scan toàn vault, tạo folder top/lớp 2 khi chưa duyệt, tự move source ngoài Clippings
OUTPUT = summary created/updated/skipped
TOOL NOTE = nếu update note/index bằng REPLACE, lấy old text bằng `$$READ: <path>$$` hoặc `$$FIND: <path>$$<từ khóa>$$END_FIND$$` trước

NẾU user yêu cầu kiểm tra health, broken link, frontmatter, index, cấu trúc, stale note, orphan note
THÌ mode = lint
LOAD = emit `$$LOAD_SKILL: lint$$`
SCOPE = chạy deterministic bằng `$$LINT$$` hoặc inspect file/folder được chỉ định
MUTATION = false theo mặc định
DO NOT = fix nếu user chưa yêu cầu fix rõ ràng
OUTPUT = top must-fix + advisory + metric
TOOL NOTE = khi fix, dùng `$$FIND: <path>$$<từ khóa>$$END_FIND$$` hoặc `$$READ: <path>$$` trước `$$REPLACE$$`

NẾU user yêu cầu tạo artifact publishable, article, framework, deck, memo hoặc public output
THÌ mode = express
LOAD = emit `$$LOAD_SKILL: express$$`
SCOPE = topic đã chọn + 3-8 source note
MUTATION = false cho tới khi có phê duyệt lưu
DO NOT = write vào 4.OUTPUT trước khi output type + audience + approval đã rõ
OUTPUT = draft / outline / summary artifact đã lưu
TOOL NOTE = nếu cần sửa MOC/index bằng REPLACE, dùng `$$FIND: <path>$$<từ khóa>$$END_FIND$$` hoặc `$$READ: <path>$$` trước
```

---

## Mặc Định Khi Nhập Nhằng

| Trường hợp nhập nhằng | Chọn | Lý do |
|---|---|---|
| Query vs Express | `query` | Trả lời trước; chỉ đề xuất artifact khi user yêu cầu. |
| Query vs Ingest | `query` | Không tạo note từ câu hỏi casual. |
| Lint report vs fix | `lint` report | Fix là mutation, cần intent rõ. |
| Ingest nhưng template/folder chưa rõ | classify/clarify | Tránh tạo note sai chỗ. |
| Express nhưng audience/output chưa rõ | clarify hoặc chỉ draft outline | Tránh lưu artifact non. |

---

## Tầng Chi Phí

| Tầng | Khi dùng | Ngân sách tool | Kết quả |
|---|---|---|---|
| Nhanh | Query đơn giản, routing hiển nhiên | emit `$$SEARCH: <từ khóa>$$` <=1, `$$READ: <path>$$` <=3 | Câu trả lời ngắn |
| Chuẩn | Query/ingest/lint thông thường | Theo budget trong skill | Kết quả luồng đầy đủ |
| Sâu | Synthesis đa nguồn, express, mutation rủi ro | Mở rộng `$$READ: <path>$$` + verify | Kết quả tin cậy hơn |

Công thức quyết định:

```md
Lợi ích kỳ vọng = Giá trị output × Độ tin cậy - Chi phí token - Rủi ro mutation
```

Chỉ tăng tầng chi phí khi giá trị output hoặc rủi ro mutation đủ lớn để biện minh.
