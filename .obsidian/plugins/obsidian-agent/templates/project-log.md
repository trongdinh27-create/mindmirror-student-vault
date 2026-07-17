---
title: {{title}}
type: log
subtype: project
project_name: {{title}}
status: active                            # active | paused | done | killed
priority: ""                              # P0 / P1 / P2
start_date: {{date:YYYY-MM-DD}}
deadline: ""
owner: ""
team: []                                  # ["Anh Thắng", "Chị Hằng"]
sponsor: ""                               # người duyệt / chịu trách nhiệm cao nhất
problem_hub: ""                           # "[[Vấn đề - ...]]" — Problem gốc mà project này giải
budget: ""                                # OPTIONAL
created: {{date:DD-MM-YYYY}}
updated: {{date:DD-MM-YYYY}}
llm_managed: true
tags: [project]
aliases: []
---
`Tags`: #project-log

# Project: {{title}}

## 0) Outcome (giải xong trông như thế nào?)
- **Tiêu chí "xong"**: (specific, measurable)
- **Dấu hiệu đo được**: (số liệu / qualitative signal)
- **Deadline**: ___
- **Định nghĩa "thất bại"**: ___ (nếu xảy ra → kill project)

## 1) Vấn đề gốc (Why this project?)
- **Vấn đề này giải**: [[Vấn đề - ...]]
- **Tại sao giải BÂY GIỜ** (urgency / opportunity cost):
- **Hệ quả nếu không giải**:

## 2) Stakeholders
- **Owner** (người chạy hằng ngày):
- **Sponsor** (người duyệt budget / strategic):
- **Team thực thi**:
- **Khách hàng / người hưởng lợi cuối**:
- **Người có thể block / từ chối**:

## 3) Scope (in/out)
**In scope** (PHẢI làm):
- ___
- ___

**Out of scope** (KHÔNG làm trong project này):
- ___
- ___

## 4) Milestones
- [ ] **M1** (deadline: ___): ___
- [ ] **M2** (deadline: ___): ___
- [ ] **M3** (deadline: ___): ___

## 5) Status hiện tại (cập nhật hằng tuần)
- **Tuần này đã làm**:
- **Tuần tới sẽ làm**:
- **% completion ước tính**: __%
- **Blocker hiện tại**:
- **Cần help từ ai**:

## 6) Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Risk 1 | H/M/L | H/M/L | ___ |
| Risk 2 | H/M/L | H/M/L | ___ |

## 7) Resources cần
- **Người**: ___ (full-time / part-time)
- **Tiền**: ___
- **Tool / phần mềm**: ___
- **Thời gian estimate**: ___ tuần / tháng

## 8) Decision log (timestamp khi có quyết định lớn)
- `[YYYY-MM-DD]` Quyết định: ___ — Lý do: ___
- `[YYYY-MM-DD]` Quyết định: ___ — Lý do: ___

## 9) Lessons learned (cập nhật khi xong / pause / kill)
- ✅ Làm tốt: ___
- ❌ Sai lầm cần tránh lần sau: ___
- 💡 Insight chiến lược:
- 📝 Note nên tạo (để tích luỹ kiến thức): [[concept-rút-ra-được]]

## 10) Liên kết

**Cấu trúc:**
- Problem hub: [[Vấn đề - ...]]
- Parent project (nếu là sub): [[...]]

**Nhân quả:**
- Project này dẫn đến: [[outcome-X]]

**Phụ thuộc:**
- Cần [[concept-A]] / [[method-B]] / [[tool-C]] để chạy
- Áp dụng [[principle-X]]

**Tương đồng:**
- Project trước có pattern giống: [[project-Y]] (lessons từ đó)

**Meeting notes liên quan:**
- [[Họp - ngày X]]
- [[Họp - ngày Y]]
