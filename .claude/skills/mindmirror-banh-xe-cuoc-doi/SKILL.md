---
name: mindmirror-banh-xe-cuoc-doi
description: >-
  Đánh giá Bánh xe cuộc đời từ dữ liệu và tự chấm điểm của người dùng; đọc Me.md, Bản Đồ Cuộc Đời và trạng thái gần nhất; xác định khoảng lệch, chiều đòn bẩy và một thử nghiệm cải thiện 7 ngày; có thể lưu snapshot và tạo nhắc lịch khi được đồng ý. Trigger: "bánh xe cuộc đời", "chấm điểm cuộc sống", "cuộc sống đang lệch ở đâu", "tôi cần cải thiện mặt nào", "review 8 chiều cuộc sống".
version: 1.0.0
author: MindMirror
license: Private
metadata:
  hermes:
    tags: [mindmirror, banh-xe-cuoc-doi, can-bang, review-ca-nhan]
    related_skills: [mindmirror-ban-do-cuoc-doi, mindmirror-ve-banh-xe-cuoc-doi, mindmirror-co-van-ca-nhan]
---

# MindMirror — Bánh Xe Cuộc Đời

## Mục đích

Biến Bánh xe cuộc đời từ một bài chấm điểm cảm tính thành **vòng review có bằng chứng và hành động**:

```text
Dữ liệu gần đây → Tự chấm có xác nhận → Nhìn khoảng lệch → Chọn đòn bẩy → Thử 7 ngày → Review
```

Skill giúp người dùng thấy toàn cảnh nhưng chỉ chọn **một chiều ưu tiên**. Nó không cố làm mọi vùng của cuộc sống đạt 10/10 và không dùng “cân bằng” như một chuẩn đạo đức.

## Phạm vi và quan hệ với skill khác

| Skill | Vai trò |
|---|---|
| `mindmirror-ban-do-cuoc-doi` | Phỏng vấn sâu để xây hồ sơ và tầm nhìn tổng thể |
| `mindmirror-banh-xe-cuoc-doi` | Đánh giá hiện trạng, khoảng lệch, đòn bẩy và hành động |
| `mindmirror-ve-banh-xe-cuoc-doi` | Render biểu đồ từ dữ liệu điểm đã được xác nhận |
| `mindmirror-co-van-ca-nhan` | Cố vấn một quyết định cụ thể |

Không dùng skill này để chẩn đoán sức khỏe, tâm lý, quan hệ hay tài chính. Khi một chiều có rủi ro nghiêm trọng, ưu tiên an toàn và chuyên gia phù hợp.

## Tám chiều mặc định

Nếu `3. Chuyển Hoá/Bản Đồ/Bản Đồ Cuộc Đời.base` đã có hệ chiều riêng, giữ nguyên hệ đó. Nếu chưa có, dùng tám chiều:

1. Tri thức & Tư duy.
2. Sức khỏe & Thể chất.
3. Sự nghiệp & Kinh doanh.
4. Tài chính.
5. Quan hệ & Gia đình.
6. Sáng tạo & Đóng góp.
7. Phát triển bản thân.
8. Ý nghĩa & Tâm linh.

Không tự trộn hệ 8 chiều với hệ 15 chiều. Nếu dữ liệu cũ dùng hệ khác, tạo bảng ánh xạ và xin người dùng xác nhận trước khi so xu hướng.

## Nguyên tắc

### Điểm do người dùng xác nhận

AI có thể đọc dữ liệu để gợi ý câu hỏi hoặc một khoảng điểm, nhưng không được tự gán điểm chính xác cho sức khỏe, tình yêu, tài chính hoặc mức hài lòng. Điểm cuối cùng phải do người dùng xác nhận.

### Điểm không phải sự thật tuyệt đối

Mỗi điểm cần đi kèm:

- lý do ngắn;
- một bằng chứng hoặc sự kiện gần đây;
- mức tự tin `cao / vừa / thấp`.

### Không ưu tiên chiều thấp nhất một cách máy móc

Chiều cần ưu tiên là giao của:

- khoảng cách giữa hiện tại và mong muốn;
- mức quan trọng ở giai đoạn này;
- độ cấp bách/rủi ro;
- khả năng tạo hiệu ứng lan tỏa;
- nguồn lực thực tế.

### Một câu hỏi mỗi lượt

Nếu đang phỏng vấn điểm số, hỏi từng chiều hoặc từng câu, chờ trả lời rồi mới tiếp tục. Nếu người dùng đã cung cấp đủ bảng điểm, không hỏi lại.

### Một đòn bẩy mỗi chu kỳ

Mỗi vòng review chỉ chọn một thử nghiệm chính kéo dài 7 ngày. Các chiều khác được giữ ở mức tối thiểu an toàn.

## Quy trình vận hành

### BƯỚC 0 — Chọn chế độ review

Xác định một trong ba chế độ:

1. **Chấm mới:** chưa có dữ liệu điểm.
2. **Cập nhật:** đã có điểm kỳ trước, cần review lại.
3. **Phân tích nhanh:** người dùng đã gửi đủ điểm hiện tại và mong muốn.

Xác định kỳ review: tuần, tháng hoặc quý. Mặc định dùng tuần cho thử nghiệm hành vi và tháng cho xu hướng.

**Hoàn thành khi:** biết chế độ, kỳ review và hệ chiều đang dùng.

### BƯỚC 1 — Đọc ngữ cảnh

Đọc theo thứ tự:

1. Hướng dẫn ở gốc vault.
2. `Me.md`.
3. `3. Chuyển Hoá/Bản Đồ/Bản Đồ Cuộc Đời.base`.
4. Weekly Note mới nhất và tối đa ba Weekly Note trước đó nếu cần xu hướng.
5. Daily Note gần đây khi một chiều cần bằng chứng cụ thể.
6. Danh sách `4. Kiến Tạo/1. Đang Làm/` để biết cam kết và tải công việc hiện tại.

Chỉ đọc sâu file liên quan. Không quét toàn vault.

Tạo Context Snapshot:

- theme/chương đời hiện tại;
- ba cam kết lớn nhất;
- dấu hiệu năng lượng/sức khỏe;
- sự kiện quan hệ hoặc tài chính do người dùng đã ghi;
- điểm cũ và hành động cũ nếu có.

**Hoàn thành khi:** có 3–7 dữ kiện gần đây và nhận diện vùng thiếu dữ liệu.

### BƯỚC 2 — Thu điểm có căn cứ

Với mỗi chiều, thu bốn giá trị:

| Trường | Thang | Ý nghĩa |
|---|---:|---|
| Hiện tại | 1–10 | Mức hài lòng/thực trạng hôm nay |
| Mong muốn | 1–10 | Mức phù hợp cho giai đoạn này, không mặc định 10 |
| Quan trọng | 1–5 | Mức ảnh hưởng tới giai đoạn hiện tại |
| Tự tin | thấp/vừa/cao | Mức chắc chắn của điểm hiện tại |

Mẫu hỏi một chiều:

> “Với [chiều], bạn tự chấm hiện tại bao nhiêu trên 10? Dữ kiện gần đây nào khiến bạn chọn điểm đó?”

Sau đó hỏi mức mong muốn và quan trọng nếu chưa có. Không hỏi cả 8 chiều trong một tin nhắn nếu người dùng đang trả lời hội thoại.

**Hoàn thành khi:** mỗi chiều có điểm hiện tại được xác nhận; điểm thiếu được đánh dấu `?`.

### BƯỚC 3 — Kiểm tra chất lượng điểm

Đối chiếu điểm với dữ liệu gần đây để phát hiện, không phải bác bỏ:

- điểm cao nhưng không có bằng chứng;
- điểm thấp do một sự kiện nhất thời;
- tiêu chuẩn lý tưởng không thực tế;
- hai chiều đang phụ thuộc hoặc xung đột;
- điểm thay đổi mạnh so với kỳ trước.

Nếu có mâu thuẫn lớn, phản chiếu và hỏi một câu xác nhận. Quyền chấm điểm cuối cùng thuộc người dùng.

**Hoàn thành khi:** bảng điểm có ghi chú về spike, xu hướng và độ tin cậy.

### BƯỚC 4 — Phân tích khoảng lệch và đòn bẩy

Tính khi có đủ số liệu:

```text
Khoảng lệch = Mong muốn - Hiện tại
Chỉ số ưu tiên tham khảo = Khoảng lệch × Mức quan trọng
```

Nếu cần tính nhiều điểm, dùng công cụ tính toán thay vì nhẩm. Chỉ số là heuristic (quy tắc gợi ý), không phải chẩn đoán.

Sau đó đánh giá bốn lớp:

1. **Nền an toàn:** chiều nào xuống dưới mức tối thiểu cần xử lý trước?
2. **Nút thắt:** chiều nào đang làm kẹt nhiều chiều khác?
3. **Đòn bẩy:** cải thiện nhỏ ở đâu tạo hiệu ứng lan tỏa lớn nhất?
4. **Đúng thời điểm:** chiều nào phù hợp theme và cam kết hiện tại?

Không chọn ưu tiên chỉ vì điểm thấp nhất. Ví dụ, sức khỏe 6/10 có thể là đòn bẩy cao hơn một sở thích 3/10 nếu năng lượng đang làm kẹt mọi dự án.

**Hoàn thành khi:** chọn một chiều ưu tiên và nêu rõ vì sao không chọn hai chiều cạnh tranh gần nhất.

### BƯỚC 5 — Tìm nguyên nhân có thể kiểm soát

Với chiều ưu tiên, tách:

- **Dữ kiện:** điều đã xảy ra.
- **Diễn giải:** câu chuyện người dùng đang kể.
- **Pattern:** hành vi lặp lại có bằng chứng.
- **Điều kiện môi trường:** lịch, người, công cụ, tiền, không gian.
- **Đòn bẩy kiểm soát được:** hành động nhỏ trong 7 ngày.

Không quy mọi vấn đề về kỷ luật cá nhân. Nếu nguyên nhân thuộc hệ thống hoặc giới hạn thật, thiết kế môi trường thay vì trách móc.

### BƯỚC 6 — Thiết kế thử nghiệm 7 ngày

Thử nghiệm phải có:

- một hành vi chính;
- tần suất hoặc trigger cụ thể;
- giới hạn tối thiểu để tránh quá tải;
- một chỉ số dẫn dắt có thể kiểm soát;
- một dấu hiệu kết quả;
- ngày review;
- điều kiện giữ, sửa hoặc dừng.

Mẫu:

> Trong 7 ngày, sau [trigger], thực hiện [hành vi] trong tối đa [thời lượng]. Theo dõi [chỉ số dẫn dắt]. Review ngày [date]; giữ nếu [ngưỡng], sửa nếu [điều kiện], dừng nếu [rủi ro].

Chỉ chốt một thử nghiệm chính. Có thể thêm “mức sàn” cho các chiều an toàn như ngủ, ăn, thuốc hoặc nghĩa vụ gia đình, nhưng không biến thành danh sách mục tiêu mới.

### BƯỚC 7 — Nhắc lịch và review

Chỉ tạo nhắc việc khi người dùng đồng ý rõ. Nếu môi trường có công cụ lịch/nhắc/cron:

1. xác nhận thời điểm và múi giờ;
2. xác nhận nơi nhận nhắc;
3. tạo một nhắc hành động nếu cần;
4. tạo một nhắc review sau 7 ngày;
5. đọc lại lịch đã tạo để xác minh.

Nếu không có kênh giao thông báo, tạo block nhắc trong Weekly/Daily Note thay vì hứa sẽ nhắn tự động.

**Hoàn thành khi:** người dùng biết hành động, thời điểm review và cơ chế nhắc thật sự khả dụng.

## Định dạng output

```markdown
## Ảnh chụp Bánh xe cuộc đời — YYYY-MM-DD

| Chiều | Hiện tại | Mong muốn | Quan trọng | Khoảng lệch | Tự tin |
|---|---:|---:|---:|---:|---|
| ... | | | | | |

## Quan sát chính

- **Nền mạnh:** ...
- **Vùng cần bảo vệ:** ...
- **Nút thắt:** ...
- **Chiều đòn bẩy:** ...

## Vì sao ưu tiên chiều này

[Dữ kiện → diễn giải → khuyến nghị.]

## Thử nghiệm 7 ngày

- **Hành vi:** ...
- **Trigger/tần suất:** ...
- **Giới hạn:** ...
- **Chỉ số dẫn dắt:** ...
- **Ngày review:** ...
- **Ngưỡng giữ/sửa/dừng:** ...

## Độ chắc chắn

- Đã biết: ...
- Đang suy luận: ...
- Còn thiếu: ...
```

## Lưu và cập nhật vault

Mặc định không tự lưu. Khi người dùng đồng ý:

1. Nếu là review tuần, thêm section theo `templates/snapshot-banh-xe-cuoc-doi.md` vào Weekly Note hiện tại.
2. Cập nhật cột “Hiện trạng” trong `3. Chuyển Hoá/Bản Đồ/Bản Đồ Cuộc Đời.base` chỉ khi người dùng muốn đồng bộ bản đồ hiện tại.
3. Nếu thử nghiệm có deadline và output riêng, tạo Kiến Tạo Active đúng frontmatter.
4. Nếu cần hình, gọi `mindmirror-ve-banh-xe-cuoc-doi` sau khi điểm đã được xác nhận.
5. Không ghi chi tiết nhạy cảm vào bản đồ công khai; có thể ghi tóm tắt trung tính hoặc giữ trong cuộc trò chuyện.

## Lỗi phải tránh

1. Tự chấm điểm thay người dùng.
2. Ép mọi chiều đạt 10/10.
3. Chọn chiều thấp nhất mà không xét cấp bách và đòn bẩy.
4. So sánh hệ 8 chiều với hệ 15 chiều mà không ánh xạ.
5. Dùng một ngày tệ để kết luận xu hướng tháng.
6. Đưa tám kế hoạch cải thiện cùng lúc.
7. Tự tạo lịch nhắc hoặc cron khi chưa được đồng ý.
8. Hứa sẽ thông báo khi môi trường không có kênh giao.
9. Biến vấn đề hệ thống thành lỗi kỷ luật cá nhân.
10. Lưu dữ liệu sức khỏe, quan hệ hoặc tài chính nhạy cảm vào nơi không phù hợp.

## Checklist hoàn tất

- [ ] Đã chọn đúng chế độ và hệ chiều.
- [ ] Đã đọc Me.md, Bản Đồ Cuộc Đời và trạng thái gần nhất.
- [ ] Điểm hiện tại do người dùng xác nhận; thiếu dùng `?`.
- [ ] Mỗi điểm có lý do/bằng chứng và độ tự tin khi khả thi.
- [ ] Đã kiểm tra spike, xu hướng và mâu thuẫn.
- [ ] Chọn một chiều theo nền an toàn × khoảng lệch × đòn bẩy × thời điểm.
- [ ] Nêu vì sao không chọn các chiều cạnh tranh.
- [ ] Chốt đúng một thử nghiệm 7 ngày.
- [ ] Nhắc lịch chỉ được tạo sau đồng ý và đã xác minh kênh.
- [ ] Chỉ lưu khi được đồng ý và giữ đúng ranh giới riêng tư.
