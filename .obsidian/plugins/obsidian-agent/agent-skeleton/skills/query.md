---
name: query
trigger: "hỏi | tìm | so sánh | giải thích | tóm tắt | câu hỏi về kiến thức trong vault | hỏi đáp wiki"
requires: ""
mutates: false
default_read_limit: "3 note, có thể mở rộng tới 6"
desc: "Hỏi đáp chỉ đọc từ vault với budget SEARCH/READ, confidence và gap"
llm_managed: true
---

# Skill: QUERY

## Mục Tiêu

Trả lời từ vault với số lượt đọc có giới hạn, bằng chứng rõ, confidence rõ và gap rõ. Query là mode mặc định khi intent nhập nhằng.

## Phạm Vi

- Mặc định chỉ đọc.
- Dùng cú pháp `$$SEARCH: <từ khóa>$$` để tìm note ứng viên.
- Đọc 3 note đầu tiên bằng `$$READ: <path>$$`; chỉ mở rộng tối đa 6 note nếu confidence vẫn dưới medium hoặc user yêu cầu đào sâu.
- Chỉ emit `$$READ: 1.CAPTURE/<file>.md$$` khi user yêu cầu verify nguồn gốc hoặc trích nguyên văn cho một claim cụ thể.

## Máy Trạng Thái

```md
BẮT_ĐẦU
  -> CHUẨN_HÓA_CÂU_HỎI
  -> TÌM_NOTE_LIÊN_QUAN
  -> CHẤM_ĐIỂM_KẾT_QUẢ
  -> ĐỌC_NOTE_TOP
  -> TỔNG_HỢP_CÂU_TRẢ_LỜI
  -> KIỂM_TRA_GAP
  -> KẾT_THÚC
```

## Chốt Chặn

- Nếu SEARCH không trả về note hữu ích, báo không tìm thấy và gợi ý từ khóa tìm kiếm tốt hơn; không bịa.
- Nếu confidence thấp sau 3 READ, hỏi user có muốn mở rộng scope hoặc chạy search rộng hơn không.
- Nếu câu trả lời tạo ra insight có thể tái dùng, chỉ đề xuất tạo synthesis note; không write.
- Nếu user muốn lưu câu trả lời, chỉ chuyển sang ingest/express sau khi xác nhận intent mutation.

## Ngân Sách

- Tìm kiếm: tối đa 2 lệnh `$$SEARCH: <từ khóa>$$` theo mặc định.
- Đọc file: 3 lệnh `$$READ: <path>$$` ban đầu, tối đa 6 sau khi mở rộng.
- WRITE/APPEND/REPLACE/MOVE: 0.
- Output: mặc định 400-800 từ trừ khi user yêu cầu long-form.

## Quy Trình

1. Trích câu hỏi thật, entity và constraint.
2. Emit `$$SEARCH: <term hẹp nhất đủ dùng>$$`.
3. Xếp hạng note ứng viên theo độ khớp tiêu đề, độ liên quan của snippet và độ đáng tin.
4. Emit `$$READ: <path>$$` cho top 3 note.
5. Trả lời với bằng chứng `[[wikilink]]`.
6. Tách rõ bằng chứng từ vault và suy luận của {{botName}}.
7. Nêu confidence và gap.

## Không Làm

- Không write file hoặc append log cho Q&A thuần.
- Không load ingest/express chỉ vì câu trả lời có thể biến thành note/artifact.
- Không đọc full `_agent/index.md` cho search thông thường.
- Không đọc raw CAPTURE trừ khi cần verify nguồn gốc rõ ràng.

## Hợp Đồng Output

Dạng mặc định:

```md
<câu trả lời>

Bằng chứng: [[note-a]], [[note-b]]
Độ tin cậy: high | medium | low
Gap: <điều chưa tìm thấy hoặc chưa verify được>
```

## Kiểm Chứng

Câu trả lời đạt yêu cầu khi claim chính được neo vào note đã đọc, uncertainty được nêu rõ, và không có file mutation.
