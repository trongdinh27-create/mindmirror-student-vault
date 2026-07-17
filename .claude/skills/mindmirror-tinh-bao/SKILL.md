---
name: mindmirror-tinh-bao
description: Nhận bất kỳ thông tin nào (bài báo, newsletter, transcript, thread) → phân tích qua PESTLE → đối chiếu với vault cá nhân (Me.md, Kiến Tạo Active, Tổng Kết Tuần, Kiến Thức Cốt Lõi liên quan) → ra đúng 1 insight và 1 hành động cụ thể. Khác với mindmirror-chac-loc (lưu kiến thức) — mindmirror-tinh-bao ra quyết định hành động ngay. Trigger: "lọc thông tin này", "bài này liên quan gì đến tôi", "tôi nên làm gì với thông tin này", "phân tích với vault", "check intel", "/mindmirror-tinh-bao", "ra quyết định từ bài này", "thông tin này có đáng để tôi quan tâm không".
---

# Nexus Intel — Thông Tin → Hành Động Cụ Thể

## Mục đích

Biến thông tin bên ngoài thành **1 hành động cụ thể** bằng cách lọc qua bộ não cá nhân (vault). Không lưu kiến thức, không tạo note — chỉ ra quyết định.

> **Khác với các skill khác:**
> - `mindmirror-chac-loc` = thông tin → kiến thức → lưu vault (đọc lại về sau)
> - `mindmirror-xu-ly` = input → pipeline 4 tầng → Kiến Tạo note
> - `mindmirror-tinh-bao` = **thông tin + vault → 1 insight + 1 hành động ngay**

---

## BƯỚC 1 — Nhận Input

Chấp nhận hai dạng:
- **Link URL** — tự động fetch nội dung. Ưu tiên **defuddle** (skill `/defuddle`, lệnh `defuddle parse <url> --md`) để lấy markdown sạch, bỏ quảng cáo/nav, tiết kiệm token. Fallback WebFetch nếu defuddle CLI chưa cài. **Ngoại lệ:** URL kết thúc `.md` → dùng WebFetch thẳng (đã là markdown).
- **Văn bản** — paste trực tiếp bất kỳ định dạng nào: bài báo, newsletter, transcript podcast/video, thread mạng xã hội, báo cáo thị trường, số liệu

Nhiều nguồn cùng lúc: paste/gửi lần lượt, xử lý tổng hợp sau khi nhận đủ.

---

## BƯỚC 2 — Phân Tích Nhanh

### 2A. Ngữ cảnh hoá
Rút ra **3-5 thay đổi lớn** đang diễn ra trong text — những shift về hành vi, thị trường, công nghệ, hay con người.

Không liệt kê sự kiện. Liệt kê **thay đổi**: từ A → B.

Ví dụ:
- ❌ "AI đang phát triển mạnh"
- ✅ "Người dùng chuyển từ search truyền thống → hỏi AI trực tiếp"

### 2B. Phân tích PESTLE
Nhìn thông tin qua 6 lăng kính — chỉ điền lăng kính nào có signal rõ, bỏ qua lăng kính không liên quan:

| Lăng kính | Câu hỏi cần trả lời |
|---|---|
| **P**olitical (Chính trị) | Chính sách / quy định nào đang thay đổi? |
| **E**conomic (Kinh tế) | Dòng tiền / chi phí / cơ hội kinh tế nào dịch chuyển? |
| **S**ocial (Xã hội) | Hành vi / kỳ vọng / văn hoá người dùng thay đổi thế nào? |
| **T**echnological (Công nghệ) | Công nghệ nào đang làm thay đổi cuộc chơi? |
| **L**egal (Pháp lý) | Rủi ro pháp lý / compliance nào xuất hiện? |
| **E**nvironmental (Môi trường) | Yếu tố bền vững / ESG nào ảnh hưởng? |

### 2C. Tổng hợp góc nhìn
Từ PESTLE, rút ra:
- **Cơ hội** — những cửa sổ đang mở ra
- **Thách thức** — những rào cản / nguy cơ cần chú ý

---

## BƯỚC 3 — Check Vault (Bộ Lọc Cá Nhân)

Đây là bước tạo ra sự khác biệt. Đọc theo thứ tự:

### 3A. Đọc Me.md
File: `Me.md`
Mục đích: Hiểu bối cảnh tổng thể — người dùng là ai, đang theo đuổi gì, giá trị cốt lõi là gì.

### 3B. Đọc Kiến Tạo Active
Folder: `4. Kiến Tạo/1. Đang Làm/`
Mục đích: Biết chính xác những dự án đang chạy — insight phải kết nối với ít nhất 1 dự án cụ thể.

### 3C. Đọc Tổng Kết Tuần gần nhất
Folder: `2. Tinh Lọc/Tổng Kết Tuần/`
Đọc **3-4 file gần nhất** (sort by name giảm dần).
Mục đích: Biết momentum hiện tại — tuần qua người dùng đang tập trung gì, vấp phải gì, đang nghĩ gì.

### 3D. Đọc Daily Note hôm nay
File: `2. Tinh Lọc/Nhật Ký Ngày/YYYY-MM-DD.md` (ngày hiện tại)
Mục đích: Biết context *ngay lúc này* — mood, năng lượng, việc đang bận.
Nếu file chưa có → bỏ qua, không tạo mới.

### 3E. Đọc Kiến Thức Cốt Lõi liên quan
Folder: `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`
Chỉ đọc file có **keyword trùng với chủ đề của input** — không đọc tất cả.
Mục đích: Biết người dùng đã nghĩ gì về lĩnh vực này → tránh đề xuất điều đã biết, chỉ đề xuất bước tiếp theo.

---

## BƯỚC 4 — Ra Kết Luận 80/20

Sau khi đọc xong vault, tổng hợp thành output cố định:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INTEL REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSIGHT:
[1 câu — nhận định cốt lõi nhất từ thông tin, không phải tóm tắt]

TẠI SAO LIÊN QUAN ĐẾN BẠN:
[1-2 câu — kết nối trực tiếp với dự án đang chạy hoặc bối cảnh cá nhân]

HÀNH ĐỘNG:
[1 việc cụ thể — ai làm, làm gì, khi nào. Không dùng "cân nhắc" hay "tìm hiểu thêm"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Quy tắc output bắt buộc:**
- INSIGHT: Phải là nhận định, không phải tóm tắt. Có quan điểm.
- TẠI SAO LIÊN QUAN: Phải gọi tên dự án cụ thể trong Kiến Tạo Active. Không nói chung chung.
- HÀNH ĐỘNG: Phải đủ cụ thể để thực hiện ngay hôm nay hoặc ngày mai. Không có động từ mờ nhạt.

**Ví dụ hành động tốt vs xấu:**
- ❌ "Cân nhắc nghiên cứu thêm về AI"
- ✅ "Thêm 1 buổi test Cursor AI vào lịch tuần này cho dự án [X]"

---

## Phân biệt với skills liên quan

| | mindmirror-tinh-bao | mindmirror-chac-loc | mindmirror-xu-ly |
|---|---|---|---|
| **Mục đích** | Ra hành động | Lưu kiến thức | Tạo Kiến Tạo note |
| **Output** | 1 insight + 1 hành động | Nhiều Kiến Thức Cốt Lõi Notes | Note trong 4 tầng |
| **Có lưu file không** | Không | Có | Có |
| **Check vault không** | Có — bắt buộc | Không | Có — một phần |
| **Dùng khi** | Đọc xong, cần quyết định | Muốn lưu lại để dùng sau | Muốn đưa vào hệ thống |

---

## Tham chiếu
- Bối cảnh cá nhân: `Me.md`
- Dự án đang chạy: `4. Kiến Tạo/1. Đang Làm/`
- Tuần gần nhất: `2. Tinh Lọc/Tổng Kết Tuần/`
- Tri thức tích lũy: `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/`
