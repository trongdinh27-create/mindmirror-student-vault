# MindMirror Student Vault — Bộ Não Thứ Hai Trong Thời AI

Đây là bản MindMirror sạch dành cho học viên: một hệ thống biến **thông tin → hiểu biết → tri thức → giá trị** và cung cấp ngữ cảnh dài hạn để AI hỗ trợ đúng người, đúng mục tiêu.

## Bạn nhận được gì

- Kiến trúc 4 tầng: `Thu Thập → Tinh Lọc → Chuyển Hoá → Kiến Tạo`.
- Dashboard, hướng dẫn cài đặt, lộ trình làm quen 7 ngày và ví dụ xuyên suốt.
- 11 Template cốt lõi và cấu hình Daily Note/Templater.
- Đóng gói đầy đủ 23 Community Plugins đang dùng trong hệ thống gốc, cùng 5 theme và 7 CSS snippet.
- 34 workflow AI MindMirror canonical trong `.claude/skills/` và adapter Codex tương ứng.
- Module tùy chọn `6. OPC Company 2Brain/` để xây Não Bộ Doanh Nghiệp sạch.
- Script setup, cài Hermes wrapper và validator chống lộ dữ liệu/đường dẫn máy.

## Bắt đầu trong 10 phút

1. Giải nén toàn bộ thư mục.
2. Mở Obsidian → **Open folder as vault** → chọn thư mục này.
3. Vào **Settings → Community Plugins**, tắt Restricted Mode rồi reload Obsidian. Toàn bộ 23 plugin đã nằm sẵn trong vault; xem `THIRD-PARTY-NOTICES.md`.
4. Chạy:

```bash
python3 scripts/setup.py
```

5. Mở [[0. Bắt Đầu/00. BẮT ĐẦU Ở ĐÂY]].
6. Đổi tên `Me.example.md` thành `Me.md` nếu script chưa tạo tự động, rồi điền thông tin của bạn.

## Nguyên tắc an toàn

- `Me.md`, nhật ký, tri thức, dự án và tệp đính kèm là dữ liệu riêng của học viên; không thuộc gói cập nhật.
- `.claude/skills/` là nguồn workflow chuẩn. `.agents/skills/` chỉ là adapter.
- Không đưa API key, mật khẩu hoặc dữ liệu khách hàng vào file skill/config.
- Archive thay vì xoá: dùng `4. Kiến Tạo/4. Tạm Dừng/` hoặc `.trash/`.

## Hỗ trợ AI

- Claude Code: mở chính thư mục vault làm project; đọc `CLAUDE.md`.
- Codex: mở chính thư mục vault; đọc `AGENTS.md`.
- Hermes: chạy `python3 scripts/install_hermes_wrappers.py` rồi reload skills.

## Phiên bản

Xem `VERSION` và `CHANGELOG.md`.
