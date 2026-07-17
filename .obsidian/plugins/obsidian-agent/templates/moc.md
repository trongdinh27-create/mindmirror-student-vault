---
title: {{title}}
type: moc
area: ""                                  # lĩnh vực (brain / marketing / problem-solving / data / finance / ...)
status: growing                           # seed | growing | evergreen
created: {{date:DD-MM-YYYY}}
updated: {{date:DD-MM-YYYY}}
llm_managed: true
tags: [moc, navigation]
aliases: []
---
# MOC: {{title}}

> Map of Content — bản đồ navigation cho cluster {{title}}. Đọc note này để biết bắt đầu từ đâu, đi theo path nào.
> ⚠️ Quy ước: section nào KHÔNG có nội dung cho cluster này → **BỎ HẲN heading** (đừng để placeholder rỗng). Cụm nhỏ thường chỉ cần: Bản đồ + Câu hỏi cốt lõi + Entry point + Concept nền.

## Bản đồ kiến thức
> Cây tổng quan tới **cấp nhóm / sub-MOC** — KHÔNG liệt note lẻ (note lẻ nằm ở section 2–6, tránh trùng & double-maintenance). Cập nhật khi thêm/bớt nhóm hoặc tách sub-MOC.

```text
{{title}}
│
├── Nhóm 1 — TÊN NHÓM (≈n note)
├── Nhóm 2 — TÊN NHÓM (≈n note)
├── moc-sub-1 — sub-cluster về ___ (≈n note)
└── Nhóm N — TÊN NHÓM (≈n note)
```

## Câu hỏi cốt lõi
> Cluster {{title}} trả lời những câu hỏi nền nào? (3-5 câu — đọc xong cluster phải trả lời được). Đây là "la bàn" định hướng toàn bộ MOC.

- ___?
- ___?
- ___?

## 0) MOC này dùng để làm gì? (1 câu)
- Cluster {{title}} nói về ___
- Đọc xong cluster này, người đọc sẽ ___

## 1) Entry point — bắt đầu đọc từ đâu?
> Note quan trọng nhất phải đọc đầu tiên (1-3 cái thôi, nhiều quá là spam).

- 🚪 [[note-overview]] — overview tổng cluster (đọc 1st)
- 🚪 [[concept-cot-loi]] — concept cốt lõi cần hiểu trước
- 🚪 [[entry-practical]] — practical entry nếu muốn dùng ngay

## 2) Concept nền (Foundational concepts)
> Khái niệm là building block — không hiểu = không hiểu cluster.

- [[concept-1]] — vai trò trong cluster: ___
- [[concept-2]] — vai trò: ___
- [[concept-3]] — vai trò: ___

## 3) Method / Phương pháp
> "Cách làm" — concrete steps để áp dụng concept.

- [[method-1]] — khi nào dùng: ___
- [[method-2]] — khi nào dùng: ___

## 4) Pattern / Framework
> Pattern verified rule of 3, framework dùng được.

- [[pattern-1]] — pattern khi: ___
- [[framework-1]] — dùng cho: ___

## 5) Case study / Ví dụ áp dụng
> Concrete instance — concept/method được dùng trong case nào.

- [[case-1]] — ngữ cảnh: ___ → outcome: ___
- [[case-2]] — ngữ cảnh: ___ → outcome: ___

## 6) Sub-MOC (nếu cluster lớn)
> Khi cluster có >20 atomic note → tách sub-cluster + sub-MOC.

- [[moc-sub-1]] — sub-cluster về ___ (___ note)
- [[moc-sub-2]] — sub-cluster về ___ (___ note)

## 7) Reading path đề xuất
> Thứ tự đọc tối ưu cho người mới — cognitive load thấp dần.

1. **Basic**: [[note-A]] → [[note-B]]
2. **Intermediate**: [[note-C]] → [[note-D]]
3. **Advanced**: [[note-E]] → [[note-F]]

## 8) Liên kết ngang (cluster khác)
> Bridge note — cluster này overlap / phụ thuộc / mâu thuẫn với cluster khác.

**Cấu trúc:**
- [[moc-cluster-cha]] — cluster này là phần của ___

**Phụ thuộc:**
- Cluster này cần [[moc-tien-de]] làm nền
- Cluster này áp dụng vào [[moc-domain]]

**Tương đồng:**
- [[moc-cluster-tuong-tu]] — cùng họ ___, khác ở [chiều nào]

**Đối lập:**
- [[moc-doi-lap]] — đối lập nguyên lý ở ___

## 9) Note còn thiếu / cần tạo (gap)
> Knowledge gap — note đáng có nhưng chưa viết.

- [ ] [[concept-can-tao-1]] — vì sao cần: ___
- [ ] [[concept-can-tao-2]] — vì sao cần: ___

## 10) Log cập nhật cluster
- `[YYYY-MM-DD]` Thêm: [[note-moi]]
- `[YYYY-MM-DD]` Sửa cấu trúc: ___
- `[YYYY-MM-DD]` Tách sub-cluster: ___

