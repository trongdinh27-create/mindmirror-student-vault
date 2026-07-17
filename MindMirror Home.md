---
obsidianUIMode: preview
tags: [home, dashboard, mindmirror]
cssclasses: [home]
---

# MindMirror Home

> Bắt tín hiệu → hiểu ý nghĩa → kết nối tri thức → tạo giá trị.

## Bắt đầu

- [[0. Bắt Đầu/00. BẮT ĐẦU Ở ĐÂY]]
- [[Me]]
- [[+ About MindMirror]]
- [[Giới Thiệu Tác Giả|Giới Thiệu Tác Giả]]

## Hệ thống 4 tầng

| Tầng | Đi đến | Câu hỏi |
|---|---|---|
| 1. Thu Thập | [[1. Thu Thập/README]] | Điều gì vừa xuất hiện? |
| 2. Tinh Lọc | [[2. Tinh Lọc/README]] | Nó có ý nghĩa gì với tôi? |
| 3. Chuyển Hoá | [[3. Chuyển Hoá/README]] | Tri thức nào có thể dùng lại? |
| 4. Kiến Tạo | [[4. Kiến Tạo/README]] | Tôi sẽ tạo ra điều gì? |
| 5. Hộp Công Cụ | [[5. Hộp Công Cụ/README]] | Template và công cụ nào cần dùng? |

## Đang làm

```dataview
TABLE WITHOUT ID file.link AS "Dự án", deadline AS "Hạn", rank AS "Ưu tiên"
FROM "4. Kiến Tạo/1. Đang Làm"
WHERE contains(tags, "mint")
SORT rank DESC
```

## Nhật ký gần đây

```dataview
LIST
FROM "2. Tinh Lọc/Nhật Ký Ngày"
SORT file.name DESC
LIMIT 7
```

## Module tùy chọn

- [[6. OPC Company 2Brain/README|Não Bộ Doanh Nghiệp — OPC Company 2Brain]]
