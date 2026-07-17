---
name: mindmirror-dich-anh-viet
description: Dịch bất kỳ nội dung tiếng Anh nào sang tiếng Việt tự nhiên — có thể dịch toàn bộ note, chỉ một section (transcript, body, quote), hoặc đoạn văn bản thuần túy. Sau khi dịch, hỏi user có muốn lưu bản dịch vào note gốc không. Trigger: "dịch sang tiếng Việt", "translate to Vietnamese", "dịch đoạn này", "dịch note này", "dịch transcript", "convert sang tiếng Việt".
---

# Translate EN → VI

## Mục đích
Dịch nội dung tiếng Anh trong vault (note, transcript, quote, clipping) sang tiếng Việt tự nhiên, giữ nguyên cấu trúc markdown, timestamp và heading.

---

## BƯỚC 1 — Xác định nguồn input

Nhận input theo một trong ba dạng:

**A. Tên file / đường dẫn note:**
- Đọc file, xác định phần cần dịch (toàn bộ? chỉ transcript? chỉ body?)
- Nếu note có cả phần tiếng Việt (tóm tắt, điểm chính) lẫn phần tiếng Anh (transcript gốc) → chỉ dịch phần tiếng Anh, KHÔNG dịch lại phần đã có tiếng Việt

**B. Đoạn văn bản thuần túy (user paste trực tiếp):**
- Dịch toàn bộ đoạn đó

**C. Không có input rõ ràng:**
- Hỏi user: "Bạn muốn dịch nội dung gì? Có thể paste text hoặc cho mình biết tên file."

---

## BƯỚC 2 — Dịch

**Nguyên tắc dịch:**
- Giữ giọng tự nhiên, tiếng Việt thông thường (không dịch máy)
- Giữ nguyên: timestamp (0:00, 1:33...), heading markdown (###), bold (**...**), wikilink ([[...]]), frontmatter YAML
- Các thuật ngữ chuyên ngành giữ nguyên tiếng Anh nếu không có từ tương đương phổ biến (ví dụ: *clarity*, *flow*, *PKM*, *transcript* — có thể giữ nguyên hoặc thêm chú thích)
- Tên riêng (người, sản phẩm, công ty) → giữ nguyên
- Tên sách, video, podcast → giữ nguyên hoặc dịch tên + ghi nguyên văn trong ngoặc
- Câu trích dẫn (quote) → dịch thoáng, ưu tiên ý nghĩa hơn sát nghĩa từng từ

**Format output:**
- Nếu dịch transcript → giữ nguyên cấu trúc `**timestamp** · nội dung`
- Nếu dịch section heading → dịch heading sang tiếng Việt
- Nếu note có nhiều section → dịch từng section theo thứ tự, hiển thị đầy đủ

---

## BƯỚC 3 — Hỏi về lưu file (chỉ khi input là file trong vault)

Sau khi hiển thị bản dịch, hỏi:

> **"Bạn muốn mình lưu bản dịch này vào file gốc không?"**
>
> Có hai cách:
> - **Thay thế phần tiếng Anh** bằng bản tiếng Việt (file gọn hơn)
> - **Thêm bản dịch lên trên**, giữ nguyên tiếng Anh phía dưới (có thể đối chiếu)

Nếu user đồng ý → thực hiện edit file theo lựa chọn.
Nếu user không đồng ý hoặc input là văn bản thuần → chỉ hiển thị bản dịch trong chat.

---

## Ví dụ trigger

| User nói | Hành động |
|---|---|
| "dịch note How I Trained an AI..." | Tìm file trong Clipping, dịch phần chưa có tiếng Việt |
| "dịch đoạn này sang tiếng Việt" + paste text | Dịch đoạn đó, hiển thị trong chat |
| "translate transcript của note này" | Dịch chỉ section Transcript |
| "dịch toàn bộ note X sang tiếng Việt" | Dịch toàn bộ body (bỏ qua frontmatter) |
| "dịch quote này: ..." | Dịch quote, hiển thị trong chat, không lưu file |

---

## Lưu ý

- **KHÔNG dịch frontmatter YAML** (các field `up`, `tags`, `source`, `created`...)
- **KHÔNG dịch lại** những đoạn đã có tiếng Việt trong note
- Nếu note quá dài → dịch từng phần, hỏi user có muốn tiếp tục không
- Nếu có đoạn không rõ nghĩa hoặc khó dịch → ghi chú `[*chú thích: ...]` inline
