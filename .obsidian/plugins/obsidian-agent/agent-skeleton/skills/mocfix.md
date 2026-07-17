---
name: mocfix
trigger: "chuẩn hoá MOC | /mocfix"
desc: Dựng lại 1 MOC theo template (nearest-ancestor, đọc-dẫn không phẳng)
llm_managed: true
---

# Skill: CHUẨN HOÁ MOC

Khi user gõ 'chuẩn hoá MOC X theo template' / `/mocfix`.

Mục tiêu: biến 1 MOC cũ dạng danh-sách-phẳng thành bản đồ ĐỌC-DẪN theo template (đọc từ đâu, đọc gì trước).

**Bước 1:** `$$READ: 5.RESOURCE/template/moc.md$$` (cấu trúc chuẩn) + `$$READ$$` file MOC X hiện tại.

**Bước 2:** `$$LIST$$` folder của MOC X + các subfolder. Xác định PHẠM VI SỞ HỮU theo nguyên lý NEAREST-ANCESTOR:
- Note nằm TRỰC TIẾP trong folder của X → X ôm.
- Subfolder CÓ MOC riêng → X link SUB-MOC đó (KHÔNG liệt note lẻ của subfolder — để sub-MOC tự ôm).
- Subfolder CHƯA có MOC → X link các note trong subfolder đó (đệ quy xuống tới khi gặp MOC con).

**Bước 3:** Dựng lại MOC X theo template CHỈ với các item X SỞ HỮU (bước 2). Đầu MOC: section **Bản đồ kiến thức** (cây ASCII trong code block ```text``` chỉ tới **cấp nhóm/sub-MOC**, KHÔNG liệt note lẻ — tránh trùng section 2–6) + **Câu hỏi cốt lõi** (3-5 câu cluster trả lời). Section nào rỗng cho cluster này → BỎ heading. Rồi các section: Entry point (1-3 note đọc đầu) · Concept nền · Method · Pattern/Framework · Case study · Sub-MOC · Reading path (basic→advanced) · Gap. Phân loại note theo `type`. ⚠️ Link đang có mà KHÔNG thuộc sở hữu X (note lẻ của subfolder đã có MOC) → GỠ khỏi X, thay bằng link sub-MOC tương ứng (note vẫn được sub-MOC ôm, không mất coverage). KHÔNG bịa note chưa tồn tại.

**Bước 4:** `$$WRITE$$` ghi đè MOC X (giữ frontmatter `type: moc`) → APPEND log.md (action: MOC-RESTRUCTURE).

⚠️ CHỈ làm cho ĐÚNG MOC user chỉ định — KHÔNG tự đụng MOC khác.
