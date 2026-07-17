---
name: mindmirror-phan-tich-nang-luc-nghe-nghiep
description: >-
  Phân tích mức độ phù hợp giữa một người với nghề, vai trò hoặc hướng sự nghiệp dựa trên dữ liệu thật trong MindMirror; đối chiếu năng lực, giá trị, bằng chứng, năng lượng, triển vọng và cái giá; chỉ ra khoảng thiếu và thiết kế thử nghiệm nghề nghiệp có thời hạn. Trigger: "tôi hợp nghề gì", "tôi có hợp làm X không", "phân tích năng lực", "định hướng nghề nghiệp", "đổi nghề", "chọn hướng sự nghiệp".
version: 1.0.0
author: MindMirror
license: Private
metadata:
  hermes:
    tags: [mindmirror, nang-luc, nghe-nghiep, huong-nghiep]
    related_skills: [mindmirror-co-van-ca-nhan, mindmirror-ban-do-cuoc-doi]
---

# MindMirror — Phân Tích Năng Lực Và Nghề Nghiệp

## Mục đích

Biến dữ liệu trong Second Brain thành một **bản đồ phù hợp nghề nghiệp có bằng chứng**. Skill không dùng bài trắc nghiệm chung để gắn nhãn con người, không chọn nghề theo xu hướng và không chỉ lặp lại danh sách điểm mạnh. Kết quả phải chỉ ra:

1. Người dùng đang cân nhắc nghề/vai trò nào và trong thời hạn nào.
2. Yêu cầu thực tế của hướng đó là gì.
3. Điểm nào đã có bằng chứng, điểm nào mới là tự nhận định.
4. Khoảng thiếu nào có thể học, khoảng nào là trade-off dài hạn.
5. Một thử nghiệm nhỏ nào tạo thêm bằng chứng trước khi cam kết lớn.

## Khi nào dùng

Dùng khi người dùng hỏi:

- “Tôi có hợp làm AI/coach/creator/quản lý không?”
- “Tôi nên theo nghề nào hoặc chuyển sang hướng nào?”
- “Điểm mạnh của tôi có thể tạo giá trị trong vai trò nào?”
- “Tôi thiếu gì để làm nghề X?”
- “So sánh mức độ phù hợp giữa hai hướng sự nghiệp.”

Không dùng khi:

- câu hỏi là một quyết định cá nhân tổng quát không tập trung vào nghề — dùng `mindmirror-co-van-ca-nhan`;
- người dùng cần xây lại hồ sơ bản thân từ đầu — dùng `mindmirror-ban-do-cuoc-doi`;
- người dùng chỉ cần thông tin tuyển dụng hoặc mức lương hiện tại — làm nghiên cứu thị trường riêng;
- tình huống cần tư vấn pháp lý, y tế hoặc tài chính có trách nhiệm chuyên môn.

## Nguyên tắc

### Vault-first

Đọc dữ liệu thật trước khi kết luận. Dùng lời người dùng và sản phẩm/hành động đã có làm bằng chứng; không coi tuyên bố “tôi giỏi X” ngang với kết quả quan sát được.

### Người × Nghề × Thời điểm

“Phù hợp” không phải thuộc tính cố định. Phải đánh giá đồng thời:

- **Người:** giá trị, năng lực, pattern, năng lượng.
- **Nghề:** nhiệm vụ cốt lõi, tiêu chuẩn đầu ra, môi trường, kinh tế.
- **Thời điểm:** ưu tiên, nguồn lực, trách nhiệm và mức sẵn sàng hiện tại.

### Phân biệt bốn lớp

- **Dữ kiện cá nhân:** đã được ghi/xác nhận trong vault.
- **Yêu cầu nghề:** đến từ mô tả vai trò, nguồn thị trường hoặc giả thuyết được nêu rõ.
- **Suy luận phù hợp:** cách AI nối hai lớp trên.
- **Khuyến nghị:** hướng đi hoặc thử nghiệm đề xuất.

### Không định mệnh hóa

Không dùng MBTI, DISC, thần số học, Bát Tự hoặc một bài test đơn lẻ để kết luận nghề. Nếu người dùng muốn dùng, chỉ coi đó là lăng kính phản tư và phải đối chiếu với hành vi thật.

### Một câu hỏi mỗi lượt

Nếu thiếu dữ kiện làm thay đổi nhánh phân tích, hỏi đúng một câu quan trọng nhất. Không hỏi lại dữ kiện đã có trong vault.

## Quy trình vận hành

### BƯỚC 0 — Đóng khung câu hỏi nghề nghiệp

Chuyển yêu cầu thành:

> “Trong [thời hạn], tôi có nên thử/đầu tư/chuyển sang [nghề hoặc vai trò] để đạt [kết quả], với [ràng buộc] hay không?”

Xác định dạng bài toán:

| Dạng | Cách xử lý |
|---|---|
| Một nghề | Đánh giá phù hợp + gap + thử nghiệm |
| Hai hướng | Chấm cùng tiêu chí và chỉ ra trade-off |
| Chưa biết nghề | Tạo 2–4 giả thuyết nghề từ bằng chứng, không đưa danh sách dài |
| Chuyển nghề | Đánh giá tài sản chuyển đổi, runway và cầu nối |
| Nâng cấp vai trò | So hiện trạng với tiêu chuẩn cấp tiếp theo |

Nếu chưa có nghề/vai trò đích, hỏi: “Trong ba năm tới, bạn muốn công việc mang lại điều gì nhất mà hiện tại chưa có?”

**Hoàn thành khi:** có một câu hỏi nghề nghiệp, thời hạn và ràng buộc chính.

### BƯỚC 1 — Đọc nền tảng cá nhân

Đọc theo thứ tự:

1. File hướng dẫn ở gốc vault (`CLAUDE.md`, `AGENTS.md` hoặc file tương đương).
2. `Me.md`.
3. `3. Chuyển Hoá/Bản Đồ/Bản Đồ Cuộc Đời.base` nếu có.
4. Weekly Note mới nhất và Daily Note gần nhất nếu liên quan.
5. Tên dự án trong `4. Kiến Tạo/1. Đang Làm/`, sau đó mở dự án có liên quan.
6. Nếu hướng nghề thuộc founder/business: đọc Business Context và file `Chân Dung CEO*.md` đang hoạt động nếu có; bỏ qua placeholder.

Trích Evidence Pack cá nhân:

- 3–7 năng lực hoặc pattern có liên quan;
- 2–5 đầu ra/hành động chứng minh;
- tín hiệu năng lượng: việc tạo flow, việc gây cạn kiệt;
- giá trị và ranh giới không nên đánh đổi;
- nguồn lực/ràng buộc hiện tại.

**Hoàn thành khi:** mỗi nhận định quan trọng có nguồn và biết điểm nào chỉ là tự khai báo.

### BƯỚC 2 — Xây Bản mô tả nghề tối thiểu

Thu thập sáu phần về nghề/vai trò đích:

1. Nhiệm vụ lặp lại hàng tuần.
2. Đầu ra được trả tiền hoặc được đánh giá.
3. Năng lực ngưỡng bắt buộc.
4. Môi trường làm việc và nhịp độ.
5. Con đường tạo thu nhập/cơ hội.
6. Cái giá và rủi ro thường gặp.

Ưu tiên nguồn theo thứ tự:

- mô tả/brief người dùng cung cấp;
- tài liệu nghề nghiệp trong vault;
- nguồn thị trường hiện tại nếu có công cụ tìm kiếm;
- giả thuyết được ghi rõ nếu chưa thể kiểm chứng.

Không đánh giá một nghề chỉ từ hình ảnh hấp dẫn hoặc tên gọi. Phải phân tích công việc lặp lại thật sự.

**Hoàn thành khi:** có bản mô tả nghề đủ để so khớp, và nguồn/độ tin cậy cho từng phần.

### BƯỚC 3 — Lập Ma trận Phù hợp 6P

Dùng thang 1–5 hoặc `?` khi thiếu dữ liệu:

| P | Nội dung | Câu hỏi kiểm tra |
|---|---|---|
| **Purpose — Mục đích** | WHY, giá trị, chương đời | Công việc này phục vụ điều người dùng tin và muốn đóng góp không? |
| **Proficiency — Năng lực** | kỹ năng và khả năng học | Các nhiệm vụ cốt lõi dùng điểm mạnh nào; thiếu năng lực ngưỡng nào? |
| **Proof — Bằng chứng** | sản phẩm, kết quả, phản hồi | Đã có đầu ra hoặc người thật xác nhận chưa? |
| **Pull — Sức hút/năng lượng** | tò mò, flow, sức bền | Người dùng thích công việc hằng ngày hay chỉ thích danh tính nghề? |
| **Prospects — Triển vọng** | nhu cầu, thu nhập, đường vào | Có cơ hội thực tế phù hợp mục tiêu và bối cảnh không? |
| **Price — Cái giá** | thời gian, tiền, sức khỏe, quan hệ | Cái giá học và làm nghề có chấp nhận được không? |

Quy tắc chấm:

- `1`: xung đột mạnh hoặc chưa đáp ứng ngưỡng.
- `3`: có tín hiệu nhưng bằng chứng chưa đủ.
- `5`: khớp mạnh và có bằng chứng lặp lại.
- `?`: chưa có dữ liệu; không chấm bừa.

Không cộng điểm máy móc nếu có điều kiện loại như vi phạm giá trị, rủi ro an toàn hoặc cái giá không thể chấp nhận.

**Hoàn thành khi:** nhìn thấy chiều mạnh, chiều yếu, điều kiện loại và trade-off chính.

### BƯỚC 4 — Phân loại khoảng thiếu

Mỗi gap phải thuộc một nhóm:

| Gap | Câu hỏi |
|---|---|
| Kiến thức | Chưa biết điều gì? |
| Kỹ năng | Chưa thực hiện được nhiệm vụ nào? |
| Bằng chứng | Làm được nhưng chưa có output/case/feedback? |
| Môi trường | Thiếu cộng đồng, mentor, dữ liệu, công cụ hoặc quyền tiếp cận? |
| Kinh tế | Chưa có runway, đường kiếm tiền hoặc mức chấp nhận rủi ro? |
| Bản sắc/năng lượng | Công việc xung đột giá trị hay chỉ khó vì đang mới? |

Phân biệt:

- **Gap có thể huấn luyện:** học và luyện có thể thu hẹp.
- **Gap cần kiểm chứng:** chưa đủ dữ liệu để biết.
- **Trade-off dài hạn:** bản chất công việc đòi cái giá người dùng không muốn trả.

**Hoàn thành khi:** có tối đa ba gap ưu tiên và biết loại xử lý của từng gap.

### BƯỚC 5 — Tạo bản đồ hướng đi

Chọn tối đa ba giả thuyết:

1. **Hướng chính:** khớp tốt nhất với bằng chứng hiện tại.
2. **Hướng kề:** dùng cùng tài sản nhưng ít cái giá hơn.
3. **Vai trò cầu nối:** tạo bằng chứng/thu nhập trước khi chuyển hẳn.

Không đưa 10–20 nghề chung chung. Với mỗi hướng, ghi:

- vì sao phù hợp;
- bằng chứng hiện có;
- rủi ro lớn nhất;
- điều gì cần xảy ra để đi tiếp.

**Hoàn thành khi:** người dùng hiểu lựa chọn thực tế, không chỉ nhận một nhãn nghề.

### BƯỚC 6 — Kết luận có điều kiện

Chọn một kết luận:

- **Phù hợp để đầu tư:** đã có khớp và bằng chứng đủ mạnh.
- **Phù hợp có điều kiện:** hướng đúng nhưng cần giới hạn/gap cụ thể.
- **Nên thử nhỏ trước:** tín hiệu tốt nhưng Proof hoặc Prospects còn yếu.
- **Chưa phù hợp lúc này:** thời điểm/nguồn lực chưa đúng, không đồng nghĩa không bao giờ phù hợp.
- **Không nên ưu tiên:** xung đột giá trị hoặc cái giá dài hạn quá lớn.

Nêu rõ điều gì có thể khiến kết luận đổi chiều.

### BƯỚC 7 — Thiết kế thử nghiệm nghề nghiệp

Thử nghiệm kéo dài 7–30 ngày và phải có:

- một nhiệm vụ giống công việc thật;
- một output có thể xem;
- ít nhất một người dùng/khách hàng/chuyên gia phản hồi nếu khả thi;
- giới hạn thời gian/tiền;
- ba tín hiệu: năng lực, năng lượng, giá trị thị trường;
- ngày review và ngưỡng đi tiếp/dừng/đổi giả thuyết.

Ví dụ cấu trúc:

> Trong 14 ngày, tạo [output] cho [đối tượng thật] trong tối đa [X giờ]. Thu [N phản hồi]. Đi tiếp nếu chất lượng đạt [ngưỡng], người dùng còn muốn làm sau vòng đầu và có tín hiệu nhu cầu thật.

**Hoàn thành khi:** thử nghiệm tạo được bằng chứng mới thay vì chỉ học thêm.

## Định dạng output

```markdown
## Kết luận

**Mức phù hợp:** [Phù hợp để đầu tư / Có điều kiện / Thử nhỏ / Chưa phù hợp lúc này / Không nên ưu tiên]

## Evidence Pack

- **Dữ kiện cá nhân:** ... — nguồn: `[[...]]`
- **Bằng chứng hành vi/output:** ... — nguồn: `[[...]]`
- **Yêu cầu nghề:** ... — nguồn/độ tin cậy: ...
- **Phản biện hoặc rủi ro:** ...

## Ma trận 6P

| Chiều | Điểm | Bằng chứng | Khoảng thiếu |
|---|---:|---|---|
| Purpose | /5 | | |
| Proficiency | /5 | | |
| Proof | /5 | | |
| Pull | /5 | | |
| Prospects | /5 | | |
| Price | /5 | | |

## Hướng đi

1. **Hướng chính:** ...
2. **Hướng kề/cầu nối:** ...

## Thử nghiệm tiếp theo

**Trong [thời hạn]:** ...

**Đo:** năng lực / năng lượng / nhu cầu thị trường.

## Độ chắc chắn

- Đã biết: ...
- Đang suy luận: ...
- Còn thiếu: ...
```

## Lưu kết quả

Mặc định không tự lưu. Khi người dùng đồng ý:

- phân tích nghề từ trải nghiệm cá nhân → `2. Tinh Lọc/Kiến Thức Nguồn/LN — Phù hợp nghề [Tên] — YYYY-MM-DD.md`;
- thử nghiệm có deadline → `4. Kiến Tạo/1. Đang Làm/Thử nghiệm nghề [Tên].md` với `tags: [mint]`, `rank`, `deadline`;
- chỉ cập nhật `Me.md` khi người dùng xác nhận một năng lực/pattern bền vững;
- dùng template `templates/bao-cao-phu-hop-nghe.md` nếu cần lưu báo cáo.

Không chuyển dữ liệu riêng tư sang hồ sơ công khai hoặc Business Context nếu chưa được đồng ý.

## Lỗi phải tránh

1. Chọn nghề từ tính cách hoặc huyền học.
2. Đánh đồng thích nội dung về nghề với thích công việc hằng ngày của nghề.
3. Chỉ tìm bằng chứng ủng hộ và bỏ qua cái giá.
4. Dùng nhu cầu thị trường lỗi thời như dữ kiện hiện tại.
5. Chấm điểm khi chưa có nguồn.
6. Khuyên nghỉ việc/chuyển nghề ngay khi chưa có thử nghiệm và runway.
7. Tạo kế hoạch học dài nhưng không tạo output cho người thật.
8. Gắn nhãn điểm yếu cố định thay vì tách gap có thể huấn luyện.

## Checklist hoàn tất

- [ ] Có nghề/vai trò, thời hạn và ràng buộc rõ.
- [ ] Đã đọc Me.md, trạng thái gần nhất và bằng chứng dự án.
- [ ] Có bản mô tả công việc thực, không chỉ tên nghề.
- [ ] Tách dữ kiện cá nhân, yêu cầu nghề, suy luận và khuyến nghị.
- [ ] Ma trận 6P có nguồn; thiếu dữ liệu dùng `?`.
- [ ] Có ít nhất hai bằng chứng ủng hộ và một phản biện.
- [ ] Gap được phân loại và giới hạn tối đa ba.
- [ ] Kết luận có điều kiện đổi chiều.
- [ ] Chốt đúng một thử nghiệm nghề nghiệp.
- [ ] Không tự lưu hoặc công khai dữ liệu cá nhân.
