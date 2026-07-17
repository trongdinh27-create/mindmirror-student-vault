---
name: lint
trigger: "lint wiki | kiểm tra sức khoẻ | broken link | orphan | frontmatter | stale note | index"
requires: ""
mutates: false
default_read_limit: "chỉ dùng kết quả $$LINT$$"
desc: "Kiểm tra sức khỏe vault bằng $$LINT$$; mặc định chỉ report, fix có guard riêng"
llm_managed: true
---

# Skill: LINT

## Mục Tiêu

Báo cáo sức khỏe vault bằng kết quả lint deterministic. Lint trong chat mặc định chỉ report; fix cần user yêu cầu rõ.

## Phạm Vi

- Dùng cú pháp `$$LINT$$` cho kiểm tra sức khỏe toàn vault.
- Nếu user chỉ định file/folder, chỉ inspect đúng scope đó khi context/tool hỗ trợ.
- Tách must-fix và advisory.

## Máy Trạng Thái

```md
BẮT_ĐẦU
  -> XÁC_ĐỊNH_SCOPE
  -> CHẠY_LINT
  -> PHÂN_LOẠI_ISSUE
  -> ƯU_TIÊN
  -> TRÌNH_BÀY_REPORT
  -> KIỂM_TRA_YÊU_CẦU_FIX
  -> FIX_THEO_BATCH
  -> VERIFY_FIX
  -> KẾT_THÚC
```

## Chốt Chặn

- Không dùng `$$SEARCH$$` để suy đoán broken link, orphan note hoặc trạng thái lint.
- Không đọc `_agent/log.md` hoặc `_agent/maintenance-report.md` làm nguồn lint.
- Advisory không bao giờ auto-fix: CAPTURE backlog, forward link trong body, broken link nhập nhằng, ví dụ folder chết.
- Chat mode không fix nếu user chưa yêu cầu fix rõ.
- Mọi fix phải dùng đoạn text cũ chính xác từ kết quả lint, `$$FIND: <path>$$<từ khóa>$$END_FIND$$`, hoặc `$$READ: <path>$$` trước khi `$$REPLACE: <path>$$<text cũ>$$WITH$$<text mới>$$END_REPLACE$$`.
- Chặn thao tác destructive.

## Ngân Sách

- Mặc định report top 10 must-fix.
- Gom advisory theo category/count.
- Fix batch: tối đa 5 file mỗi lượt trừ khi user yêu cầu rộng hơn.
- Output: một bảng + summary metric/advisory ngắn.

## Nhóm Lỗi

Các nhóm thường gặp:
- broken navigation link;
- full-path wikilink cần đổi về bare link;
- body link trỏ vào `1.CAPTURE/`;
- thiếu/sai frontmatter trên note `llm_managed: true`;
- thiếu entry trong index;
- thiếu coverage MOC;
- artifact thiếu source citation;
- stale note;
- duplicate basename;
- CAPTURE backlog advisory.

## Quy Trình

1. Emit `$$LINT$$`.
2. Phân loại issue trả về thành must-fix và advisory.
3. Ưu tiên must-fix theo blast radius và độ chắc.
4. Trình bày report trong giới hạn.
5. Nếu user đã yêu cầu fix, chỉ fix nhóm deterministic đã được duyệt.
6. Verify fix bằng exact text; nếu có mutation, emit `$$APPEND: _agent/log.md$$<log entry>$$END_APPEND$$`.

## Không Làm

- Không báo clean nếu kết quả lint vẫn còn issue.
- Không auto-ingest CAPTURE backlog.
- Không rewrite MOC hoặc note theo nghĩa trong lúc chỉ report lint.
- Không chạy vòng SEARCH/LIST rộng.

## Hợp Đồng Output

```md
| Issue | Severity | File | Action đề xuất |
|---|---|---|---|

Advisory summary:
Chỉ số:
Fix batch đề xuất:
```

## Kiểm Chứng

Lint report hợp lệ khi dựa trên `$$LINT$$`, must-fix/advisory được tách rõ, và fix đề xuất là deterministic hoặc được đánh dấu cần user judgment.
