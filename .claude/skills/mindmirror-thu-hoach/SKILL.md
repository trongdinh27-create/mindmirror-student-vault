---
name: mindmirror-thu-hoach
description: Stockpile mode — nạp nhanh Thu Thập vào kho Chuyển Hoá Kiến Thức Cốt Lõi mà không cần tạo Kiến Tạo. Dùng khi đang đọc sách, nghe podcast, học khóa học và muốn capture nhiều Kiến Thức Cốt Lõi liên tiếp. Mini-Tinh Lọc (1 câu bắt buộc) được nhúng trực tiếp vào Kiến Thức Cốt Lõi để đảm bảo đây là quan điểm của bạn, không phải paraphrase nguồn. Trigger: "harvest", "nạp vào core", "chỉ cần statement", "ghi nhanh vào core", "đang đọc sách muốn capture", hoặc khi user paste nhiều quote liên tiếp.
---

# Nexus Harvest — Thu Thập → Chuyển Hoá (Stockpile Mode)

## Mục đích
Xây kho Kiến Thức Cốt Lõi đồ sộ trong Chuyển Hoá khi đang trong "chế độ tiêu thụ" (đọc sách, nghe podcast, học khóa học). Kiến Thức Cốt Lõi tích lũy ở đây là nguyên liệu thô — sau này `mindmirror-xu-ly` chỉ cần "lắp ráp" thay vì tư duy lại từ đầu.

> **Khác với `mindmirror-xu-ly`:**
> - `mindmirror-xu-ly` = Produce mode. Input → Output (bài viết hoàn chỉnh).
> - `mindmirror-thu-hoach` = Stockpile mode. Input → Kho (Kiến Thức Cốt Lõi sẵn sàng dùng).

---

## BƯỚC 0 — Context Scan (Rút gọn)

Đọc **Daily Note hôm nay** (nếu có) và **3 ngày gần nhất** — chỉ lấy:
- Đang đọc sách / khoá học nào?
- Theme đang nổi trong tuần?
- Projects đang active trong Kiến Tạo?

Dùng để cá nhân hoá "Mini-Tinh Lọc" (Bước 3), không cần User Context Summary đầy đủ.

---

## BƯỚC 1 — Nhận input

Nhận một hoặc nhiều input liên tiếp:
- Quote từ sách/podcast
- Ý tưởng thô
- Quan sát

**Nếu user paste nhiều quote cùng lúc** → xử lý lần lượt, tạo Kiến Thức Cốt Lõi riêng cho từng cái.

**Hỏi nếu thiếu:**
- Nguồn? (sách gì, tác giả nào) — quan trọng để link `source:` trong frontmatter
- Đây là quote nguyên văn hay ý tưởng cá nhân của user?

---

## BƯỚC 2 — Thu Thập (Tối giản)

Không tạo file Thu Thập riêng. Thay vào đó, lưu quote gốc trực tiếp vào frontmatter của Kiến Thức Cốt Lõi:

```yaml
raw-input: "{quote/ý tưởng gốc}"
```

> **Lý do**: Mục tiêu là tốc độ — tạo thêm file Thu Thập riêng sẽ tạo overhead không cần thiết khi ở stockpile mode. Quote gốc được lưu trong frontmatter để truy xuất sau nếu cần.

---

## BƯỚC 3 — Mini-Tinh Lọc (Bắt buộc — 1 câu)

Đây là bước **không được bỏ qua**. Hỏi user đúng 1 câu:

> **"Điều này đúng với bạn không? Nếu có — ví dụ cụ thể từ cuộc sống/công việc của bạn là gì?"**

Nếu user trả lời → dùng để viết phần **"Tôi thấy điều này vì..."** trong Kiến Thức Cốt Lõi.

Nếu user trả lời "không biết" hoặc "chưa có ví dụ" → ghi `"Chưa có ví dụ thực tế — cần test"` và đánh tag `#needs-validation`.

> **Tại sao bắt buộc?**
> Kiến Thức Cốt Lõi không có "tiếng nói cá nhân" = paraphrase của nguồn = không phải Chuyển Hoá.
> 1 câu này là ranh giới giữa "lưu thông tin" và "xây dựng tri thức".

---

## BƯỚC 4 — Đề xuất Kiến Thức Cốt Lõi candidates

Từ input + Mini-Tinh Lọc, đề xuất **2-3 Kiến Thức Cốt Lõi candidates** dưới dạng câu khẳng định hoàn chỉnh:

```
Đề xuất Kiến Thức Cốt Lõi:

1. "{Câu khẳng định — góc nhìn: vấn đề}"
2. "{Câu khẳng định — góc nhìn: cơ chế}"
3. "{Câu khẳng định — góc nhìn: hệ quả/ứng dụng}"

Chọn Kiến Thức Cốt Lõi(s) muốn tạo (có thể chọn nhiều hoặc sửa tên):
```

**Quy tắc đặt tên Kiến Thức Cốt Lõi:**
- Phải có chủ ngữ + vị ngữ rõ ràng
- Phải thể hiện quan điểm, không phải sự kiện
- Nên bao gồm góc cạnh cá nhân hoặc bối cảnh cụ thể
- ❌ "AI và Second Brain"
- ✅ "AI không làm việc xây dựng Second Brain dễ hơn — nó làm lộ ra phần duy nhất có giá trị"

---

## BƯỚC 5 — Tạo Kiến Thức Cốt Lõi

Tạo tại `3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/{câu khẳng định}.md`:

```markdown
---
up:
  - "[[MOC liên quan — tìm tự động]]"
created: YYYY-MM-DD
tags: [statement, core, {domain-tags}]
source: "[[Literature Note nếu có]]"
raw-input: "{quote/ý tưởng gốc — lưu để truy xuất}"
harvest-session: "{tên sách/nguồn đang đọc}"
mint-ready: false
---

# {Câu khẳng định}

## Luận điểm
{2-4 câu — viết từ góc nhìn user, không phải tóm tắt nguồn}

## Tôi thấy điều này vì...
{Câu Mini-Tinh Lọc — ví dụ cụ thể từ cuộc sống/công việc user}
*Nếu chưa có ví dụ: "Chưa test — cần kiểm chứng trong thực tế."*

## Liên kết
{≥3 wikilinks — auto-scan, xem Bước 6}
```

> **`mint-ready: false`** — Flag mặc định. Khi user muốn dùng Kiến Thức Cốt Lõi này để viết bài, đổi thành `true` hoặc gọi `mindmirror-xu-ly` với Kiến Thức Cốt Lõi làm input thay vì Thu Thập.

---

## BƯỚC 6 — Auto-Link Scan

Scan vault tìm notes liên quan và **tự động chèn** vào section Liên kết:

```
Scan folders:
- 3. Chuyển Hoá/Tri Thức/Kiến Thức Cốt Lõi/   → title keywords
- 3. Chuyển Hoá/Bản Đồ/              → cùng domain → link MOC lên "up:"
- 3. Chuyển Hoá/Tri Thức/Concepts/     → shared topic
- 2. Tinh Lọc/Kiến Thức Nguồn/  → cùng tác giả/sách
```

Tự động chèn top 3-5 matches vào Liên kết (không hỏi). Báo cáo ngắn sau khi xong.

Nếu tìm được MOC phù hợp → update `up:` frontmatter và **thêm link Kiến Thức Cốt Lõi vào MOC đó** luôn.

---

## BƯỚC 7 — Hỏi "Tiếp theo?"

Sau khi tạo xong Kiến Thức Cốt Lõi, hỏi:

```
✅ Đã tạo Kiến Thức Cốt Lõi: "{tên}"
🔗 Auto-linked: {N} notes

Tiếp theo:
[1] Harvest thêm — paste quote/ý tưởng tiếp theo
[2] Dừng lại
[3] Upgrade thành Kiến Tạo ngay — gọi mindmirror-xu-ly với Kiến Thức Cốt Lõi này làm seed
```

Nếu user chọn [1] → lặp lại từ Bước 1 (không cần context scan lại).

---

## Validate trước khi save

- [ ] Tên file là câu khẳng định có chủ ngữ + vị ngữ
- [ ] Có `raw-input:` trong frontmatter
- [ ] Section "Tôi thấy điều này vì..." không rỗng (có thể là "Chưa test")
- [ ] Có ≥3 wikilinks
- [ ] Có `up:` link đến ít nhất 1 MOC

---

## So sánh nhanh với mindmirror-xu-ly

| | mindmirror-thu-hoach | mindmirror-xu-ly |
|---|---|---|
| **Khi nào dùng** | Đang đọc/học | Muốn viết bài |
| **Output** | Kiến Thức Cốt Lõi trong Chuyển Hoá | 4 files Thu Thập→Tinh Lọc→Chuyển Hoá→Kiến Tạo |
| **Thời gian** | 5-10 phút/Kiến Thức Cốt Lõi | 20-30 phút |
| **Tinh Lọc** | Mini (1 câu nhúng vào Kiến Thức Cốt Lõi) | Đầy đủ (file riêng) |
| **Kiến Tạo** | Không tạo (flag mint-ready) | Tạo bài viết hoàn chỉnh |
| **Batch** | Có — nhiều Kiến Thức Cốt Lõi liên tiếp | Không — 1 topic mỗi lần |

---

## Tham chiếu
- Framework: `3. Chuyển Hoá/Tri Thức/Framework/Framework - Hệ Thống Chuyển Hoá — Cấu Trúc Và Vận Hành.md`
- Skill đầy đủ: `mindmirror-xu-ly`
- MOC Home: `3. Chuyển Hoá/Bản Đồ/Bản Đồ Chủ Đề — Tổng Quan.base`
