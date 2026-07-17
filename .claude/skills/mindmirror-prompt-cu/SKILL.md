---
name: mindmirror-prompt-cu
description: Đưa ra một câu hỏi triết lý/suy ngẫm sâu (vd "Nếu chết trong 1 năm bạn hối tiếc gì?"). Lưu câu trả lời vào 1. Thu Thập/ với tag #deep-reflection để sau biến thành Kiến Thức Cốt Lõi. Trigger khi user nói "câu hỏi suy ngẫm", "deep reflection", "muốn suy nghĩ sâu", hoặc auto ngẫu nhiên 1-2 lần/tuần.
---

# Legacy Prompt — Câu Hỏi Suy Ngẫm Sâu

## Mục đích
Buộc user dừng lại 5–10 phút trong tuần để suy nghĩ vượt khỏi to-do list. Đây là nguồn sinh insight cho Atlas.

## Khi được trigger

### Bước 1: Chọn 1 câu hỏi

Random pick từ pool (hoặc cycle để không lặp lại trong 1 tháng):

**Quá khứ:**
- 3 năm gần đây bạn đã thay đổi quan điểm về điều gì?
- Quyết định nào bạn cảm ơn quá khứ-bạn vì đã đưa ra?
- Việc gì bạn từng sợ mà giờ không sợ nữa?

**Tương lai:**
- Nếu chết trong 1 năm tới, bạn sẽ hối tiếc điều gì nhất?
- 80-tuổi-bạn sẽ nói gì với hôm-nay-bạn?
- Nếu chỉ còn 5 năm sống, lịch trình tuần này có thay đổi gì không?

**Giá trị:**
- 3 điều quan trọng nhất với bạn hôm nay — chúng có khớp với việc bạn dành thời gian không?
- Bạn nói "có" với cái gì mà thực ra nên nói "không"?
- Khi nào lần gần nhất bạn cảm thấy hoàn toàn là chính mình?

**Người khác:**
- Ai bạn đã ngừng giữ liên lạc mà giờ thấy hối tiếc?
- Người bạn ngưỡng mộ nhất có điểm chung gì?
- Bạn muốn được nhớ đến vì điều gì?

**Bóng tối:**
- Điều gì bạn đang trốn tránh đối diện?
- Lỗi lầm nào bạn vẫn chưa tha thứ cho chính mình?
- Cái gì đang "đủ tốt" mà thực ra bạn cần "tốt thực sự"?

### Bước 2: Hỏi user

Trình bày câu hỏi đơn giản, không thêm context. Đợi.

### Bước 3: Lưu câu trả lời

Tạo file trong `1. Thu Thập/`:

```markdown
---
tags: [fleeting, deep-reflection]
created: {YYYY-MM-DD HH:MM}
prompt: {câu hỏi gốc}
---

# FN — Reflection: {snippet}

## Câu hỏi
> {câu hỏi}

## Câu trả lời
{user response}

## Trạng thái cảm xúc khi trả lời
*(Tùy chọn — vd: bình thản / xáo trộn / có insight mới)*

---
*Tag #deep-reflection để xử lý trong weekly review → có thể biến thành Kiến Thức Cốt Lõi.*
```

Filename: `1. Thu Thập/FN — Reflection — {YYYY-MM-DD}.md`

### Bước 4: Theo dõi

- Đánh dấu câu hỏi đã dùng vào `1. Thu Thập/Prompt History.md` (tạo khi chưa có) để không lặp trong 1 tháng.
- Nếu user trả lời "không có ý kiến" → ghi nhận và đề xuất câu khác (hoặc dừng phiên này).

### Bước 5: Theo dõi sau

Trong weekly review, các FN có tag `#deep-reflection` được xử lý đặc biệt:
- Nếu insight đủ chín → gọi `/mindmirror-thu-hoach` (hoặc `/mindmirror-chac-loc`) để biến thành Kiến Thức Cốt Lõi
- Nếu chưa → giữ trong Inbox thêm 1 tuần
- Nếu sau 4 tuần vẫn chưa thành Kiến Thức Cốt Lõi → xóa hoặc archive

## Quy tắc

- **Không phán xét câu trả lời.** Đây là không gian an toàn để user nói thật với chính mình.
- **Không tự trả lời thay user.** Im lặng > Gợi ý.
- **Không quá 1 câu/phiên.** Quá nhiều = không ai trả lời sâu.

## Tham chiếu
- Thiết kế: `🧭 Bản Đồ Cuộc Đời - Skills.md` (mục 7)
