---
title: {{title}}
type: log
subtype: meeting
date: {{date:YYYY-MM-DD}}
time: {{time:HH:mm}}
duration: ""                              # 30min / 1h / 2h
attendees: []                             # ["Anh Thắng", "Chị Hằng", ...]
chair: ""                                 # người chủ trì
location: ""                              # online / phòng họp / quán cafe
project: ""                               # OPTIONAL: "[[Dự án X]]" nếu thuộc 1 project
problem: ""                               # OPTIONAL: "[[Vấn đề - Y]]" nếu họp để giải 1 problem
status: scheduled                         # scheduled | done | cancelled | rescheduled
created: {{date:DD-MM-YYYY}}
updated: {{date:DD-MM-YYYY}}
llm_managed: true
tags: [meeting]
---
`Tags`: #meeting

# Họp: {{title}}

## 0) Mục tiêu cuộc họp (1 câu)
- Cuộc họp này để: ___
- Tiêu chí "thành công" (xong họp đạt được gì):

## 1) Agenda
- [ ] Topic 1 (XX phút):
- [ ] Topic 2 (XX phút):
- [ ] Topic 3 (XX phút):

## 2) Nội dung thảo luận

### Topic 1: ___
- **Người trình bày**:
- **Nội dung chính**:
- **Phản đối / câu hỏi**:
- **Kết luận**:

### Topic 2: ___
- **Người trình bày**:
- **Nội dung chính**:
- **Kết luận**:

## 3) Quyết định (Decisions)
> Mỗi quyết định PHẢI có owner + deadline. Không owner = không decision.

- [ ] **Quyết định 1**: ___ — Owner: ___ — Deadline: ___
- [ ] **Quyết định 2**: ___ — Owner: ___ — Deadline: ___

## 4) Action items (đưa vào TASKS.md)
- [ ] [@Owner] Việc 1 — Deadline: ___
- [ ] [@Owner] Việc 2 — Deadline: ___
- [ ] [@Owner] Việc 3 — Deadline: ___

## 5) Vấn đề mở / cần follow-up
- Vấn đề 1: → cần thảo luận tiếp ở meeting tới / tách thành [[Vấn đề - ...]]
- Vấn đề 2:

## 6) Insight / bài học rút ra
- 1 điều cần ghi nhớ:
- 1 điều cần làm khác lần sau:

## 7) Liên kết

**Cấu trúc:**
- Project: [[...]]
- Problem hub: [[Vấn đề - ...]]

**Phụ thuộc:**
- Decision dựa trên: [[concept-X]] / [[method-Y]]
- Meeting trước: [[Họp - ngày trước]]
- Meeting sau (nếu có): [[Họp - ngày sau]]
