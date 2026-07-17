---
name: mindmirror-luu-tra-loi
description: Lưu nhanh câu trả lời của Claude vào MindMirror Vault dưới dạng Fleeting Note trong 1. Thu Thập/. Trigger khi user nói "lưu câu trả lời này", "lưu note này vào vault", "save this to nexus", "đưa vào MindMirror", "lưu vào vault".
---

# Nexus Save Answer

## Mục đích

Chuyển câu trả lời của Claude thành Fleeting Note trong MindMirror Vault mà không cần copy-paste thủ công. Đây là bước Thu Thập đầu tiên — capture trước, xử lý sau.

## Quy tắc văn phong (bắt buộc áp dụng khi tạo note)

Không dùng icon hoặc emoji trong nội dung note.

Không dùng dấu "-" để liệt kê. Thay bằng đoạn văn xuôi hoặc xuống dòng đơn giản.

Thuật ngữ tiếng Anh phải kèm nghĩa tiếng Việt trong dấu ngoặc đơn, ví dụ: context (ngữ cảnh), trigger (điều kiện kích hoạt), skill (kỹ năng tự động).

## Khi được trigger

Bước 1 — Xác định nội dung cần lưu.

Nếu user chỉ nói "lưu câu trả lời này" mà không paste gì thêm, tự suy ra nội dung từ câu trả lời ngay trước đó trong conversation (cuộc hội thoại) hiện tại.

Nếu user paste nội dung cụ thể, dùng nội dung đó.

Bước 2 — Tạo slug (tên ngắn) tiếng Việt 4–8 từ mô tả chủ đề chính. Ví dụ: "CLAUDE.md là gì và vai trò trong tạo skill".

Bước 3 — Tạo file tại đường dẫn cứng:

`1. Thu Thập/FN — {slug} — {YYYY-MM-DD}.md`

Bước 4 — Viết nội dung note theo format sau:

```markdown
---
created: {YYYY-MM-DD}
tags: [raw, fleeting, {1-3 tag liên quan}]
status: unprocessed
source: "{câu hỏi gốc của user dẫn đến câu trả lời này, giữ nguyên văn}"
---

# FN — {slug} — {YYYY-MM-DD}

{Nội dung câu trả lời được viết lại ngắn gọn, súc tích.
Giữ các điểm quan trọng nhất. Bỏ các ví dụ thừa.
Không dùng "-" để liệt kê. Không dùng icon.
Thuật ngữ tiếng Anh kèm nghĩa tiếng Việt trong ngoặc đơn.}

#process-later
```

Bước 5 — Xác nhận với user: "Đã lưu vào 1. Thu Thập/ — FN — {slug} — {YYYY-MM-DD}.md. Dùng mindmirror-xu-ly để đẩy lên Chuyển Hoá khi sẵn sàng."

## Quy tắc bổ sung

Không hỏi nhiều hơn 1 câu trước khi tạo note.

Không format đẹp quá mức — đây là Thu Thập, chưa qua xử lý.

Không tạo wikilink nếu chưa chắc note đích tồn tại.

Luôn thêm #process-later ở cuối để đánh dấu chờ xử lý.

## Tích hợp với các skill khác

Sau khi lưu FN, user có thể dùng mindmirror-xu-ly để đẩy qua Tinh Lọc → Chuyển Hoá → Kiến Tạo.

Nếu nội dung đủ sâu để thành Kiến Thức Cốt Lõi ngay, dùng mindmirror-thu-hoach thay thế.

## Vault path

Folder ở root vault (thư mục chứa `.obsidian/`). FN lưu vào `1. Thu Thập/`.
