---
title: {{title}}
type: methodology
area: ai
status: seed
problem: ""
sources:
  - "path/to/source.md"
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
llm_managed: true
tags: [method, ai, prompt-engineering, template, reusable-prompt]
aliases: []
---

# Prompt template: {{title}}

## 1) Dùng để làm gì?
- Prompt này được thiết kế để giải quyết việc gì?
- Output cuối cùng mong muốn là gì?
- Một câu mô tả ngắn: "Dùng khi cần ..."

## 2) Khi nào nên dùng / không nên dùng

**Nên dùng khi**
- 
- 
- 

**Không nên dùng khi**
- 
- 
- 

## 3) Input cần điền trước khi chạy
- Bối cảnh / context:
- Mục tiêu / objective:
- Audience / người đọc:
- Dữ liệu đầu vào / input data:
- Ràng buộc / constraints:
- Format đầu ra mong muốn:

## 4) Prompt template

```txt
[ROLE]
Bạn là ...

[CONTEXT]
Bối cảnh:
...

[TASK]
Nhiệm vụ:
...

[INPUT]
Dữ liệu đầu vào:
...

[CONSTRAINTS]
Ràng buộc:
...

[OUTPUT FORMAT]
Trả về theo format:
...
```

## 5) Output mong đợi
- AI nên trả về cái gì?
- Thế nào là output tốt?
- Các tiêu chí để chấm prompt này hoạt động ổn:
  - 
  - 
  - 

## 6) Ví dụ điền thật

**Input mẫu**
- Context:
- Task:
- Constraints:
- Output format:

**Prompt hoàn chỉnh**

```txt
...
```

**Kết quả kỳ vọng**
- 
- 
- 

## 7) Checklist debug nhanh
- Role đã đủ rõ chưa?
- Task có đủ cụ thể chưa?
- Input có thiếu dữ liệu quan trọng không?
- Constraints có ngăn AI đoán mò không?
- Output format có đủ rõ để copy dùng ngay không?
- Có example nếu task phức tạp không?

## 8) Biến thể / cách nâng cấp
- Có thể thêm few-shot examples khi:
- Có thể tách thành prompt chain khi:
- Có thể thêm rubric/evaluation khi:
- Có thể thêm Socratic clarification khi:

## 9) Liên kết ngang (1–2 câu)
- Prompt này thuộc cụm prompt-engineering và nên dùng cùng các note phương pháp liên quan để tăng độ ổn định output.
- Nếu prompt còn fail hoặc output lệch, xem thêm các note debug, chaining, rubric hoặc persona tương ứng.

## 10) Liên quan đến
- prompt-engineering
- cach-viet-hybrid-prompt-template
- debug-prompt-trong-60-giay
