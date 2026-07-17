const { Plugin, ItemView, WorkspaceLeaf, MarkdownRenderer, Notice, setIcon, PluginSettingTab, Setting, Modal, DropdownComponent, TFile, TFolder, requestUrl } = require('obsidian');

const VIEW_TYPE_OBSIDIAN_AGENT = "obsidian-agent-view";

// ============================================================================
// CONTEXT BUDGET — giới hạn để không nuốt context window
// ============================================================================
const CONTEXT_CHAR_BUDGET = 120_000;          // ≈30k token tổng cho text attachments + body
const URL_FETCH_CHAR_LIMIT = 30_000;          // cắt mỗi URL/YouTube ở 30k char
const IMAGE_BYTES_BUDGET = 5 * 1024 * 1024;   // 5MB tổng base64 ảnh per request (Phase 3)
const FOLDER_FILE_THRESHOLD = 10;             // > N file thì confirm trước khi attach
const PDF_MAX_PAGES = 50;                     // Phase 2
const DEFAULT_FOLDER_EXCLUDES = [".trash", "Templates", "1.CAPTURE"];

// ============================================================================
// VAULT_STRUCTURE — full hệ thống folder + MOC + content notes (PARA + CODE)
// Dùng khi $$INSTALL_FOLDERS$$ chạy mặc định (không truyền spec tùy chỉnh)
// ============================================================================
const VAULT_STRUCTURE = {
    // --- Tất cả folder cần tạo (theo thứ tự cha → con) ---
    folders: [
        // 0. Hướng dẫn nhập môn — ở ngoài root làm tài liệu hướng dẫn
        "0. Nhập môn (Start Here)",
        "0. Nhập môn (Start Here)/1. WHY - Vì sao cần Second Brain",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ",
        "0. Nhập môn (Start Here)/3. Phương pháp",
        "0. Nhập môn (Start Here)/4. Thực hành",
        "0. Nhập môn (Start Here)/5. Duy trì & Nâng cao",
        // 1. CAPTURE — raw inbox, bất biến
        "1.CAPTURE",
        // 2. INPUT — tri thức đầu vào
        "2.INPUT",
        "2.INPUT/99.DEV NOTE",
        "2.INPUT/99.DEV NOTE/github-repo",
        // 3. PROCESS — xử lý, dự án đang làm
        "3.PROCESS",
        // 4. OUTPUT — sản phẩm tri thức (artifact)
        "4.OUTPUT",
        "4.OUTPUT/1. Patterns & Insights",
        "4.OUTPUT/2. Frameworks",
        "4.OUTPUT/3. Synthesis & Theses",
        "4.OUTPUT/4. Principles & Heuristics",
        "4.OUTPUT/5. Articles & Essays",
        "4.OUTPUT/6. Social Post",
        "4.OUTPUT/7. Decks & Visual Output",
        "4.OUTPUT/8. Long-form & Books",
        // 5. RESOURCE — template + assets
        "5.RESOURCE",
        "5.RESOURCE/attachments",
        "5.RESOURCE/books",
        "5.RESOURCE/people",
        "5.RESOURCE/people/Clients",
        "5.RESOURCE/people/Family",
        "5.RESOURCE/people/Friends",
        "5.RESOURCE/people/Mentors",
        "5.RESOURCE/template",
        "5.RESOURCE/tools-reference",
        // 6. PROBLEM HUB — vấn đề cần giải quyết
        "6.PROBLEM HUB",
        "6.PROBLEM HUB/6.1 Active",
        "6.PROBLEM HUB/6.2 Solved",
        "6.PROBLEM HUB/6.3 Symptoms",
        "6.PROBLEM HUB/_Hub cha",
        // 7. ARCHIVES — lưu trữ
        "7.ARCHIVES",
        // 8. TRACK — theo dõi hằng ngày
        "8.TRACK",
        "8.TRACK/Daily",
        "8.TRACK/Meetings - Cross-domain",
        // Clippings — web clippings
        "Clippings",
    ],

    // --- MOC skeleton notes: tạo file với frontmatter + heading chuẩn ---
    mocs: [
        { path: "0. Nhập môn (Start Here)/moc-nhap-mon-obsidian-second-brain.md", title: "MOC — Nhập môn Obsidian & Second Brain" },
        { path: "2.INPUT/moc-input.md",                                          title: "MOC — Tri thức Đầu vào (Input)" },
        { path: "2.INPUT/99.DEV NOTE/moc-dev-note.md",                           title: "MOC — Ghi chú Phát triển (Dev Note)" },
        { path: "2.INPUT/99.DEV NOTE/github-repo/moc-dev-github-repo.md",        title: "MOC — Dự án GitHub" },
        { path: "3.PROCESS/moc-process.md",                                      title: "MOC — Xử lý & Thiết kế (Process)" },
        { path: "4.OUTPUT/moc-output.md",                                        title: "MOC — Sản phẩm Tri thức (Output)" },
        { path: "4.OUTPUT/1. Patterns & Insights/moc-exhibit-patterns.md",       title: "MOC — Mẫu hình & Góc nhìn sâu (Patterns & Insights)" },
        { path: "4.OUTPUT/2. Frameworks/moc-exhibit-frameworks.md",              title: "MOC — Khung tư duy (Frameworks)" },
        { path: "4.OUTPUT/3. Synthesis & Theses/moc-exhibit-synthesis.md",       title: "MOC — Tổng hợp & Luận điểm (Synthesis & Theses)" },
        { path: "4.OUTPUT/4. Principles & Heuristics/moc-exhibit-principles.md", title: "MOC — Nguyên tắc & Quy tắc kinh nghiệm (Principles & Heuristics)" },
        { path: "4.OUTPUT/5. Articles & Essays/moc-exhibit-articles.md",         title: "MOC — Bài viết & Tiểu luận (Articles & Essays)" },
        { path: "4.OUTPUT/7. Decks & Visual Output/moc-exhibit-decks.md",        title: "MOC — Slide & Sản phẩm trực quan (Decks & Visual Output)" },
        { path: "4.OUTPUT/8. Long-form & Books/moc-exhibit-longform.md",         title: "MOC — Tác phẩm dài (Long-form & Books)" },
        { path: "6.PROBLEM HUB/moc-problem-hub.md",                             title: "MOC — Trung tâm Vấn đề (Problem Hub)" },
        { path: "6.PROBLEM HUB/6.1 Active/moc-problem-active.md",               title: "MOC — Vấn đề đang hoạt động (Active)" },
        { path: "6.PROBLEM HUB/6.2 Solved/moc-problem-solved.md",               title: "MOC — Đã giải quyết (Solved)" },
        { path: "6.PROBLEM HUB/6.3 Symptoms/moc-problem-symptoms.md",           title: "MOC — Triệu chứng (Symptoms)" },
        { path: "6.PROBLEM HUB/_Hub cha/moc-problem-hub-cha.md",                title: "MOC — Hub cha (Parent Hubs)" },
        { path: "7.ARCHIVES/moc-archives.md",                                    title: "MOC — Lưu trữ (Archives)" },
        { path: "8.TRACK/moc-track.md",                                          title: "MOC — Theo dõi (Track)" },
        { path: "8.TRACK/Daily/moc-track-daily.md",                              title: "MOC — Ghi chú Hằng ngày (Daily)" },
        { path: "8.TRACK/Meetings - Cross-domain/moc-track-meetings.md",         title: "MOC — Cuộc họp (Meetings)" },
    ],

    // --- Content notes: copy nguyên văn từ vault-skeleton/ vào vault ---
    // Đường dẫn tương đối (trùng cấu trúc trong vault-skeleton/)
    contentNotes: [
        "0. Nhập môn (Start Here)/lo-trinh-7-ngay-cho-nguoi-moi.md",
        "0. Nhập môn (Start Here)/sai-lam-thuong-gap-cua-nguoi-moi.md",
        "0. Nhập môn (Start Here)/1. WHY - Vì sao cần Second Brain/building-a-second-brain-overview.md",
        "0. Nhập môn (Start Here)/1. WHY - Vì sao cần Second Brain/cognitive-load-la-gi.md",
        "0. Nhập môn (Start Here)/1. WHY - Vì sao cần Second Brain/second-brain-la-gi.md",
        "0. Nhập môn (Start Here)/1. WHY - Vì sao cần Second Brain/vi-sao-can-second-brain-gioi-han-tri-nho.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/cai-dat-va-tao-vault-dau-tien.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/daily-note-va-template.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/dong-bo-va-backup-vault.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/folder-vs-tag-vs-link.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/graph-view-doc-sao-cho-dung.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/markdown-co-ban.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/obsidian-la-gi-vi-sao-chon.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/plugin-cong-dong-cot-loi.md",
        "0. Nhập môn (Start Here)/2. Obsidian - Công cụ/wikilink-va-backlink.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/atomic-note-la-gi.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/code-method-tiago-forte.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/flow-phuong-phap-pkm-obsidian.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/moc-la-gi-map-of-content.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/para-framework.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/khung-tu-duy-pipoo.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/so-sanh-pipoo-code-para-zettelkasten.md",
        "0. Nhập môn (Start Here)/3. Phương pháp/zettelkasten-co-ban.md",
        "0. Nhập môn (Start Here)/4. Thực hành/progressive-summarization.md",
        "0. Nhập môn (Start Here)/4. Thực hành/quy-trinh-capture-hang-ngay.md",
        "0. Nhập môn (Start Here)/4. Thực hành/workflow-mot-tuan-mau-cho-nguoi-moi.md",
        "0. Nhập môn (Start Here)/5. Duy trì & Nâng cao/nang-cao-tu-pkm-len-llm-wiki.md",
        "0. Nhập môn (Start Here)/5. Duy trì & Nâng cao/review-va-bao-tri-vault.md",
    ],
};

// Backward-compat: mảng phẳng 8 folder level-1 cho trường hợp AI truyền spec tùy chỉnh
const STANDARD_FOLDERS = VAULT_STRUCTURE.folders.filter(f => !f.includes("/"));

// ============================================================================
// PROVIDER PRESETS — auto-fill template khi tạo profile mới
// ============================================================================
const PROVIDER_PRESETS = {
    chatgpt_oauth: { label: "ChatGPT Subscription (OAuth)", provider: "chatgpt-oauth",     baseUrl: "https://chatgpt.com/backend-api/codex/responses",       model: "gpt-5" },
    gemini_oauth:  { label: "Gemini Code Assist (OAuth)",   provider: "gemini-oauth",      baseUrl: "https://cloudcode-pa.googleapis.com/v1internal",        model: "gemini-2.5-pro" },
    gemini_web:    { label: "Gemini Web (AgentBridge)",     provider: "gemini-web",        baseUrl: "http://localhost:8765/v1/chat/completions",             model: "gemini-web" },
    trollllm:   { label: "Trollllm",                    provider: "openai-compatible", baseUrl: "https://chat.trollllm.xyz/v1/chat/completions",        model: "gpt-5.4" },
    openai:     { label: "OpenAI",                      provider: "openai-compatible", baseUrl: "https://api.openai.com/v1/chat/completions",            model: "gpt-4o" },
    anthropic:  { label: "Anthropic Claude",            provider: "anthropic",         baseUrl: "https://api.anthropic.com/v1/messages",                 model: "claude-sonnet-4-5" },
    anthropic_oauth: { label: "Anthropic Claude (Subscription OAuth)", provider: "anthropic-oauth", baseUrl: "https://api.anthropic.com/v1/messages",        model: "claude-sonnet-4-5" },
    google:     { label: "Google Gemini",               provider: "google",            baseUrl: "https://generativelanguage.googleapis.com/v1beta",      model: "gemini-2.5-pro" },
    ollama:     { label: "Ollama (local)",              provider: "ollama",            baseUrl: "http://localhost:11434/v1/chat/completions",            model: "llama3.2" },
    openrouter: { label: "OpenRouter",                  provider: "openai-compatible", baseUrl: "https://openrouter.ai/api/v1/chat/completions",         model: "anthropic/claude-sonnet-4" },
    groq:       { label: "Groq",                        provider: "openai-compatible", baseUrl: "https://api.groq.com/openai/v1/chat/completions",       model: "llama-3.3-70b-versatile" },
    deepseek:   { label: "DeepSeek",                    provider: "openai-compatible", baseUrl: "https://api.deepseek.com/v1/chat/completions",          model: "deepseek-chat" },
    custom:     { label: "Custom OpenAI-compatible",    provider: "openai-compatible", baseUrl: "",                                                       model: "" }
};

const PROVIDER_TYPES = ["openai-compatible", "anthropic", "anthropic-oauth", "google", "ollama", "chatgpt-oauth", "gemini-oauth", "gemini-web"];

// ============================================================================
// CODEX OAUTH (ChatGPT subscription) — ported from openai/codex Rust + kalix-cqa
// ============================================================================

const CODEX_OAUTH = {
    ISSUER: "https://auth.openai.com",
    CLIENT_ID: "app_EMoamEEZ73f0CkXaXp7hrann",
    AUTHORIZE_URL: "https://auth.openai.com/oauth/authorize",
    TOKEN_URL: "https://auth.openai.com/oauth/token",
    REDIRECT_URI: "http://localhost:1455/auth/callback",
    LOGIN_SCOPE: "openid profile email offline_access api.connectors.read api.connectors.invoke",
    REFRESH_SCOPE: "openid profile email offline_access",
    RESPONSES_URL: "https://chatgpt.com/backend-api/codex/responses",
    MODELS_URL: "https://chatgpt.com/backend-api/codex/models",
    CLIENT_VERSION: "1.0.0",
};

// base64url từ bytes (Uint8Array hoặc Node Buffer) — dùng btoa, chạy cả desktop lẫn mobile.
function b64url(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = (typeof btoa === "function") ? btoa(bin) : Buffer.from(bytes).toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Random bytes cross-platform qua Web Crypto (KHÔNG dùng Node 'crypto' — vắng trên mobile).
function randomBytesCompat(n) {
    const arr = new Uint8Array(n);
    crypto.getRandomValues(arr);
    return arr;
}

async function generatePkce() {
    const verifier = b64url(randomBytesCompat(64));
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
    const challenge = b64url(new Uint8Array(digest));
    return { codeVerifier: verifier, codeChallenge: challenge };
}

function generateOAuthState() {
    return b64url(randomBytesCompat(32));
}

function buildCodexAuthorizeUrl(state, codeChallenge) {
    const qs = new URLSearchParams({
        response_type: "code",
        client_id: CODEX_OAUTH.CLIENT_ID,
        redirect_uri: CODEX_OAUTH.REDIRECT_URI,
        scope: CODEX_OAUTH.LOGIN_SCOPE,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        id_token_add_organizations: "true",
        codex_cli_simplified_flow: "true",
        state,
        originator: "codex_cli_rs",
    });
    return `${CODEX_OAUTH.AUTHORIZE_URL}?${qs.toString()}`;
}

async function codexExchangeCode(code, codeVerifier) {
    const { requestUrl } = require("obsidian");
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: CODEX_OAUTH.REDIRECT_URI,
        client_id: CODEX_OAUTH.CLIENT_ID,
        code_verifier: codeVerifier,
    });
    const res = await requestUrl({
        url: CODEX_OAUTH.TOKEN_URL,
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        throw: false,
    });
    if (res.status !== 200) throw new Error(`Token exchange failed: ${res.status} ${res.text || ""}`);
    return res.json;
}

async function codexRefreshTokens(refreshToken) {
    const { requestUrl } = require("obsidian");
    const res = await requestUrl({
        url: CODEX_OAUTH.TOKEN_URL,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: CODEX_OAUTH.CLIENT_ID,
            scope: CODEX_OAUTH.REFRESH_SCOPE,
        }),
        throw: false,
    });
    if (res.status !== 200) throw new Error(`Token refresh failed: ${res.status} ${res.text || ""}`);
    const j = res.json;
    if (!j.access_token) throw new Error("Refresh response missing access_token");
    return {
        id_token: j.id_token || "",
        access_token: j.access_token,
        refresh_token: j.refresh_token || refreshToken,
    };
}

function decodeJwt(token) {
    const parts = (token || "").split(".");
    if (parts.length !== 3) return null;
    try {
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const pad = payload.length % 4 === 0 ? "" : "=".repeat(4 - (payload.length % 4));
        return JSON.parse(Buffer.from(payload + pad, "base64").toString("utf8"));
    } catch (e) {
        return null;
    }
}

function codexExtractAccountInfo(idToken, accessToken) {
    const idClaims = decodeJwt(idToken) || {};
    const accessClaims = decodeJwt(accessToken) || {};
    const idAuth = idClaims["https://api.openai.com/auth"] || {};
    const accAuth = accessClaims["https://api.openai.com/auth"] || {};
    return {
        accountId: (typeof idAuth.chatgpt_account_id === "string" && idAuth.chatgpt_account_id)
            || (typeof accAuth.chatgpt_account_id === "string" && accAuth.chatgpt_account_id) || null,
        planType: (typeof accAuth.chatgpt_plan_type === "string" && accAuth.chatgpt_plan_type)
            || (typeof idAuth.chatgpt_plan_type === "string" && idAuth.chatgpt_plan_type) || null,
    };
}

function codexAccessTokenExpiry(accessToken) {
    const claims = decodeJwt(accessToken);
    if (!claims || typeof claims.exp !== "number") return null;
    return new Date(claims.exp * 1000);
}

function codexShouldRefresh(expiresAtIso, lastRefreshAtIso) {
    const now = Date.now();
    if (expiresAtIso) {
        const exp = new Date(expiresAtIso).getTime();
        if (!isNaN(exp) && exp - now < 5 * 60 * 1000) return true;
    }
    if (!lastRefreshAtIso) return true;
    const last = new Date(lastRefreshAtIso).getTime();
    if (isNaN(last) || now - last > 55 * 60 * 1000) return true;
    return false;
}

function parseCodexCallbackUrl(rawUrl) {
    const u = new URL(rawUrl.trim());
    const code = u.searchParams.get("code");
    const state = u.searchParams.get("state");
    if (!code || !state) throw new Error("Callback URL thiếu `code` hoặc `state`");
    return { code, state };
}

// Refresh token nếu cần, save vào profile, return profile mới.
async function ensureFreshCodexProfile(plugin, profile) {
    if (!profile.refreshToken) throw new Error("Chưa login — vào Settings → Login.");
    if (!codexShouldRefresh(profile.expiresAt, profile.lastRefreshAt)) return profile;

    const fresh = await codexRefreshTokens(profile.refreshToken);
    const info = codexExtractAccountInfo(fresh.id_token, fresh.access_token);
    const exp = codexAccessTokenExpiry(fresh.access_token);
    const now = new Date();

    profile.accessToken = fresh.access_token;
    profile.refreshToken = fresh.refresh_token;
    profile.idToken = fresh.id_token || profile.idToken || null;
    profile.accountId = info.accountId || profile.accountId || null;
    profile.planType = info.planType || profile.planType || null;
    profile.expiresAt = exp ? exp.toISOString() : null;
    profile.lastRefreshAt = now.toISOString();
    await plugin.saveSettings();
    return profile;
}

// ============================================================================
// ANTHROPIC OAUTH (Claude Pro/Max subscription) — Claude Code login flow
// (manual paste-code flow + PKCE; token endpoint console.anthropic.com)
// Tái dùng b64url/generatePkce/generateOAuthState/codexShouldRefresh ở trên.
// ============================================================================

const CLAUDE_OAUTH = {
    CLIENT_ID: "9d1c250a-e61b-44d9-88ed-5944d1962f5e",   // public client của Claude Code CLI
    AUTHORIZE_URL: "https://claude.ai/oauth/authorize",   // login subscription Pro/Max
    TOKEN_URL: "https://console.anthropic.com/v1/oauth/token",
    REDIRECT_URI: "https://console.anthropic.com/oauth/code/callback",
    SCOPE: "org:create_api_key user:profile user:inference",
    BETA_HEADER: "oauth-2025-04-20",
    // Inference bằng OAuth subscription YÊU CẦU system block đầu tiên ĐÚNG chuỗi này —
    // thiếu sẽ bị API từ chối ("credential only authorized for use with Claude Code").
    SPOOF_SYSTEM: "You are Claude Code, Anthropic's official CLI for Claude.",
};

function buildClaudeAuthorizeUrl(state, codeChallenge) {
    const qs = new URLSearchParams({
        code: "true",
        client_id: CLAUDE_OAUTH.CLIENT_ID,
        response_type: "code",
        redirect_uri: CLAUDE_OAUTH.REDIRECT_URI,
        scope: CLAUDE_OAUTH.SCOPE,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state,
    });
    return `${CLAUDE_OAUTH.AUTHORIZE_URL}?${qs.toString()}`;
}

// Claude render code dạng `<code>#<state>` trên trang callback — tách 2 phần.
// Cũng accept full URL ?code=...&state=... cho chắc.
function parseClaudeCallbackInput(rawInput) {
    const input = (rawInput || "").trim();
    if (!input) throw new Error("Input rỗng — paste code trước.");
    if (input.startsWith("http://") || input.startsWith("https://")) {
        const u = new URL(input);
        const code = u.searchParams.get("code");
        const state = u.searchParams.get("state");
        if (!code) throw new Error("URL không chứa `code`.");
        return { code, state };
    }
    const cleaned = input.replace(/\s+/g, "");
    const hashIdx = cleaned.indexOf("#");
    const code = hashIdx >= 0 ? cleaned.slice(0, hashIdx) : cleaned;
    const state = hashIdx >= 0 ? cleaned.slice(hashIdx + 1) : null;
    if (!code || code.length < 10) throw new Error("Code có vẻ quá ngắn — kiểm tra lại.");
    return { code, state: state || null };
}

async function claudeExchangeCode(code, state, codeVerifier) {
    const { requestUrl } = require("obsidian");
    const res = await requestUrl({
        url: CLAUDE_OAUTH.TOKEN_URL,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            state,
            client_id: CLAUDE_OAUTH.CLIENT_ID,
            redirect_uri: CLAUDE_OAUTH.REDIRECT_URI,
            code_verifier: codeVerifier,
        }),
        throw: false,
    });
    if (res.status !== 200) throw new Error(`Claude token exchange failed: ${res.status} ${(res.text || "").slice(0, 300)}`);
    return res.json;
}

async function claudeRefreshTokens(refreshToken) {
    const { requestUrl } = require("obsidian");
    const res = await requestUrl({
        url: CLAUDE_OAUTH.TOKEN_URL,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: CLAUDE_OAUTH.CLIENT_ID,
        }),
        throw: false,
    });
    if (res.status !== 200) throw new Error(`Claude token refresh failed: ${res.status} ${(res.text || "").slice(0, 300)}`);
    const j = res.json;
    if (!j || !j.access_token) throw new Error("Refresh response missing access_token");
    return {
        access_token: j.access_token,
        refresh_token: j.refresh_token || refreshToken,
        expires_in: typeof j.expires_in === "number" ? j.expires_in : 3600,
    };
}

// Trích account/plan nếu access token là JWT có claims (best-effort; OAuth token có thể opaque).
function claudeExtractAccountInfo(accessToken) {
    const claims = decodeJwt(accessToken) || {};
    return {
        accountId: (typeof claims.sub === "string" && claims.sub) || null,
        planType: (typeof claims.plan === "string" && claims.plan)
            || (typeof claims.account_type === "string" && claims.account_type) || null,
    };
}

async function ensureFreshClaudeProfile(plugin, profile) {
    if (!profile.refreshToken) throw new Error("Chưa login — vào Settings → Login.");
    if (!codexShouldRefresh(profile.expiresAt, profile.lastRefreshAt)) return profile;
    const fresh = await claudeRefreshTokens(profile.refreshToken);
    const now = new Date();
    profile.accessToken = fresh.access_token;
    profile.refreshToken = fresh.refresh_token;
    profile.expiresAt = new Date(now.getTime() + fresh.expires_in * 1000).toISOString();
    profile.lastRefreshAt = now.toISOString();
    await plugin.saveSettings();
    return profile;
}

// Build Codex Responses API request body từ messages OpenAI-shape
// Canonical message.content can be string OR array [{type:'text',text}, {type:'image',mediaType,base64,name}]
// Per-provider mappers chuyển canonical → wire format.

function _canonicalParts(content) {
    if (typeof content === "string") return [{ type: "text", text: content }];
    if (Array.isArray(content)) return content;
    return [{ type: "text", text: String(content ?? "") }];
}

function _flattenCanonicalToText(content) {
    return _canonicalParts(content).filter(p => p.type === "text").map(p => p.text).join("\n");
}

function messageContentToOpenAI(content) {
    if (typeof content === "string") return content;
    return _canonicalParts(content).map(p => {
        if (p.type === "image") {
            return { type: "image_url", image_url: { url: `data:${p.mediaType};base64,${p.base64}` } };
        }
        return { type: "text", text: p.text || "" };
    });
}

function messageContentToAnthropic(content) {
    if (typeof content === "string") return content;
    return _canonicalParts(content).map(p => {
        if (p.type === "image") {
            return { type: "image", source: { type: "base64", media_type: p.mediaType, data: p.base64 } };
        }
        return { type: "text", text: p.text || "" };
    });
}

function messageContentToGeminiParts(content) {
    return _canonicalParts(content).map(p => {
        if (p.type === "image") {
            return { inline_data: { mime_type: p.mediaType, data: p.base64 } };
        }
        return { text: p.text || "" };
    });
}

function messageContentToCodex(role, content) {
    const textType = role === "assistant" ? "output_text" : "input_text";
    if (typeof content === "string") return [{ type: textType, text: content }];
    return _canonicalParts(content).map(p => {
        if (p.type === "image") {
            // Codex Responses API: input_image with image_url
            return { type: "input_image", image_url: `data:${p.mediaType};base64,${p.base64}` };
        }
        return { type: textType, text: p.text || "" };
    });
}

function buildCodexRequestBody(model, messages, systemPrompt) {
    const input = messages.map(m => ({
        type: "message",
        role: m.role,
        content: messageContentToCodex(m.role, m.content)
    }));
    return {
        model,
        instructions: systemPrompt,
        input,
        store: false,
        stream: true,
    };
}

// ============================================================================
// GEMINI CODE ASSIST OAUTH — ported from google-gemini/gemini-cli
// (paste-back flow + PKCE; uses Code Assist v1internal endpoint)
// ============================================================================

const GEMINI_OAUTH = {
    // Gemini Code Assist OAuth dùng public installed-app credentials của Gemini CLI.
    // KHÔNG hardcode trong source (tránh leak vào repo + GitHub secret-scanning).
    // Người dùng tự dán Client ID + Secret trong Settings → profile "Gemini Code Assist (OAuth)".
    CLIENT_ID: "",
    CLIENT_SECRET: "",
    AUTHORIZE_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    TOKEN_URL: "https://oauth2.googleapis.com/token",
    REDIRECT_URI: "https://codeassist.google.com/authcode",
    CODE_ASSIST_BASE: "https://cloudcode-pa.googleapis.com/v1internal",
    MODELS_URL: "https://generativelanguage.googleapis.com/v1beta/models",
    SCOPES: [
        "https://www.googleapis.com/auth/cloud-platform",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ].join(" "),
    // metadata gửi kèm tất cả Code Assist requests — bắt buộc, server reject nếu thiếu
    CLIENT_METADATA: {
        ideType: "IDE_UNSPECIFIED",
        platform: "PLATFORM_UNSPECIFIED",
        pluginType: "GEMINI"
    },
    // Hardcoded list — Gemini CLI cũng hardcode (không có Code Assist :listModels endpoint).
    // generativelanguage.googleapis.com/v1beta/models cần scope khác mà Gemini CLI client_id không có.
    DEFAULT_MODELS: [
        // Stable
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        // Preview Gemini 3
        "gemini-3-pro-preview",
        "gemini-3-flash-preview",
        // Preview Gemini 3.1 (cần early access)
        "gemini-3.1-pro-preview",
        "gemini-3.1-pro-preview-customtools",
        "gemini-3.1-flash-lite-preview"
    ]
};

// Lấy Gemini OAuth creds từ profile (người dùng tự khai trong Settings); fallback constant (rỗng).
function geminiOAuthCreds(profile) {
    const clientId = (profile && profile.oauthClientId) || GEMINI_OAUTH.CLIENT_ID;
    const clientSecret = (profile && profile.oauthClientSecret) || GEMINI_OAUTH.CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("Gemini OAuth chưa có Client ID/Secret. Mở Settings → profile \"Gemini Code Assist (OAuth)\" và dán Client ID + Client Secret (creds công khai của Gemini CLI).");
    }
    return { clientId, clientSecret };
}

// Mở URL ngoài cross-platform: desktop dùng electron shell, mobile fallback window.open.
function openExternalUrl(url) {
    try {
        const { shell } = require("electron");
        shell.openExternal(url);
        return;
    } catch (e) {
        // Mobile: không có electron.
    }
    window.open(url, "_blank");
}

function buildGeminiAuthorizeUrl(state, codeChallenge, clientId) {
    const qs = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: GEMINI_OAUTH.REDIRECT_URI,
        scope: GEMINI_OAUTH.SCOPES,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        access_type: "offline",
        prompt: "consent",
        state,
    });
    return `${GEMINI_OAUTH.AUTHORIZE_URL}?${qs.toString()}`;
}

// User có thể paste raw code (Google render code trên trang authcode)
// hoặc full URL có ?code=... — accept cả 2 cho UX nhất quán với Codex modal.
function parseGeminiCallbackInput(rawInput) {
    const input = (rawInput || "").trim();
    if (!input) throw new Error("Input rỗng — paste code hoặc URL trước.");
    if (input.startsWith("http://") || input.startsWith("https://")) {
        try {
            const u = new URL(input);
            const code = u.searchParams.get("code");
            const state = u.searchParams.get("state");
            if (!code) throw new Error("URL không chứa `code` parameter.");
            return { code, state };
        } catch (e) {
            throw new Error(`URL không hợp lệ: ${e.message}`);
        }
    }
    // Raw code: 4/0Ab... pattern hoặc tương tự
    const cleaned = input.replace(/\s+/g, "");
    if (cleaned.length < 10) throw new Error("Code có vẻ quá ngắn — kiểm tra lại.");
    return { code: cleaned, state: null };
}

async function geminiExchangeCode(code, codeVerifier, creds) {
    const { requestUrl } = require("obsidian");
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: GEMINI_OAUTH.REDIRECT_URI,
        code_verifier: codeVerifier,
    });
    const res = await requestUrl({
        url: GEMINI_OAUTH.TOKEN_URL,
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        throw: false,
    });
    if (res.status !== 200) throw new Error(`Gemini token exchange failed: ${res.status} ${(res.text || "").slice(0, 300)}`);
    return res.json;
}

async function geminiRefreshTokens(refreshToken, creds) {
    const { requestUrl } = require("obsidian");
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
    });
    const res = await requestUrl({
        url: GEMINI_OAUTH.TOKEN_URL,
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        throw: false,
    });
    if (res.status !== 200) throw new Error(`Gemini token refresh failed: ${res.status} ${(res.text || "").slice(0, 300)}`);
    const j = res.json;
    if (!j || !j.access_token) throw new Error("Refresh response missing access_token");
    return {
        access_token: j.access_token,
        // Google thường KHÔNG return refresh_token mới — reuse cached
        refresh_token: j.refresh_token || refreshToken,
        id_token: j.id_token || null,
        expires_in: typeof j.expires_in === "number" ? j.expires_in : 3600,
    };
}

function geminiExtractEmail(idToken) {
    const claims = decodeJwt(idToken) || {};
    return (typeof claims.email === "string" && claims.email) || null;
}

function geminiShouldRefresh(expiresAtIso, lastRefreshAtIso) {
    // Reuse Codex heuristic — same windows
    return codexShouldRefresh(expiresAtIso, lastRefreshAtIso);
}

async function ensureFreshGeminiProfile(plugin, profile) {
    if (!profile.refreshToken) throw new Error("Chưa login — vào Settings → Login.");
    if (!geminiShouldRefresh(profile.expiresAt, profile.lastRefreshAt)) return profile;

    const fresh = await geminiRefreshTokens(profile.refreshToken, geminiOAuthCreds(profile));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + fresh.expires_in * 1000);

    profile.accessToken = fresh.access_token;
    profile.refreshToken = fresh.refresh_token;
    if (fresh.id_token) {
        profile.idToken = fresh.id_token;
        const email = geminiExtractEmail(fresh.id_token);
        if (email) profile.email = email;
    }
    profile.expiresAt = expiresAt.toISOString();
    profile.lastRefreshAt = now.toISOString();
    await plugin.saveSettings();
    return profile;
}

// ----- Code Assist setup (loadCodeAssist + onboardUser LRO) -----

async function geminiCodeAssistRequest(accessToken, method, path, bodyObj) {
    const { requestUrl } = require("obsidian");
    const url = `${GEMINI_OAUTH.CODE_ASSIST_BASE}${path}`;
    const opts = {
        url,
        method,
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        throw: false,
    };
    if (bodyObj !== undefined) opts.body = JSON.stringify(bodyObj);
    const res = await requestUrl(opts);
    if (res.status < 200 || res.status >= 300) {
        throw new Error(`Code Assist ${method} ${path} → ${res.status}: ${(res.text || "").slice(0, 400)}`);
    }
    return res.json;
}

async function geminiLoadCodeAssist(accessToken, projectId) {
    const body = {
        metadata: { ...GEMINI_OAUTH.CLIENT_METADATA },
    };
    if (projectId) {
        body.cloudaicompanionProject = projectId;
        body.metadata.duetProject = projectId;
    }
    return geminiCodeAssistRequest(accessToken, "POST", ":loadCodeAssist", body);
}

async function geminiOnboardUser(accessToken, tierId, projectId) {
    const body = {
        tierId,
        metadata: { ...GEMINI_OAUTH.CLIENT_METADATA },
    };
    // CRITICAL: free-tier KHÔNG được truyền cloudaicompanionProject (Precondition Failed)
    if (projectId && tierId !== "free-tier") {
        body.cloudaicompanionProject = projectId;
        body.metadata.duetProject = projectId;
    }
    let lro = await geminiCodeAssistRequest(accessToken, "POST", ":onboardUser", body);

    // Poll LRO until done (max 30s, every 5s)
    const startTs = Date.now();
    while (lro && lro.done === false && lro.name) {
        if (Date.now() - startTs > 30000) throw new Error("Onboarding timeout (>30s)");
        await new Promise(r => setTimeout(r, 5000));
        lro = await geminiCodeAssistRequest(accessToken, "GET", `/${lro.name}`);
    }
    return lro;
}

// Returns { tier, projectId, loadResponse } — caller sẽ save vào profile
async function geminiSetupUser(accessToken, providedProjectId) {
    const loadRes = await geminiLoadCodeAssist(accessToken, providedProjectId);
    // Auto-detect project ID nếu user không nhập
    const detectedProject = (loadRes && loadRes.cloudaicompanionProject) || null;
    const finalProject = providedProjectId || detectedProject || null;

    const currentTier = (loadRes && loadRes.currentTier && loadRes.currentTier.id) || null;
    if (currentTier) {
        // Đã onboarded rồi — dùng tier hiện tại
        return { tier: currentTier, projectId: finalProject, loadResponse: loadRes };
    }

    // Chưa onboarded → gọi onboardUser. Auto-detect tier từ paidTier ưu tiên.
    const paidTierId = loadRes && loadRes.paidTier && loadRes.paidTier.id;
    const allowedTier = loadRes && loadRes.allowedTiers && loadRes.allowedTiers[0] && loadRes.allowedTiers[0].id;
    const tierId = paidTierId || allowedTier || "free-tier";

    const lro = await geminiOnboardUser(accessToken, tierId, finalProject);
    const onboardedProject = (lro && lro.response && lro.response.cloudaicompanionProject && lro.response.cloudaicompanionProject.id) || finalProject;
    return { tier: tierId, projectId: onboardedProject, loadResponse: loadRes };
}

// Build Code Assist request body — convert OpenAI-shape messages sang Gemini contents
function openaiMessagesToGeminiContents(messages) {
    return messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: messageContentToGeminiParts(m.content)
    }));
}

function buildGeminiCodeAssistBody(profile, messages, systemPrompt) {
    const userPromptId = Array.from(randomBytesCompat(16)).map(b => b.toString(16).padStart(2, "0")).join("");
    const inner = {
        contents: openaiMessagesToGeminiContents(messages),
        generationConfig: { maxOutputTokens: profile.maxTokens || 32000 },   // tránh cắt output dài
    };
    if (systemPrompt) {
        inner.systemInstruction = { parts: [{ text: systemPrompt }] };
    }
    if (profile.sessionId) inner.session_id = profile.sessionId;
    return {
        model: profile.model,
        project: profile.projectId || undefined,
        user_prompt_id: userPromptId,
        request: inner,
    };
}

// ============================================================================
// MCP CLIENT — JSON-RPC 2.0 over stdio cho long-running subprocess
// (tích hợp NotebookLM MCP server, mở rộng cho server MCP khác sau này)
// ============================================================================

class MCPClient {
    constructor(command, args, options) {
        this.command = command;
        this.args = args || [];
        this.env = (options && options.env) || {};
        this.proc = null;
        this.buffer = "";
        this.nextId = 1;
        this.pending = new Map();
        this.tools = [];
        this.initialized = false;
        this.onLog = (options && options.onLog) || ((...a) => console.log("[mcp]", ...a));
        this.requestTimeoutMs = (options && options.requestTimeoutMs) || 60000;
    }

    async start() {
        const { spawn } = require("child_process");
        try {
            this.proc = spawn(this.command, this.args, {
                stdio: ["pipe", "pipe", "pipe"],
                env: { ...process.env, ...this.env }
            });
        } catch (e) {
            throw new Error(`MCP spawn failed (${this.command}): ${e.message}`);
        }
        this.proc.stdout.on("data", c => this._onStdout(c));
        this.proc.stderr.on("data", c => this.onLog("[stderr]", c.toString().trim()));
        this.proc.on("exit", code => this._onExit(code));
        this.proc.on("error", err => this._onError(err));
        await new Promise(r => setTimeout(r, 100));
        if (!this.proc.pid) {
            throw new Error(`MCP process không spawn được — kiểm tra command path: ${this.command}`);
        }
        await this._handshake();
    }

    async _handshake() {
        await this._request("initialize", {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            clientInfo: { name: "bob-obsidian", version: "1.0.0" }
        });
        this._sendRaw({ jsonrpc: "2.0", method: "notifications/initialized" });
        const toolsRes = await this._request("tools/list", {});
        this.tools = (toolsRes && toolsRes.tools) || [];
        this.initialized = true;
        this.onLog(`initialized — ${this.tools.length} tools`);
    }

    _onStdout(chunk) {
        this.buffer += chunk.toString("utf8");
        const lines = this.buffer.split("\n");
        this.buffer = lines.pop();
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const msg = JSON.parse(line);
                this._dispatch(msg);
            } catch (e) {
                this.onLog("[parse-err]", line.slice(0, 200));
            }
        }
    }

    _dispatch(msg) {
        if (msg.id !== undefined && this.pending.has(msg.id)) {
            const { resolve, reject, timer } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            clearTimeout(timer);
            if (msg.error) {
                reject(new Error(msg.error.message || JSON.stringify(msg.error)));
            } else {
                resolve(msg.result);
            }
            return;
        }
        if (msg.method === "notifications/message") {
            this.onLog("[notify]", JSON.stringify(msg.params).slice(0, 200));
        }
    }

    _onExit(code) {
        this.initialized = false;
        for (const { reject, timer } of this.pending.values()) {
            clearTimeout(timer);
            reject(new Error(`MCP server exited (code ${code})`));
        }
        this.pending.clear();
        this.onLog(`exited code=${code}`);
    }

    _onError(err) {
        this.onLog("[spawn-err]", err.message);
    }

    _sendRaw(obj) {
        if (!this.proc || !this.proc.stdin || !this.proc.stdin.writable) {
            throw new Error("MCP process not running");
        }
        this.proc.stdin.write(JSON.stringify(obj) + "\n");
    }

    async _request(method, params) {
        const id = this.nextId++;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error(`MCP timeout: ${method} (${this.requestTimeoutMs}ms)`));
                }
            }, this.requestTimeoutMs);
            this.pending.set(id, { resolve, reject, timer });
            try {
                this._sendRaw({ jsonrpc: "2.0", id, method, params });
            } catch (e) {
                this.pending.delete(id);
                clearTimeout(timer);
                reject(e);
            }
        });
    }

    async callTool(name, args) {
        if (!this.initialized) throw new Error("MCP not initialized");
        return await this._request("tools/call", { name, arguments: args || {} });
    }

    stop() {
        if (!this.proc) return;
        try { this.proc.stdin.end(); } catch {}
        const proc = this.proc;
        setTimeout(() => {
            if (proc && !proc.killed) {
                try { proc.kill("SIGKILL"); } catch {}
            }
        }, 2000);
        this.proc = null;
        this.initialized = false;
    }
}

// ============================================================================
// Concurrency primitives — Semaphore (limit parallel) + Mutex (serialize shared)
// ============================================================================

class Semaphore {
    constructor(max) {
        this.max = max;
        this.current = 0;
        this.queue = [];
    }
    async acquire() {
        if (this.current < this.max) { this.current++; return; }
        await new Promise(resolve => this.queue.push(resolve));
    }
    release() {
        this.current--;
        const next = this.queue.shift();
        if (next) { this.current++; next(); }
    }
}

class Mutex {
    constructor() { this.locked = false; this.queue = []; }
    async acquire() {
        if (!this.locked) { this.locked = true; return; }
        await new Promise(resolve => this.queue.push(resolve));
    }
    release() {
        const next = this.queue.shift();
        if (next) next(); else this.locked = false;
    }
}

// ============================================================================
// callLLMHeadless — gọi LLM provider không qua UI streaming (cho INGEST_BATCH)
// ============================================================================

async function callLLMHeadless(plugin, profile, messages, systemPrompt) {
    const { requestUrl } = require('obsidian');

    // Refresh OAuth tokens nếu cần
    if (profile.provider === "chatgpt-oauth") {
        profile = await ensureFreshCodexProfile(plugin, profile);
    } else if (profile.provider === "gemini-oauth") {
        profile = await ensureFreshGeminiProfile(plugin, profile);
    } else if (profile.provider === "anthropic-oauth") {
        profile = await ensureFreshClaudeProfile(plugin, profile);
    }

    // Codex Responses API BẮT BUỘC stream:true (non-stream → 400 "Stream must be set to true").
    // Provider này: gửi stream rồi gom SSE deltas thành text. Provider khác: non-stream cho gọn.
    const mustStream = profile.provider === "chatgpt-oauth";

    const requestSpec = buildChatRequest(profile, messages, systemPrompt, mustStream);
    if (requestSpec.body && typeof requestSpec.body === 'object') {
        requestSpec.body.stream = mustStream;
    }

    const res = await requestUrl({
        url: requestSpec.url,
        method: 'POST',
        headers: requestSpec.headers,
        body: JSON.stringify(requestSpec.body),
        throw: false
    });
    if (res.status !== 200) {
        throw new Error(`LLM HTTP ${res.status}: ${(res.text || '').slice(0, 300)}`);
    }
    const reply = mustStream
        ? aggregateStreamText(profile.provider, res.text || "")
        : parseNonStreamResponse(profile.provider, res.json);
    if (!reply) throw new Error("LLM trả response rỗng");
    return reply;
}

function newProfileId() {
    return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function makeProfileFromPreset(presetKey) {
    const p = PROVIDER_PRESETS[presetKey] || PROVIDER_PRESETS.custom;
    return {
        id: newProfileId(),
        name: p.label,
        provider: p.provider,
        apiKey: "",
        baseUrl: p.baseUrl,
        model: p.model
    };
}

const DEFAULT_SETTINGS = {
    activeProfileId: "",
    profiles: [],
    onboarded: false,
    userProfile: {
        userName: "",
        botName: "Wiki Agent",
        location: "",
        doing: "",
        language: "Tiếng Việt",
        honorific: "bạn",
        persona: "",
        soul: "",
        communicationStyle: "",
        templatesFolder: "",
        tasksFile: ""
    },
    contextExcludeFolders: DEFAULT_FOLDER_EXCLUDES,
    ytDlpPath: "yt-dlp",   // có thể đổi sang absolute path nếu yt-dlp không trên PATH
    whisper: {
        enabled: false,
        apiKey: "",
        baseUrl: "https://api.openai.com/v1/audio/transcriptions",
        model: "whisper-1",          // hoặc "gpt-4o-transcribe", "gpt-4o-mini-transcribe"
        language: ""                 // ISO-639-1 vd "vi","en"; để trống = auto
    },
    mcp: {
        notebooklmEnabled: false,
        notebooklmCommand: "notebooklm-mcp",   // dùng PATH; nhập absolute path nếu cần
        notebooklmArgs: [],
        notebooklmTimeoutMs: 180000            // 3 phút — query notebook to cần lâu hơn 60s default
    },
    github: {
        token: ""                              // Personal Access Token — https://github.com/settings/tokens. Scope: public_repo (public) hoặc repo (private). Empty = anonymous (60 req/h).
    },
    maintenance: {
        mode: "auto",            // 'off' | 'deterministic' | 'auto'
        excludeKalix: true,      // bỏ qua 99.KALIX SYSTEM khi auto-fix naming (zone riêng)
        gitCheckpoint: true,     // tạo git commit checkpoint trước mỗi lần chạy
        lastRun: ""              // 'YYYY-MM-DD' — chống chạy lại trong ngày
    }
};

// One-time profile schema migration — đảm bảo mọi profile có vision flag
function migrateProfileSchema(profile) {
    if (typeof profile.vision !== "boolean") profile.vision = false;
    return profile;
}

// ============================================================================
// PROVIDER ADAPTER — translate request/response between providers
// ============================================================================

function buildChatRequest(profile, messages, systemPrompt, stream) {
    const { provider, apiKey, baseUrl, model } = profile;

    if (provider === "chatgpt-oauth") {
        const headers = {
            "Authorization": `Bearer ${profile.accessToken}`,
            "OpenAI-Beta": "responses=experimental",
            "Content-Type": "application/json",
        };
        if (profile.accountId) headers["chatgpt-account-id"] = profile.accountId;
        return {
            url: baseUrl || CODEX_OAUTH.RESPONSES_URL,
            headers,
            body: buildCodexRequestBody(model, messages, systemPrompt),
        };
    }

    if (provider === "gemini-oauth") {
        const root = (baseUrl || GEMINI_OAUTH.CODE_ASSIST_BASE).replace(/\/$/, "");
        const action = stream ? "streamGenerateContent" : "generateContent";
        const sse = stream ? "?alt=sse" : "";
        return {
            url: `${root}:${action}${sse}`,
            headers: {
                "Authorization": `Bearer ${profile.accessToken}`,
                "Content-Type": "application/json",
            },
            body: buildGeminiCodeAssistBody(profile, messages, systemPrompt),
        };
    }

    if (provider === "anthropic") {
        return {
            url: baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: {
                model,
                max_tokens: profile.maxTokens || 32000,   // nâng output để note/sơ đồ dài không bị cắt giữa $$WRITE$$ (model cũ cap 8192 → set profile.maxTokens thấp hơn)
                system: systemPrompt,
                messages: messages.map(m => ({ role: m.role, content: messageContentToAnthropic(m.content) })),
                stream
            }
        };
    }

    if (provider === "anthropic-oauth") {
        return {
            url: baseUrl || "https://api.anthropic.com/v1/messages",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${profile.accessToken}`,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': CLAUDE_OAUTH.BETA_HEADER,
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: {
                model,
                max_tokens: profile.maxTokens || 32000,
                // System BẮT BUỘC dạng array, block đầu = chuỗi spoof Claude Code (xem CLAUDE_OAUTH.SPOOF_SYSTEM).
                system: [
                    { type: "text", text: CLAUDE_OAUTH.SPOOF_SYSTEM },
                    { type: "text", text: systemPrompt }
                ],
                messages: messages.map(m => ({ role: m.role, content: messageContentToAnthropic(m.content) })),
                stream
            }
        };
    }

    if (provider === "google") {
        const root = baseUrl.replace(/\/$/, '');
        const action = stream ? "streamGenerateContent" : "generateContent";
        const sse = stream ? "&alt=sse" : "";
        return {
            url: `${root}/models/${model}:${action}?key=${apiKey}${sse}`,
            headers: { 'Content-Type': 'application/json' },
            body: {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: messages.map(m => ({
                    role: m.role === "assistant" ? "model" : "user",
                    parts: messageContentToGeminiParts(m.content)
                })),
                generationConfig: { maxOutputTokens: profile.maxTokens || 32000 }   // tránh cắt output dài (mặc định Gemini có thể thấp)
            }
        };
    }

    if (provider === "gemini-web") {
        const actualUrl = baseUrl.endsWith("/chat/completions") ? baseUrl : (baseUrl.endsWith("/") ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`);
        return {
            url: actualUrl,
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
            },
            body: {
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map(m => ({ role: m.role, content: messageContentToOpenAI(m.content) }))
                ],
                max_tokens: profile.maxTokens || 32000,
                stream
            }
        };
    }

    // openai-compatible + ollama (ollama hỗ trợ /v1/chat/completions OpenAI-compat)
    return {
        url: baseUrl,
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: {
            model,
            messages: [
                { role: "system", content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: messageContentToOpenAI(m.content) }))
            ],
            max_tokens: profile.maxTokens || 32000,   // nâng output để note dài không bị cắt giữa $$WRITE$$ (proxy có thể hard-cap thấp hơn)
            stream
        }
    };
}

// Parse 1 SSE line. state = { eventType } để giữ event type giữa các lines (Anthropic).
function parseStreamLine(provider, line, state) {
    if (provider === "chatgpt-oauth") {
        // Codex Responses API SSE: events có data: {json} với field type
        if (!line.startsWith("data: ")) return { textDelta: "", done: false };
        const payload = line.slice(6);
        if (payload === "[DONE]") return { textDelta: "", done: true };
        try {
            const ev = JSON.parse(payload);
            if (!ev || typeof ev !== "object") return { textDelta: "", done: false };
            if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") {
                return { textDelta: ev.delta, done: false };
            }
            if (ev.type === "response.output_text.done" && typeof ev.text === "string") {
                // 'done' event: full text — not a delta. Skip để tránh duplicate (deltas đã accumulate đủ).
                return { textDelta: "", done: false };
            }
            if (ev.type === "response.completed") {
                return { textDelta: "", done: true };
            }
        } catch (e) {}
        return { textDelta: "", done: false };
    }

    if (provider === "anthropic" || provider === "anthropic-oauth") {
        if (line.startsWith("event: ")) {
            state.eventType = line.slice(7).trim();
            return { textDelta: "", done: false };
        }
        if (line.startsWith("data: ")) {
            try {
                const data = JSON.parse(line.slice(6));
                if (state.eventType === "content_block_delta" && data.delta && typeof data.delta.text === "string") {
                    return { textDelta: data.delta.text, done: false };
                }
                if (state.eventType === "message_stop") {
                    return { textDelta: "", done: true };
                }
            } catch (e) {}
        }
        return { textDelta: "", done: false };
    }

    if (provider === "google") {
        if (line.startsWith("data: ")) {
            try {
                const data = JSON.parse(line.slice(6));
                const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text || "";
                const done = !!(data.candidates && data.candidates[0] && data.candidates[0].finishReason);
                return { textDelta: text, done };
            } catch (e) {}
        }
        return { textDelta: "", done: false };
    }

    if (provider === "gemini-web") {
        if (line === "data: [DONE]") return { textDelta: "", done: true };
        if (line.startsWith("data: ")) {
            try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content || "";
                return { textDelta: delta, done: false };
            } catch (e) {}
        }
        return { textDelta: "", done: false };
    }

    if (provider === "gemini-oauth") {
        // Code Assist SSE: data: { response: { candidates: [...], usageMetadata: {...} } }
        if (!line.startsWith("data: ")) return { textDelta: "", done: false };
        try {
            const ev = JSON.parse(line.slice(6));
            const inner = (ev && ev.response) || ev || {};
            const cand = inner.candidates && inner.candidates[0];
            if (!cand) return { textDelta: "", done: false };
            const parts = (cand.content && cand.content.parts) || [];
            let text = "";
            for (const p of parts) {
                if (p && typeof p.text === "string" && !p.thought) text += p.text;
            }
            const done = !!cand.finishReason;
            return { textDelta: text, done };
        } catch (e) {}
        return { textDelta: "", done: false };
    }

    // openai-compatible + ollama
    if (line === "data: [DONE]") return { textDelta: "", done: true };
    if (line.startsWith("data: ")) {
        try {
            const data = JSON.parse(line.slice(6));
            const delta = data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content || "";
            return { textDelta: delta, done: false };
        } catch (e) {}
    }
    return { textDelta: "", done: false };
}

function parseNonStreamResponse(provider, json) {
    if (provider === "anthropic" || provider === "anthropic-oauth") {
        return (json.content && json.content[0] && json.content[0].text) || "";
    }
    if (provider === "google") {
        return (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text) || "";
    }
    if (provider === "gemini-oauth") {
        const inner = (json && json.response) || json || {};
        const parts = (inner.candidates && inner.candidates[0] && inner.candidates[0].content && inner.candidates[0].content.parts) || [];
        let out = "";
        for (const p of parts) {
            if (p && typeof p.text === "string" && !p.thought) out += p.text;
        }
        return out;
    }
    if (provider === "gemini-web") {
        return (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || "";
    }
    return (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) || "";
}

// Gom 1 SSE response đã buffer đầy đủ thành text — cho provider BẮT BUỘC stream (vd Codex).
// Tái dùng parseStreamLine y như stream consumer của UI (tách theo '\n', cộng dồn textDelta).
function aggregateStreamText(provider, rawText) {
    let out = "";
    const state = { eventType: null };
    for (const line of String(rawText).split("\n")) {
        if (!line) continue;
        const { textDelta } = parseStreamLine(provider, line.replace(/\r$/, ""), state);
        if (textDelta) out += textDelta;
    }
    return out;
}

async function listModels(profile) {
    const { requestUrl } = require('obsidian');
    const { provider, apiKey, baseUrl } = profile;

    if (provider === "gemini-web") {
        // Fetch từ AgentBridge /v1/models (OpenAI-compatible). Fallback nếu lỗi.
        try {
            // Normalize: bỏ trailing slash + bỏ /chat/completions nếu có → đảm bảo append /models đúng.
            const root = String(baseUrl || "")
                .replace(/\/+$/, '')
                .replace(/\/chat\/completions$/, '');
            const modelsUrl = `${root}/models`;
            const r = await requestUrl({
                url: modelsUrl,
                method: "GET",
                headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {},
                throw: false,
            });
            const ids = ((r.json && r.json.data) || []).map(m => m.id).filter(Boolean);
            if (ids.length > 0) return ids.sort();
        } catch (_) { /* fallthrough to default */ }
        return ["gemini-web"];
    }

    if (provider === "chatgpt-oauth") {
        if (!profile.accessToken) throw new Error("Chưa login. Click Login trong Settings.");
        const headers = {
            "Authorization": `Bearer ${profile.accessToken}`,
            "User-Agent": `codex_cli_rs/${CODEX_OAUTH.CLIENT_VERSION}`,
            "OpenAI-Beta": "responses=experimental",
        };
        if (profile.accountId) headers["chatgpt-account-id"] = profile.accountId;
        const url = `${CODEX_OAUTH.MODELS_URL}?client_version=${CODEX_OAUTH.CLIENT_VERSION}`;
        const r = await requestUrl({ url, method: "GET", headers, throw: false });
        if (r.status !== 200) throw new Error(`Codex models fetch failed: ${r.status} ${(r.text||"").slice(0,200)}`);
        const raw = (r.json && r.json.models) || [];
        return raw
            .filter(m => typeof m.slug === "string" && m.slug && m.visibility !== "hidden" && m.supported_in_api !== false)
            .sort((a, b) => (a.priority || 999) - (b.priority || 999))
            .map(m => m.slug);
    }

    if (provider === "gemini-oauth") {
        if (!profile.accessToken) throw new Error("Chưa login. Click Login trong Settings.");
        // Code Assist không có endpoint :listModels; generativelanguage models endpoint
        // yêu cầu scope mà Gemini CLI client_id không có. Trả về list curated từ Gemini CLI source.
        return [...GEMINI_OAUTH.DEFAULT_MODELS];
    }

    if (provider === "anthropic") {
        const r = await requestUrl({
            url: "https://api.anthropic.com/v1/models",
            method: "GET",
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
        });
        return ((r.json && r.json.data) || []).map(m => m.id).sort();
    }

    if (provider === "anthropic-oauth") {
        if (!profile.accessToken) throw new Error("Chưa login. Click Login trong Settings.");
        const r = await requestUrl({
            url: "https://api.anthropic.com/v1/models",
            method: "GET",
            headers: {
                'Authorization': `Bearer ${profile.accessToken}`,
                'anthropic-version': '2023-06-01',
                'anthropic-beta': CLAUDE_OAUTH.BETA_HEADER
            },
            throw: false,
        });
        if (r.status === 200 && r.json && Array.isArray(r.json.data)) {
            return r.json.data.map(m => m.id).sort();
        }
        // /v1/models có thể không cho OAuth subscription token → fallback list tĩnh (gõ tay vẫn được).
        return ["claude-opus-4-1", "claude-sonnet-4-5", "claude-3-5-haiku-latest"];
    }

    if (provider === "google") {
        const root = baseUrl.replace(/\/$/, '');
        const r = await requestUrl({ url: `${root}/models?key=${apiKey}`, method: "GET" });
        return ((r.json && r.json.models) || []).map(m => m.name.replace(/^models\//, '')).sort();
    }

    if (provider === "ollama") {
        const host = new URL(baseUrl).origin;
        const r = await requestUrl({ url: `${host}/api/tags`, method: "GET" });
        return ((r.json && r.json.models) || []).map(m => m.name).sort();
    }

    // openai-compatible: derive .../models from .../chat/completions
    const modelsUrl = baseUrl.replace(/\/chat\/completions\/?$/, '/models');
    const r = await requestUrl({
        url: modelsUrl,
        method: "GET",
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
    return ((r.json && r.json.data) || []).map(m => m.id).sort();
}

class ObsidianAgentChatView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.messages = [];
        // Profile dùng cho mỗi request được đọc dynamic qua this.plugin.getActiveProfile()
        // → cho phép switch provider giữa session mà không phải reopen view.
        this.currentChatFile = null;
        this.isRunning = false;
        this.aborted = false;
        this.currentReq = null;
    }

    getViewType() {
        return VIEW_TYPE_OBSIDIAN_AGENT;
    }

    getDisplayText() {
        return "Wiki Agent";
    }

    getIcon() {
        return "bot";
    }

    refreshHeaderProfile() {
        // Profile switcher đã bỏ — chỉ cần refresh model select để follow active profile
        this.refreshModelSelect();
    }

    refreshModelSelect() {
        if (!this.modelSelect) return;
        this.modelSelect.empty();
        const profile = this.plugin.getActiveProfile();
        if (!profile) {
            const opt = this.modelSelect.createEl("option");
            opt.value = "";
            opt.text = "(chưa có profile)";
            this.modelSelect.disabled = true;
            return;
        }
        this.modelSelect.disabled = false;

        const fetched = profile.fetchedModels || [];
        const models = fetched.length > 0 ? [...fetched] : [];
        if (profile.model && !models.includes(profile.model)) models.unshift(profile.model);
        if (models.length === 0) models.push("(chưa fetch — vào Settings)");

        for (const m of models) {
            const opt = this.modelSelect.createEl("option", { value: m, text: m });
            if (m === profile.model) opt.selected = true;
        }
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass("obsidian-agent-container");

        // Header
        const header = container.createDiv({ cls: "obsidian-agent-header" });
        const badgeRow = header.createDiv({ cls: "obsidian-agent-badge-row" });
        badgeRow.createEl("h3", { text: "Wiki Agent" });

        const headerBtns = badgeRow.createDiv({ cls: "obsidian-agent-header-btns" });

        // History button
        const historyOpenBtn = headerBtns.createEl("button", { cls: "obsidian-agent-btn-small obsidian-agent-btn-history" });
        const historyIcon = historyOpenBtn.createSpan();
        setIcon(historyIcon, "folder-open");
        historyOpenBtn.createSpan({ text: "Lịch sử" });
        this.historyPanel = header.createDiv({ cls: "obsidian-agent-history-panel" });
        this.historyPanel.style.display = "none";
        historyOpenBtn.addEventListener("click", () => this.toggleHistoryPanel());

        const newChatBtn = headerBtns.createEl("button", { cls: "obsidian-agent-btn-small" });
        const newChatIcon = newChatBtn.createSpan();
        setIcon(newChatIcon, "plus");
        newChatBtn.createSpan({ text: "Hội thoại mới" });
        newChatBtn.addEventListener("click", () => {
            this.messages = [];
            this.currentChatFile = null;
            this.currentJsonFile = null;
            this.renderMessages();
        });

        // Message List
        this.messageContainer = container.createDiv({ cls: "obsidian-agent-messages" });

        // Floating toolbar khi user bôi đen text trong bubble assistant
        this._initSelectionToolbar(container);

        this.attachments = [];
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordChunks = [];
        this.recordStream = null;
        const inputArea = container.createDiv({ cls: "obsidian-agent-input-area" });
        this.attachmentContainer = inputArea.createDiv({ cls: "obsidian-agent-attachment-container" });

        this.textarea = inputArea.createEl("textarea", {
            placeholder: "Nhắn gì đó cho trợ lý... (Enter để gửi, Shift+Enter xuống dòng, '/' để xem lệnh nhanh)",
            cls: "obsidian-agent-textarea"
        });

        // Slash command menu (anchored above textarea)
        this.slashMenu = inputArea.createDiv({ cls: "obsidian-agent-slash-menu" });
        this.slashMenu.style.display = "none";
        this.slashIndex = 0;
        this.slashFiltered = [];
        this._setupSlashCommands();

        const btnRow = inputArea.createDiv({ cls: "obsidian-agent-btn-row" });

        const contextBtn = btnRow.createEl("button", { cls: "obsidian-agent-btn-secondary obsidian-agent-btn-icon-only", title: "Đính kèm" });
        const attachIcon = contextBtn.createSpan();
        setIcon(attachIcon, "paperclip");
        contextBtn.addEventListener("click", (e) => {
            const menu = new (require('obsidian').Menu)();
            menu.addItem(i => i.setTitle("Chọn file từ máy…").setIcon("hard-drive").onClick(() => this._pickFilesFromDisk()));
            menu.addItem(i => i.setTitle("Nhúng file/text đang mở").setIcon("file-text").onClick(() => this.appendContext()));
            menu.showAtMouseEvent(e);
        });

        this.micBtn = btnRow.createEl("button", { cls: "obsidian-agent-btn-secondary obsidian-agent-btn-icon-only", title: "Ghi âm (speech-to-text)" });
        setIcon(this.micBtn.createSpan(), "mic");
        this.micBtn.addEventListener("click", () => this._toggleVoiceRecording());

        // Model picker — chỉ hiện model của profile đang active
        this.modelSelect = btnRow.createEl("select", { cls: "obsidian-agent-model-select" });
        this.modelSelect.addEventListener("change", async (e) => {
            const profile = this.plugin.getActiveProfile();
            if (!profile) return;
            profile.model = e.target.value;
            await this.plugin.saveSettings();
            new Notice(`Đã chuyển sang model: ${profile.model}`);
        });
        this.refreshModelSelect();

        this.sendBtn = btnRow.createEl("button", { text: "Gửi", cls: "obsidian-agent-btn-primary" });
        this.sendBtn.addEventListener("click", () => this.sendMessage());

        this.stopBtn = btnRow.createEl("button", { cls: "obsidian-agent-btn-stop" });
        const stopIcon = this.stopBtn.createSpan();
        setIcon(stopIcon, "square");
        this.stopBtn.createSpan({ text: " Dừng" });
        this.stopBtn.style.display = "none";
        this.stopBtn.addEventListener("click", () => this.stopAgent());

        this.textarea.addEventListener("keydown", (e) => {
            // Slash menu navigation when open
            if (this.slashMenu.style.display !== "none" && this.slashFiltered.length > 0) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    this.slashIndex = (this.slashIndex + 1) % this.slashFiltered.length;
                    this._renderSlashMenu();
                    return;
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    this.slashIndex = (this.slashIndex - 1 + this.slashFiltered.length) % this.slashFiltered.length;
                    this._renderSlashMenu();
                    return;
                }
                if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
                    e.preventDefault();
                    this._applySlashCommand(this.slashFiltered[this.slashIndex]);
                    return;
                }
                if (e.key === "Escape") {
                    e.preventDefault();
                    this._hideSlashMenu();
                    return;
                }
            }
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.textarea.addEventListener("input", () => this._maybeShowSlashMenu());

        // Paste image from clipboard (screenshot) → đính kèm như external image attachment
        this.textarea.addEventListener("paste", async (e) => {
            const items = e.clipboardData?.items || [];
            const imageItems = [];
            for (const it of items) {
                if (it.kind === "file" && it.type.startsWith("image/")) {
                    const f = it.getAsFile();
                    if (f) imageItems.push(f);
                }
            }
            if (imageItems.length > 0) {
                e.preventDefault();
                for (const f of imageItems) {
                    const mime = f.type || "image/png";
                    const ext = (mime.split("/")[1] || "png").toLowerCase().replace("jpeg", "jpg");
                    const ts = new Date();
                    const stamp = `${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}${String(ts.getSeconds()).padStart(2,'0')}`;
                    const name = f.name && f.name !== "image.png" ? f.name : `pasted-${stamp}.${ext}`;
                    const att = { name, type: 'external', file: f, ext };
                    if (this._isImageExt(ext)) {
                        try {
                            const buf = await f.arrayBuffer();
                            att.imageData = this._encodeImageDataAttachment(buf, ext);
                        } catch (err) { console.warn("[bob] paste image encode:", err); }
                    }
                    this.attachments.push(att);
                }
                this.renderAttachments();
                new Notice(`Đã paste ${imageItems.length} ảnh vào chat`);
                return;
            }

            // Paste a bare URL → auto fetch as context attachment
            const pasted = (e.clipboardData?.getData("text/plain") || "").trim();
            if (!pasted) return;
            // Chỉ trigger nếu textarea đang trống và pasted là 1 URL duy nhất
            if (this.textarea.value.trim() !== "") return;
            if (!/^https?:\/\/\S+$/.test(pasted)) return;
            e.preventDefault();
            await this.appendUrlToChat(pasted);
        });

        // Improved drag and drop support
        this.textarea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.textarea.addClass('obsidian-agent-dragover');
        });

        this.textarea.addEventListener('dragleave', () => {
            this.textarea.removeClass('obsidian-agent-dragover');
        });

        this.textarea.addEventListener('drop', async (e) => {
            e.preventDefault();
            this.textarea.removeClass('obsidian-agent-dragover');

            // 1. Handle External Files (kèm folder qua webkitGetAsEntry — Finder drag)
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                const externalFiles = [];
                const folderEntries = [];
                for (let i = 0; i < e.dataTransfer.items.length; i++) {
                    const it = e.dataTransfer.items[i];
                    if (it.kind !== "file") continue;
                    const entry = it.webkitGetAsEntry?.();
                    if (entry && entry.isDirectory) {
                        folderEntries.push(entry);
                    } else {
                        const f = it.getAsFile?.();
                        if (f) externalFiles.push(f);
                    }
                }
                if (folderEntries.length > 0) {
                    for (const dir of folderEntries) {
                        const collected = await this._readExternalDirectoryEntry(dir, ['md', 'txt']);
                        for (const f of collected) externalFiles.push(f);
                    }
                }
                if (externalFiles.length > 0) {
                    if (externalFiles.length > FOLDER_FILE_THRESHOLD) {
                        const ok = window.confirm(`Đính kèm ${externalFiles.length} file từ folder bên ngoài?`);
                        if (!ok) return;
                    }
                    for (const file of externalFiles) {
                        const ext = file.name.split('.').pop().toLowerCase();
                        const att = { name: file.name, type: 'external', file, ext };
                        if (this._isImageExt(ext)) {
                            try {
                                const buf = await file.arrayBuffer();
                                att.imageData = this._encodeImageDataAttachment(buf, ext);
                            } catch (e) { console.warn("[bob] external image encode:", e); }
                        }
                        this.attachments.push(att);
                    }
                    this.renderAttachments();
                    new Notice(`Đã đính kèm ${externalFiles.length} file bên ngoài!`);
                    return;
                }
            }

            // 2. Handle Internal Obsidian Files / Folders
            const text = e.dataTransfer.getData("text/plain");
            if (text) {
                const linkMatch = text.match(/\[\[(.*?)(?:\|.*?)?\]\]/);
                const path = linkMatch ? linkMatch[1] : text;
                // Thử resolve thẳng path (folder)
                const direct = this.app.vault.getAbstractFileByPath(path);
                if (direct instanceof TFolder) {
                    await this.appendFilesToChat([direct]);
                    return;
                }
                const file = this.app.metadataCache.getFirstLinkpathDest(path, "");
                if (file) {
                    this.appendFilesToChat([file]);
                    return;
                }
            }
        });

        this.renderMessages();

        // First-run onboarding greeting (chỉ khi chưa onboarded và chưa có tin nhắn)
        if (!this.plugin.settings.onboarded && this.messages.length === 0) {
            this._beginOnboardingGreeting();
        }
    }

    _beginOnboardingGreeting() {
        const hasProfile = !!this.plugin.getActiveProfile();
        let greeting;
        if (!hasProfile) {
            greeting = "👋 Xin chào! Mình là trợ lý AI quản lý vault Obsidian này.\n\nTrước tiên bạn cần cấu hình một **provider (API key)** trong **Settings → Wiki Agent**. Xong rồi nhắn cho mình một câu (vd \"hi\") để mình bắt đầu thiết lập nhé.\n\n💡 Gõ `/guide` để xem hướng dẫn cài đặt chi tiết.";
        } else {
            greeting = "👋 Xin chào! Mình là trợ lý AI giúp bạn quản lý vault Obsidian này. Đây là lần đầu khởi động nên mình muốn hỏi vài câu để cá nhân hoá trước khi bắt đầu nhé.\n\nĐầu tiên: **mình nên gọi bạn là gì?** (tên hoặc biệt danh bạn thích)";
        }
        this.messages.push({ role: "assistant", content: greeting });
        this.renderMessages();
    }

    renderAttachments() {
        this.attachmentContainer.empty();
        if (this.attachments.length === 0) {
            this.attachmentContainer.style.display = "none";
            return;
        }
        this.attachmentContainer.style.display = "flex";
        this.attachments.forEach((at, index) => {
            const chip = this.attachmentContainer.createDiv({ cls: "obsidian-agent-attachment-chip" });
            const icon = chip.createSpan({ cls: "obsidian-agent-attachment-icon" });
            const isAV = this._isAudioVideoExt(at.ext);
            const iconName = at.type === 'selection'
                ? 'quote'
                : at.type === 'url'
                ? (at.kind === 'youtube' ? 'youtube' : 'globe')
                : (isAV ? (["mp4","webm","mov","mpeg"].includes((at.ext||"").toLowerCase()) ? 'video' : 'audio-lines')
                : (at.type === 'external' ? 'external-link' : 'file-text'));
            setIcon(icon, iconName);
            chip.createSpan({ text: at.name, cls: "obsidian-agent-attachment-name" });
            const remove = chip.createSpan({ cls: "obsidian-agent-attachment-remove" });
            setIcon(remove, "x");
            remove.addEventListener("click", () => {
                this.attachments.splice(index, 1);
                this.renderAttachments();
            });
        });
    }

    // ===== Bubble actions: Copy + Tạo note + Attach selection =====
    _renderAssistantActions(msgEl, contentEl, rawText, msgIndex) {
        if (!contentEl || !rawText || !rawText.trim()) return;
        if (contentEl.querySelector(":scope > .obsidian-agent-msg-actions")) return;
        const row = contentEl.createDiv({ cls: "obsidian-agent-msg-actions" });

        const copyBtn = row.createEl("button", {
            cls: "obsidian-agent-btn-small obsidian-agent-btn-icon-only",
            attr: { title: "Copy nội dung trả lời", "aria-label": "Copy" }
        });
        setIcon(copyBtn, "copy");
        copyBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(rawText);
                copyBtn.empty();
                setIcon(copyBtn, "check");
                new Notice("Đã copy phản hồi");
                setTimeout(() => { copyBtn.empty(); setIcon(copyBtn, "copy"); }, 1500);
            } catch (err) {
                new Notice(`Copy lỗi: ${err.message}`);
            }
        });

        const noteBtn = row.createEl("button", {
            cls: "obsidian-agent-btn-small obsidian-agent-btn-icon-only",
            attr: { title: "Tạo note mới từ phản hồi này", "aria-label": "Tạo note" }
        });
        setIcon(noteBtn, "file-plus");
        noteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try { await this._createNoteFromReply(rawText); }
            catch (err) { new Notice(`Tạo note lỗi: ${err.message}`); }
        });
    }

    _slugifyTitle(s) {
        return (s || "")
            .normalize("NFD").replace(/[̀-ͯ]/g, "")
            .replace(/đ/gi, "d")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 60);
    }

    async _createNoteFromReply(text) {
        const ts = window.moment ? window.moment().format("YYYY-MM-DD_HH-mm-ss") : new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
        const headingMatch = text.match(/^\s*#{1,6}\s+(.+?)\s*$/m);
        const baseSlug = headingMatch ? this._slugifyTitle(headingMatch[1]) : "";
        const slug = baseSlug || "agent-reply";
        let path = `${slug}-${ts}.md`;
        let n = 1;
        while (this.app.vault.getAbstractFileByPath(path)) {
            path = `${slug}-${ts}-${n++}.md`;
        }
        const isoNow = new Date().toISOString();
        const fm = `---\nsource: agent-reply\ncreated: ${isoNow}\nllm_managed: false\n---\n\n`;
        const file = await this.app.vault.create(path, fm + text);
        await this.app.workspace.getLeaf(true).openFile(file);
        new Notice(`Đã tạo note: ${path}`);
    }

    _initSelectionToolbar(rootEl) {
        const toolbar = rootEl.createDiv({ cls: "obsidian-agent-selection-toolbar" });
        toolbar.style.position = "absolute";
        toolbar.style.display = "none";
        const btn = toolbar.createEl("button", {
            cls: "obsidian-agent-btn-small",
            attr: { title: "Đưa đoạn này thành context cho câu hỏi kế tiếp" }
        });
        const iconSpan = btn.createSpan();
        setIcon(iconSpan, "quote");
        const label = btn.createSpan({ text: " Attach selection" });
        const countLabel = toolbar.createSpan({ cls: "obsidian-agent-selection-count" });
        this._selectionToolbar = toolbar;
        this._selectionCountLabel = countLabel;
        this._pendingSelection = null;

        btn.addEventListener("mousedown", (e) => {
            // mousedown thay vì click để không mất selection trước khi handler chạy
            e.preventDefault();
            e.stopPropagation();
            if (this._pendingSelection) this._attachSelection(this._pendingSelection);
            this._hideSelectionToolbar();
        });

        const hide = () => this._hideSelectionToolbar();
        this.messageContainer.addEventListener("mouseup", () => {
            setTimeout(() => this._updateSelectionToolbar(rootEl), 0);
        });
        document.addEventListener("selectionchange", () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed) hide();
        });
        document.addEventListener("mousedown", (e) => {
            if (toolbar.contains(e.target)) return;
            // Cho phép giữ toolbar khi user click trong message container (đang select)
            if (this.messageContainer.contains(e.target)) return;
            hide();
        });
    }

    _hideSelectionToolbar() {
        if (!this._selectionToolbar) return;
        this._selectionToolbar.style.display = "none";
        this._selectionToolbar.removeClass("visible");
        this._pendingSelection = null;
    }

    _updateSelectionToolbar(rootEl) {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) return this._hideSelectionToolbar();
        const text = sel.toString().trim();
        if (text.length < 5) return this._hideSelectionToolbar();
        const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
        const focusEl = sel.focusNode && (sel.focusNode.nodeType === 1 ? sel.focusNode : sel.focusNode.parentElement);
        if (!anchorEl || !focusEl) return this._hideSelectionToolbar();
        const bubble = anchorEl.closest(".obsidian-agent-msg-assistant .obsidian-agent-content");
        const bubbleFocus = focusEl.closest(".obsidian-agent-msg-assistant .obsidian-agent-content");
        if (!bubble || bubble !== bubbleFocus) return this._hideSelectionToolbar();

        // Xác định msgIndex từ vị trí msgEl trong messageContainer (chỉ đếm assistant bubbles)
        const msgEl = bubble.closest(".obsidian-agent-msg");
        let msgIndex = -1;
        if (msgEl) {
            const all = Array.from(this.messageContainer.querySelectorAll(".obsidian-agent-msg-assistant"));
            msgIndex = all.indexOf(msgEl);
        }

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const rootRect = rootEl.getBoundingClientRect();
        const top = Math.max(4, rect.top - rootRect.top - 36);
        const left = Math.max(4, rect.left - rootRect.left + rect.width / 2 - 80);

        this._selectionToolbar.style.top = `${top}px`;
        this._selectionToolbar.style.left = `${left}px`;
        this._selectionToolbar.style.display = "flex";
        this._selectionToolbar.addClass("visible");
        this._selectionCountLabel.setText(` (${text.length} ký tự)`);
        this._pendingSelection = { text, msgIndex };
    }

    _attachSelection({ text, msgIndex }) {
        if (!text) return;
        const preview = text.replace(/\s+/g, " ").slice(0, 40);
        this.attachments.push({
            type: "selection",
            name: `Trích: "${preview}${text.length > 40 ? "…" : ""}"`,
            text,
            msgIndex,
            ext: "txt"
        });
        this.renderAttachments();
        new Notice(`Đã đính kèm ${text.length} ký tự làm context`);
    }
    // ===== END bubble actions =====

    async appendFilesToChat(items) {
        // items có thể là TFile, TFolder, hoặc mảng hỗn hợp
        let totalAdded = 0;
        for (const item of items) {
            if (item instanceof TFolder) {
                const added = await this.appendFolderRecursive(item);
                totalAdded += added;
            } else if (item instanceof TFile) {
                const att = {
                    name: item.name,
                    type: 'internal',
                    file: item,
                    path: item.path,
                    ext: item.extension
                };
                if (this._isImageExt(item.extension)) {
                    try {
                        const buf = await this.app.vault.readBinary(item);
                        att.imageData = this._encodeImageDataAttachment(buf, item.extension);
                    } catch (e) {
                        console.warn("[bob] image encode failed:", e);
                    }
                }
                this.attachments.push(att);
                totalAdded++;
            }
        }
        this.renderAttachments();
        if (totalAdded > 0) new Notice(`Đã đính kèm ${totalAdded} file!`);
    }

    _isImageExt(ext) {
        return ["png", "jpg", "jpeg", "gif", "webp"].includes((ext || "").toLowerCase());
    }

    _encodeImageDataAttachment(arrayBuffer, ext) {
        const mediaType = {
            png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
            gif: "image/gif", webp: "image/webp"
        }[ext.toLowerCase()] || "application/octet-stream";
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        const base64 = btoa(binary);
        return { mediaType, base64, byteLength: arrayBuffer.byteLength };
    }

    async appendFolderRecursive(folder) {
        const excludes = (this.plugin.settings.contextExcludeFolders || DEFAULT_FOLDER_EXCLUDES)
            .map(s => s.toLowerCase());
        const collected = [];
        this._collectMarkdownChildren(folder, excludes, collected);

        if (collected.length === 0) {
            new Notice(`Folder "${folder.name}" không có .md (hoặc bị exclude).`);
            return 0;
        }

        // Confirm nếu vượt threshold
        if (collected.length > FOLDER_FILE_THRESHOLD) {
            const sizeKB = Math.round(collected.reduce((s, f) => s + (f.stat?.size || 0), 0) / 1024);
            const ok = window.confirm(`Đính kèm ${collected.length} file .md từ "${folder.name}" (~${sizeKB}KB)?\n(Token budget = 120k char, sẽ cắt nếu vượt)`);
            if (!ok) return 0;
        }

        for (const f of collected) {
            this.attachments.push({
                name: f.name,
                type: 'internal',
                file: f,
                path: f.path,
                ext: f.extension
            });
        }
        return collected.length;
    }

    _collectMarkdownChildren(folder, excludeLower, out) {
        for (const child of folder.children) {
            if (child instanceof TFolder) {
                if (excludeLower.includes(child.name.toLowerCase())) continue;
                this._collectMarkdownChildren(child, excludeLower, out);
            } else if (child instanceof TFile && child.extension === "md") {
                out.push(child);
            }
        }
    }

    // ====================================================================
    // URL fetcher — /url <link> hoặc paste URL → fetch HTML hoặc YouTube transcript
    // ====================================================================
    async appendUrlToChat(url) {
        if (!/^https?:\/\//.test(url)) {
            new Notice(`URL không hợp lệ: ${url}`);
            return;
        }
        const ytId = this._isYouTubeUrl(url);
        const ghRepo = ytId ? null : this._isGitHubRepoUrl(url);
        const sourceLabel = ytId ? "YouTube" : (ghRepo ? "GitHub repo" : "URL");
        const notice = new Notice(`Đang lấy nội dung từ ${sourceLabel}…`, 0);
        try {
            let attachment;
            if (ytId) {
                attachment = await this._fetchYouTubeAsAttachment(ytId, url);
            } else if (ghRepo) {
                attachment = await this._fetchGitHubAsAttachment(url, ghRepo.owner, ghRepo.repo);
            } else {
                attachment = await this._fetchUrlAsAttachment(url);
            }
            this.attachments.push(attachment);
            this.renderAttachments();
            notice.hide();
            new Notice(`Đã đính kèm: ${attachment.name}`);
        } catch (err) {
            notice.hide();
            console.error("[bob] URL fetch error:", err);
            new Notice(`Lỗi fetch URL: ${err.message}`);
        }
    }

    async _fetchUrlAsAttachment(url) {
        const res = await requestUrl({ url, throw: false });
        if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
        const html = res.text || "";
        const { title, text } = this._htmlToPlainText(html);
        let body = text;
        if (body.length > URL_FETCH_CHAR_LIMIT) {
            body = body.slice(0, URL_FETCH_CHAR_LIMIT) + `\n\n[…đã cắt bớt — xem nguồn ${url}]`;
        }
        const hostname = new URL(url).hostname;
        return {
            name: title || hostname,
            type: 'url',
            kind: 'web',
            text: body,
            sourceUrl: url,
            ext: 'url'
        };
    }

    _isGitHubRepoUrl(url) {
        try {
            const u = new URL(url);
            if (u.hostname !== "github.com" && u.hostname !== "www.github.com") return null;
            const m = u.pathname.match(/^\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/);
            if (!m) return null;
            const reserved = new Set(["settings", "marketplace", "notifications", "pulls", "issues", "explore", "topics", "trending", "collections", "events", "sponsors", "search", "about", "pricing", "features", "login", "signup", "logout", "new", "organizations", "orgs"]);
            if (reserved.has(m[1].toLowerCase())) return null;
            return { owner: m[1], repo: m[2] };
        } catch (_) {
            return null;
        }
    }

    async _fetchGitHubAsAttachment(url, owner, repo) {
        const token = (this.plugin.settings.github && this.plugin.settings.github.token || "").trim();
        const headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "obsidian-agent-bob"
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // 1) Repo metadata
        const metaRes = await requestUrl({
            url: `https://api.github.com/repos/${owner}/${repo}`,
            headers,
            throw: false
        });
        if (metaRes.status === 404) throw new Error(`Repo ${owner}/${repo} không tồn tại hoặc private (cần PAT có scope 'repo')`);
        if (metaRes.status === 401 || metaRes.status === 403) throw new Error(`GitHub auth failed (${metaRes.status}) — kiểm tra PAT trong Settings → GitHub`);
        if (metaRes.status >= 400) throw new Error(`GitHub API HTTP ${metaRes.status}`);
        const meta = metaRes.json || JSON.parse(metaRes.text || "{}");

        // 2) README (raw markdown)
        const readmeHeaders = { ...headers, "Accept": "application/vnd.github.raw" };
        const readmeRes = await requestUrl({
            url: `https://api.github.com/repos/${owner}/${repo}/readme`,
            headers: readmeHeaders,
            throw: false
        });
        let readme = "";
        if (readmeRes.status === 200) {
            readme = readmeRes.text || "";
            if (readme.length > URL_FETCH_CHAR_LIMIT) {
                readme = readme.slice(0, URL_FETCH_CHAR_LIMIT) + `\n\n[…README đã cắt bớt — xem nguồn ${url}]`;
            }
        } else if (readmeRes.status === 404) {
            readme = "_(Repo không có README)_";
        } else {
            readme = `_(Không lấy được README — HTTP ${readmeRes.status})_`;
        }

        const fmtNum = n => (typeof n === "number") ? n.toLocaleString("en-US") : "?";
        const lastCommit = meta.pushed_at ? meta.pushed_at.slice(0, 10) : "";
        const license = (meta.license && (meta.license.spdx_id || meta.license.name)) || "no-license";
        const topics = Array.isArray(meta.topics) ? meta.topics.join(", ") : "";

        const body = [
            `# GitHub Repo: ${owner}/${repo}`,
            ``,
            `## Metadata (snapshot ${new Date().toISOString().slice(0, 10)})`,
            `- **URL**: ${meta.html_url || url}`,
            `- **Owner**: ${meta.owner && meta.owner.login || owner} (${meta.owner && meta.owner.type || "?"})`,
            `- **Description**: ${meta.description || "(không có)"}`,
            `- **Language**: ${meta.language || "?"}`,
            `- **License**: ${license}`,
            `- **Stars**: ${fmtNum(meta.stargazers_count)}`,
            `- **Forks**: ${fmtNum(meta.forks_count)}`,
            `- **Open issues**: ${fmtNum(meta.open_issues_count)}`,
            `- **Default branch**: ${meta.default_branch || "main"}`,
            `- **Created**: ${(meta.created_at || "").slice(0, 10)}`,
            `- **Last commit (pushed_at)**: ${lastCommit}`,
            `- **Last release**: ${(meta.released_at || meta.updated_at || "").slice(0, 10) || "?"}`,
            `- **Archived**: ${meta.archived ? "YES (read-only)" : "no"}`,
            `- **Disabled**: ${meta.disabled ? "YES" : "no"}`,
            `- **Topics**: ${topics || "(không có)"}`,
            `- **Homepage**: ${meta.homepage || "(không có)"}`,
            ``,
            `## README`,
            ``,
            readme
        ].join("\n");

        return {
            name: `${owner}/${repo}`,
            type: "url",
            kind: "github-repo",
            text: body,
            sourceUrl: meta.html_url || url,
            ext: "url",
            githubMeta: {
                owner: meta.owner && meta.owner.login || owner,
                repo: meta.name || repo,
                language: meta.language || "",
                license,
                stars: meta.stargazers_count || 0,
                forks: meta.forks_count || 0,
                last_commit: lastCommit,
                description: meta.description || "",
                topics: Array.isArray(meta.topics) ? meta.topics : [],
                default_branch: meta.default_branch || "main",
                archived: !!meta.archived
            }
        };
    }

    _isYouTubeUrl(url) {
        try {
            const u = new URL(url);
            const host = u.hostname.replace(/^www\./, "");
            if (host === "youtu.be") return u.pathname.slice(1).split('/')[0] || null;
            if (host === "youtube.com" || host === "m.youtube.com") {
                if (u.pathname === "/watch") return u.searchParams.get("v");
                const m = u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
                if (m) return m[2];
            }
        } catch (_) { /* ignore */ }
        return null;
    }

    _htmlToPlainText(html) {
        // Extract <title>
        let title = "";
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch) title = this._decodeHtmlEntities(titleMatch[1].trim());

        let s = html;
        // Strip script/style/noscript/svg wholesale
        s = s.replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, " ");
        // Drop <head> entirely (keep title already extracted)
        s = s.replace(/<head[\s\S]*?<\/head>/gi, " ");
        // Convert <br> + block boundaries to newlines
        s = s.replace(/<br\s*\/?>/gi, "\n");
        s = s.replace(/<\/(p|div|section|article|h[1-6]|li|tr)>/gi, "\n");
        // Strip remaining tags
        s = s.replace(/<[^>]+>/g, " ");
        s = this._decodeHtmlEntities(s);
        // Collapse whitespace
        s = s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
        return { title, text: s };
    }

    _decodeHtmlEntities(s) {
        return s
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
            .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
    }

    async _fetchYouTubeAsAttachment(videoId, originalUrl) {
        const transcript = await this._extractYouTubeTranscript(videoId);
        let body = transcript.text;
        if (body.length > URL_FETCH_CHAR_LIMIT) {
            body = body.slice(0, URL_FETCH_CHAR_LIMIT) + `\n\n[…transcript đã cắt — xem video ${originalUrl}]`;
        }
        return {
            name: `[YT] ${transcript.title || videoId}`,
            type: 'url',
            kind: 'youtube',
            text: `# ${transcript.title || videoId}\n\nVideo: ${originalUrl}\nLanguage: ${transcript.lang}\n\n--- Transcript ---\n\n${body}`,
            sourceUrl: originalUrl,
            ext: 'url'
        };
    }

    async _extractYouTubeTranscript(videoId, langPref = ['vi', 'en']) {
        // 1. Fetch watch page → tìm ytInitialPlayerResponse
        const pageRes = await requestUrl({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            headers: { "Accept-Language": "vi,en;q=0.9" },
            throw: false
        });
        if (pageRes.status >= 400) throw new Error(`YouTube HTTP ${pageRes.status}`);
        const html = pageRes.text || "";

        const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\})\s*;\s*(?:var|<\/script>)/);
        if (!playerMatch) throw new Error("Không parse được player response (video có thể private/age-gated)");
        let player;
        try { player = JSON.parse(playerMatch[1]); }
        catch (e) { throw new Error("Player response JSON không hợp lệ"); }

        // 2. Lấy captions track
        const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (!tracks || tracks.length === 0) throw new Error("Video không có phụ đề");

        // Ưu tiên track THỦ CÔNG (kind != asr) trước, vì ASR bị YouTube chặn từ 2024
        const manualTracks = tracks.filter(t => t.kind !== "asr");
        const pool = manualTracks.length > 0 ? manualTracks : tracks;
        let chosen = null;
        for (const lang of langPref) {
            chosen = pool.find(t => (t.languageCode || "").toLowerCase().startsWith(lang));
            if (chosen) break;
        }
        if (!chosen) chosen = pool[0];

        const isAsrOnly = manualTracks.length === 0;

        // 3. Fetch caption — thử JSON3/srv1/default/vtt trực tiếp
        let lines;
        try {
            lines = await this._fetchCaptionLines(chosen.baseUrl);
        } catch (err) {
            // Fallback yt-dlp: tin cậy hơn cho ASR vì nó dùng player extractor có sẵn bypass
            console.warn("[bob] direct caption fetch failed, falling back to yt-dlp:", err.message);
            try {
                lines = await this._fetchCaptionViaYtDlp(videoId, langPref);
                new Notice(`Đã dùng yt-dlp fallback để lấy transcript`);
            } catch (ytErr) {
                if (isAsrOnly) {
                    throw new Error(
                        `Video chỉ có phụ đề tự động (ASR) và cả direct fetch + yt-dlp đều fail. ` +
                        `Lỗi yt-dlp: ${ytErr.message}. ` +
                        `Workaround: mở YouTube → "..." → "Show transcript" → copy paste vào khung chat.`
                    );
                }
                throw ytErr;
            }
        }

        const title = player?.videoDetails?.title || videoId;
        return {
            title,
            lang: chosen.languageCode || "?",
            text: lines.join("\n")
        };
    }

    async _fetchCaptionLines(baseUrl) {
        const setParam = (url, key, val) => {
            if (url.includes(`${key}=`)) return url.replace(new RegExp(`${key}=[^&]*`), `${key}=${val}`);
            return url + (url.includes('?') ? '&' : '?') + `${key}=${val}`;
        };
        const stripParam = (url, key) => url.replace(new RegExp(`[?&]${key}=[^&]*`, 'g'), (m) => m[0] === '?' ? '?' : '');

        const headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "vi,en;q=0.9",
            "Referer": "https://www.youtube.com/"
        };

        const tryFetch = async (label, url) => {
            const r = await requestUrl({ url, headers, throw: false });
            const len = (r.text || "").length;
            const ct = r.headers?.["content-type"] || r.headers?.["Content-Type"] || "?";
            console.log(`[bob] caption ${label}: HTTP ${r.status} | ct=${ct} | len=${len} | url=${url.slice(0, 120)}`);
            return r;
        };

        // Attempt 1: JSON3
        try {
            const r = await tryFetch("json3", setParam(baseUrl, "fmt", "json3"));
            if (r.status < 400 && r.text && r.text.trim().startsWith("{")) {
                const j = JSON.parse(r.text);
                const out = [];
                for (const ev of (j.events || [])) {
                    if (!ev.segs) continue;
                    const line = ev.segs.map(s => s.utf8 || "").join("").replace(/\n/g, " ").trim();
                    if (line) out.push(line);
                }
                if (out.length > 0) return out;
            }
        } catch (e) { console.warn("[bob] json3 parse fail:", e.message); }

        // Attempt 2: srv1 XML
        try {
            const r = await tryFetch("srv1", setParam(baseUrl, "fmt", "srv1"));
            if (r.status < 400 && r.text && r.text.trim()) {
                const out = this._parseTimedtextXml(r.text);
                if (out.length > 0) return out;
            }
        } catch (e) { console.warn("[bob] srv1 fail:", e.message); }

        // Attempt 3: default (no fmt — YouTube returns srv3-like XML)
        try {
            const r = await tryFetch("default", stripParam(baseUrl, "fmt"));
            if (r.status < 400 && r.text && r.text.trim()) {
                const out = this._parseTimedtextXml(r.text);
                if (out.length > 0) return out;
            }
        } catch (e) { console.warn("[bob] default fail:", e.message); }

        // Attempt 4: vtt (text)
        try {
            const r = await tryFetch("vtt", setParam(baseUrl, "fmt", "vtt"));
            if (r.status < 400 && r.text) {
                const out = this._parseVtt(r.text);
                if (out.length > 0) return out;
            }
        } catch (e) { console.warn("[bob] vtt fail:", e.message); }

        throw new Error("Không lấy được caption (đã thử json3/srv1/default/vtt — xem console để debug)");
    }

    async _probeYouTubeLang(ytdlpPath, videoId, langPref) {
        const { spawn } = require("child_process");
        const probeArgs = ["-J", "--skip-download", "--no-warnings",
            `https://www.youtube.com/watch?v=${videoId}`];
        const stdout = await new Promise((resolve, reject) => {
            let proc;
            try { proc = spawn(ytdlpPath, probeArgs, { stdio: ["ignore", "pipe", "pipe"] }); }
            catch (e) { return reject(e); }
            let out = "", err = "";
            proc.stdout.on("data", d => out += d.toString());
            proc.stderr.on("data", d => err += d.toString());
            proc.on("error", reject);
            proc.on("exit", code => code === 0 ? resolve(out) : reject(new Error(`probe exit ${code}: ${err.slice(-300)}`)));
            setTimeout(() => { try { proc.kill(); } catch {} reject(new Error("probe timeout 30s")); }, 30_000);
        });
        let info;
        try { info = JSON.parse(stdout); } catch { throw new Error("yt-dlp -J output không parse được"); }

        const subKeys = Object.keys(info.subtitles || {});
        const autoKeys = Object.keys(info.automatic_captions || {});
        const videoLang = info.language || "";

        // Ưu tiên: manual sub theo langPref → manual sub bất kỳ → auto-orig của videoLang →
        //         auto-orig theo langPref → auto raw của videoLang → auto raw theo langPref → fallback đầu tiên
        const candidates = [];
        for (const l of langPref) candidates.push(l); // manual sub user-pref
        for (const l of langPref) candidates.push(`${l}-orig`); // auto orig
        if (videoLang) {
            candidates.unshift(`${videoLang}-orig`, videoLang); // ưu tiên cao nhất: lang gốc của video
        }
        // Loại trùng giữ thứ tự
        const uniq = [...new Set(candidates)];

        // Match: manual subs trước, auto sau
        for (const c of uniq) if (subKeys.includes(c)) return c;
        for (const c of uniq) if (autoKeys.includes(c)) return c;

        // Fallback: bất kỳ -orig nào trong autoKeys (không qua translate)
        const orig = autoKeys.find(k => k.endsWith("-orig"));
        if (orig) return orig;

        // Fallback cuối: auto đầu tiên (có thể bị 429 nếu translate)
        if (autoKeys.length > 0) return autoKeys[0];
        if (subKeys.length > 0) return subKeys[0];
        throw new Error("Video không có caption nào (manual lẫn auto)");
    }

    async _fetchCaptionViaYtDlp(videoId, langPref) {
        const { spawn } = require("child_process");
        const fsSync = require("fs");
        const path = require("path");
        const os = require("os");
        const fs = require("fs/promises");

        const tmpDir = os.tmpdir();
        const outBase = path.join(tmpDir, `yt-bob-${videoId}-${Date.now()}`);

        // Auto-probe: nếu user-configured path không tồn tại, thử các path phổ biến
        const candidates = [
            this.plugin.settings.ytDlpPath || "yt-dlp",
            "/opt/homebrew/bin/yt-dlp",
            "/usr/local/bin/yt-dlp",
            "/Library/Frameworks/Python.framework/Versions/3.14/bin/yt-dlp",
            "/Library/Frameworks/Python.framework/Versions/3.13/bin/yt-dlp",
            "/Library/Frameworks/Python.framework/Versions/3.12/bin/yt-dlp",
            `${os.homedir()}/.local/bin/yt-dlp`,
        ];

        let ytdlpPath = null;
        const tried = [];
        for (const p of candidates) {
            // Bare command "yt-dlp" — không check existsSync, để spawn tự thử PATH
            if (!p.includes("/")) {
                ytdlpPath = p;
                tried.push(`${p} (rely on PATH)`);
                break;
            }
            tried.push(p);
            try {
                if (fsSync.existsSync(p)) { ytdlpPath = p; break; }
            } catch {}
        }
        console.log("[bob] yt-dlp path candidates tried:", tried, "→ chosen:", ytdlpPath);
        if (!ytdlpPath) {
            throw new Error(`yt-dlp không tìm thấy. Đã thử: ${tried.join(", ")}. Cài bằng: brew install yt-dlp, hoặc pip install yt-dlp, rồi set absolute path trong Settings.`);
        }

        // Probe metadata với -J để biết video có lang gốc nào → tránh translate (429)
        const langChoice = await this._probeYouTubeLang(ytdlpPath, videoId, langPref);
        console.log(`[bob] yt-dlp lang chosen: ${langChoice}`);

        const args = [
            "--skip-download",
            "--write-subs",
            "--write-auto-subs",
            "--sub-lang", langChoice,
            "--sub-format", "vtt",
            "--no-warnings",
            "-o", outBase + ".%(ext)s",
            `https://www.youtube.com/watch?v=${videoId}`
        ];

        const exitInfo = await new Promise((resolve, reject) => {
            let proc;
            try {
                proc = spawn(ytdlpPath, args, { stdio: ["ignore", "pipe", "pipe"] });
            } catch (err) {
                return reject(new Error(`spawn ${ytdlpPath} fail: ${err.message}`));
            }
            let stderr = "";
            proc.stderr.on("data", (d) => { stderr += d.toString(); });
            proc.on("error", (err) => reject(new Error(
                err.code === "ENOENT"
                    ? `yt-dlp tại '${ytdlpPath}' không chạy được (ENOENT). Verify bằng: ${ytdlpPath} --version trong terminal.`
                    : `${err.code || ''} ${err.message}`
            )));
            proc.on("exit", (code) => resolve({ code, stderr }));
            setTimeout(() => { try { proc.kill(); } catch {} reject(new Error("yt-dlp timeout 60s")); }, 60_000);
        });

        // Tìm VTT file đã tạo (yt-dlp có thể exit !=0 nhưng vẫn tạo được 1 vài file)
        const files = await fs.readdir(tmpDir);
        const myVttFiles = files.filter(f => f.startsWith(path.basename(outBase)) && f.endsWith(".vtt"));
        if (myVttFiles.length === 0) {
            // Không có file nào → fail thực sự
            throw new Error(`yt-dlp exit ${exitInfo.code}, không tạo VTT: ${exitInfo.stderr.slice(-500)}`);
        }
        if (exitInfo.code !== 0) {
            console.warn(`[bob] yt-dlp exit ${exitInfo.code} nhưng vẫn tạo được ${myVttFiles.length} VTT — partial success, dùng tiếp.`);
        }
        // Ưu tiên file không có suffix lang đặc biệt (vd .en.vtt > .en-orig.vtt)
        const vttFile = myVttFiles.sort((a, b) => a.length - b.length)[0];
        const fullPath = path.join(tmpDir, vttFile);
        const vtt = await fs.readFile(fullPath, "utf-8");
        // Cleanup tất cả file tạm cùng prefix
        for (const f of files) {
            if (f.startsWith(`yt-bob-${videoId}-`)) {
                try { await fs.unlink(path.join(tmpDir, f)); } catch {}
            }
        }

        const lines = this._parseVtt(vtt);
        if (lines.length === 0) throw new Error("VTT từ yt-dlp parse ra 0 dòng");

        // Dedupe consecutive duplicates (auto-cap thường lặp 2 dòng kế tiếp)
        const dedup = [];
        for (const ln of lines) {
            if (dedup[dedup.length - 1] !== ln) dedup.push(ln);
        }
        return dedup;
    }

    _parseTimedtextXml(xml) {
        const out = [];
        const re = /<(?:text|p)[^>]*>([\s\S]*?)<\/(?:text|p)>/g;
        let m;
        while ((m = re.exec(xml)) !== null) {
            // Strip nested <s> tags (used in srv3) but keep their text
            const inner = m[1].replace(/<\/?s[^>]*>/g, "");
            const line = this._decodeHtmlEntities(inner).replace(/\n/g, " ").trim();
            if (line) out.push(line);
        }
        return out;
    }

    _parseVtt(vtt) {
        const out = [];
        const lines = vtt.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const ln = lines[i];
            if (/-->/.test(ln) || /^WEBVTT/.test(ln) || /^NOTE/.test(ln) || /^\d+$/.test(ln) || ln.trim() === "") continue;
            const clean = ln.replace(/<[^>]+>/g, "").trim();
            if (clean) out.push(clean);
        }
        return out;
    }

    // ====================================================================
    // PDF extraction (pdfjs-dist 3.11.174 ship trong vendor/)
    // ====================================================================
    async _ensurePdfJs() {
        if (window.pdfjsLib) return window.pdfjsLib;
        if (this._pdfJsLoading) return this._pdfJsLoading;
        const noticeRef = new Notice("Đang tải bộ giải mã PDF…", 0);
        this._pdfJsLoading = (async () => {
            try {
                const pluginDir = `${this.app.vault.configDir}/plugins/obsidian-agent`;
                const libPath = `${pluginDir}/vendor/pdf.min.js`;
                const workerPath = `${pluginDir}/vendor/pdf.worker.min.js`;
                const libCode = await this.app.vault.adapter.read(libPath);
                // Eval trong scope global để pdfjsLib bind vào window
                // pdf.min.js là UMD: kiểm tra typeof exports → fallback gắn window.pdfjsLib
                const fn = new Function("window", "self", "globalThis", libCode + "\n;return (typeof pdfjsLib!=='undefined'?pdfjsLib:(window.pdfjsLib||self.pdfjsLib));");
                const lib = fn(window, window, window);
                if (lib) window.pdfjsLib = lib;
                if (!window.pdfjsLib) throw new Error("pdfjsLib không bind được vào window sau khi eval");
                // Worker: tạo blob URL từ file content (vault path không phải URL hợp lệ cho Worker)
                const workerCode = await this.app.vault.adapter.read(workerPath);
                const blob = new Blob([workerCode], { type: "application/javascript" });
                const blobUrl = URL.createObjectURL(blob);
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
                noticeRef.hide();
                return window.pdfjsLib;
            } catch (err) {
                noticeRef.hide();
                this._pdfJsLoading = null; // cho phép retry
                throw err;
            }
        })();
        return this._pdfJsLoading;
    }

    // ====================================================================
    // DOCX / XLSX extraction (fflate UMD ship trong vendor/)
    // ====================================================================
    async _ensureFflate() {
        if (window.fflate) return window.fflate;
        if (this._fflateLoading) return this._fflateLoading;
        this._fflateLoading = (async () => {
            const pluginDir = `${this.app.vault.configDir}/plugins/obsidian-agent`;
            const code = await this.app.vault.adapter.read(`${pluginDir}/vendor/fflate.min.js`);
            const fn = new Function("self", "globalThis", "window",
                code + "\n;return (typeof fflate!=='undefined'?fflate:(self.fflate||window.fflate));");
            const lib = fn(window, window, window);
            if (!lib) throw new Error("fflate không bind được");
            window.fflate = lib;
            return lib;
        })();
        return this._fflateLoading;
    }

    async _unzipDocx(arrayBuffer) {
        const fflate = await this._ensureFflate();
        const u8 = new Uint8Array(arrayBuffer);
        return new Promise((resolve, reject) => {
            fflate.unzip(u8, (err, files) => {
                if (err) reject(err); else resolve(files);
            });
        });
    }

    _utf8Decode(u8) {
        return new TextDecoder("utf-8").decode(u8);
    }

    async _extractDocxText(arrayBuffer) {
        const files = await this._unzipDocx(arrayBuffer);
        const docXml = files["word/document.xml"];
        if (!docXml) throw new Error("DOCX không có word/document.xml");
        const xml = this._utf8Decode(docXml);

        // Mỗi <w:p> = 1 paragraph; nội dung ở <w:t>...</w:t>
        const paragraphs = [];
        const pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
        let pm;
        while ((pm = pRe.exec(xml)) !== null) {
            const inner = pm[1];
            const tRe = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
            const parts = [];
            let tm;
            while ((tm = tRe.exec(inner)) !== null) {
                parts.push(this._decodeHtmlEntities(tm[1]));
            }
            const line = parts.join("").trim();
            if (line) paragraphs.push(line);
            else if (paragraphs.length > 0 && paragraphs[paragraphs.length - 1] !== "") {
                paragraphs.push(""); // blank line giữa các đoạn rỗng
            }
        }
        if (paragraphs.length === 0) throw new Error("DOCX không có nội dung text");
        return paragraphs.join("\n");
    }

    async _extractXlsxText(arrayBuffer, opts = {}) {
        const maxRows = opts.maxRows || 500;
        const files = await this._unzipDocx(arrayBuffer);

        // Shared strings table
        const sharedStrings = [];
        if (files["xl/sharedStrings.xml"]) {
            const sxml = this._utf8Decode(files["xl/sharedStrings.xml"]);
            const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
            let sm;
            while ((sm = siRe.exec(sxml)) !== null) {
                const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
                let parts = [];
                let tm;
                while ((tm = tRe.exec(sm[1])) !== null) parts.push(this._decodeHtmlEntities(tm[1]));
                sharedStrings.push(parts.join(""));
            }
        }

        // List sheet files
        const sheetPaths = Object.keys(files).filter(p => /^xl\/worksheets\/sheet\d+\.xml$/.test(p)).sort();
        if (sheetPaths.length === 0) throw new Error("XLSX không có worksheet");

        const sheetTexts = [];
        for (const sp of sheetPaths) {
            const xml = this._utf8Decode(files[sp]);
            const rows = [];
            const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
            let rm;
            let rowCount = 0;
            while ((rm = rowRe.exec(xml)) !== null && rowCount < maxRows) {
                const cellRe = /<c\b[^>]*\bt="([^"]*)"[^>]*>([\s\S]*?)<\/c>|<c\b[^>]*\/>|<c\b[^>]*>([\s\S]*?)<\/c>/g;
                const cells = [];
                let cm;
                while ((cm = cellRe.exec(rm[1])) !== null) {
                    let val = "";
                    if (cm[1] === "s") {
                        // shared string index
                        const vMatch = /<v>(\d+)<\/v>/.exec(cm[2] || "");
                        if (vMatch) val = sharedStrings[parseInt(vMatch[1], 10)] || "";
                    } else if (cm[1] === "inlineStr") {
                        const tMatch = /<t[^>]*>([\s\S]*?)<\/t>/.exec(cm[2] || "");
                        if (tMatch) val = this._decodeHtmlEntities(tMatch[1]);
                    } else {
                        // numeric / boolean / date
                        const inner = cm[2] || cm[3] || "";
                        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(inner);
                        if (vMatch) val = vMatch[1];
                    }
                    cells.push(val);
                }
                if (cells.some(c => c !== "")) rows.push(cells.join("\t"));
                rowCount++;
            }
            const sheetName = sp.match(/sheet(\d+)/)[1];
            sheetTexts.push(`=== Sheet ${sheetName} (${rows.length} dòng) ===\n${rows.join("\n")}`);
        }
        if (sheetTexts.length === 0) throw new Error("XLSX không có dữ liệu");
        return sheetTexts.join("\n\n");
    }

    async _extractPptxText(arrayBuffer, opts = {}) {
        const includeNotes = opts.includeNotes !== false;
        const files = await this._unzipDocx(arrayBuffer);

        // Liệt kê slide files theo số thứ tự
        const slidePaths = Object.keys(files)
            .filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p))
            .sort((a, b) => {
                const na = parseInt(a.match(/slide(\d+)/)[1], 10);
                const nb = parseInt(b.match(/slide(\d+)/)[1], 10);
                return na - nb;
            });
        if (slidePaths.length === 0) throw new Error("PPTX không có slide nào");

        // Map slideN → notesSlideN nếu có
        const notesByNum = {};
        if (includeNotes) {
            for (const p of Object.keys(files)) {
                const m = p.match(/^ppt\/notesSlides\/notesSlide(\d+)\.xml$/);
                if (m) notesByNum[m[1]] = files[p];
            }
        }

        const out = [];
        for (const sp of slidePaths) {
            const slideNum = sp.match(/slide(\d+)/)[1];
            const xml = this._utf8Decode(files[sp]);

            // Text trong slide: <a:t>...</a:t> (DrawingML)
            const tRe = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
            const lines = [];
            let tm;
            while ((tm = tRe.exec(xml)) !== null) {
                const txt = this._decodeHtmlEntities(tm[1]).trim();
                if (txt) lines.push(txt);
            }

            // Notes
            let notesText = "";
            if (notesByNum[slideNum]) {
                const nxml = this._utf8Decode(notesByNum[slideNum]);
                const nRe = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
                const nLines = [];
                let nm;
                while ((nm = nRe.exec(nxml)) !== null) {
                    const txt = this._decodeHtmlEntities(nm[1]).trim();
                    if (txt) nLines.push(txt);
                }
                if (nLines.length > 0) notesText = `\nNotes: ${nLines.join(" ")}`;
            }

            out.push(`=== Slide ${slideNum} ===\n${lines.join("\n")}${notesText}`);
        }
        return out.join("\n\n");
    }

    async _extractPdfText(arrayBuffer, opts = {}) {
        const maxPages = opts.maxPages || PDF_MAX_PAGES;
        const lib = await this._ensurePdfJs();
        const doc = await lib.getDocument({ data: arrayBuffer, isEvalSupported: false }).promise;
        const numPages = doc.numPages;
        const pageLimit = Math.min(numPages, maxPages);
        const pageTexts = [];
        for (let i = 1; i <= pageLimit; i++) {
            const page = await doc.getPage(i);
            const content = await page.getTextContent();
            const line = content.items.map(it => it.str).join(" ").replace(/\s+/g, " ").trim();
            if (line) pageTexts.push(`--- Trang ${i} ---\n${line}`);
        }
        if (pageTexts.length === 0) {
            throw new Error("PDF không có text layer (có thể là ảnh scan, cần OCR — bỏ qua)");
        }
        let text = pageTexts.join("\n\n");
        if (numPages > pageLimit) text += `\n\n[…còn ${numPages - pageLimit} trang chưa đọc]`;
        return text;
    }

    // ====================================================================
    // Audio/video transcription qua OpenAI Whisper API
    // ====================================================================
    _isAudioVideoExt(ext) {
        return ["mp3","m4a","wav","webm","mp4","mpga","mpeg","ogg","oga","flac","mov","aac"].includes((ext || "").toLowerCase());
    }

    _audioMimeType(ext) {
        const e = (ext || "").toLowerCase();
        return ({
            mp3: "audio/mpeg", mpga: "audio/mpeg", mpeg: "audio/mpeg",
            m4a: "audio/mp4", aac: "audio/aac",
            wav: "audio/wav",
            ogg: "audio/ogg", oga: "audio/ogg",
            flac: "audio/flac",
            webm: "video/webm",
            mp4: "video/mp4",
            mov: "video/quicktime"
        })[e] || "application/octet-stream";
    }

    async _sha256Hex(arrayBuffer) {
        const hash = await crypto.subtle.digest("SHA-256", arrayBuffer);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // Transcribe audio/video buffer qua Whisper API. Cache theo sha256 trong session.
    // Mở hộp thoại OS chọn file từ ổ đĩa → đính kèm (tái dùng pipeline attachment 'external' của kéo-thả).
    _pickFilesFromDisk() {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.addEventListener("change", async () => {
            const files = Array.from(input.files || []);
            if (!files.length) return;
            for (const file of files) {
                const ext = (file.name.split('.').pop() || '').toLowerCase();
                const att = { name: file.name, type: 'external', file, ext };
                if (this._isImageExt(ext)) {
                    try { att.imageData = this._encodeImageDataAttachment(await file.arrayBuffer(), ext); }
                    catch (e) { console.warn("[bob] picked image encode:", e); }
                }
                this.attachments.push(att);
            }
            this.renderAttachments();
            new Notice(`Đã đính kèm ${files.length} file từ máy!`);
        });
        input.click();
    }

    _toggleVoiceRecording() {
        if (this.isRecording) this._stopRecordingAndTranscribe();
        else this._startRecording();
    }

    async _startRecording() {
        const w = this.plugin.settings.whisper || {};
        const engine = w.engine || "whisper";
        if (engine === "gemini") {
            if (!this._getGeminiSttProfile()) {
                new Notice("STT engine = Gemini nhưng không tìm thấy profile 'Google' có API key. Thêm trong Settings → Wiki Agent.", 8000);
                return;
            }
        } else if (!w.enabled || !w.apiKey) {
            new Notice("Bật Whisper + nhập OpenAI API key trong Settings → Whisper trước khi ghi âm.", 8000);
            return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
            new Notice("Thiết bị/nền tảng này không hỗ trợ ghi âm.", 8000);
            return;
        }
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            new Notice(`Không truy cập được mic: ${e.message}`, 8000);
            return;
        }
        const mimeType = (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported("audio/webm"))
            ? "audio/webm" : undefined;
        this.recordStream = stream;
        this.recordChunks = [];
        this.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        this.mediaRecorder.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) this.recordChunks.push(ev.data); };
        this.mediaRecorder.onstop = () => this._onRecordingStopped();
        this.mediaRecorder.start();
        this.isRecording = true;
        this.micBtn.empty();
        setIcon(this.micBtn.createSpan(), "square");
        this.micBtn.addClass("obsidian-agent-btn-recording");
        this.micBtn.title = "Dừng ghi âm";
    }

    _stopRecordingAndTranscribe() {
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
            try { this.mediaRecorder.stop(); } catch (e) { console.warn("[bob] recorder stop:", e); }
        }
    }

    _resetMicUI() {
        this.isRecording = false;
        this.micBtn.removeClass("obsidian-agent-btn-recording");
        this.micBtn.empty();
        setIcon(this.micBtn.createSpan(), "mic");
        this.micBtn.title = "Ghi âm (speech-to-text)";
    }

    async _onRecordingStopped() {
        const chunks = this.recordChunks;
        this.recordChunks = [];
        if (this.recordStream) { this.recordStream.getTracks().forEach(t => t.stop()); this.recordStream = null; }
        this.mediaRecorder = null;
        this._resetMicUI();

        if (!chunks.length) { new Notice("Không thu được âm thanh nào."); return; }
        const engine = (this.plugin.settings.whisper || {}).engine || "whisper";
        const notice = new Notice("🎙 Đang nhận dạng giọng nói…", 0);
        try {
            const blob = new Blob(chunks, { type: chunks[0].type || "audio/webm" });
            const buf = await blob.arrayBuffer();
            const r = engine === "gemini"
                ? await this._transcribeAudioGemini(buf)
                : await this._transcribeAudio(buf, `ghi-am-${Date.now()}.webm`, "webm");
            const text = (r.text || "").trim();
            notice.hide();
            if (!text) { new Notice("Không nhận dạng được nội dung."); return; }
            const cur = this.textarea.value;
            this.textarea.value = cur && !cur.endsWith(" ") && !cur.endsWith("\n") ? `${cur} ${text}` : `${cur}${text}`;
            this.textarea.focus();
            this.textarea.dispatchEvent(new Event("input"));
            new Notice(`✓ Đã chèn ${text.length} ký tự — xem lại rồi Gửi.`);
        } catch (e) {
            notice.hide();
            new Notice(`Lỗi nhận dạng: ${e.message}`, 8000);
        }
    }

    // Tìm profile Google (API key) để dùng làm STT engine Gemini.
    _getGeminiSttProfile() {
        const active = this.plugin.getActiveProfile();
        if (active && active.provider === "google" && active.apiKey) return active;
        return (this.plugin.settings.profiles || []).find(p => p.provider === "google" && p.apiKey) || null;
    }

    _arrayBufferToBase64(buf) {
        const bytes = new Uint8Array(buf);
        let bin = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(bin);
    }

    // Decode audio (webm/opus) → resample mono 16kHz → encode WAV PCM16 (Gemini KHÔNG nhận webm).
    async _audioToWav16k(arrayBuffer) {
        const AC = window.AudioContext || window.webkitAudioContext;
        const tmp = new AC();
        let decoded;
        try { decoded = await tmp.decodeAudioData(arrayBuffer.slice(0)); }
        finally { tmp.close(); }
        const targetRate = 16000;
        const frames = Math.max(1, Math.ceil(decoded.duration * targetRate));
        const offline = new OfflineAudioContext(1, frames, targetRate);
        const src = offline.createBufferSource();
        src.buffer = decoded;
        src.connect(offline.destination);
        src.start();
        const rendered = await offline.startRendering();
        return this._encodeWavPcm16(rendered.getChannelData(0), targetRate);
    }

    _encodeWavPcm16(samples, sampleRate) {
        const len = samples.length;
        const buffer = new ArrayBuffer(44 + len * 2);
        const view = new DataView(buffer);
        const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
        writeStr(0, "RIFF");
        view.setUint32(4, 36 + len * 2, true);
        writeStr(8, "WAVE");
        writeStr(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);            // PCM
        view.setUint16(22, 1, true);            // mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true); // byte rate
        view.setUint16(32, 2, true);            // block align
        view.setUint16(34, 16, true);           // bits/sample
        writeStr(36, "data");
        view.setUint32(40, len * 2, true);
        let off = 44;
        for (let i = 0; i < len; i++) {
            const s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            off += 2;
        }
        return buffer;
    }

    async _transcribeAudioGemini(arrayBuffer) {
        const profile = this._getGeminiSttProfile();
        if (!profile) throw new Error("Không tìm thấy profile Google có API key cho STT.");

        const hash = await this._sha256Hex(arrayBuffer);
        if (!this.plugin._whisperCache) this.plugin._whisperCache = {};
        if (this.plugin._whisperCache[hash]) return { text: this.plugin._whisperCache[hash], cached: true };

        // Gemini không nhận webm → convert sang WAV mono 16kHz trước.
        const wav = await this._audioToWav16k(arrayBuffer);
        const MAX = 20 * 1024 * 1024;
        if (wav.byteLength > MAX) throw new Error(`Audio sau convert ${(wav.byteLength / 1024 / 1024).toFixed(1)}MB > 20MB (giới hạn inline Gemini). Ghi đoạn ngắn hơn.`);
        const base64 = this._arrayBufferToBase64(wav);

        const root = (profile.baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/$/, "");
        const model = profile.model || "gemini-2.5-flash";
        const url = `${root}/models/${model}:generateContent?key=${profile.apiKey}`;
        const lang = ((this.plugin.settings.whisper || {}).language || "").trim();
        const promptText = `Transcribe the spoken audio to plain text verbatim.${lang ? ` The spoken language is "${lang}".` : ""} Output ONLY the transcript — no commentary, no quotes, no timestamps.`;
        const body = {
            contents: [{ role: "user", parts: [
                { text: promptText },
                { inlineData: { mimeType: "audio/wav", data: base64 } }
            ] }]
        };
        const { requestUrl } = require("obsidian");
        const res = await requestUrl({
            url, method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            throw: false
        });
        if (res.status !== 200) throw new Error(`Gemini STT ${res.status}: ${(res.text || "").slice(0, 300)}`);
        const text = (parseNonStreamResponse("google", res.json) || "").trim();
        if (!text) throw new Error("Gemini trả transcript rỗng");
        this.plugin._whisperCache[hash] = text;
        return { text, cached: false };
    }

    async _transcribeAudio(arrayBuffer, filename, ext) {
        const cfg = this.plugin.settings.whisper || {};
        if (!cfg.enabled) throw new Error("Whisper transcription chưa bật trong Settings");
        if (!cfg.apiKey) throw new Error("Chưa có OpenAI API key trong Settings → Whisper");

        const MAX_BYTES = 25 * 1024 * 1024;
        if (arrayBuffer.byteLength > MAX_BYTES) {
            throw new Error(`File ${filename} = ${(arrayBuffer.byteLength/1024/1024).toFixed(1)}MB > 25MB (limit Whisper). Cần nén/cắt trước (vd ffmpeg -i in.mp4 -vn -ac 1 -ar 16000 -b:a 64k out.mp3).`);
        }

        const hash = await this._sha256Hex(arrayBuffer);
        if (!this.plugin._whisperCache) this.plugin._whisperCache = {};
        if (this.plugin._whisperCache[hash]) {
            return { text: this.plugin._whisperCache[hash], cached: true };
        }

        const mime = this._audioMimeType(ext);
        const fd = new FormData();
        fd.append("file", new Blob([arrayBuffer], { type: mime }), filename);
        fd.append("model", cfg.model || "whisper-1");
        fd.append("response_format", "text");
        if (cfg.language && cfg.language.trim()) fd.append("language", cfg.language.trim());

        const url = cfg.baseUrl || "https://api.openai.com/v1/audio/transcriptions";
        const startedAt = Date.now();
        const res = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${cfg.apiKey}` },
            body: fd
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => "");
            throw new Error(`Whisper API ${res.status}: ${errText.slice(0, 300)}`);
        }
        const text = (await res.text()).trim();
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
        console.log(`[bob-whisper] transcribed ${filename} (${(arrayBuffer.byteLength/1024).toFixed(0)}KB) in ${elapsed}s → ${text.length} chars`);
        this.plugin._whisperCache[hash] = text;
        return { text, cached: false, elapsedSec: elapsed };
    }

    // Đọc đệ quy folder bên ngoài Obsidian (Finder drag) qua FileSystemDirectoryEntry API
    async _readExternalDirectoryEntry(dirEntry, allowedExts) {
        const out = [];
        const reader = dirEntry.createReader();
        const readBatch = () => new Promise((resolve, reject) =>
            reader.readEntries(resolve, reject)
        );
        const walk = async (entry) => {
            if (entry.isFile) {
                const ext = entry.name.split('.').pop().toLowerCase();
                if (!allowedExts || allowedExts.includes(ext)) {
                    const f = await new Promise((res, rej) => entry.file(res, rej));
                    out.push(f);
                }
            } else if (entry.isDirectory) {
                const subReader = entry.createReader();
                let entries;
                do {
                    entries = await new Promise((res, rej) => subReader.readEntries(res, rej));
                    for (const sub of entries) await walk(sub);
                } while (entries.length > 0);
            }
        };
        let entries;
        do {
            entries = await readBatch();
            for (const sub of entries) await walk(sub);
        } while (entries.length > 0);
        return out;
    }

    async appendContext() {
        const activeFile = this.app.workspace.getActiveFile();
        let selection = "";

        // Try to get selected text if editor is active
        const activeView = this.app.workspace.getActiveViewOfType(require('obsidian').MarkdownView);
        if (activeView && activeView.editor) {
            selection = activeView.editor.getSelection();
        }

        if (selection) {
            this.textarea.value += `\n\n\`\`\`text\n${selection}\n\`\`\`\n`;
            new Notice("Đã nhúng đoạn text đang chọn!");
        } else if (activeFile) {
            const content = await this.app.vault.read(activeFile);
            this.textarea.value += `\n\n\`\`\`${activeFile.extension}\n${content}\n\`\`\`\n`;
            new Notice(`Đã nhúng toàn bộ file ${activeFile.name}!`);
        } else {
            new Notice("Không có file nào đang mở!");
        }
    }

    // ====================================================================
    // Slash commands — gõ "/" đầu textarea để mở menu lệnh nhanh
    // ====================================================================
    _setupSlashCommands() {
        // Mỗi lệnh: trigger (filter), label, hint (mô tả ngắn), expand (template prompt)
        // {arg} sẽ được giữ nguyên trong textarea với placeholder "<...>" để user fill
        this.slashCommands = [
            // INGEST cluster
            { trigger: "concept",   label: "/concept",   hint: "Ingest concept X (atomic theory-first)", expand: "ingest concept {X}" },
            { trigger: "method",    label: "/method",    hint: "Tạo method/quy trình X (Problem-Driven HOW)", expand: "tạo method {X}" },
            { trigger: "principle", label: "/principle", hint: "Tạo principle/nguyên tắc X (WHY rule)", expand: "nguyên tắc {X}" },
            { trigger: "pattern",   label: "/pattern",   hint: "Tạo pattern X (giải pháp lặp lại, rule of 3)", expand: "pattern {X}" },
            { trigger: "framework", label: "/framework", hint: "Tạo framework X (khung phân tích/quyết định)", expand: "framework {X}" },
            { trigger: "tool",      label: "/tool",      hint: "Tạo tool/công cụ X", expand: "tool {X}" },
            { trigger: "problem",   label: "/problem",   hint: "Tạo problem hub X", expand: "tạo problem {X}" },
            { trigger: "symptom",   label: "/symptom",   hint: "Tạo symptom X", expand: "triệu chứng {X}" },
            { trigger: "hub",       label: "/hub",       hint: "Tạo hub X", expand: "hub {X}" },
            { trigger: "hubcha",    label: "/hubcha",    hint: "Tạo hub cha (parent hub) X", expand: "hub cha {X}" },
            // Daily / quick capture
            { trigger: "daily",     label: "/daily",     hint: "Daily note hôm nay", expand: "daily" },
            { trigger: "note",      label: "/note",      hint: "Ghi chú nhanh (capture seed)", expand: "ghi chú nhanh: {nội dung}" },
            // People / Books / Meetings
            { trigger: "profile",   label: "/profile",   hint: "People profile (12-section)", expand: "profile {tên}" },
            { trigger: "book",      label: "/book",      hint: "Tóm tắt sách / book highlights", expand: "tóm tắt sách {tựa}" },
            { trigger: "meeting",   label: "/meeting",   hint: "Meeting note", expand: "họp {chủ đề}" },
            { trigger: "project",   label: "/project",   hint: "Project log entry", expand: "project {tên}" },
            { trigger: "moc",       label: "/moc",       hint: "MOC (Map of Content)", expand: "MOC {chủ đề}" },
            { trigger: "mocfix",    label: "/mocfix",    hint: "Chuẩn hoá 1 MOC cũ theo template moc.md (đọc-dẫn, không phẳng)", expand: "chuẩn hoá MOC {tên-moc} theo template moc.md" },
            { trigger: "minto",     label: "/minto",     hint: "Minto pyramid note", expand: "minto {chủ đề}" },
            // Batch & maintenance
            { trigger: "batch",     label: "/batch",     hint: "INGEST_BATCH các file đính kèm / Clippings cùng topic", expand: "ingest tất cả {topic / file} bằng INGEST_BATCH" },
            { trigger: "lint",      label: "/lint",      hint: "Lint wiki (kiểm tra orphan, broken link, frontmatter sai)", expand: "lint wiki" },
            { trigger: "express",   label: "/express",   hint: "Tạo artifact EXHIBIT từ atomic notes", expand: "express {topic}" },
            { trigger: "query",     label: "/query",     hint: "Query knowledge graph", expand: "{câu hỏi}" },
            { trigger: "reorg",     label: "/reorg",     hint: "Hỏi về tổ chức folder / re-route", expand: "đề xuất reorg cho {folder/topic}" },
            // Helpers
            { trigger: "active",    label: "/active",    hint: "Đính kèm file đang mở vào prompt", expand: "__INSERT_ACTIVE__" },
            // Quản lý bảng task Kanban (tasksFile)
            { trigger: "task",      label: "/task",      hint: "Thêm task mới vào bảng Kanban (deadline tuỳ chọn)", expand: "thêm task: {tên task} — deadline {DD/MM}" },
            { trigger: "done",      label: "/done",      hint: "Đánh dấu task đã xong (tick + ngày hoàn thành)", expand: "task '{tên task}' đã xong" },
            { trigger: "tasks",     label: "/tasks",     hint: "Liệt kê task theo trạng thái / deadline", expand: "liệt kê task {đang làm / quá hạn / tuần này}" },
            { trigger: "report",    label: "/report",    hint: "Báo cáo trạng thái task (tổng/done/pending/overdue)", expand: "báo cáo task tuần này" },
            { trigger: "url",       label: "/url",       hint: "Fetch nội dung 1 URL (web article) làm context", expand: "__FETCH_URL__" },
            { trigger: "yt",        label: "/yt",        hint: "Fetch transcript YouTube làm context", expand: "__FETCH_URL__" },
            { trigger: "folder",    label: "/folder",    hint: "Đính kèm folder vault (recurse .md)", expand: "__PICK_FOLDER__" },
            { trigger: "guide",     label: "/guide",     hint: "Hướng dẫn cài đặt & sử dụng plugin", expand: "__SHOW_GUIDE__" },
            { trigger: "onboarding",label: "/onboarding",hint: "Chạy lại thiết lập cá nhân hoá ban đầu", expand: "__START_ONBOARDING__" },
            { trigger: "help",      label: "/help",      hint: "Liệt kê toàn bộ trigger trợ lý hỗ trợ", expand: "liệt kê các trigger và luồng bạn hỗ trợ" },
        ];

        // Gate lệnh Kanban — chỉ giữ khi đã cấu hình tasksFile và file tồn tại
        const tasksFile = (this.plugin.settings.userProfile?.tasksFile || "").replace(/^\/+|\/+$/g, "");
        if (!tasksFile || !this.app.vault.getAbstractFileByPath(tasksFile)) {
            this.slashCommands = this.slashCommands.filter(c => !["task", "done", "tasks", "report"].includes(c.trigger));
        }
    }

    _maybeShowSlashMenu() {
        const val = this.textarea.value;
        // Chỉ kích hoạt nếu toàn bộ textarea bắt đầu bằng "/" và CHƯA có space (đang trong tên lệnh)
        if (!val.startsWith("/")) {
            this._hideSlashMenu();
            return;
        }
        const firstSpace = val.indexOf(" ");
        const firstNewline = val.indexOf("\n");
        if (firstSpace !== -1 || firstNewline !== -1) {
            this._hideSlashMenu();
            return;
        }
        const query = val.slice(1).toLowerCase();
        this.slashFiltered = this.slashCommands.filter(c =>
            c.trigger.startsWith(query) || c.label.toLowerCase().includes(query)
        );
        if (this.slashFiltered.length === 0) {
            this._hideSlashMenu();
            return;
        }
        this.slashIndex = 0;
        this._renderSlashMenu();
    }

    _renderSlashMenu() {
        this.slashMenu.empty();
        this.slashMenu.style.display = "block";
        for (let i = 0; i < this.slashFiltered.length; i++) {
            const cmd = this.slashFiltered[i];
            const item = this.slashMenu.createDiv({
                cls: "obsidian-agent-slash-item" + (i === this.slashIndex ? " is-selected" : "")
            });
            item.createSpan({ text: cmd.label, cls: "obsidian-agent-slash-label" });
            item.createSpan({ text: cmd.hint, cls: "obsidian-agent-slash-hint" });
            item.addEventListener("mousedown", (e) => {
                e.preventDefault(); // tránh blur textarea
                this._applySlashCommand(cmd);
            });
            // Mobile: tap chọn lệnh (mousedown không kích hoạt đáng tin trên touch)
            item.addEventListener("touchstart", (e) => {
                e.preventDefault();
                this._applySlashCommand(cmd);
            }, { passive: false });
            item.addEventListener("mouseenter", () => {
                this.slashIndex = i;
                this._renderSlashMenu();
            });
        }
    }

    _hideSlashMenu() {
        this.slashMenu.style.display = "none";
        this.slashFiltered = [];
    }

    async _applySlashCommand(cmd) {
        if (!cmd) return;
        // Special: /active → đính kèm file đang mở rồi để textarea trống
        if (cmd.expand === "__INSERT_ACTIVE__") {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                await this.appendFilesToChat([activeFile]);
                this.textarea.value = "";
            } else {
                new Notice("Không có file nào đang mở!");
            }
            this._hideSlashMenu();
            return;
        }
        // Special: /url, /yt → prompt user nhập URL rồi fetch
        if (cmd.expand === "__FETCH_URL__") {
            this._hideSlashMenu();
            const url = await this._promptText(cmd.trigger === "yt" ? "Dán URL YouTube:" : "Dán URL:");
            if (url) {
                this.textarea.value = "";
                await this.appendUrlToChat(url.trim());
            }
            this.textarea.focus();
            return;
        }
        // Special: /folder → mở picker chọn folder vault
        if (cmd.expand === "__PICK_FOLDER__") {
            this._hideSlashMenu();
            const folderPath = await this._promptFolderPath();
            if (folderPath) {
                const folder = this.app.vault.getAbstractFileByPath(folderPath);
                if (folder instanceof TFolder) {
                    await this.appendFilesToChat([folder]);
                    this.textarea.value = "";
                } else {
                    new Notice(`Không tìm thấy folder: ${folderPath}`);
                }
            }
            this.textarea.focus();
            return;
        }
        // Special: /guide → hiện hướng dẫn tĩnh ngay (không gọi LLM); guide nằm trong context để LLM trả lời follow-up
        if (cmd.expand === "__SHOW_GUIDE__") {
            this._hideSlashMenu();
            this.messages.push({ role: "assistant", content: this._getSetupGuideText() });
            this.renderMessages();
            this.saveHistory();
            this.textarea.value = "";
            this.textarea.focus();
            return;
        }
        // Special: /onboarding → chạy lại thiết lập ban đầu
        if (cmd.expand === "__START_ONBOARDING__") {
            this._hideSlashMenu();
            const ok = window.confirm("Chạy lại onboarding? Trợ lý sẽ hỏi lại thông tin và ghi đè bộ não _agent/.");
            if (ok) {
                this.plugin.settings.onboarded = false;
                this.plugin.saveSettings();
                this.messages = [];
                this.currentChatFile = null;
                this.currentJsonFile = null;
                this._beginOnboardingGreeting();
            }
            this.textarea.value = "";
            this.textarea.focus();
            return;
        }
        this.textarea.value = cmd.expand;
        // Đặt cursor vào placeholder đầu tiên dạng {...} nếu có, để user fill ngay
        const placeholder = cmd.expand.match(/\{[^}]+\}/);
        if (placeholder) {
            const start = cmd.expand.indexOf(placeholder[0]);
            this.textarea.setSelectionRange(start, start + placeholder[0].length);
        } else {
            this.textarea.setSelectionRange(cmd.expand.length, cmd.expand.length);
        }
        this.textarea.focus();
        this._hideSlashMenu();
    }

    _getSetupGuideText() {
        return [
            "# 🧭 Hướng dẫn cài đặt & sử dụng",
            "",
            "## 1. Bắt buộc — Provider (API key)",
            "Vào **Settings → Wiki Agent**, tạo một *profile* và nhập thông tin model:",
            "- **OpenAI-compatible / Trollllm**: nhập **Base URL** + **API Key** + chọn **model**.",
            "- **ChatGPT (OAuth)** hoặc **Gemini (OAuth)**: đăng nhập bằng tài khoản, không cần API key thủ công.",
            "- **Ollama**: chạy local, không cần API key.",
            "",
            "Chưa có profile thì mình **không chạy** được. Bật cờ **Vision** trong profile nếu muốn gửi ảnh.",
            "",
            "## 2. Tuỳ chọn — các tích hợp thêm",
            "- **YouTube (`/yt`)**: cài `yt-dlp` trên máy. Nếu nó không nằm trên PATH, chỉnh `ytDlpPath` trong settings.",
            "- **Audio/Video transcribe**: bật mục **Whisper** (apiKey/baseUrl/model) để mình đọc file audio/video đính kèm.",
            "- **NotebookLM MCP**: cài server, chạy `nlm login` ở terminal, rồi bật `mcp.notebooklmEnabled` trong settings. Lỗi auth → chạy lại `nlm login`.",
            "- **GitHub token**: điền `github.token` để tăng giới hạn khi fetch repo công khai.",
            "",
            "## 3. Dùng nhanh",
            "- Gõ `/` trong khung chat để xem toàn bộ lệnh nhanh (đính kèm file, fetch URL, v.v.).",
            "- `/onboarding` — chạy lại thiết lập cá nhân hoá ban đầu (hỏi lại tên, ngôn ngữ… và dựng lại `_agent/`).",
            "- Mình thao tác trực tiếp file vault (đọc/ghi/di chuyển) theo yêu cầu — cứ nói tự nhiên là được.",
            "",
            "Cần hỏi gì thêm về bước nào, cứ nhắn cho mình nhé 👇"
        ].join("\n");
    }

    _promptText(label) {
        return new Promise(resolve => {
            const modal = new Modal(this.app);
            modal.titleEl.setText(label);
            const input = modal.contentEl.createEl("input", { type: "text", cls: "obsidian-agent-prompt-input" });
            input.style.width = "100%";
            input.style.padding = "8px";
            input.style.marginBottom = "10px";
            const btnRow = modal.contentEl.createDiv({ cls: "obsidian-agent-prompt-buttons" });
            btnRow.style.display = "flex";
            btnRow.style.gap = "8px";
            btnRow.style.justifyContent = "flex-end";
            const okBtn = btnRow.createEl("button", { text: "OK", cls: "mod-cta" });
            const cancelBtn = btnRow.createEl("button", { text: "Hủy" });
            let result = null;
            const finish = (val) => { result = val; modal.close(); };
            okBtn.onclick = () => finish(input.value);
            cancelBtn.onclick = () => finish(null);
            input.addEventListener("keydown", e => {
                if (e.key === "Enter") finish(input.value);
                else if (e.key === "Escape") finish(null);
            });
            modal.onClose = () => resolve(result);
            modal.open();
            setTimeout(() => input.focus(), 50);
        });
    }

    async _promptFolderPath() {
        // Liệt kê folder vault, cho user chọn
        const folders = [];
        const collect = (f) => {
            if (f instanceof TFolder) {
                folders.push(f.path || "/");
                for (const c of f.children) collect(c);
            }
        };
        collect(this.app.vault.getRoot());
        return new Promise(resolve => {
            const modal = new Modal(this.app);
            modal.titleEl.setText("Chọn folder để đính kèm");
            const input = modal.contentEl.createEl("input", { type: "text", placeholder: "Lọc..." });
            input.style.width = "100%";
            input.style.padding = "8px";
            input.style.marginBottom = "8px";
            const list = modal.contentEl.createDiv();
            list.style.maxHeight = "300px";
            list.style.overflowY = "auto";
            const render = (filter) => {
                list.empty();
                const f = (filter || "").toLowerCase();
                folders.filter(p => p.toLowerCase().includes(f)).slice(0, 100).forEach(p => {
                    const it = list.createDiv({ text: p, cls: "obsidian-agent-folder-item" });
                    it.style.padding = "6px 10px";
                    it.style.cursor = "pointer";
                    it.style.borderRadius = "4px";
                    it.onmouseenter = () => it.style.background = "var(--background-modifier-hover)";
                    it.onmouseleave = () => it.style.background = "";
                    it.onclick = () => { result = p; modal.close(); };
                });
            };
            let result = null;
            input.addEventListener("input", () => render(input.value));
            input.addEventListener("keydown", e => { if (e.key === "Escape") modal.close(); });
            render("");
            modal.onClose = () => resolve(result);
            modal.open();
            setTimeout(() => input.focus(), 50);
        });
    }

    async renderMarkdownAsync(text, el) {
        el.empty();
        const sourcePath = this.app.workspace.getActiveFile()?.path || '';

        // Collapse $$WRITE/APPEND:...$$ blocks into details/summary
        let safeText = text.replace(
            /\$\$(WRITE|APPEND):\s*(.*?)\$\$([\s\S]*?)\$\$END_(?:WRITE|APPEND)\$\$/g,
            (_, cmd, path, content) => {
                return `<details class="obsidian-agent-write-block"><summary>📝 ${cmd}: ${path.trim()}</summary>\n\n\`\`\`\n${content.trim()}\n\`\`\`\n</details>`;
            }
        );

        // Collapse $$REPLACE/DELETE:...$$ blocks
        safeText = safeText.replace(
            /\$\$(REPLACE):\s*(.*?)\$\$([\s\S]*?)\$\$WITH\$\$([\s\S]*?)\$\$END_REPLACE\$\$/g,
            (_, cmd, path, oldT, newT) => {
                return `<details class="obsidian-agent-write-block"><summary>🔄 REPLACE: ${path.trim()}</summary>\n\n**Cũ:**\n\`\`\`\n${oldT.trim()}\n\`\`\`\n**Mới:**\n\`\`\`\n${newT.trim()}\n\`\`\`\n</details>`;
            }
        );
        safeText = safeText.replace(
            /\$\$DELETE:\s*(.*?)\$\$([\s\S]*?)\$\$END_DELETE\$\$/g,
            (_, path, content) => {
                return `<details class="obsidian-agent-write-block"><summary>🗑 DELETE: ${path.trim()}</summary>\n\n\`\`\`\n${content.trim()}\n\`\`\`\n</details>`;
            }
        );

        // Collapse $$MOVE: src$$dst$$END_MOVE$$ block
        safeText = safeText.replace(
            /\$\$MOVE:\s*([\s\S]*?)\$\$([\s\S]*?)\$\$END_MOVE\$\$/g,
            (_, src, dst) => {
                return `<details class="obsidian-agent-write-block"><summary>🚚 MOVE: ${src.trim()} → ${dst.trim()}</summary></details>`;
            }
        );

        // Collapse $$INGEST_BATCH$$ ... $$END_INGEST_BATCH$$ block (JSON spec)
        safeText = safeText.replace(
            /\$\$INGEST_BATCH\$\$([\s\S]*?)\$\$END_INGEST_BATCH\$\$/g,
            (_, content) => {
                let count = '?';
                try {
                    const parsed = JSON.parse(content.trim());
                    if (Array.isArray(parsed)) count = parsed.length;
                } catch (_) {}
                return `<details class="obsidian-agent-write-block"><summary>📦 INGEST_BATCH spec (${count} note)</summary>\n\n\`\`\`json\n${content.trim()}\n\`\`\`\n</details>`;
            }
        );

        // Collapse $$SAVE_PROFILE$$ ... $$END_SAVE_PROFILE$$ (onboarding) + ẩn token $$ONBOARDING_DONE$$
        safeText = safeText.replace(
            /\$\$SAVE_PROFILE\$\$([\s\S]*?)\$\$END_SAVE_PROFILE\$\$/g,
            () => `<details class="obsidian-agent-write-block"><summary>👤 Lưu hồ sơ cá nhân hoá</summary></details>`
        );
        safeText = safeText.replace(/\$\$ONBOARDING_DONE\$\$/g, '🎉 *(thiết lập hoàn tất)*');
        safeText = safeText.replace(
            /\$\$INSTALL_TEMPLATES\$\$([\s\S]*?)\$\$END_INSTALL_TEMPLATES\$\$/g,
            () => `<details class="obsidian-agent-write-block"><summary>📦 Cài template</summary></details>`
        );
        safeText = safeText.replace(
            /\$\$INSTALL_FOLDERS\$\$([\s\S]*?)\$\$END_INSTALL_FOLDERS\$\$/g,
            () => `<details class="obsidian-agent-write-block"><summary>📁 Cài hệ thống folder</summary></details>`
        );
        safeText = safeText.replace(
            /\$\$SCAFFOLD_AGENT\$\$([\s\S]*?)\$\$END_SCAFFOLD_AGENT\$\$/g,
            () => `<details class="obsidian-agent-write-block"><summary>🧠 Tạo bộ não _agent (CLAUDE + luồng)</summary></details>`
        );
        safeText = safeText.replace(
            /\$\$INSTALL_TASKBOARD\$\$([\s\S]*?)\$\$END_INSTALL_TASKBOARD\$\$/g,
            () => `<details class="obsidian-agent-write-block"><summary>📋 Tạo bảng task Kanban</summary></details>`
        );

        // Escape remaining $$COMMAND$$ syntax to prevent LaTeX rendering
        safeText = safeText.replace(/\$\$(READ|LIST|SEARCH):\s*(.*?)\$\$/g, '`$1: $2`');
        // Collapse $$NLM_TOOL: name$$args$$END_NLM_TOOL$$ block
        safeText = safeText.replace(
            /\$\$NLM_TOOL:\s*([\w-]+)\$\$([\s\S]*?)\$\$END_NLM_TOOL\$\$/g,
            (_, name, args) => `<details class="obsidian-agent-write-block"><summary>🔧 NLM_TOOL: ${name.trim()}</summary>\n\n\`\`\`\n${args.trim()}\n\`\`\`\n</details>`
        );

        safeText = safeText.replace(/\$\$END_(WRITE|APPEND|REPLACE|DELETE|MOVE|INGEST_BATCH|NLM_TOOL)\$\$/g, '');

        // Collapse attachment code fences (YouTube/URL/PDF/Ảnh/Tệp nội bộ) thành <details>
        // Matches: ```LABEL\nBODY\n```  với LABEL bắt đầu bằng prefix đặc biệt.
        // Fence length động (3+ backticks) — match `(`{3,}) capture group + back-reference \1
        // để đóng fence đúng dù body có chứa inner ```.
        safeText = safeText.replace(
            /(`{3,})(YouTube|URL|PDF|DOCX|XLSX|PPTX|Ảnh|Tệp nội bộ|Tệp bên ngoài):\s*([^\n]+)\n([\s\S]*?)\n\1/g,
            (_, fence, kind, name, body) => {
                const icon = { "YouTube": "▶️", "URL": "🌐", "PDF": "📄", "DOCX": "📝", "XLSX": "📊", "PPTX": "📽️", "Ảnh": "🖼️", "Tệp nội bộ": "📎", "Tệp bên ngoài": "📎" }[kind] || "📎";
                const lineCount = body.split('\n').length;
                const charCount = body.length;
                const meta = lineCount > 5 ? ` (${lineCount} dòng, ${charCount.toLocaleString()} ký tự)` : "";
                return `<details class="obsidian-agent-write-block"><summary>${icon} ${kind}: ${name.trim()}${meta}</summary>\n\n\`\`\`\n${body}\n\`\`\`\n</details>`;
            }
        );
        // Also collapse fences with raw path label (label = at.path for .md attachments)
        safeText = safeText.replace(
            /(`{3,})([^\n`]+\.(?:md|txt|csv|json|js|ts|py|html|xml|yaml|yml))\n([\s\S]*?)\n\1/g,
            (_, fence, path, body) => {
                const lineCount = body.split('\n').length;
                const charCount = body.length;
                const meta = lineCount > 5 ? ` (${lineCount} dòng, ${charCount.toLocaleString()} ký tự)` : "";
                return `<details class="obsidian-agent-write-block"><summary>📎 ${path.trim()}${meta}</summary>\n\n\`\`\`\n${body}\n\`\`\`\n</details>`;
            }
        );

        await MarkdownRenderer.renderMarkdown(safeText, el, sourcePath, this);

        // Make [[wikilinks]] clickable — open the note in Obsidian
        el.querySelectorAll('a.internal-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('data-href') || link.getAttribute('href');
                if (!href) return;

                // 1. Try resolving via metadataCache (finds notes even in subfolders)
                const resolved = this.app.metadataCache.getFirstLinkpathDest(href, sourcePath);
                if (resolved) {
                    this.app.workspace.openLinkText(resolved.path, '', false);
                    return;
                }

                // 2. Check if it's a folder name
                const folder = this.app.vault.getAbstractFileByPath(href);
                if (folder && folder.children) {
                    // Reveal folder in file explorer
                    this.app.internalPlugins.getPluginById('file-explorer')?.instance?.revealInFolder(folder);
                    new Notice(`📂 Đã mở thư mục: ${href}`);
                    return;
                }

                // 3. Fuzzy search: scan all files for partial match
                const allFiles = this.app.vault.getFiles();
                const match = allFiles.find(f => {
                    const basename = f.basename.toLowerCase();
                    const search = href.toLowerCase();
                    return basename === search || f.path.toLowerCase().includes(search);
                });
                if (match) {
                    this.app.workspace.openLinkText(match.path, '', false);
                    return;
                }

                new Notice(`⚠️ Không tìm thấy note hoặc thư mục: ${href}`);
            });
        });
    }

    renderMessages() {
        this.messageContainer.empty();
        if (this.messages.length === 0) {
            this.messageContainer.createDiv({ text: "Hãy bắt đầu trò chuyện với ObsidianAgent! Cuộc hội thoại sẽ được tự động lưu.", cls: "obsidian-agent-empty" });
            return;
        }

        for (const msg of this.messages) {
            if (msg.role === "system") continue;

            // Defensive: extract text + image parts khi content là array (Phase 3 vision)
            const textPart = typeof msg.content === "string"
                ? msg.content
                : _flattenCanonicalToText(msg.content);
            const imageParts = Array.isArray(msg.content)
                ? msg.content.filter(p => p.type === "image")
                : [];

            // Detect system auto-reply messages (file content / list results / MCP tool results)
            const isSystemResult = msg.role === "user" && (
                textPart.startsWith("[HỆ THỐNG") ||
                textPart.startsWith("[NotebookLM TOOL RESULT")
            );
            // Maintenance prompt (user message dài do runMaintenanceTask nạp) — thu gọn để khỏi chiếm màn hình.
            // Prefix khớp với _buildMaintenancePrompt(); nếu đổi prefix đó thì cập nhật ở đây.
            const isMaintPrompt = msg.role === "user" && textPart.startsWith("[BẢO TRÌ TỰ ĐỘNG]");

            if (isSystemResult || isMaintPrompt) {
                const msgEl = this.messageContainer.createDiv({ cls: "obsidian-agent-msg obsidian-agent-msg-system-result" });
                const avatar = msgEl.createDiv({ cls: "obsidian-agent-avatar" });
                avatar.addClass("obsidian-agent-avatar-system");
                setIcon(avatar, "settings");
                const wrapper = msgEl.createDiv({ cls: "obsidian-agent-content obsidian-agent-collapsible-wrapper" });

                // Extract title from first line
                const firstLine = textPart.split('\n')[0];
                const details = wrapper.createEl("details");
                const summary = isMaintPrompt ? "🔧 Đang chạy bảo trì vault… (bấm để xem prompt)" : firstLine;
                details.createEl("summary", { text: summary, cls: "obsidian-agent-collapsible-title" });
                const body = details.createDiv({ cls: "obsidian-agent-collapsible-body" });
                const bodyContent = isMaintPrompt ? textPart : textPart.split('\n').slice(1).join('\n');
                this.renderMarkdownAsync(bodyContent, body);
                continue;
            }

            const msgEl = this.messageContainer.createDiv({ cls: `obsidian-agent-msg obsidian-agent-msg-${msg.role}` });
            const avatar = msgEl.createDiv({ cls: "obsidian-agent-avatar" });
            if (msg.role === "user") {
                avatar.innerText = "N";
                avatar.addClass("obsidian-agent-avatar-user");
            } else {
                avatar.addClass("obsidian-agent-avatar-agent");
                setIcon(avatar, "bot");
            }

            const contentEl = msgEl.createDiv({ cls: "obsidian-agent-content markdown-rendered" });
            this.renderMarkdownAsync(textPart, contentEl);

            // Render image thumbnails dưới text
            if (imageParts.length > 0) {
                const gallery = msgEl.createDiv({ cls: "obsidian-agent-image-gallery" });
                for (const ip of imageParts) {
                    const img = gallery.createEl("img", { cls: "obsidian-agent-image-thumb" });
                    img.src = `data:${ip.mediaType};base64,${ip.base64}`;
                    img.alt = ip.name || "image";
                    img.title = ip.name || "image";
                }
            }

            // Action row (copy + tạo note) cuối bubble assistant
            if (msg.role === "assistant" && textPart && textPart.trim()) {
                this._renderAssistantActions(msgEl, contentEl, textPart, this.messages.indexOf(msg));
            }
        }

        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    async saveHistory() {
        const folderName = "_agent/chats";
        if (!this.app.vault.getAbstractFileByPath(folderName)) {
            await this.app.vault.createFolder(folderName);
        }

        if (!this.currentChatFile) {
            const dateStr = window.moment().format("YYYY-MM-DD_HH-mm-ss");
            const mdName = `${folderName}/Chat_${dateStr}.md`;
            const jsonName = `${folderName}/Chat_${dateStr}.json`;
            this.currentChatFile = await this.app.vault.create(mdName, "");
            this.currentJsonFile = await this.app.vault.create(jsonName, "[]");
        }

        // Save readable MD
        const firstUserMsg = this.messages.find(m => m.role === "user");
        const firstUserText = firstUserMsg
            ? (typeof firstUserMsg.content === "string" ? firstUserMsg.content : _flattenCanonicalToText(firstUserMsg.content))
            : "";
        const title = firstUserText ? firstUserText.slice(0, 60).replace(/\n/g, ' ') : 'Untitled';
        let fileContent = `# ${title}\n\n`;
        for (const msg of this.messages) {
            if (msg.role === "system") continue;
            const roleName = msg.role === "user" ? "**You**" : "**ObsidianAgent**";
            const text = typeof msg.content === "string" ? msg.content : _flattenCanonicalToText(msg.content);
            const imgCount = Array.isArray(msg.content) ? msg.content.filter(p => p.type === "image").length : 0;
            const imgNote = imgCount > 0 ? `\n_(kèm ${imgCount} ảnh)_` : "";
            fileContent += `${roleName}:\n${text}${imgNote}\n\n---\n\n`;
        }
        await this.app.vault.modify(this.currentChatFile, fileContent);

        // Save JSON for reload
        if (this.currentJsonFile) {
            const jsonFile = this.app.vault.getAbstractFileByPath(this.currentJsonFile.path);
            if (jsonFile) {
                await this.app.vault.modify(jsonFile, JSON.stringify(this.messages.filter(m => m.role !== "system"), null, 2));
            }
        }
    }

    async toggleHistoryPanel() {
        if (this.historyPanel.style.display !== "none") {
            this.historyPanel.style.display = "none";
            return;
        }
        this.historyPanel.empty();
        this.historyPanel.style.display = "";

        const folderName = "_agent/chats";
        const folder = this.app.vault.getAbstractFileByPath(folderName);
        if (!folder || !folder.children) {
            this.historyPanel.createDiv({ text: "Chưa có lịch sử hội thoại.", cls: "obsidian-agent-empty" });
            return;
        }

        const jsonFiles = folder.children
            .filter(f => f.name.endsWith('.json'))
            .sort((a, b) => b.name.localeCompare(a.name));

        if (jsonFiles.length === 0) {
            this.historyPanel.createDiv({ text: "Chưa có lịch sử hội thoại.", cls: "obsidian-agent-empty" });
            return;
        }

        for (const jf of jsonFiles) {
            const item = this.historyPanel.createDiv({ cls: "obsidian-agent-history-item" });

            // Try to read first user message as preview
            let preview = jf.name.replace('.json', '').replace('Chat_', '').replace(/_/g, ' ');
            try {
                const raw = await this.app.vault.read(jf);
                const msgs = JSON.parse(raw);
                const firstUser = msgs.find(m => m.role === "user");
                if (firstUser) {
                    preview = firstUser.content.slice(0, 50).replace(/\n/g, ' ');
                    if (firstUser.content.length > 50) preview += '...';
                }
            } catch (e) { }

            const dateMatch = jf.name.match(/Chat_(\d{4}-\d{2}-\d{2})_(\d{2})-?(\d{2})/);
            const dateLabel = dateMatch ? `${dateMatch[1]} ${dateMatch[2]}:${dateMatch[3]}` : '';

            const textDiv = item.createDiv({ cls: "obsidian-agent-history-text" });
            textDiv.createDiv({ text: preview, cls: "obsidian-agent-history-preview" });
            if (dateLabel) textDiv.createDiv({ text: dateLabel, cls: "obsidian-agent-history-date" });

            // Delete button per item
            const delBtn = item.createEl("button", { cls: "obsidian-agent-history-delete" });
            setIcon(delBtn, "trash-2");
            delBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await this.deleteSession(jf);
                await this.toggleHistoryPanel(); // close
                await this.toggleHistoryPanel(); // reopen refreshed
            });

            textDiv.addEventListener("click", async () => {
                await this.loadSession(jf);
                this.historyPanel.style.display = "none";
            });
        }

        // Clear all button
        const clearAllBtn = this.historyPanel.createDiv({ cls: "obsidian-agent-history-clear-all" });
        const clearBtn = clearAllBtn.createEl("button", { cls: "obsidian-agent-btn-small obsidian-agent-btn-danger" });
        const clearIcon = clearBtn.createSpan();
        setIcon(clearIcon, "trash-2");
        clearBtn.createSpan({ text: " Xóa tất cả lịch sử" });
        clearAllBtn.addEventListener("click", async () => {
            for (const jf of jsonFiles) {
                await this.deleteSession(jf);
            }
            this.messages = [];
            this.currentChatFile = null;
            this.currentJsonFile = null;
            this.renderMessages();
            await this.toggleHistoryPanel(); // close
            await this.toggleHistoryPanel(); // reopen (empty)
            new Notice("Đã xóa toàn bộ lịch sử!");
        });
    }
    async deleteSession(jsonFile) {
        try {
            // Delete JSON
            await this.app.vault.delete(jsonFile);
            // Delete matching MD
            const mdPath = jsonFile.path.replace('.json', '.md');
            const mdFile = this.app.vault.getAbstractFileByPath(mdPath);
            if (mdFile) await this.app.vault.delete(mdFile);
            // If we're viewing this session, reset
            if (this.currentJsonFile && this.currentJsonFile.path === jsonFile.path) {
                this.messages = [];
                this.currentChatFile = null;
                this.currentJsonFile = null;
                this.renderMessages();
            }
        } catch (e) {
            console.error("Delete session error", e);
        }
    }

    async loadSession(jsonFile) {
        try {
            const raw = await this.app.vault.read(jsonFile);
            this.messages = JSON.parse(raw);
            // Find matching MD file
            const mdPath = jsonFile.path.replace('.json', '.md');
            const mdFile = this.app.vault.getAbstractFileByPath(mdPath);
            this.currentChatFile = mdFile || null;
            this.currentJsonFile = jsonFile;
            this.renderMessages();
            new Notice(`Đã mở lại phiên chat!`);
        } catch (e) {
            new Notice(`Lỗi khi mở phiên chat: ${e.message}`);
        }
    }

    async getOnboardingPrompt() {
        const today = (window.moment ? window.moment().format("YYYY-MM-DD") : new Date().toISOString().slice(0, 10));
        const up = this.plugin.settings.userProfile || {};
        let p = "# CHẾ ĐỘ ONBOARDING — Thiết lập lần đầu\n";
        p += "Bạn là trợ lý AI thân thiện đang giúp một người dùng MỚI thiết lập vault Obsidian lần đầu tiên. Mục tiêu: làm quen → cá nhân hoá → tự dựng 'bộ não' _agent/ riêng cho vault của họ.\n\n";
        p += "## Nguyên tắc giao tiếp\n";
        p += "- Mặc định trả lời bằng Tiếng Việt; nếu người dùng nhắn bằng ngôn ngữ khác thì chuyển theo họ.\n";
        p += "- Hỏi TỪNG câu một, ngắn gọn, ấm áp. TUYỆT ĐỐI không hỏi dồn nhiều câu cùng lúc.\n";
        p += "- Lời chào + câu hỏi đầu tiên (gọi người dùng là gì) ĐÃ được hiển thị sẵn. Hãy tiếp tục TỪ câu trả lời của người dùng (đó chính là userName).\n\n";
        p += "## Thông tin cần thu thập (đúng thứ tự, mỗi lần 1 câu)\n";
        p += "1. userName — gọi người dùng là gì (ĐÃ hỏi ở lời chào).\n";
        p += "2. botName — người dùng muốn gọi BẠN (trợ lý) là gì? (gợi ý mặc định: Wiki Agent).\n";
        p += "--- THIẾT LẬP \"LINH HỒN\" AGENT (hỏi ngay sau khi đặt tên — đây là phần định hình ai bạn sẽ là) ---\n";
        p += "3. persona — TÍNH CÁCH của bạn (trợ lý). Hỏi: \"Bạn muốn mình có tính cách thế nào?\" + GỢI Ý vài lựa chọn để họ chọn nhanh (vd: 'điềm đạm như mentor', 'hài hước gần gũi', 'thẳng thắn & chính xác', 'nhiệt huyết cổ vũ'). Cho phép họ tự mô tả.\n";
        p += "4. soul — LINH HỒN / bản chất cốt lõi: nếu bạn là một con người đồng hành cùng họ thì bạn là ai, coi trọng điều gì? (vd: 'một người bạn kỷ luật luôn thúc mình tư duy sâu thay vì làm hộ'). Gợi ý 1-2 mẫu, ngắn gọn 1 câu.\n";
        p += "5. communicationStyle — PHONG CÁCH GIAO TIẾP: dài hay ngắn gọn, trang trọng hay thân mật, có dùng emoji không, thích ví dụ/ẩn dụ không, thẳng hay nhẹ nhàng. Gợi ý mẫu để chọn nhanh.\n";
        p += "(persona/soul/communicationStyle: LUÔN đưa gợi ý sẵn để user chỉ cần gật/chọn — đừng bắt họ nghĩ từ con số 0. Có thể bỏ qua nếu user nói 'tuỳ bạn' → dùng mặc định thân thiện-chính xác.)\n";
        p += "--- THÔNG TIN BỐI CẢNH ---\n";
        p += "6. location — đang ở đâu / múi giờ nào (để hiểu bối cảnh thời gian).\n";
        p += "7. doing — đang làm hoặc học gì (nghề nghiệp, lĩnh vực, mục tiêu dùng vault).\n";
        p += "8. language — ngôn ngữ chính muốn dùng (mặc định Tiếng Việt).\n";
        p += "9. honorific — bạn nên xưng hô với họ thế nào (vd 'bạn', 'sếp', 'cậu') — TỰ SUY từ phong cách trò chuyện, có thể hỏi nhẹ nếu phân vân.\n";
        p += "Sau khi đủ, xác nhận lại 1 dòng tóm tắt (gồm cả tính cách/phong cách) rồi chuyển sang BƯỚC LƯU & QUÉT.\n\n";
        p += "## Năng lực thao tác file (in ra text thường, KHÔNG bọc code block — plugin tự chạy & trả kết quả về cho bạn)\n";
        p += "- Liệt kê thư mục: $$LIST: đường/dẫn$$  (root vault = $$LIST: /$$)\n";
        p += "- Đọc file: $$READ: đường/dẫn$$\n";
        p += "- Tạo / ghi đè file: $$WRITE: đường/dẫn$$\nNội dung\n$$END_WRITE$$\n";
        p += "- Thêm cuối file: $$APPEND: đường/dẫn$$\nNội dung\n$$END_APPEND$$\n";
        p += "Bạn CÓ THỂ emit NHIỀU lệnh trong cùng 1 reply — plugin chạy tuần tự.\n\n";
        p += "## BƯỚC 1 — LƯU PROFILE (sau khi đã đủ thông tin)\n";
        p += "In ra CHÍNH XÁC (JSON 1 dòng, không code block):\n";
        p += '$$SAVE_PROFILE$$ {"userName":"...","botName":"...","persona":"...","soul":"...","communicationStyle":"...","location":"...","doing":"...","language":"...","honorific":"...","templatesFolder":""} $$END_SAVE_PROFILE$$\n';
        p += "(templatesFolder để trống ở bước này; sẽ điền sau ở BƯỚC 3 TEMPLATE.)\n\n";
        p += "## BƯỚC 2 — QUÉT VAULT (NÔNG)\n";
        p += "1. $$LIST: /$$ để xem các thư mục & file cấp 1.\n";
        p += "2. LIST sâu TỐI ĐA 1 cấp con vào các thư mục chính (BỎ QUA `.obsidian` và `_agent`). Suy ra vai trò mỗi folder từ TÊN của nó.\n";
        p += "3. KHÔNG đệ quy sâu, KHÔNG đọc nội dung từng note — chỉ cần nắm cấu trúc tổng thể để định tuyến.\n\n";
        p += "## BƯỚC 3 — HỆ THỐNG FOLDER\n";
        p += "Dựa trên kết quả quét, đánh giá vault đã có hệ thống folder tổ chức rõ ràng chưa, rồi NÊU 2 LỰA CHỌN cho user (giải thích ngắn gọn để họ quyết):\n";
        p += "**(A) Cài hệ thống 8 folder chuẩn** (PARA + CODE) — giải thích mỗi folder 1 dòng:\n";
        p += "  • `1.CAPTURE` — capture nhanh, hộp thư raw đầu vào (bất biến)\n";
        p += "  • `2.INPUT` — tri thức đầu vào qua đọc / nghe / xem / quan sát\n";
        p += "  • `3.PROCESS` — xử lý tri thức thành sản phẩm (bài viết, quy trình, pattern); nơi chứa dự án/công việc đang làm\n";
        p += "  • `4.OUTPUT` — sản phẩm tri thức đã chắt lọc, đúc kết\n";
        p += "  • `5.RESOURCE` — template note + file đính kèm (attachments)\n";
        p += "  • `6.PROBLEM HUB` — thu nạp tri thức để giải quyết vấn đề\n";
        p += "  • `7.ARCHIVE` — lưu trữ dự án đã kết thúc\n";
        p += "  • `8.TRACK` — theo dõi công việc, ghi chú cá nhân hàng ngày\n";
        p += "**(B) Dùng hệ thống folder hiện có** của user (giữ nguyên cấu trúc đã quét).\n";
        p += "- Hỏi user có muốn TÙY CHỈNH không (đổi tên / bỏ bớt folder) trước khi cài.\n";
        p += "- NẾU chọn (A): emit `$$INSTALL_FOLDERS$$ {} $$END_INSTALL_FOLDERS$$` (hoặc {\"folders\":[...]} nếu user tùy chỉnh). Ghi nhớ: ở BƯỚC 4 template sẽ cài vào `5.RESOURCE/template`.\n";
        p += "- NẾU chọn (B): KHÔNG cài folder; routing-rules ở BƯỚC 5 sẽ bám cấu trúc hiện có.\n\n";
        p += "## BƯỚC 4 — TEMPLATE GHI CHÚ\n";
        p += "⚠️ `templatesFolder` (nếu đã có trong profile) chỉ là ĐÍCH SẼ CÀI, KHÔNG phải bằng chứng template đã tồn tại. Folder `5.RESOURCE/template` vừa tạo ở BƯỚC 3 đang RỖNG. TUYỆT ĐỐI không suy ra 'đã có template' từ việc field này được set — muốn biết thực sự có template chưa thì `$$LIST$$` đúng folder đó xem có file `.md` không, hoặc hỏi user. Mặc định luồng (A): user CHƯA có template → giới thiệu & CÀI, đừng nói 'có thể đã sẵn'.\n";
        p += "Hỏi user: \"Bạn đã có sẵn bộ template ghi chú chưa? Nếu có thì nằm ở folder nào trong vault?\"\n";
        p += "- NẾU CÓ (user tự xác nhận, KHÔNG phải vì field được set): ghi nhận folder đó → đưa vào field `templatesFolder` khi $$SAVE_PROFILE$$. KHÔNG cài gì thêm.\n";
        p += "- NẾU CHƯA: giới thiệu NGẮN GỌN bộ template kèm sẵn (danh sách dưới), hỏi muốn cài cái nào hay CÀI TẤT. Chọn folder đích theo nhánh BƯỚC 3:\n";
        p += "  • Nếu chọn (A) 8 folder chuẩn → đích = `5.RESOURCE/template`.\n";
        p += "  • Nếu chọn (B) folder riêng → HỎI user muốn đặt template ở folder nào trong cấu trúc CỦA HỌ (vd folder resource sẵn có). TUYỆT ĐỐI không tự tạo `5.RESOURCE` nếu vault họ không dùng cấu trúc đó.\n";
        p += '  Rồi emit: $$INSTALL_TEMPLATES$$ {"folder":"<folder đã chốt>","files":"all"} $$END_INSTALL_TEMPLATES$$\n';
        p += "  (hoặc \"files\":[\"concept.md\",\"moc.md\",...] nếu user chọn lẻ). Sau đó cập nhật `templatesFolder` (đúng folder vừa cài) qua $$SAVE_PROFILE$$.\n";
        p += "Bộ template kèm sẵn (20 + 2 file tham chiếu):\n";
        p += "  concept (X là gì) · method (quy trình) · principle (nguyên tắc) · pattern (mẫu lặp lại) · framework (khung tư duy) · tool (SaaS) · symptom (triệu chứng) · new-problem (vấn đề) · hub / hub-cha (điều hướng vấn đề) · daily-note · meeting-note · project-log · people-profile · book-highlights · github-repo · minto-note (output) · moc (bản đồ) · ghi-chu-nhanh (capture) · prompt-template (prompt tái dùng).\n";
        p += "  + tham chiếu: quy-uoc-tao-note (taxonomy) · huong-dan-su-dung-template (cách chọn).\n\n";
        p += "## BƯỚC 5 — BẢNG TASK KANBAN (tuỳ chọn)\n";
        p += "Hỏi user: \"Bạn có muốn tạo một bảng quản lý công việc dạng Kanban (To Do / Doing / Done) không?\" (cần plugin Obsidian Kanban để hiện dạng bảng).\n";
        p += "- NẾU CÓ: chọn vị trí theo nhánh BƯỚC 3:\n";
        p += "  • Nếu (A) 8 folder chuẩn → `8.TRACK/TASKS.md`.\n";
        p += "  • Nếu (B) folder riêng → HỎI user muốn đặt bảng ở đâu trong cấu trúc của họ (KHÔNG tự tạo `8.TRACK` nếu họ không dùng).\n";
        p += '  Emit: $$INSTALL_TASKBOARD$$ {"file":"<file đã chốt>"} $$END_INSTALL_TASKBOARD$$\n';
        p += "  Sau đó set `tasksFile` (đúng file vừa tạo) qua $$SAVE_PROFILE$$ để bật lệnh /task.\n";
        p += "- NẾU KHÔNG: bỏ qua, không tạo gì (có thể bật sau).\n\n";
        p += "## BƯỚC 6 — SINH BỘ NÃO _agent/ (sau khi đã hiểu cấu trúc)\n";
        p += "Bộ não gồm CLAUDE.md + mode-routing.md + workflows.md + skills.md/skills/ (bản chuẩn → tạo bằng SCAFFOLD) + 4 file CÁ NHÂN HOÁ theo vault THẬT (routing-rules/index/memory/log).\n";
        p += "TRONG CÙNG 1 reply, theo thứ tự:\n";
        p += '1. Emit `$$SCAFFOLD_AGENT$$ {"botName":"...","honorific":"...","language":"...","userName":"...","persona":"...","soul":"...","communicationStyle":"..."} $$END_SCAFFOLD_AGENT$$` → plugin tự tạo _agent/CLAUDE.md + _agent/mode-routing.md + _agent/workflows.md + _agent/skills.md + 9 skill trong _agent/skills/ (KHÔNG tự viết các file này).\n';
        p += "2. Rồi $$WRITE$$ ĐỦ 4 file còn lại (TUYỆT ĐỐI không bịa folder không tồn tại):\n";
        p += "   - _agent/routing-rules.md — bảng: mỗi folder cấp 1 THẬT | vai trò | có nhận note mới không. Kèm decision tree ngắn phân loại note mới vào đúng folder CỦA VAULT NÀY.\n";
        p += "   - _agent/index.md — mục lục: cây thư mục thật (từ kết quả LIST) + ghi chú vai trò mỗi folder. Bản đồ vault.\n";
        p += "   - _agent/memory.md — header + 1-2 dòng info user (tên, nghề/đang làm gì, ngôn ngữ).\n";
        p += `   - _agent/log.md — header + 1 dòng: '${today} | SETUP | Onboarding | Khởi tạo _agent từ scan vault'.\n`;
        p += "GỢI Ý: emit SCAFFOLD + 4 $$WRITE$$ trong cùng 1 reply.\n\n";
        p += "## BƯỚC 7 — HOÀN TẤT\n";
        p += "Sau khi SCAFFOLD + 4 file _agent/ đã xong (đủ 6 file): trong CÙNG 1 reply, viết lời chào kết thúc ngắn gọn TRƯỚC (tóm tắt đã dựng xong bộ não + gợi ý 2-3 việc có thể nhờ), RỒI in $$ONBOARDING_DONE$$ ở cuối.\n";
        p += "TUYỆT ĐỐI hoàn thành trọn vẹn chuỗi (lưu profile → quét → folder → template → task → scaffold+4 file → DONE), KHÔNG dừng giữa chừng để hỏi 'có tiếp không'. NGOẠI LỆ: câu hỏi Kanban ở BƯỚC 5 là 1 câu hỏi BẮT BUỘC (không tính là 'có tiếp không') — VẪN phải hỏi user, KHÔNG tự bỏ qua bảng task; hỏi xong nhận câu trả lời rồi chạy tiếp ngay.\n";
        return p;
    }

    async getSystemPrompt() {
        const s = this.plugin.settings;
        if (!s.onboarded) return await this.getOnboardingPrompt();

        const up = s.userProfile || {};
        const botName = (up.botName || "Wiki Agent").trim() || "Wiki Agent";
        const userName = (up.userName || "").trim();
        const honorific = (up.honorific || "bạn").trim() || "bạn";
        const persona = (up.persona || "").trim();
        const soul = (up.soul || "").trim();
        const communicationStyle = (up.communicationStyle || "").trim();
        const language = (up.language || "Tiếng Việt").trim() || "Tiếng Việt";
        const doing = (up.doing || "").trim();
        const location = (up.location || "").trim();
        const tplFolder = (up.templatesFolder || "").replace(/^\/+|\/+$/g, "");
        // Có template = folder được set VÀ có ≥1 file .md bên trong (đệ quy, gồm cả sub-folder).
        const hasTemplates = !!tplFolder && this.app.vault.getMarkdownFiles().some(f => f.path.startsWith(tplFolder + "/"));
        const tasksFile = (up.tasksFile || "").replace(/^\/+|\/+$/g, "");
        const hasTasks = !!tasksFile && !!this.app.vault.getAbstractFileByPath(tasksFile);

        let prompt = "# IDENTITY & PERSONA\n";
        prompt += `Tên: ${botName} — Wiki Maintainer AI\n`;
        prompt += `Vai trò: Người bảo trì Wiki cá nhân cho vault Obsidian${userName ? " của " + userName : ""}.\n`;
        if (soul) prompt += `Linh hồn (bản chất cốt lõi): ${soul}\n`;
        prompt += `Tính cách: ${persona || "Thân thiện, dí dỏm nhưng cực kỳ chính xác khi làm việc — như một anh dev senior vui tính."}\n`;
        prompt += "Phong cách giao tiếp:\n";
        if (communicationStyle) prompt += `- ${communicationStyle}\n`;
        prompt += `- Luôn trả lời bằng ${language} tự nhiên\n`;
        prompt += `- Gọi người dùng là "${honorific}" một cách tự nhiên\n`;
        if (!communicationStyle) prompt += "- Thỉnh thoảng dùng emoji để tạo không khí (không spam); ngắn gọn, đi thẳng vấn đề\n";
        if (doing) prompt += `- Bối cảnh người dùng: đang ${doing}\n`;
        if (location) prompt += `- Nơi ở / múi giờ: ${location}\n`;
        prompt += "\nDưới đây là khế ước vault, định tuyến mode, định tuyến thư mục, catalog template, lịch sử gần nhất và memory để bạn nắm rõ bối cảnh và tuân thủ:\n\n";

        // workflows.md đã chuyển thành skill lazy-load (_agent/skills/) — KHÔNG nạp always nữa.
        const coreFiles = ["_agent/CLAUDE.md", "_agent/mode-routing.md", "_agent/routing-rules.md", "_agent/templates.md", "_agent/log.md", "_agent/memory.md"];

        for (const path of coreFiles) {
            try {
                const file = this.app.vault.getAbstractFileByPath(path);
                if (file) {
                    let content = await this.app.vault.read(file);
                    // S1: log.md tăng vô hạn → chỉ nạp 40 dòng cuối để tiết kiệm context
                    if (path === "_agent/log.md") {
                        const ls = content.split("\n");
                        if (ls.length > 40) content = "… (chỉ hiện 40 dòng log gần nhất; full ở _agent/log.md) …\n" + ls.slice(-40).join("\n");
                    }
                    prompt += `\n\n--- BẮT ĐẦU NỘI DUNG FILE: ${path} ---\n${content}\n--- KẾT THÚC NỘI DUNG FILE: ${path} ---\n`;
                }
            } catch (e) {
                console.log(`ObsidianAgent: Không thể đọc file context ${path}`, e);
            }
        }

        // Nạp CHỈ block AUTO:INVENTORY (bản đồ folder ~1.6KB) thay vì full index.md (188KB) — tiết kiệm context
        const invBlock = await this._loadInventoryBlock();
        if (invBlock) {
            prompt += `\n\n--- BẢN ĐỒ CẤU TRÚC VAULT (AUTO:INVENTORY trích từ _agent/index.md) ---\n${invBlock}\n--- HẾT BẢN ĐỒ ---\n`;
        } else {
            prompt += "\n\n(Bản đồ inventory chưa có — dùng $$READ: _agent/index.md$$ nếu cần xem cấu trúc vault.)\n";
        }

        prompt += "\n\n⚠️ TIẾT KIỆM CONTEXT: Các file rule lõi (CLAUDE, mode-routing, routing-rules, templates, memory, log) ĐÃ nằm trong context — TUYỆT ĐỐI KHÔNG $$READ$$ lại, dùng trực tiếp; cần SỬA thì $$REPLACE$$/$$APPEND$$. Bản đồ cấu trúc vault (AUTO:INVENTORY) cũng ĐÃ có ở trên. Luồng chi tiết (ingest/query/lint/express...) nạp qua $$LOAD_SKILL$$ (xem SKILL SYSTEM).\n";
        prompt += "📂 LƯU Ý: danh sách per-note đầy đủ trong `_agent/index.md` và cấu trúc chi tiết `_agent/folders.md` KHÔNG nằm trong context (để tiết kiệm token). Cần kiểm tra/tìm 1 note → `$$SEARCH: từ khóa$$` (nhanh, rẻ). Cần SỬA 1 dòng trong index.md/folders.md → dùng `$$FIND: _agent/index.md$$<basename note>$$END_FIND$$` để lấy dòng NGUYÊN VĂN rồi `$$REPLACE$$` đúng dòng đó (KHÔNG cần $$READ$$ cả file). Chỉ `$$READ$$` full khi thật sự cần toàn bộ mục lục/cấu trúc.\n";

        prompt += "\n\nQUAN TRỌNG: Bạn CÓ QUYỀN TRUY CẬP TRỰC TIẾP vào hệ thống file của người dùng. Để thực thi các hành động với file, bạn HÃY IN RA đúng cú pháp dưới đây trong câu trả lời (không dùng code block, chỉ viết text thường):\n";
        prompt += "1. Đọc file: $$READ: đường/dẫn/file.md$$\n";
        prompt += "2. Đọc thư mục: $$LIST: đường/dẫn/thư/mục$$ (dùng / cho root vault, ví dụ: $$LIST: /$$ hoặc $$LIST: 1.CONCEPTS$$)\n";
        prompt += "3. Ghi file MỚI (hoặc ghi đè toàn bộ): \n$$WRITE: đường/dẫn/file.md$$Nội dung$$END_WRITE$$\n";
        prompt += "4. Thêm nội dung cuối file (NHANH): \n$$APPEND: đường/dẫn/file.md$$Nội dung thêm vào$$END_APPEND$$\n";
        prompt += "5. Tìm & thay thế trong file (NHANH): \n$$REPLACE: đường/dẫn/file.md$$text cũ cần tìm$$WITH$$text mới thay thế$$END_REPLACE$$\n";
        prompt += "   ⚠️ REPLACE: `text cũ` PHẢI khớp TUYỆT ĐỐI (từng ký tự/khoảng trắng) với nội dung file hiện tại. Nếu file CHƯA nằm trong context (MOC, note, file ngoài _agent core) → `$$READ$$` file đó TRƯỚC để copy đúng text, RỒI mới REPLACE. TUYỆT ĐỐI KHÔNG đoán `text cũ` (đoán = lỗi 'text không tìm thấy').\n";
        prompt += "6. Xóa đoạn text trong file (NHANH): \n$$DELETE: đường/dẫn/file.md$$text cần xóa$$END_DELETE$$\n";
        prompt += "7. Tìm kiếm note: $$SEARCH: từ khóa$$\n";
        prompt += "7c. Lint vault (kiểm tra sức khoẻ deterministic): $$LINT$$ — plugin quét link-graph thật, trả danh sách lỗi chính xác (KHÔNG tự đoán bằng SEARCH).\n";
        prompt += "7b. Lấy dòng NGUYÊN VĂN trong 1 file (để REPLACE chính xác mà KHÔNG cần READ full file): \n$$FIND: đường/dẫn/file.md$$từ khóa$$END_FIND$$\n";
        prompt += "   ⚠️ FIND: dùng cho file lớn NGOÀI context (vd `_agent/index.md`, `_agent/folders.md`). Dùng từ khóa ĐẶC TRƯNG (vd basename note kebab-case) để khớp đúng dòng. FIND trả về các dòng chứa từ khóa y HỆT trong file → copy NGUYÊN cả dòng làm `text cũ` cho $$REPLACE$$ (dòng entry đầy đủ thường là duy nhất → REPLACE an toàn). Đây là cách sửa 1 dòng mà không tốn token đọc cả file.\n";
        prompt += "8. Move/rename file (auto-update mọi wikilink trong vault): \n$$MOVE: nguồn/cu.md$$đích/moi.md$$END_MOVE$$\n";
        prompt += "   Dùng MOVE cho luồng INGEST: sau khi đã distill xong note thô từ 1.CAPTURE/, move source gốc từ Clippings → 1.CAPTURE/ để bất biến hoá.\n\n";
        prompt += "⚡ ƯU TIÊN: Khi cập nhật file đã có (ví dụ thêm entry vào _agent/index.md), HÃY DÙNG APPEND/REPLACE/DELETE thay vì WRITE. WRITE chỉ dùng khi tạo file mới hoặc cần ghi đè toàn bộ. APPEND/REPLACE/DELETE nhanh hơn 10-20 lần vì bạn chỉ cần output phần thay đổi.\n";
        prompt += "Sau khi bạn in ra lệnh, hệ thống sẽ tự động chạy + trả lại kết quả (tin nhắn chat tự động) để bạn đọc và tiếp tục.\n";
        prompt += "🚀 MULTI-COMMAND PER REPLY: bạn CÓ THỂ emit NHIỀU lệnh cùng 1 reply — plugin sẽ chạy tuần tự theo thứ tự xuất hiện trong text. Ưu tiên dùng multi-command để tiết kiệm turn (vd: WRITE + APPEND + APPEND + MOVE cùng 1 reply thay vì 4 turn riêng). KHÔNG nest lệnh trong lệnh.\n";
        prompt += "Hãy đóng vai là Wiki Maintainer chuyên nghiệp: chọn mode theo _agent/mode-routing.md, rồi load đúng skill trước khi thực thi. Không mutation nếu intent chưa rõ.\n";
        // ===== SKILL SYSTEM (lazy-load) — thay cho các khối luồng inline =====
        const skillsBlock = await this._loadSkillsBlock();
        prompt += "\n\n🧩 SKILL SYSTEM — năng lực nạp-theo-yêu-cầu:\n";
        prompt += "Các luồng chuyên biệt (ingest/tạo note, template, MOC, lint, batch, NotebookLM, Kanban...) KHÔNG nằm sẵn trong prompt — để tiết kiệm context và tránh lẫn vai. Khi intent user khớp 1 skill trong bảng dưới, HÃY emit `$$LOAD_SKILL: <name>$$` TRƯỚC → hệ thống nạp đầy đủ hướng dẫn skill đó cho bạn ở lượt kế → rồi mới thực thi.\n";
        prompt += "Quy tắc: chỉ load skill khi THỰC SỰ cần cho yêu cầu hiện tại; 1 reply CÓ THỂ load nhiều skill nếu việc cần (vd ingest cần kèm template-system). Nếu không skill nào khớp → xử lý bằng năng lực core (đọc/ghi/sửa file) hoặc HỎI user.\n";
        if (skillsBlock) {
            prompt += `\n--- DANH SÁCH SKILL (manifest từ _agent/skills.md) ---\n${skillsBlock}\n--- HẾT DANH SÁCH SKILL ---\n`;
        } else {
            prompt += "\n(Manifest skill chưa có — tạo _agent/skills.md với block AUTO:SKILLS, hoặc xử lý bằng năng lực core.)\n";
        }
        // Ghi chú khả dụng theo cấu hình hiện tại (giữ gating cũ của template/kanban/notebooklm)
        const skillAvail = [];
        if (!hasTemplates) skillAvail.push("ingest/template-system/mocfix CẦN cấu hình templatesFolder (hiện chưa có).");
        if (!hasTasks) skillAvail.push("kanban CẦN cấu hình tasksFile (hiện chưa có).");
        if (!(this.plugin.settings.mcp && this.plugin.settings.mcp.notebooklmEnabled)) skillAvail.push("notebooklm CẦN bật NotebookLM trong settings (hiện tắt).");
        if (skillAvail.length) prompt += "⚠️ Lưu ý khả dụng: " + skillAvail.join(" ") + "\n";
        prompt += "\n🧠 MEMORY (Bộ nhớ dài hạn):\n";
        prompt += "- File _agent/memory.md là bộ nhớ dài hạn của bạn, được load mỗi phiên chat mới\n";
        prompt += "- Khi phát hiện thông tin quan trọng cần nhớ (sở thích của user, quyết định thiết kế, pattern hay dùng, lỗi đã sửa, context dự án...), hãy TỰ ĐỘNG ghi vào memory bằng:\n";
        prompt += "  $$APPEND: _agent/memory.md$$\n- [YYYY-MM-DD] Nội dung cần nhớ\n$$END_APPEND$$\n";
        prompt += "- Không cần hỏi user trước khi ghi memory — cứ ghi khi thấy cần thiết\n";
        prompt += "- Giữ memory ngắn gọn, mỗi entry 1-2 dòng, dạng bullet point\n";
        prompt += "- Đầu mỗi phiên mới, nếu _agent/memory.md có nội dung, hãy đọc và ÁP DỤNG ngay — đó là những gì bạn đã biết về user\n";
        prompt += "QUAN TRỌNG VỀ LIÊN KẾT: Khi nhắc đến bất kỳ note nào trong vault, LUÔN sử dụng cú pháp wikilink của Obsidian: [[tên-note]] (ví dụ: [[tam-ly-hoc-nhan-thuc]], [[lich-su-chu-nghia-hanh-vi]]). KHÔNG dùng markdown link [text](url). Điều này giúp người dùng bấm trực tiếp vào tên note trong chat để mở note đó ngay lập tức.\n";

        // [skill-migrated] TEMPLATE SYSTEM + CHUẨN HOÁ MOC + TẠO NOTE 6 BƯỚC
        // → _agent/skills/template-system.md, mocfix.md, ingest.md (nạp qua $$LOAD_SKILL$$).

        // [skill-migrated] INGEST_BATCH → _agent/skills/ingest-batch.md (nạp qua $$LOAD_SKILL$$).

        // [skill-migrated] NotebookLM MCP tools → _agent/skills/notebooklm.md (nạp qua $$LOAD_SKILL$$).

        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            prompt += `\n\n[INFO] File đang được mở (active) hiện tại trên màn hình của người dùng là: ${activeFile.path}\n`;
            prompt += "Nếu người dùng yêu cầu xử lý 'file hiện tại', 'note này', hãy tự động hiểu là họ đang nói đến file này và TỰ ĐỘNG DÙNG LỆNH $$READ: " + activeFile.path + "$$ nếu bạn cần đọc nội dung của nó để tiếp tục.\n";
        }

        // [skill-migrated] Kanban task management → _agent/skills/kanban.md (nạp qua $$LOAD_SKILL$$).

        return prompt;
    }

    // ====================================================================
    // Multi-command handler — execute ALL commands trong reply, không chỉ command đầu
    // ====================================================================
    async handleAgentCommands(assistantReply) {
        const commands = this._getCommandRegistry();
        const sysMessages = [];
        let displayContent = assistantReply;
        let working = assistantReply;
        let safety = 0;
        let triggered = false;

        while (safety++ < 30) {
            // Tìm command match đầu tiên (theo position) trong working reply
            let earliest = null;
            for (const cmd of commands) {
                const m = working.match(cmd.regex);
                if (m && (earliest === null || m.index < earliest.match.index)) {
                    earliest = { cmd, match: m };
                }
            }
            if (!earliest) break;
            triggered = true;

            let result;
            try {
                result = await earliest.cmd.handler.call(this, earliest.match);
            } catch (e) {
                console.error(`[bob] command ${earliest.cmd.name} error:`, e);
                result = {
                    statusBadge: `❌ ${earliest.cmd.name} error: ${e.message}`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: ${earliest.cmd.name} failed: ${e.message}`
                };
            }
            if (result) {
                if (result.statusBadge) {
                    // Dùng replacer function để tránh String.replace() interpret "$$" trong replacement string
                    // (JS spec: $$ → $, $1 → group 1, etc. — chỉ áp dụng khi replacement là string, không phải function)
                    const cmdText = earliest.match[0];
                    const newText = `${result.statusBadge}\n\n${cmdText}`;
                    displayContent = displayContent.replace(cmdText, () => newText);
                }
                if (result.sysMessage) sysMessages.push(result.sysMessage);
            }
            // Strip command đã execute để loop tìm command tiếp theo
            working = working.slice(0, earliest.match.index) + working.slice(earliest.match.index + earliest.match[0].length);
        }

        if (!triggered) return;

        // Update lastMsg với displayContent (status badges đã chèn vào trước mỗi command block)
        const lastMsg = this.messages[this.messages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = displayContent;
        }
        this.textarea.value = sysMessages.join("\n\n---\n\n");
        this.renderMessages();
        await this.saveHistory();

        if (!this.aborted) {
            setTimeout(() => this.sendMessage(), 100);
        }
    }

    // Bob semantic maintenance — tái dùng vòng lặp agentic của view
    _buildMaintenancePrompt() {
        return [
            "[BẢO TRÌ TỰ ĐỘNG] Chạy luồng đồng bộ meta sau khi script deterministic đã xong.",
            "",
            "BƯỚC 1 — `$$READ: _agent/maintenance-report.md$$` (chưa có trong context). `routing-rules.md`, `templates.md` ĐÃ nằm trong context — KHÔNG READ lại. NHƯNG `_agent/index.md` và `_agent/folders.md` KHÔNG còn trong context (đã tách để tiết kiệm token). Khi sửa entry/broken-link trong index.md: mục '## LINT' của report ĐÃ in sẵn 'DÒNG NGUYÊN VĂN' của link gãy → dùng CHÍNH dòng đó làm `text cũ` cho $$REPLACE$$. Nếu cần dòng mà report không có → `$$FIND: _agent/index.md$$<basename>$$END_FIND$$` lấy dòng rồi REPLACE. TUYỆT ĐỐI KHÔNG $$READ$$ full index.md chỉ để sửa 1 dòng.",
            "BƯỚC 2 — XỬ LÝ MỤC '## LINT' trong report: report đã liệt kê SẴN từng việc cụ thể (note thiếu index, broken link, full-path link, CAPTURE link, MOC thiếu note, cụm chưa MOC, routing thiếu/thừa folder). **PHẢI xử lý TỪNG item** trong các nhóm đó — KHÔNG được báo 'clean' nếu report còn item.",
            "⚠️ QUY TẮC SỬA FILE MOC/NOTE: các file MOC và note KHÔNG nằm trong context. Trước khi `$$REPLACE$$` bất kỳ MOC/note nào → PHẢI `$$READ$$` file đó trước (gom các READ vào 1 reply cho nhanh), copy ĐÚNG đoạn text, rồi mới REPLACE. ĐỪNG REPLACE mù (sẽ lỗi 'text không tìm thấy'). Cách xử mỗi nhóm:",
            "  a. Note thiếu index → thêm entry vào `_agent/index.md` (link + tóm tắt 1 dòng + type + updated).",
            "  b. Broken link trong index/MOC (navigation dangling) → sửa/gỡ cho đúng. LƯU Ý: mục '## LINT — ADVISORY' (broken link trong note nội dung) phần lớn là forward-link CỐ Ý → CHỈ liệt kê, TUYỆT ĐỐI KHÔNG tự sửa/xóa trừ khi user yêu cầu.",
            "  c. Full-path wikilink → đổi về bare `[[basename]]`.",
            "  d. Link `[[1.CAPTURE/...]]` trong body wiki → gỡ.",
            "  e. MOC coverage → $$READ$$ MOC đó TRƯỚC, rồi: (THIẾU) thêm `[[note]] — tóm tắt` vào ĐÚNG section theo TYPE note (concept→'Concept nền', method→'Method', pattern/framework→'Pattern/Framework', summary/case→'Case study', moc→'Sub-MOC'); MOC chưa có section phù hợp → thêm dưới section gần nghĩa nhất. (THỪA) gỡ link khỏi MOC cha. ⚠️ CHỈ thêm/gỡ link — KHÔNG restructure toàn bộ MOC cũ (việc đó làm riêng qua /mocfix).",
            "  e2. Cụm chưa MOC = ADVISORY → CHỈ liệt kê, KHÔNG tự tạo. Nếu BẮT BUỘC phải tạo MOC mới → $$READ: 5.RESOURCE/template/moc.md$$ rồi dựng theo template (Entry point / Concept nền / Method / Pattern / Reading path / Sub-MOC), TUYỆT ĐỐI không để thành danh sách phẳng.",
            "  g. 'routing-rules CHƯA nhắc folder X' (domain mới) → bổ sung 1 dòng luật routing cho folder đó (mô tả khi nào route vào, theo ngữ nghĩa).",
            "  h. ADVISORY 'folder-path không resolve trong routing/CLAUDE' → KIỂM TRA thật: nếu folder đã đổi tên thật → sửa path cho đúng; nếu chỉ là ví dụ SAI cố ý (vd trong mục Naming) → BỎ QUA.",
            "  f. TEMPLATE MỚI — nếu `_agent/templates.md` mục 'Auto-detected (chờ phân loại)' có dòng template: (1) `$$READ$$` đúng file template đó; (2) tự suy ra **trigger** (cụm từ user sẽ gõ để dùng) + cột **'Dùng khi'**; (3) thêm 1 dòng HOÀN CHỈNH vào BẢNG CHÍNH với GIÁ TRỊ THẬT vừa suy ra — **TUYỆT ĐỐI KHÔNG** copy placeholder kiểu `(chưa rõ)`/`(điền...)`; PHẢI điền **NGAY trong turn này**, KHÔNG để 'điền sau'; (4) reset block AUTO:TEMPLATES-NEW về `_(chưa có template mới)_`. ⚠️ Hiểu đúng: chữ 'chờ Bob điền' nghĩa là CHÍNH BẠN điền ngay bây giờ, không phải để lúc khác.",
            "BƯỚC 3 — Ghi 1 dòng tổng kết vào `_agent/log.md` (action MAINT-SYNC).",
            "",
            "CHỈ ĐƯỢC sửa: `_agent/index.md`, `_agent/routing-rules.md`, file MOC, block `<!-- AUTO -->` trong CLAUDE.md, VÀ **chỉ sửa đường-dẫn-folder đã CHẾT trong bảng của CLAUDE.md** (thay path sai → path đúng theo folders.md).",
            "TUYỆT ĐỐI KHÔNG: sửa nội dung `1.CAPTURE/`; sửa note user (không có `llm_managed: true`); sửa `_agent/folders.md` (do script quản); sửa CÂU CHỮ luật/triết lý/schema trong CLAUDE.md (chỉ được thay path folder chết, KHÔNG đổi nội dung quy tắc); đụng `99.KALIX SYSTEM/`; nested vault; xóa file; đổi tên folder.",
            "Dùng APPEND/REPLACE thay vì WRITE khi sửa file lớn.",
            "",
            "🤖 ĐÂY LÀ WORKFLOW TỰ ĐỘNG — chạy autonomous đến hết, KHÔNG dừng giữa chừng để hỏi user (KHÔNG hỏi 'anh muốn làm gì', KHÔNG liệt kê lựa chọn). Tự quyết và làm.",
            "🎯 ĐIỀU KIỆN DỪNG: chỉ xử các item trong mục '## LINT' của report (must-fix) + ghi MAINT-SYNC vào log → RỒI DỪNG bằng 1 tóm tắt ngắn (đã fix gì). KHÔNG đọc/khám phá thêm file ngoài các file cần sửa. KHÔNG mở rộng phạm vi.",
            "📦 Nếu phải sửa nhiều file MOC/note: gom hết $$READ$$ cần thiết vào 1-2 reply, rồi gom các $$REPLACE$$ vào reply tiếp — làm liên tục cho xong, đừng ngắt để hỏi."
        ].join("\n");
    }

    async runMaintenanceTask() {
        if (this._maintRunning) return;
        if (!this.plugin.settings.onboarded || !this.plugin.getActiveProfile()) {
            new Notice("⚠️ Bảo trì semantic cần onboarded + 1 profile LLM", 5000);
            return;
        }
        if (!this.textarea || typeof this.sendMessage !== "function") {
            console.warn("[bob-maint] view chưa sẵn sàng, bỏ qua semantic pass");
            return;
        }
        this._maintRunning = true;
        try {
            // S4: chạy maintenance trong conversation SẠCH — không tích luỹ lịch sử chat của user (tránh phình context)
            this.messages = [];
            this.currentChatFile = null;
            this.currentJsonFile = null;
            this.renderMessages();
            this.textarea.value = this._buildMaintenancePrompt();
            await this.sendMessage();
        } catch (e) {
            console.error("[bob-maint] runMaintenanceTask error:", e);
        } finally {
            this._maintRunning = false;
        }
    }

    _getCommandRegistry() {
        return [
            // Multi-line commands FIRST (tránh bị single-line patterns match nhầm phần đầu)
            { name: "SAVE_PROFILE", regex: /\$\$SAVE_PROFILE\$\$([\s\S]*?)\$\$END_SAVE_PROFILE\$\$/, handler: this._handleSaveProfile },
            { name: "INSTALL_TEMPLATES", regex: /\$\$INSTALL_TEMPLATES\$\$([\s\S]*?)\$\$END_INSTALL_TEMPLATES\$\$/, handler: this._handleInstallTemplates },
            { name: "INSTALL_FOLDERS", regex: /\$\$INSTALL_FOLDERS\$\$([\s\S]*?)\$\$END_INSTALL_FOLDERS\$\$/, handler: this._handleInstallFolders },
            { name: "SCAFFOLD_AGENT", regex: /\$\$SCAFFOLD_AGENT\$\$([\s\S]*?)\$\$END_SCAFFOLD_AGENT\$\$/, handler: this._handleScaffoldAgent },
            { name: "INSTALL_TASKBOARD", regex: /\$\$INSTALL_TASKBOARD\$\$([\s\S]*?)\$\$END_INSTALL_TASKBOARD\$\$/, handler: this._handleInstallTaskboard },
            { name: "ONBOARDING_DONE", regex: /\$\$ONBOARDING_DONE\$\$/, handler: this._handleOnboardingDone },
            { name: "INGEST_BATCH", regex: /\$\$INGEST_BATCH\$\$([\s\S]*?)\$\$END_INGEST_BATCH\$\$/, handler: this._handleIngestBatch },
            { name: "WRITE",       regex: /\$\$WRITE:\s*(.*?)\$\$([\s\S]*?)\$\$END_WRITE\$\$/,   handler: this._handleWrite },
            { name: "APPEND",      regex: /\$\$APPEND:\s*(.*?)\$\$([\s\S]*?)\$\$END_APPEND\$\$/, handler: this._handleAppend },
            { name: "REPLACE",     regex: /\$\$REPLACE:\s*(.*?)\$\$([\s\S]*?)\$\$WITH\$\$([\s\S]*?)\$\$END_REPLACE\$\$/, handler: this._handleReplace },
            { name: "DELETE",      regex: /\$\$DELETE:\s*(.*?)\$\$([\s\S]*?)\$\$END_DELETE\$\$/, handler: this._handleDelete },
            { name: "MOVE",        regex: /\$\$MOVE:\s*([\s\S]*?)\$\$([\s\S]*?)\$\$END_MOVE\$\$/, handler: this._handleMove },
            { name: "NLM_TOOL",    regex: /\$\$NLM_TOOL:\s*([\w-]+)\$\$([\s\S]*?)\$\$END_NLM_TOOL\$\$/, handler: this._handleNlmTool },
            { name: "FIND",        regex: /\$\$FIND:\s*(.*?)\$\$([\s\S]*?)\$\$END_FIND\$\$/, handler: this._handleFind },
            // Single-line commands
            { name: "LOAD_SKILL", regex: /\$\$LOAD_SKILL:\s*([\w-]+)\$\$/, handler: this._handleLoadSkill },
            { name: "READ",   regex: /\$\$READ:\s*(.*?)\$\$/,   handler: this._handleRead },
            { name: "LIST",   regex: /\$\$LIST:\s*(.*?)\$\$/,   handler: this._handleList },
            { name: "SEARCH", regex: /\$\$SEARCH:\s*(.*?)\$\$/, handler: this._handleSearch },
            { name: "LINT",   regex: /\$\$LINT\$\$/,            handler: this._handleLint },
        ];
    }

    // Nạp body 1 skill từ _agent/skills/<name>.md → trả qua sysMessage (vòng lặp
    // handleAgentCommands tự feed lại model ở lượt kế). Bổ sung context vars + strip frontmatter.
    async _handleLoadSkill(match) {
        const name = (match[1] || "").trim().replace(/[^\w-]/g, "");   // chống path traversal
        const path = `_agent/skills/${name}.md`;
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!file || file.children) {
            return {
                statusBadge: `❌ Skill '${name}' không tồn tại`,
                sysMessage: `[HỆ THỐNG]: không tìm thấy skill '${name}' ở ${path}. Xem manifest trong _agent/skills.md để biết skill có sẵn, hoặc xử lý bằng năng lực core.`
            };
        }
        let body = await this.app.vault.read(file);
        body = body.replace(/^---\n[\s\S]*?\n---\n/, "");   // bỏ frontmatter
        const up = this.plugin.settings.userProfile || {};
        const tpl = (up.templatesFolder || "").replace(/^\/+|\/+$/g, "") || "5.RESOURCE/template";
        const tasks = (up.tasksFile || "").replace(/^\/+|\/+$/g, "");
        body = body.replace(/\{\{TEMPLATES_FOLDER\}\}/g, tpl).replace(/\{\{TASKS_FILE\}\}/g, tasks);
        return {
            statusBadge: `📚 Đã nạp skill: ${name}`,
            sysMessage: `[HỆ THỐNG NẠP SKILL: ${name}]\n${body.trim()}\n[HẾT SKILL ${name}] — Giờ thực thi đúng luồng trên cho yêu cầu của user.`
        };
    }

    async _handleRead(match) {
        const targetPath = match[1].trim();
        const file = this.app.vault.getAbstractFileByPath(targetPath);
        if (file && !file.children) {
            const content = await this.app.vault.read(file);
            return {
                statusBadge: `📖 Đã đọc \`${targetPath}\``,
                sysMessage: `[HỆ THỐNG TRẢ KẾT QUẢ ĐỌC FILE ${targetPath}]:\n\n${content}`
            };
        }
        return {
            statusBadge: `❌ READ thất bại: ${targetPath}`,
            sysMessage: `[HỆ THỐNG BÁO LỖI]: Không tìm thấy file ${targetPath}`
        };
    }

    async _handleList(match) {
        let targetPath = match[1].trim();
        const vaultBasePath = this.app.vault.adapter.basePath || '';
        if (vaultBasePath && targetPath.startsWith(vaultBasePath)) {
            targetPath = targetPath.slice(vaultBasePath.length).replace(/^\/+/, '');
        }
        targetPath = targetPath.replace(/^\/+/, '').replace(/\/+$/, '');
        const folder = (targetPath === '' || targetPath === '.' || targetPath === '/')
            ? this.app.vault.getRoot()
            : this.app.vault.getAbstractFileByPath(targetPath);
        if (folder && folder.children) {
            const items = folder.children.map(c => (c.children ? "[DIR]  " : "[FILE] ") + c.name).join("\n");
            return {
                statusBadge: `📂 Đã list \`${targetPath || '/'}\``,
                sysMessage: `[HỆ THỐNG TRẢ KẾT QUẢ LIST DIR ${targetPath}]:\n\n${items}`
            };
        }
        return {
            statusBadge: `❌ LIST thất bại`,
            sysMessage: `[HỆ THỐNG BÁO LỖI]: Không tìm thấy thư mục ${targetPath}`
        };
    }

    async _handleSaveProfile(match) {
        try {
            const data = JSON.parse(match[1].trim());
            const cur = this.plugin.settings.userProfile || {};
            const fields = ["userName", "botName", "location", "doing", "language", "honorific", "persona", "soul", "communicationStyle", "templatesFolder", "tasksFile"];
            const next = Object.assign({}, cur);
            for (const f of fields) {
                if (typeof data[f] === "string" && data[f].trim()) next[f] = data[f].trim();
            }
            this.plugin.settings.userProfile = next;
            await this.plugin.saveSettings();
            return {
                statusBadge: `✅ Đã lưu hồ sơ cá nhân hoá`,
                sysMessage: `[HỆ THỐNG BÁO]: Đã lưu profile (gọi user: "${next.honorific}", tên trợ lý: "${next.botName}", ngôn ngữ: "${next.language}", templatesFolder: "${next.templatesFolder || "(chưa đặt)"}"). TIẾP TỤC theo thứ tự: (1) $$LIST: /$$ quét vault nông; (2) HỆ THỐNG FOLDER — nêu 2 lựa chọn, nếu chọn (A) thì $$INSTALL_FOLDERS$$; (3) TEMPLATE — nếu user chưa có thì $$INSTALL_TEMPLATES$$ rồi set templatesFolder qua $$SAVE_PROFILE$$; (4) BẢNG TASK (tuỳ chọn) — nếu user muốn thì $$INSTALL_TASKBOARD$$ rồi set tasksFile; (5) $$SCAFFOLD_AGENT$$ + $$WRITE$$ 4 file (routing-rules/index/memory/log); (6) $$ONBOARDING_DONE$$.`
            };
        } catch (e) {
            return {
                statusBadge: `❌ SAVE_PROFILE lỗi JSON`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: SAVE_PROFILE không phải JSON hợp lệ: ${e.message}. Hãy in lại đúng định dạng: $$SAVE_PROFILE$$ <json một dòng> $$END_SAVE_PROFILE$$.`
            };
        }
    }

    async _handleOnboardingDone(match) {
        // Guard cứng: bộ não _agent/ PHẢI đủ file trước khi chốt onboarded.
        const required = [
            "_agent/CLAUDE.md", "_agent/mode-routing.md", "_agent/workflows.md", "_agent/routing-rules.md",
            "_agent/index.md", "_agent/memory.md", "_agent/log.md", "_agent/skills.md"
        ];
        const missing = required.filter(f => !this.app.vault.getAbstractFileByPath(f));
        if (missing.length) {
            return {
                statusBadge: `⚠️ Chưa thể hoàn tất — thiếu ${missing.length} file _agent/`,
                sysMessage: `[HỆ THỐNG CHẶN]: CHƯA bật onboarded vì bộ não _agent/ còn thiếu: ${missing.join(", ")}. HÃY tạo nốt các file này (CLAUDE.md + mode-routing.md + workflows.md + skills.md/skills/ dùng $$SCAFFOLD_AGENT$$; routing-rules/index/memory/log dùng $$WRITE$$), RỒI emit lại $$ONBOARDING_DONE$$. KHÔNG kết thúc khi còn thiếu.`
            };
        }
        this.plugin.settings.onboarded = true;
        await this.plugin.saveSettings();
        // Bootstrap: chạy DETERMINISTIC maintenance 1 lần ngay → sinh folders.md / maintenance-report.md /
        // templates.md catalog / block AUTO (INVENTORY/STATS/REGISTRY) tức thì. KHÔNG kích Bob (tránh làm phiền ngay sau onboarding).
        let bootstrapNote = "";
        try {
            await this.plugin.runMaintenance({ manual: false });
            this.plugin.settings.maintenance.lastRun = this.plugin._maintToday();
            await this.plugin.saveSettings();
            bootstrapNote = " Đã chạy bảo trì khởi tạo (tạo folders.md, maintenance-report.md, templates.md, các block AUTO trong index.md/CLAUDE.md).";
        } catch (e) { console.error("[onboarding] bootstrap maintenance lỗi:", e); }
        new Notice("🎉 Onboarding hoàn tất — Wiki Agent đã sẵn sàng!");
        return {
            statusBadge: `🎉 Onboarding hoàn tất`,
            sysMessage: `[HỆ THỐNG BÁO]: Đủ 6 file _agent/ → đã bật chế độ trợ lý đầy đủ.${bootstrapNote} Nếu bạn đã gửi lời chào kết thúc thì DỪNG tại đây, KHÔNG emit thêm lệnh nào nữa.`
        };
    }

    async _handleInstallTemplates(match) {
        let spec;
        try { spec = JSON.parse(match[1].trim()); }
        catch (e) {
            return { statusBadge: `❌ INSTALL_TEMPLATES lỗi JSON`, sysMessage: `[HỆ THỐNG BÁO LỖI]: INSTALL_TEMPLATES không phải JSON hợp lệ: ${e.message}. Định dạng: $$INSTALL_TEMPLATES$$ {"folder":"Templates","files":"all"} $$END_INSTALL_TEMPLATES$$` };
        }
        const folder = String(spec.folder || "Templates").replace(/^\/+|\/+$/g, "");
        const adapter = this.app.vault.adapter;
        const tplDir = `${this.plugin.manifest.dir}/templates`;
        let bundled = [];
        try {
            const listing = await adapter.list(tplDir);
            bundled = (listing.files || []).map(p => p.split("/").pop()).filter(n => n.endsWith(".md"));
        } catch (e) {
            return { statusBadge: `❌ INSTALL_TEMPLATES: không đọc được bundle`, sysMessage: `[HỆ THỐNG BÁO LỖI]: Không liệt kê được template bundle (${tplDir}): ${e.message}` };
        }
        let files = spec.files;
        if (files === "all" || !Array.isArray(files)) files = bundled;
        else files = files.filter(f => bundled.includes(f));
        if (files.length === 0) {
            return { statusBadge: `❌ INSTALL_TEMPLATES: danh sách rỗng`, sysMessage: `[HỆ THỐNG BÁO LỖI]: Không có file hợp lệ. Bundle có: ${bundled.join(", ")}` };
        }
        if (!this.app.vault.getAbstractFileByPath(folder)) {
            try { await this.app.vault.createFolder(folder); } catch (e) {}
        }
        const installed = [], skipped = [], failed = [];
        for (const f of files) {
            const dst = `${folder}/${f}`;
            try {
                if (this.app.vault.getAbstractFileByPath(dst)) { skipped.push(f); continue; }
                const content = await adapter.read(`${tplDir}/${f}`);
                await this.app.vault.create(dst, content);
                installed.push(f);
            } catch (e) { failed.push(`${f} (${e.message})`); }
        }
        return {
            statusBadge: `📦 Cài template: ${installed.length} mới, ${skipped.length} bỏ qua${failed.length ? `, ${failed.length} lỗi` : ""}`,
            sysMessage: `[HỆ THỐNG BÁO]: Đã cài ${installed.length} template vào "${folder}/" (${installed.join(", ") || "—"}). Bỏ qua vì đã tồn tại: ${skipped.join(", ") || "—"}.${failed.length ? ` Lỗi: ${failed.join("; ")}.` : ""} Nếu chưa lưu, HÃY set templatesFolder="${folder}" qua $$SAVE_PROFILE$$.`
        };
    }

    async _handleInstallFolders(match) {
        let spec = {};
        const raw = (match[1] || "").trim();
        if (raw) {
            try { spec = JSON.parse(raw); }
            catch (e) {
                return { statusBadge: `❌ INSTALL_FOLDERS lỗi JSON`, sysMessage: `[HỆ THỐNG BÁO LỖI]: INSTALL_FOLDERS không phải JSON hợp lệ: ${e.message}. Định dạng: $$INSTALL_FOLDERS$$ {} $$END_INSTALL_FOLDERS$$ (mặc định 8 folder chuẩn) hoặc {"folders":["1.CAPTURE",...]}` };
            }
        }
        
        const isCustomSpec = Array.isArray(spec.folders) && spec.folders.length > 0;
        let folders = isCustomSpec ? spec.folders : VAULT_STRUCTURE.folders;
        folders = folders.map(f => String(f).replace(/^\/+|\/+$/g, "")).filter(Boolean);
        
        const createdFolders = [], skippedFolders = [], failedFolders = [];
        for (const f of folders) {
            try {
                if (this.app.vault.getAbstractFileByPath(f)) { skippedFolders.push(f); continue; }
                await this.app.vault.createFolder(f);
                createdFolders.push(f);
            } catch (e) { failedFolders.push(`${f} (${e.message})`); }
        }

        // If it's custom spec, we don't install the default MOCs and content notes
        if (isCustomSpec) {
            return {
                statusBadge: `📁 Cài folder: ${createdFolders.length} mới, ${skippedFolders.length} bỏ qua${failedFolders.length ? `, ${failedFolders.length} lỗi` : ""}`,
                sysMessage: `[HỆ THỐNG BÁO]: Đã tạo ${createdFolders.length} folder (${createdFolders.join(", ") || "—"}). Bỏ qua vì đã tồn tại: ${skippedFolders.join(", ") || "—"}.${failedFolders.length ? ` Lỗi: ${failedFolders.join("; ")}.` : ""}`
            };
        }

        // Create MOC skeleton notes
        const createdMocs = [], skippedMocs = [], failedMocs = [];
        const todayStr = new Date().toISOString().split('T')[0];
        
        for (const moc of VAULT_STRUCTURE.mocs) {
            const fPath = moc.path;
            try {
                if (this.app.vault.getAbstractFileByPath(fPath)) {
                    skippedMocs.push(fPath);
                    continue;
                }
                const shortTitle = moc.title.replace(/^MOC —\s*/, "");
                const mocContent = `---
title: ${moc.title}
type: moc
sources:
  - "_agent/routing-rules.md"
created: ${todayStr}
updated: ${todayStr}
llm_managed: true
tags: [moc, skeleton]
---

# ${moc.title}

> Map of Content cho cụm **${shortTitle}**. Skeleton khởi tạo theo routing-rules — chưa có note. Cập nhật danh sách khi ingest.

## Nội dung

_(chưa có note — điền khi atomic note đầu tiên route vào đây)_

## Liên kết

`;
                await this.app.vault.create(fPath, mocContent);
                createdMocs.push(fPath);
            } catch (e) {
                failedMocs.push(`${fPath} (${e.message})`);
            }
        }

        // Copy content notes from vault-skeleton/
        const createdNotes = [], skippedNotes = [], failedNotes = [];
        const adapter = this.app.vault.adapter;
        const pluginDir = this.plugin.manifest.dir;
        
        for (const notePath of VAULT_STRUCTURE.contentNotes) {
            try {
                if (this.app.vault.getAbstractFileByPath(notePath)) {
                    skippedNotes.push(notePath);
                    continue;
                }
                
                // Read from vault-skeleton
                const sourcePath = `${pluginDir}/vault-skeleton/${notePath}`;
                if (await adapter.exists(sourcePath)) {
                    const content = await adapter.read(sourcePath);
                    await this.app.vault.create(notePath, content);
                    createdNotes.push(notePath);
                } else {
                    failedNotes.push(`${notePath} (Không tìm thấy file nguồn trong skeleton)`);
                }
            } catch (e) {
                failedNotes.push(`${notePath} (${e.message})`);
            }
        }

        // Construct summary message
        const totalCreated = createdFolders.length + createdMocs.length + createdNotes.length;
        const totalSkipped = skippedFolders.length + skippedMocs.length + skippedNotes.length;
        const totalFailed = failedFolders.length + failedMocs.length + failedNotes.length;

        let statusBadge = `📁 Cấu hình Vault: ${totalCreated} mới, ${totalSkipped} đã có`;
        if (totalFailed > 0) {
            statusBadge += `, ${totalFailed} lỗi`;
        }

        const sysMessage = `[HỆ THỐNG BÁO]: Đã cấu hình thành công hệ thống folder + MOC và các bài viết nhập môn.
- **Thư mục**: Đã tạo ${createdFolders.length} (${createdFolders.join(", ") || "không có"}), bỏ qua ${skippedFolders.length} đã tồn tại.
- **MOC Skeletons**: Đã tạo ${createdMocs.length} MOC (${createdMocs.join(", ") || "không có"}), bỏ qua ${skippedMocs.length} đã tồn tại.
- **Bài viết Nhập môn**: Đã import ${createdNotes.length} bài viết, bỏ qua ${skippedNotes.length} đã tồn tại.
${totalFailed > 0 ? `\n⚠️ Có ${totalFailed} lỗi xảy ra trong quá trình cài đặt:\n${[...failedFolders, ...failedMocs, ...failedNotes].join("\n")}` : ""}`;

        return {
            statusBadge,
            sysMessage
        };
    }

    async _handleScaffoldAgent(match) {
        let spec = {};
        const raw = (match[1] || "").trim();
        if (raw) { try { spec = JSON.parse(raw); } catch (e) { spec = {}; } }
        const up = this.plugin.settings.userProfile || {};
        const botName = String(spec.botName || up.botName || "Wiki Agent").trim() || "Wiki Agent";
        const honorific = String(spec.honorific || up.honorific || "bạn").trim() || "bạn";
        const language = String(spec.language || up.language || "Tiếng Việt").trim() || "Tiếng Việt";
        const userName = String(spec.userName || up.userName || "").trim();
        const userNameSuffix = userName ? ` của ${userName}` : "";
        const persona = String(spec.persona || up.persona || "").trim() || "Thân thiện, dí dỏm nhưng cực kỳ chính xác khi làm việc.";
        const soul = String(spec.soul || up.soul || "").trim() || "Một trợ lý kỷ luật, ưu tiên giúp bạn tư duy sâu thay vì làm hộ.";
        const communicationStyle = String(spec.communicationStyle || up.communicationStyle || "").trim() || "Ngắn gọn, đi thẳng vấn đề; dùng emoji vừa phải, không spam.";
        const tasksFile = String(spec.tasksFile || up.tasksFile || "").trim();
        const subst = (s) => s
            .replace(/\{\{botName\}\}/g, botName)
            .replace(/\{\{honorific\}\}/g, honorific)
            .replace(/\{\{language\}\}/g, language)
            .replace(/\{\{persona\}\}/g, persona)
            .replace(/\{\{soul\}\}/g, soul)
            .replace(/\{\{communicationStyle\}\}/g, communicationStyle)
            .replace(/\{\{userNameSuffix\}\}/g, userNameSuffix)
            .replace(/\{\{userName\}\}/g, userName)
            .replace(/\{\{TASKS_FILE\}\}/g, tasksFile || "(chưa cấu hình tasksFile)");
        const adapter = this.app.vault.adapter;
        const skelDir = `${this.plugin.manifest.dir}/agent-skeleton`;
        if (!this.app.vault.getAbstractFileByPath("_agent")) {
            try { await this.app.vault.createFolder("_agent"); } catch (e) {}
        }
        const map = [["CLAUDE.md", "_agent/CLAUDE.md"], ["mode-routing.md", "_agent/mode-routing.md"], ["workflows.md", "_agent/workflows.md"], ["skills.md", "_agent/skills.md"]];
        const created = [], skipped = [], failed = [];
        for (const [src, dst] of map) {
            try {
                if (this.app.vault.getAbstractFileByPath(dst)) { skipped.push(dst); continue; }
                const content = subst(await adapter.read(`${skelDir}/${src}`));
                await this.app.vault.create(dst, content);
                created.push(dst);
            } catch (e) { failed.push(`${dst} (${e.message})`); }
        }
        // Copy bundle skills/ → _agent/skills/ (toàn bộ skill body — nạp lazy qua $$LOAD_SKILL$$)
        let skillCount = 0;
        try {
            if (!this.app.vault.getAbstractFileByPath("_agent/skills")) {
                try { await this.app.vault.createFolder("_agent/skills"); } catch (e) {}
            }
            const sk = await adapter.list(`${skelDir}/skills`);
            for (const p of (sk.files || [])) {
                if (!p.endsWith(".md")) continue;
                const base = p.split("/").pop();
                if (base === "kanban.md" && !tasksFile) continue;
                const dst = `_agent/skills/${base}`;
                if (this.app.vault.getAbstractFileByPath(dst)) continue;
                await this.app.vault.create(dst, subst(await adapter.read(p)));
                skillCount++;
            }
        } catch (e) { failed.push(`skills/ (${e.message})`); }
        return {
            statusBadge: `🧠 Scaffold _agent: ${created.length} file + ${skillCount} skill${skipped.length ? `, ${skipped.length} bỏ qua` : ""}${failed.length ? `, ${failed.length} lỗi` : ""}`,
            sysMessage: `[HỆ THỐNG BÁO]: Đã tạo sẵn ${created.join(", ") || "—"} + ${skillCount} skill trong _agent/skills/${skipped.length ? `; bỏ qua (đã có): ${skipped.join(", ")}` : ""}.${failed.length ? ` Lỗi: ${failed.join("; ")}.` : ""} TIẾP TỤC: $$WRITE$$ 4 file còn lại trong _agent/ — routing-rules.md, index.md, memory.md, log.md (bám cấu trúc folder thật của vault).`
        };
    }

    async _handleInstallTaskboard(match) {
        let spec = {};
        const raw = (match[1] || "").trim();
        if (raw) { try { spec = JSON.parse(raw); } catch (e) {
            return { statusBadge: `❌ INSTALL_TASKBOARD lỗi JSON`, sysMessage: `[HỆ THỐNG BÁO LỖI]: INSTALL_TASKBOARD không phải JSON hợp lệ: ${e.message}. Định dạng: $$INSTALL_TASKBOARD$$ {"file":"8.TRACK/TASKS.md"} $$END_INSTALL_TASKBOARD$$` };
        } }
        const file = String(spec.file || "8.TRACK/TASKS.md").replace(/^\/+/, "");
        if (this.app.vault.getAbstractFileByPath(file)) {
            return { statusBadge: `📋 Bảng task đã tồn tại`, sysMessage: `[HỆ THỐNG BÁO]: "${file}" đã tồn tại — bỏ qua. HÃY set tasksFile="${file}" qua $$SAVE_PROFILE$$ nếu chưa.` };
        }
        const parent = file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : "";
        if (parent && !this.app.vault.getAbstractFileByPath(parent)) {
            try { await this.app.vault.createFolder(parent); } catch (e) {}
        }
        try {
            const content = await this.app.vault.adapter.read(`${this.plugin.manifest.dir}/agent-skeleton/taskboard.md`);
            await this.app.vault.create(file, content);
        } catch (e) {
            return { statusBadge: `❌ INSTALL_TASKBOARD lỗi`, sysMessage: `[HỆ THỐNG BÁO LỖI]: Không tạo được bảng task "${file}": ${e.message}` };
        }
        return {
            statusBadge: `📋 Đã tạo bảng task Kanban`,
            sysMessage: `[HỆ THỐNG BÁO]: Đã tạo "${file}" (Kanban board: To Do / Doing / Done). HÃY set tasksFile="${file}" qua $$SAVE_PROFILE$$ để bật lệnh /task.`
        };
    }

    async _handleWrite(match) {
        const targetPath = match[1].trim().replace(/^\/+/, "");
        const content = match[2];
        const lineCount = content.split('\n').length;
        const file = this.app.vault.getAbstractFileByPath(targetPath);
        try {
            if (file && !file.children) {
                await this.app.vault.modify(file, content);
                return {
                    statusBadge: `✅ Đã ghi đè \`${targetPath}\` (${lineCount} dòng)`,
                    sysMessage: `[HỆ THỐNG BÁO]: Đã ghi đè thành công file ${targetPath}`
                };
            } else if (!file) {
                const parts = targetPath.split('/');
                let currPath = '';
                for (let i = 0; i < parts.length - 1; i++) {
                    currPath = currPath === '' ? parts[i] : currPath + '/' + parts[i];
                    if (!this.app.vault.getAbstractFileByPath(currPath)) {
                        await this.app.vault.createFolder(currPath);
                    }
                }
                await this.app.vault.create(targetPath, content);
                return {
                    statusBadge: `✅ Đã tạo \`${targetPath}\` (${lineCount} dòng)`,
                    sysMessage: `[HỆ THỐNG BÁO]: Đã tạo thành công file mới ${targetPath}`
                };
            }
            return {
                statusBadge: `❌ WRITE thất bại`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Không thể ghi vào ${targetPath} vì nó là thư mục.`
            };
        } catch (err) {
            return {
                statusBadge: `❌ WRITE error: ${err.message}`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Lỗi khi ghi file ${targetPath}: ${err.message}`
            };
        }
    }

    async _handleAppend(match) {
        const targetPath = match[1].trim().replace(/^\/+/, "");
        const newContent = match[2];
        const file = this.app.vault.getAbstractFileByPath(targetPath);
        try {
            if (file && !file.children) {
                const existing = await this.app.vault.read(file);
                await this.app.vault.modify(file, existing + '\n' + newContent);
                return {
                    statusBadge: `✅ Đã APPEND vào \`${targetPath}\``,
                    sysMessage: `[HỆ THỐNG BÁO]: Đã APPEND thành công vào ${targetPath}`
                };
            }
            return {
                statusBadge: `❌ APPEND thất bại`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: File ${targetPath} không tồn tại. Dùng WRITE để tạo mới.`
            };
        } catch (err) {
            return {
                statusBadge: `❌ APPEND error`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Lỗi APPEND: ${err.message}`
            };
        }
    }

    async _handleReplace(match) {
        const targetPath = match[1].trim();
        const oldText = match[2];
        const newText = match[3];
        const file = this.app.vault.getAbstractFileByPath(targetPath);
        try {
            if (!file || file.children) {
                return {
                    statusBadge: `❌ REPLACE thất bại`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: File ${targetPath} không tồn tại.`
                };
            }
            const content = await this.app.vault.read(file);
            if (!content.includes(oldText)) {
                return {
                    statusBadge: `❌ REPLACE: text không tìm thấy`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: Không tìm thấy đoạn text cần thay thế trong ${targetPath}`
                };
            }
            await this.app.vault.modify(file, content.replace(oldText, newText));
            return {
                statusBadge: `✅ Đã REPLACE trong \`${targetPath}\``,
                sysMessage: `[HỆ THỐNG BÁO]: Đã REPLACE thành công trong ${targetPath}`
            };
        } catch (err) {
            return {
                statusBadge: `❌ REPLACE error`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Lỗi REPLACE: ${err.message}`
            };
        }
    }

    async _handleDelete(match) {
        const targetPath = match[1].trim();
        const textToDelete = match[2];
        const file = this.app.vault.getAbstractFileByPath(targetPath);
        try {
            if (!file || file.children) {
                return {
                    statusBadge: `❌ DELETE thất bại`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: File ${targetPath} không tồn tại.`
                };
            }
            const content = await this.app.vault.read(file);
            if (!content.includes(textToDelete)) {
                return {
                    statusBadge: `❌ DELETE: text không tìm thấy`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: Không tìm thấy đoạn text cần xóa trong ${targetPath}`
                };
            }
            await this.app.vault.modify(file, content.replace(textToDelete, ''));
            return {
                statusBadge: `✅ Đã DELETE trong \`${targetPath}\``,
                sysMessage: `[HỆ THỐNG BÁO]: Đã DELETE thành công trong ${targetPath}`
            };
        } catch (err) {
            return {
                statusBadge: `❌ DELETE error`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Lỗi DELETE: ${err.message}`
            };
        }
    }

    async _handleMove(match) {
        const srcPath = match[1].trim();
        const dstPath = match[2].trim();
        try {
            const srcFile = this.app.vault.getAbstractFileByPath(srcPath);
            if (!srcFile) {
                return {
                    statusBadge: `❌ MOVE: file nguồn không tồn tại`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: File nguồn ${srcPath} không tồn tại.`
                };
            }
            if (this.app.vault.getAbstractFileByPath(dstPath)) {
                return {
                    statusBadge: `❌ MOVE: file đích đã tồn tại`,
                    sysMessage: `[HỆ THỐNG BÁO LỖI]: File đích ${dstPath} đã tồn tại — không ghi đè.`
                };
            }
            const lastSlash = dstPath.lastIndexOf('/');
            if (lastSlash > 0) {
                const parentFolder = dstPath.substring(0, lastSlash);
                if (!this.app.vault.getAbstractFileByPath(parentFolder)) {
                    await this.app.vault.createFolder(parentFolder);
                }
            }
            await this.app.fileManager.renameFile(srcFile, dstPath);
            return {
                statusBadge: `🚚 Đã move \`${srcPath}\` → \`${dstPath}\``,
                sysMessage: `[HỆ THỐNG BÁO]: Đã MOVE thành công ${srcPath} → ${dstPath}`
            };
        } catch (err) {
            return {
                statusBadge: `❌ MOVE error`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Lỗi MOVE: ${err.message}`
            };
        }
    }

    async _handleNlmTool(match) {
        const toolName = match[1].trim();
        const argsRaw = match[2].trim();
        let args;
        try {
            args = argsRaw ? JSON.parse(argsRaw) : {};
        } catch (e) {
            return {
                statusBadge: `❌ NLM_TOOL ${toolName}: args JSON sai`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: NLM_TOOL ${toolName} args không phải JSON hợp lệ: ${e.message}`
            };
        }
        try {
            if (!this.plugin.mcpNotebookLM || !this.plugin.mcpNotebookLM.initialized) {
                await this.plugin.maybeStartMCP();
            }
            const mcp = this.plugin.mcpNotebookLM;
            if (!mcp || !mcp.initialized) {
                throw new Error("NotebookLM MCP không khởi động được — kiểm tra Settings + cài notebooklm-mcp-cli + chạy 'nlm login'");
            }
            const tool = mcp.tools.find(t => t.name === toolName);
            if (!tool) {
                throw new Error(`Tool '${toolName}' không tồn tại. Available: ${mcp.tools.map(t => t.name).slice(0, 20).join(', ')}…`);
            }
            const result = await mcp.callTool(toolName, args);
            const text = (result && result.content || []).map(c => c.text || JSON.stringify(c)).join('\n')
                || JSON.stringify(result).slice(0, 4000);
            return {
                statusBadge: `🔍 Đã gọi MCP tool \`${toolName}\``,
                sysMessage: `[NotebookLM TOOL RESULT — ${toolName}]:\n${text}`
            };
        } catch (err) {
            return {
                statusBadge: `❌ NLM_TOOL ${toolName} error`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: NLM_TOOL ${toolName} failed: ${err.message}`
            };
        }
    }

    async _handleSearch(match) {
        const keyword = match[1].trim().toLowerCase();
        const allFiles = this.app.vault.getFiles().filter(f => f.extension === 'md');
        const results = [];
        for (const file of allFiles) {
            if (file.path.startsWith('.') || file.path.startsWith('_agent/chats')) continue;
            let score = 0;
            let snippet = '';
            const nameLower = file.basename.toLowerCase();
            if (nameLower.includes(keyword)) score += 10;
            const words = keyword.split(/[\s-_]+/);
            for (const w of words) {
                if (w.length > 2 && nameLower.includes(w)) score += 3;
            }
            try {
                const content = await this.app.vault.cachedRead(file);
                const contentLower = content.toLowerCase();
                if (contentLower.includes(keyword)) {
                    score += 5;
                    const idx = contentLower.indexOf(keyword);
                    const start = Math.max(0, idx - 60);
                    const end = Math.min(content.length, idx + keyword.length + 60);
                    snippet = (start > 0 ? '...' : '') + content.substring(start, end).replace(/\n/g, ' ') + (end < content.length ? '...' : '');
                } else {
                    for (const w of words) {
                        if (w.length > 2 && contentLower.includes(w)) {
                            score += 1;
                            if (!snippet) {
                                const idx = contentLower.indexOf(w);
                                const start = Math.max(0, idx - 40);
                                const end = Math.min(content.length, idx + w.length + 40);
                                snippet = (start > 0 ? '...' : '') + content.substring(start, end).replace(/\n/g, ' ') + (end < content.length ? '...' : '');
                            }
                        }
                    }
                }
            } catch (e) { }
            if (score > 0) results.push({ path: file.path, score, snippet });
        }
        results.sort((a, b) => b.score - a.score);
        const top = results.slice(0, 15);
        if (top.length === 0) {
            return {
                statusBadge: `🔍 SEARCH "${keyword}": 0 kết quả`,
                sysMessage: `[HỆ THỐNG TRẢ KẾT QUẢ TÌM KIẾM "${keyword}"]: Không tìm thấy note nào liên quan.`
            };
        }
        let output = `[HỆ THỐNG TRẢ KẾT QUẢ TÌM KIẾM "${keyword}"]: Tìm thấy ${results.length} note, hiển thị top ${top.length}:\n\n`;
        for (const r of top) {
            output += `• ${r.path} (điểm: ${r.score})`;
            if (r.snippet) output += `\n  ↳ "${r.snippet}"`;
            output += '\n';
        }
        return {
            statusBadge: `🔍 SEARCH "${keyword}": ${top.length}/${results.length} kết quả`,
            sysMessage: output
        };
    }

    // LINT — chạy linter DETERMINISTIC (_maintLint) + format kết quả. Đọc-thuần, KHÔNG ghi file/git.
    // Thay cho việc Bob tự SEARCH/đoán lỗi cấu trúc (SEARCH trả note nói VỀ khái niệm, không phải lỗi thật).
    async _handleLint() {
        let r;
        try {
            r = await this.plugin._maintLint();
        } catch (e) {
            return { statusBadge: `❌ LINT lỗi`, sysMessage: `[HỆ THỐNG BÁO LỖI]: Lint thất bại: ${e.message}` };
        }
        const sec = (title, arr) => `### ${title} (${arr.length})\n` + (arr.length ? arr.map(x => "- " + x).join("\n") : "- (không có)");
        const mustTotal = r.notesNotInIndex.length + r.brokenNav.length + r.fullPathLinks.length + r.captureLinks.length + r.mocMissingNotes.length + r.routingMissingFolder.length;
        const out = [
            `[HỆ THỐNG KẾT QUẢ LINT] (deterministic — quét link-graph THẬT, KHÔNG dựa log/report). Must-fix: ${mustTotal} item.`,
            "",
            "## MUST-FIX (xử từng item; HỎI user trước khi sửa)",
            sec("Note thiếu trong index.md → thêm entry", r.notesNotInIndex),
            sec("Broken link trong index/MOC (navigation dangling) → SỬA (kèm DÒNG NGUYÊN VĂN để REPLACE)", r.brokenNav),
            sec("Full-path wikilink → đổi về bare [[basename]]", r.fullPathLinks),
            sec("Link [[1.CAPTURE/...]] trong body wiki → gỡ", r.captureLinks),
            sec("MOC coverage (nearest-ancestor) — THIẾU link phải có / THỪA link nên gỡ", r.mocMissingNotes),
            sec("Folder domain tồn tại nhưng routing-rules CHƯA nhắc", r.routingMissingFolder),
            "",
            "## ADVISORY (CHỈ liệt kê, KHÔNG tự sửa)",
            sec("Cụm note chưa được MOC nào ôm (≥15) → đề xuất tạo MOC", r.clustersNoMoc),
            sec("📥 Backlog: capture chưa được cite trong wiki sources (1.CAPTURE là inbox raw — KHÔNG bắt buộc ingest; con số là cận trên)", r.captureNotIngested),
            sec("⚠️ Broken link trong NOTE nội dung (phần lớn forward-link cố ý — KHÔNG tự sửa)", r.brokenContent),
            sec("⚠️ folder-path trong routing/CLAUDE không resolve (có thể false-positive)", r.routingDeadFolder),
        ].join("\n");
        return { statusBadge: `🔍 Lint vault: ${mustTotal} must-fix`, sysMessage: out };
    }

    // FIND — trả các dòng NGUYÊN VĂN chứa từ khóa trong 1 file (để lấy old_text chính xác cho REPLACE,
    // tránh phải $$READ$$ full file lớn ngoài context như index.md/folders.md).
    async _handleFind(match) {
        const targetPath = (match[1] || "").trim();
        const keyword = (match[2] || "").trim();
        if (!keyword) {
            return { statusBadge: `❌ FIND: thiếu từ khóa`, sysMessage: `[HỆ THỐNG BÁO LỖI]: FIND cần từ khóa. Cú pháp: $$FIND: path$$từ khóa$$END_FIND$$` };
        }
        const file = this.app.vault.getAbstractFileByPath(targetPath);
        if (!file || file.children) {
            return { statusBadge: `❌ FIND: file không tồn tại`, sysMessage: `[HỆ THỐNG BÁO LỖI]: File ${targetPath} không tồn tại.` };
        }
        const content = await this.app.vault.read(file);
        const kwLower = keyword.toLowerCase();
        const hits = [];
        for (const line of content.split("\n")) {
            if (line.toLowerCase().includes(kwLower)) hits.push(line);
            if (hits.length >= 20) break;
        }
        if (hits.length === 0) {
            return { statusBadge: `🔎 FIND "${keyword}": 0 dòng`, sysMessage: `[HỆ THỐNG TRẢ KẾT QUẢ FIND "${keyword}" trong ${targetPath}]: Không có dòng nào chứa từ khóa. Thử từ khóa khác (vd basename note).` };
        }
        let output = `[HỆ THỐNG TRẢ KẾT QUẢ FIND "${keyword}" trong ${targetPath}]: ${hits.length} dòng khớp. Mỗi dòng dưới là NGUYÊN VĂN trong file — copy ĐÚNG 1 dòng (không thêm bớt ký tự nào) làm "text cũ" cho $$REPLACE$$:\n`;
        for (const h of hits) output += `${h}\n`;
        return { statusBadge: `🔎 FIND "${keyword}": ${hits.length} dòng`, sysMessage: output };
    }

    // Trích CHỈ block AUTO:INVENTORY (bản đồ folder nhỏ) từ index.md — dùng cho system prompt thay vì nạp full file.
    async _loadInventoryBlock() {
        try {
            const file = this.app.vault.getAbstractFileByPath("_agent/index.md");
            if (!file || file.children) return null;
            const content = await this.app.vault.read(file);
            const m = content.match(/<!--\s*AUTO:INVENTORY:START\s*-->([\s\S]*?)<!--\s*AUTO:INVENTORY:END\s*-->/);
            return m ? m[1].trim() : null;
        } catch (e) {
            console.log("ObsidianAgent: không đọc được AUTO:INVENTORY block", e);
            return null;
        }
    }

    // Manifest skill (block AUTO:SKILLS trong _agent/skills.md) — luôn nạp, tí hon.
    // Body skill đầy đủ ở _agent/skills/<name>.md, chỉ nạp on-demand qua $$LOAD_SKILL$$.
    async _loadSkillsBlock() {
        try {
            const file = this.app.vault.getAbstractFileByPath("_agent/skills.md");
            if (!file || file.children) return null;
            const content = await this.app.vault.read(file);
            const m = content.match(/<!--\s*AUTO:SKILLS:START\s*-->([\s\S]*?)<!--\s*AUTO:SKILLS:END\s*-->/);
            return m ? m[1].trim() : null;
        } catch (e) {
            console.log("ObsidianAgent: không đọc được AUTO:SKILLS block", e);
            return null;
        }
    }

    // ====================================================================
    // INGEST_BATCH — process N file song song (concurrency=2) + APPEND mutex
    // ====================================================================
    // Cú pháp:
    //   $$INGEST_BATCH$$
    //   [
    //     {
    //       "src": "Clippings/Foo.md",
    //       "dst": "3. PHÁT TRIỂN.../foo.md",
    //       "type": "concept",
    //       "title": "Foo Title",
    //       "tags": ["tag1", "tag2"],
    //       "indexEntry": "- [[foo]] — mô tả ngắn — concept — created: 2026-04-30",
    //       "logEntry": "2026-04-30 14:00 | INGEST | Foo | template: 8-section | created: 3. PHÁT TRIỂN.../foo.md"
    //     },
    //     ...
    //   ]
    //   $$END_INGEST_BATCH$$
    async _handleIngestBatch(match) {
        const jsonRaw = match[1].trim();
        let spec;
        try {
            spec = JSON.parse(jsonRaw);
        } catch (e) {
            return {
                statusBadge: `❌ INGEST_BATCH: JSON spec sai`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: INGEST_BATCH spec không phải JSON hợp lệ: ${e.message}`
            };
        }
        if (!Array.isArray(spec) || spec.length === 0) {
            return {
                statusBadge: `❌ INGEST_BATCH: spec phải là array non-empty`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: INGEST_BATCH spec phải là JSON array với ít nhất 1 entry.`
            };
        }

        const profile = this.plugin.getActiveProfile();
        if (!profile) {
            return {
                statusBadge: `❌ INGEST_BATCH: chưa có profile active`,
                sysMessage: `[HỆ THỐNG BÁO LỖI]: Chưa có profile LLM active. Vào Settings tạo profile.`
            };
        }

        // Build template prompt cho headless LLM call (tóm gọn để không nhồi quá nhiều token)
        const ingestSystemPrompt = "Bạn là wiki maintainer. Distill 1 source CAPTURE thành atomic note theo template 8 section của vault. Output ONLY markdown body (frontmatter YAML đầu file + 8 section + Liên kết), KHÔNG bao gồm bất kỳ commentary nào trước/sau. Frontmatter sources: dùng plain string, KHÔNG wrap [[...]]. Section Liên kết chỉ link wiki page khác (basename), KHÔNG link 1.CAPTURE/.";
        const today = new Date().toISOString().slice(0, 10);

        const sem = new Semaphore(2);              // 2 LLM calls song song
        const indexMutex = new Mutex();
        const logMutex = new Mutex();
        const results = [];

        // Batch chạy nền (sendMessage đã resolve trước handleAgentCommands) → tự giữ trạng thái
        // "đang chạy" + nút Stop sống + Notice tiến độ để UI không trông như treo.
        this.isRunning = true;
        this.textarea.disabled = true;
        this.sendBtn.style.display = "none";
        this.stopBtn.style.display = "";
        let doneCount = 0;
        const inFlight = new Set();
        const batchNotice = new Notice("", 0);
        const refreshNotice = () => {
            const cur = inFlight.size ? ` — đang distill: ${[...inFlight].join(', ')}` : '';
            batchNotice.setMessage(`📦 INGEST_BATCH ${doneCount}/${spec.length}${cur}`);
        };
        refreshNotice();

        const tasks = spec.map((item, idx) => (async () => {
            const tag = `[${idx + 1}/${spec.length}] ${item.title || item.src}`;
            const label = item.title || (item.src || '').split('/').pop() || `#${idx + 1}`;
            try {
                if (this.aborted) throw new Error('đã dừng (Stop)');

                // Idempotent: dst đã tồn tại → coi như đã ingest, bỏ qua (không fail, không gọi LLM, không move).
                if (this.app.vault.getAbstractFileByPath(item.dst)) {
                    results.push({ tag, ok: true, skipped: true, dst: item.dst, note: 'đã tồn tại — bỏ qua' });
                    return;
                }

                // 1. Read source
                const srcFile = this.app.vault.getAbstractFileByPath(item.src);
                if (!srcFile || srcFile.children) {
                    throw new Error(`source ${item.src} không tồn tại hoặc là folder`);
                }
                const sourceContent = await this.app.vault.read(srcFile);

                // 2. Acquire LLM semaphore + headless call
                await sem.acquire();
                let wikiBody;
                try {
                    if (this.aborted) throw new Error('đã dừng (Stop)');
                    inFlight.add(label); refreshNotice();
                    const userPrompt = `Distill source dưới đây thành atomic note theo 8-section template.

**Spec đích:**
- Title: ${item.title || '(rút từ source)'}
- Type: ${item.type || 'concept'}
- Tags: ${(item.tags || []).join(', ')}
- Path: ${item.dst}
- Source path (cho frontmatter sources): ${item.src}
- Today: ${today}

**Source content (bắt đầu):**

${sourceContent}

**Source content (kết thúc).**

Output ONLY markdown body bao gồm: frontmatter YAML + # Title + 8 section (1. Nguồn gốc / 2. Essence / 3. Examples / 4. Mechanism / 5. Scope / 6. System position / 7. Operationalization / 8. Implications) + ## Liên kết. Không ghi chú thêm.`;
                    wikiBody = await callLLMHeadless(this.plugin, profile,
                        [{ role: 'user', content: userPrompt }],
                        ingestSystemPrompt
                    );
                } finally {
                    inFlight.delete(label); refreshNotice();
                    sem.release();
                }

                // Strip code fences nếu LLM wrap
                wikiBody = wikiBody.trim()
                    .replace(/^```(?:markdown|md)?\n/, '')
                    .replace(/\n```$/, '');

                // 3. Write file (auto-create folder)
                const lastSlash = item.dst.lastIndexOf('/');
                if (lastSlash > 0) {
                    const folder = item.dst.substring(0, lastSlash);
                    if (!this.app.vault.getAbstractFileByPath(folder)) {
                        await this.app.vault.createFolder(folder);
                    }
                }
                if (this.app.vault.getAbstractFileByPath(item.dst)) {
                    throw new Error(`dst ${item.dst} đã tồn tại`);
                }
                await this.app.vault.create(item.dst, wikiBody);

                // 4. APPEND _agent/index.md (serialized via mutex)
                if (item.indexEntry) {
                    await indexMutex.acquire();
                    try {
                        const indexFile = this.app.vault.getAbstractFileByPath('_agent/index.md');
                        if (indexFile && !indexFile.children) {
                            const cur = await this.app.vault.read(indexFile);
                            await this.app.vault.modify(indexFile, cur + '\n' + item.indexEntry);
                        }
                    } finally { indexMutex.release(); }
                }

                // 5. APPEND _agent/log.md (serialized)
                if (item.logEntry) {
                    await logMutex.acquire();
                    try {
                        const logFile = this.app.vault.getAbstractFileByPath('_agent/log.md');
                        if (logFile && !logFile.children) {
                            const cur = await this.app.vault.read(logFile);
                            await this.app.vault.modify(logFile, cur + '\n' + item.logEntry);
                        }
                    } finally { logMutex.release(); }
                }

                // 6. MOVE source → 1.CAPTURE/
                const srcBaseName = item.src.split('/').pop();
                const captureDst = `1.CAPTURE/${srcBaseName}`;
                if (!this.app.vault.getAbstractFileByPath(captureDst)) {
                    await this.app.fileManager.renameFile(srcFile, captureDst);
                    results.push({ tag, ok: true, dst: item.dst, captured: captureDst });
                } else {
                    results.push({ tag, ok: true, dst: item.dst, captured: null, note: `${captureDst} đã tồn tại, skip move` });
                }
            } catch (err) {
                console.error(`[bob] INGEST_BATCH ${tag} failed:`, err);
                results.push({ tag, ok: false, error: err.message });
            } finally {
                doneCount++; refreshNotice();
            }
        })());

        await Promise.all(tasks);

        const created = results.filter(r => r.ok && !r.skipped);
        const skipped = results.filter(r => r.ok && r.skipped);
        const failures = results.filter(r => !r.ok);
        const lines = [];
        lines.push(`✅ ${created.length} tạo mới`
            + (skipped.length ? `, ⏭ ${skipped.length} bỏ qua (đã có)` : '')
            + (failures.length ? `, ❌ ${failures.length} thất bại` : '')
            + ` / ${spec.length}`);
        for (const r of created) {
            lines.push(`  ✓ ${r.tag} → ${r.dst}` + (r.captured ? ` + moved → ${r.captured}` : (r.note ? ` (${r.note})` : '')));
        }
        for (const r of skipped) {
            lines.push(`  ⏭ ${r.tag} → ${r.dst} (${r.note || 'đã có'})`);
        }
        for (const r of failures) {
            lines.push(`  ✗ ${r.tag}: ${r.error}`);
        }
        const summary = lines.join('\n');

        // Khôi phục UI; nếu không bị abort, handleAgentCommands sẽ tự gửi báo cáo (sendMessage).
        batchNotice.hide();
        this.isRunning = false;
        this.textarea.disabled = false;
        this.stopBtn.style.display = "none";
        this.sendBtn.style.display = "";

        return {
            statusBadge: `🚀 INGEST_BATCH: ${created.length} mới${skipped.length ? `, ${skipped.length} bỏ qua` : ''}${failures.length ? `, ${failures.length} fail` : ''} / ${spec.length}`,
            sysMessage: `[HỆ THỐNG BÁO INGEST_BATCH KẾT QUẢ]:\n${summary}`
        };
    }

    stopAgent() {
        this.aborted = true;
        this.isRunning = false;
        if (this.currentReq) {
            try { this.currentReq.destroy(); } catch (e) { }
            this.currentReq = null;
        }
        this.textarea.disabled = false;
        this.textarea.focus();
        this.stopBtn.style.display = "none";
        this.sendBtn.style.display = "";
        new Notice("⏹ Agent đã dừng.");
    }

    async sendMessage() {
        let text = this.textarea.value.trim();
        const attachments = [...this.attachments];

        if (!text && attachments.length === 0) return;

        this.textarea.value = "";
        this.attachments = [];
        this.renderAttachments();

        this.textarea.disabled = true;
        this.isRunning = true;
        this.aborted = false;
        this.sendBtn.style.display = "none";
        this.stopBtn.style.display = "";

        // Build the final prompt including attachment contents
        // Step 1: gom raw block per attachment để áp dụng token budget proportional
        const blocks = []; // {label, body, sourceLine}
        for (const at of attachments) {
            try {
                // Skip text block khi attachment có imageData (sẽ gửi qua vision multipart)
                if (at.imageData) {
                    blocks.push({ label: `Ảnh: ${at.name}`, body: `[ảnh được gửi kèm — xem qua vision]`, sourceLine: "" });
                    continue;
                }
                if (at.type === 'selection') {
                    blocks.push({
                        label: `Trích từ phản hồi trước của bạn (${(at.text||'').length} ký tự)`,
                        body: at.text || '',
                        sourceLine: '↑ đoạn user bôi đen từ câu trả lời TRƯỚC ĐÓ của chính bạn — dùng làm bối cảnh cho câu hỏi mới.'
                    });
                    continue;
                }
                if (at.type === 'url') {
                    // URL/YouTube attachment đã có text sẵn từ fetch
                    blocks.push({
                        label: at.kind === 'youtube' ? `YouTube: ${at.name}` : `URL: ${at.name}`,
                        body: at.text || "",
                        sourceLine: `Nguồn: ${at.sourceUrl}`
                    });
                } else if (at.type === 'internal') {
                    const ext = at.ext.toLowerCase();
                    if (ext === 'pdf') {
                        const buf = await this.app.vault.readBinary(at.file);
                        const text = await this._extractPdfText(buf);
                        blocks.push({ label: `PDF: ${at.name}`, body: text, sourceLine: `Nguồn: [[${at.path}]]` });
                    } else if (ext === "docx") {
                        const buf = await this.app.vault.readBinary(at.file);
                        const text = await this._extractDocxText(buf);
                        blocks.push({ label: `DOCX: ${at.name}`, body: text, sourceLine: `Nguồn: [[${at.path}]]` });
                    } else if (ext === "xlsx" || ext === "xls") {
                        const buf = await this.app.vault.readBinary(at.file);
                        const text = await this._extractXlsxText(buf);
                        blocks.push({ label: `XLSX: ${at.name}`, body: text, sourceLine: `Nguồn: [[${at.path}]]` });
                    } else if (ext === "pptx") {
                        const buf = await this.app.vault.readBinary(at.file);
                        const text = await this._extractPptxText(buf);
                        blocks.push({ label: `PPTX: ${at.name}`, body: text, sourceLine: `Nguồn: [[${at.path}]]` });
                    } else if (this._isAudioVideoExt(ext)) {
                        const noticeId = new Notice(`🎙 Đang transcribe ${at.name}…`, 0);
                        try {
                            const buf = await this.app.vault.readBinary(at.file);
                            const r = await this._transcribeAudio(buf, at.name, ext);
                            const tag = ["mp4","webm","mov","mpeg"].includes(ext) ? "VIDEO" : "AUDIO";
                            const cacheTag = r.cached ? " (cache)" : (r.elapsedSec ? ` (${r.elapsedSec}s)` : "");
                            blocks.push({ label: `${tag} transcript: ${at.name}${cacheTag}`, body: r.text || "[transcript trống]", sourceLine: `Nguồn: [[${at.path}]]` });
                            noticeId.hide();
                            new Notice(`✓ Transcript ${at.name} (${(r.text||'').length} chars)`);
                        } catch (e) {
                            noticeId.hide();
                            blocks.push({ label: at.name, body: `[Lỗi transcribe: ${e.message}]`, sourceLine: `Nguồn: [[${at.path}]]` });
                            new Notice(`Transcribe lỗi: ${e.message}`, 8000);
                        }
                    } else if (["png","jpg","jpeg","gif","webp"].includes(ext)) {
                        blocks.push({ label: `Ảnh: ${at.name}`, body: `[[${at.path}]] — bật vision trong Settings để model đọc được nội dung`, sourceLine: "" });
                    } else {
                        const content = await this.app.vault.read(at.file);
                        blocks.push({ label: at.path, body: content, sourceLine: "" });
                    }
                } else {
                    // External file
                    const ext = at.ext.toLowerCase();
                    const textExts = ["md", "txt", "csv", "tsv", "json", "js", "ts", "css", "py", "html", "xml", "yaml", "yml"];
                    if (ext === 'pdf') {
                        const buf = await at.file.arrayBuffer();
                        const text = await this._extractPdfText(buf);
                        blocks.push({ label: `PDF: ${at.name}`, body: text, sourceLine: "" });
                    } else if (ext === "docx") {
                        const buf = await at.file.arrayBuffer();
                        const text = await this._extractDocxText(buf);
                        blocks.push({ label: `DOCX: ${at.name}`, body: text, sourceLine: "" });
                    } else if (ext === "xlsx" || ext === "xls") {
                        const buf = await at.file.arrayBuffer();
                        const text = await this._extractXlsxText(buf);
                        blocks.push({ label: `XLSX: ${at.name}`, body: text, sourceLine: "" });
                    } else if (ext === "pptx") {
                        const buf = await at.file.arrayBuffer();
                        const text = await this._extractPptxText(buf);
                        blocks.push({ label: `PPTX: ${at.name}`, body: text, sourceLine: "" });
                    } else if (this._isAudioVideoExt(ext)) {
                        const noticeId = new Notice(`🎙 Đang transcribe ${at.name}…`, 0);
                        try {
                            const buf = await at.file.arrayBuffer();
                            const r = await this._transcribeAudio(buf, at.name, ext);
                            const tag = ["mp4","webm","mov","mpeg"].includes(ext) ? "VIDEO" : "AUDIO";
                            const cacheTag = r.cached ? " (cache)" : (r.elapsedSec ? ` (${r.elapsedSec}s)` : "");
                            blocks.push({ label: `${tag} transcript: ${at.name}${cacheTag}`, body: r.text || "[transcript trống]", sourceLine: "" });
                            noticeId.hide();
                            new Notice(`✓ Transcript ${at.name} (${(r.text||'').length} chars)`);
                        } catch (e) {
                            noticeId.hide();
                            blocks.push({ label: at.name, body: `[Lỗi transcribe: ${e.message}]`, sourceLine: "" });
                            new Notice(`Transcribe lỗi: ${e.message}`, 8000);
                        }
                    } else if (["png","jpg","jpeg","gif","webp"].includes(ext)) {
                        blocks.push({ label: `Ảnh: ${at.name}`, body: `[ảnh ngoài — bật vision trong Settings để model đọc được]`, sourceLine: "" });
                    } else if (textExts.includes(ext)) {
                        const content = await at.file.text();
                        blocks.push({ label: at.name, body: content, sourceLine: "" });
                    } else {
                        blocks.push({ label: at.name, body: `[Tệp bên ngoài (không đọc được): ${at.name}]`, sourceLine: "" });
                    }
                }
            } catch (e) {
                blocks.push({ label: at.name || "?", body: `[Lỗi đọc: ${e.message}]`, sourceLine: "" });
            }
        }

        // Step 2: áp dụng CONTEXT_CHAR_BUDGET proportional truncation
        const totalAttachChars = blocks.reduce((s, b) => s + b.body.length, 0);
        const userTextChars = text.length;
        const budget = CONTEXT_CHAR_BUDGET - userTextChars;
        let truncated = false;
        if (totalAttachChars > budget && budget > 0 && blocks.length > 0) {
            const ratio = budget / totalAttachChars;
            for (const b of blocks) {
                const limit = Math.floor(b.body.length * ratio);
                if (b.body.length > limit) {
                    b.body = b.body.slice(0, Math.max(200, limit)) + `\n\n[…đã cắt do vượt context budget]`;
                    truncated = true;
                }
            }
        }

        // Step 3: build finalPrompt
        let finalPrompt = text;
        if (blocks.length > 0) {
            finalPrompt += "\n\n--- Dưới đây là các tệp đính kèm ---\n";
            for (const b of blocks) {
                // Pick fence length = max run of backticks trong body + 1 (min 3),
                // tránh inner ``` đóng fence ngoài sớm → markdown rò rỉ ra body chính
                const maxRun = (b.body.match(/`+/g) || []).reduce((m, s) => Math.max(m, s.length), 0);
                const fenceLen = Math.max(3, maxRun + 1);
                const fence = "`".repeat(fenceLen);
                finalPrompt += `\n${fence}${b.label}\n${b.body}\n${fence}\n`;
                if (b.sourceLine) finalPrompt += b.sourceLine + "\n";
            }
            if (truncated) {
                new Notice("⚠️ Một số attachment đã bị cắt vì vượt context budget (120k char)");
            }
        }

        // Phase 3: nếu profile có vision và có image attachment → build canonical content array
        const profileForVision = this.plugin.getActiveProfile();
        const visionAttached = attachments.filter(a => a.imageData);
        let messageContent = finalPrompt;
        if (visionAttached.length > 0) {
            if (profileForVision?.vision) {
                // Check image byte budget
                const totalBytes = visionAttached.reduce((s, a) => s + (a.imageData.byteLength || 0), 0);
                if (totalBytes > IMAGE_BYTES_BUDGET) {
                    new Notice(`⚠️ Tổng ảnh (${(totalBytes/1024/1024).toFixed(1)}MB) vượt budget 5MB; bỏ qua ảnh, gửi text-only.`);
                } else {
                    messageContent = [
                        { type: "text", text: finalPrompt },
                        ...visionAttached.map(a => ({
                            type: "image",
                            mediaType: a.imageData.mediaType,
                            base64: a.imageData.base64,
                            name: a.name
                        }))
                    ];
                }
            } else {
                new Notice("Profile hiện tại không bật vision; ảnh sẽ bị bỏ qua. Mở Settings để bật.");
            }
        }

        this.messages.push({ role: "user", content: messageContent });
        this.renderMessages();
        await this.saveHistory();

        // Create Assistant Message Element for Streaming
        const msgEl = this.messageContainer.createDiv({ cls: `obsidian-agent-msg obsidian-agent-msg-assistant` });
        const avatar = msgEl.createDiv({ cls: "obsidian-agent-avatar obsidian-agent-avatar-agent" });
        setIcon(avatar, "bot");
        const contentEl = msgEl.createDiv({ cls: "obsidian-agent-content markdown-rendered obsidian-agent-streaming" });
        contentEl.innerText = "Đang suy nghĩ...";
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;

        try {
            let profile = this.plugin.getActiveProfile();
            if (!profile) throw new Error("Chưa có profile nào — vào Settings → Wiki Agent để tạo.");
            if (!profile.baseUrl) throw new Error(`Profile "${profile.name}" thiếu Base URL.`);
            if (profile.provider === "chatgpt-oauth") {
                profile = await ensureFreshCodexProfile(this.plugin, profile);
            } else if (profile.provider === "gemini-oauth") {
                profile = await ensureFreshGeminiProfile(this.plugin, profile);
            } else if (profile.provider === "anthropic-oauth") {
                profile = await ensureFreshClaudeProfile(this.plugin, profile);
            } else if (profile.provider !== "ollama" && !profile.apiKey) {
                throw new Error(`Profile "${profile.name}" thiếu API Key.`);
            }

            const systemPrompt = await this.getSystemPrompt();
            const isDesktop = require('obsidian').Platform.isDesktopApp;

            if (isDesktop) {
                // Desktop: Node http(s) — bypass CORS + support SSE streaming
                const requestSpec = buildChatRequest(profile, this.messages, systemPrompt, true);
                const payloadStr = JSON.stringify(requestSpec.body);
                const urlObj = new URL(requestSpec.url);
                const transport = urlObj.protocol === 'https:' ? require('https') : require('http');

                const options = {
                    hostname: urlObj.hostname,
                    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: 'POST',
                    headers: {
                        ...requestSpec.headers,
                        'Content-Length': Buffer.byteLength(payloadStr)
                    }
                };

                await new Promise((resolve, reject) => {
                    const req = transport.request(options, (res) => {
                        this.currentReq = req;
                        if (res.statusCode !== 200) {
                            let errorText = '';
                            res.on('data', chunk => { errorText += chunk; });
                            res.on('end', () => reject(new Error(`HTTP ${res.statusCode} - ${errorText}`)));
                            return;
                        }

                        let assistantReply = "";
                        let buffer = "";
                        let lastRender = Date.now();
                        const streamState = { eventType: null };

                        res.on('data', (chunk) => {
                            if (this.aborted) return;
                            buffer += chunk.toString('utf8');
                            const lines = buffer.split('\n');
                            buffer = lines.pop();

                            for (const line of lines) {
                                if (!line) continue;
                                const { textDelta, done } = parseStreamLine(profile.provider, line, streamState);
                                if (textDelta) assistantReply += textDelta;
                                if (done) continue;

                                if (textDelta && Date.now() - lastRender > 100) {
                                    let displayText = assistantReply;
                                    const writeMatch = assistantReply.match(/\$\$(WRITE|APPEND):\s*(.*?)\$\$/);
                                    const replaceMatch = assistantReply.match(/\$\$(REPLACE|DELETE):\s*(.*?)\$\$/);
                                    const moveMatch = assistantReply.match(/\$\$(MOVE):\s*(.*?)\$\$/);
                                    if (writeMatch && !assistantReply.includes('$$END_WRITE$$') && !assistantReply.includes('$$END_APPEND$$')) {
                                        const cmd = writeMatch[1];
                                        const beforeCmd = assistantReply.substring(0, assistantReply.indexOf(`$$${cmd}:`)).trim();
                                        const icon = cmd === 'WRITE' ? '📝' : '📎';
                                        displayText = (beforeCmd ? beforeCmd + '\n\n' : '') + `${icon} Đang ${cmd === 'WRITE' ? 'ghi' : 'thêm'} file \`${writeMatch[2].trim()}\`...`;
                                    } else if (replaceMatch && !assistantReply.includes('$$END_REPLACE$$') && !assistantReply.includes('$$END_DELETE$$')) {
                                        const cmd = replaceMatch[1];
                                        const beforeCmd = assistantReply.substring(0, assistantReply.indexOf(`$$${cmd}:`)).trim();
                                        const icon = cmd === 'REPLACE' ? '🔄' : '🗑';
                                        displayText = (beforeCmd ? beforeCmd + '\n\n' : '') + `${icon} Đang ${cmd === 'REPLACE' ? 'thay thế' : 'xóa'} trong \`${replaceMatch[2].trim()}\`...`;
                                    } else if (moveMatch && !assistantReply.includes('$$END_MOVE$$')) {
                                        const beforeCmd = assistantReply.substring(0, assistantReply.indexOf('$$MOVE:')).trim();
                                        displayText = (beforeCmd ? beforeCmd + '\n\n' : '') + `🚚 Đang move file \`${moveMatch[2].trim()}\`...`;
                                    } else {
                                        const nlmMatch = assistantReply.match(/\$\$NLM_TOOL:\s*([\w-]+)/);
                                        if (nlmMatch && !assistantReply.includes('$$END_NLM_TOOL$$')) {
                                            const beforeCmd = assistantReply.substring(0, assistantReply.indexOf('$$NLM_TOOL:')).trim();
                                            displayText = (beforeCmd ? beforeCmd + '\n\n' : '') + `🔍 Đang gọi NotebookLM \`${nlmMatch[1]}\`...`;
                                        }
                                    }
                                    this.renderMarkdownAsync(displayText + " ✍️", contentEl);
                                    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
                                    lastRender = Date.now();
                                }
                            }
                        });

                        res.on('end', () => {
                            this.currentReq = null;
                            contentEl.removeClass("obsidian-agent-streaming");
                            if (this.aborted) {
                                this.renderMarkdownAsync(assistantReply + "\n\n⏹ *Đã dừng bởi người dùng*", contentEl);
                                this.messages.push({ role: "assistant", content: assistantReply });
                                this.saveHistory().then(resolve).catch(resolve);
                                return;
                            }
                            this.renderMarkdownAsync(assistantReply, contentEl).then(() => {
                                this.messages.push({ role: "assistant", content: assistantReply });
                                this._renderAssistantActions(contentEl.parentElement, contentEl, assistantReply, this.messages.length - 1);
                                this.saveHistory().then(async () => {
                                    resolve();
                                    if (!this.aborted) await this.handleAgentCommands(assistantReply);
                                }).catch(resolve);
                            });
                        });
                    });

                    req.on('error', reject);
                    req.write(payloadStr);
                    req.end();
                });
            } else {
                // Mobile: requestUrl — không stream
                const requestSpec = buildChatRequest(profile, this.messages, systemPrompt, false);
                const response = await require('obsidian').requestUrl({
                    url: requestSpec.url,
                    method: 'POST',
                    headers: requestSpec.headers,
                    body: JSON.stringify(requestSpec.body)
                });

                if (response.status !== 200) {
                    throw new Error(`HTTP ${response.status} - ${JSON.stringify(response.json || response.text)}`);
                }

                const reply = parseNonStreamResponse(profile.provider, response.json) || "No response";

                contentEl.removeClass("obsidian-agent-streaming");
                await this.renderMarkdownAsync(reply, contentEl);
                this.messages.push({ role: "assistant", content: reply });
                this._renderAssistantActions(contentEl.parentElement, contentEl, reply, this.messages.length - 1);
                await this.saveHistory();
                await this.handleAgentCommands(reply);
            }

        } catch (error) {
            console.error(error);
            contentEl.innerText = `Lỗi kết nối: ${error.message}`;
            this.messages.push({ role: "assistant", content: `Lỗi kết nối: ${error.message}` });
        } finally {
            this.isRunning = false;
            this.currentReq = null;
            this.textarea.disabled = false;
            this.textarea.focus();
            this.stopBtn.style.display = "none";
            this.sendBtn.style.display = "";
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }
}

class ObsidianAgentSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass("bob-settings");
        containerEl.createEl("h2", { text: "Wiki Agent settings" });

        // ===== Bảo trì vault (maintenance) =====
        const maint = this.plugin.settings.maintenance || {};
        containerEl.createEl("h3", { text: "🔧 Bảo trì vault tự động" });
        new Setting(containerEl)
            .setName("Chế độ bảo trì")
            .setDesc("off = tắt · deterministic = chỉ JS cơ học (rename naming, snapshot, fix config path) · auto = thêm Bob LLM tự sync index/MOC/routing. Chạy 1 lần/ngày khi mở Obsidian.")
            .addDropdown(dd => {
                dd.addOption("off", "off — tắt");
                dd.addOption("deterministic", "deterministic — chỉ cơ học");
                dd.addOption("auto", "auto — cơ học + Bob semantic");
                dd.setValue(maint.mode || "auto");
                dd.onChange(async v => { this.plugin.settings.maintenance.mode = v; await this.plugin.saveSettings(); });
            });
        new Setting(containerEl)
            .setName("Git checkpoint trước khi chạy")
            .setDesc("Tạo commit điểm khôi phục trước mỗi lần bảo trì (cần git repo). Tắt nếu vault không dùng git.")
            .addToggle(t => {
                t.setValue(maint.gitCheckpoint !== false);
                t.onChange(async v => { this.plugin.settings.maintenance.gitCheckpoint = v; await this.plugin.saveSettings(); });
            });
        new Setting(containerEl)
            .setName("Chạy bảo trì ngay")
            .setDesc(`Lần chạy gần nhất: ${maint.lastRun || "(chưa)"}. Bấm để chạy thủ công ngay bây giờ.`)
            .addButton(btn => {
                btn.setButtonText("Chạy ngay").setCta();
                btn.onClick(async () => {
                    btn.setButtonText("Đang chạy…").setDisabled(true);
                    try { await this.plugin.maybeRunMaintenance({ manual: true, force: true }); }
                    finally { this.display(); }
                });
            });

        // ===== Active profile selector =====
        new Setting(containerEl)
            .setName("Profile đang dùng")
            .setDesc("Provider + model dùng cho chat. Có thể switch nhanh ở dropdown trên header chat.")
            .addDropdown(dd => {
                if (this.plugin.settings.profiles.length === 0) {
                    dd.addOption("", "(chưa có profile nào — tạo bên dưới)");
                } else {
                    for (const p of this.plugin.settings.profiles) {
                        dd.addOption(p.id, `${p.name} — ${p.provider}/${p.model || "?"}`);
                    }
                }
                dd.setValue(this.plugin.settings.activeProfileId);
                dd.onChange(async v => {
                    this.plugin.settings.activeProfileId = v;
                    await this.plugin.saveSettings();
                    this.plugin.refreshOpenViews();
                });
            });

        // ===== Add new profile from preset =====
        const addRow = new Setting(containerEl)
            .setName("Thêm profile mới")
            .setDesc("Chọn preset để auto-fill, sau đó nhập API key + tinh chỉnh nếu cần.");

        let selectedPreset = "trollllm";
        addRow.addDropdown(dd => {
            for (const [k, v] of Object.entries(PROVIDER_PRESETS)) dd.addOption(k, v.label);
            dd.setValue(selectedPreset);
            dd.onChange(v => { selectedPreset = v; });
        });
        addRow.addButton(btn => {
            btn.setButtonText("+ Thêm").setCta();
            btn.onClick(async () => {
                const profile = makeProfileFromPreset(selectedPreset);
                this.plugin.settings.profiles.push(profile);
                if (!this.plugin.settings.activeProfileId) {
                    this.plugin.settings.activeProfileId = profile.id;
                }
                await this.plugin.saveSettings();
                this.display();
            });
        });

        // ===== List of profiles + per-profile editor =====
        containerEl.createEl("h3", { text: "👤 Danh sách profiles" });

        if (this.plugin.settings.profiles.length === 0) {
            containerEl.createEl("p", {
                text: "Chưa có profile nào. Hãy tạo 1 profile ở trên.",
                cls: "setting-item-description"
            });
            return;
        }

        for (const profile of this.plugin.settings.profiles) {
            this.renderProfileEditor(containerEl, profile);
        }

        this.renderMCPSection(containerEl);
        this.renderGitHubSection(containerEl);
    }

    renderGitHubSection(containerEl) {
        containerEl.createEl("h3", { text: "🐙 GitHub integration" });

        const ghDesc = containerEl.createEl("p", { cls: "bob-section-desc" });
        ghDesc.innerHTML = "Khi paste URL <code>github.com/owner/repo</code>, trợ lý tự call GitHub API lấy metadata (stars, license, last_commit, topics…) + raw README. Empty token = anonymous (60 req/h, public only). Tạo PAT: <a href=\"https://github.com/settings/tokens\" target=\"_blank\">github.com/settings/tokens</a> — scope <code>public_repo</code> (public) hoặc <code>repo</code> (private).";

        if (!this.plugin.settings.github) {
            this.plugin.settings.github = { token: "" };
        }
        const ghCfg = this.plugin.settings.github;

        new Setting(containerEl)
            .setName("Personal Access Token (PAT)")
            .setDesc("Lưu local trong data.json. Không sync lên cloud. Để trống = dùng anonymous.")
            .addText(t => {
                t.inputEl.type = "password";
                t.inputEl.style.width = "100%";
                t.setPlaceholder("ghp_… hoặc github_pat_…").setValue(ghCfg.token || "").onChange(async v => {
                    ghCfg.token = v.trim();
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("Test connection")
            .setDesc("Gọi /user (nếu có token) hoặc /rate_limit (nếu anonymous) để verify token hoạt động.")
            .addButton(btn => {
                btn.setButtonText("Test").onClick(async () => {
                    const token = (ghCfg.token || "").trim();
                    const headers = {
                        "Accept": "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28",
                        "User-Agent": "obsidian-agent-bob"
                    };
                    if (token) headers["Authorization"] = `Bearer ${token}`;
                    try {
                        const res = await requestUrl({
                            url: token ? "https://api.github.com/user" : "https://api.github.com/rate_limit",
                            headers,
                            throw: false
                        });
                        if (res.status === 200) {
                            const j = res.json || JSON.parse(res.text || "{}");
                            if (token) {
                                new Notice(`✅ OK — logged in as ${j.login} (${j.name || "no name"})`);
                            } else {
                                const limit = j.rate && j.rate.limit;
                                const remaining = j.rate && j.rate.remaining;
                                new Notice(`✅ Anonymous OK — ${remaining}/${limit} req remaining`);
                            }
                        } else if (res.status === 401) {
                            new Notice(`❌ Token sai hoặc hết hạn (401)`);
                        } else {
                            new Notice(`❌ HTTP ${res.status}: ${(res.text || "").slice(0, 120)}`);
                        }
                    } catch (err) {
                        new Notice(`❌ Lỗi network: ${err.message}`);
                    }
                });
            });
    }

    renderMCPSection(containerEl) {
        containerEl.createEl("h3", { text: "🔌 NotebookLM MCP integration" });

        const mcpDesc = containerEl.createEl("p", { cls: "bob-section-desc" });
        mcpDesc.innerHTML = "Cho trợ lý query NotebookLM trong luồng INGEST. Yêu cầu (1 lần): <code>pip install notebooklm-mcp-cli</code> + <code>nlm login</code> trong terminal.";

        if (!this.plugin.settings.mcp) {
            this.plugin.settings.mcp = { notebooklmEnabled: false, notebooklmCommand: "notebooklm-mcp", notebooklmArgs: [], notebooklmTimeoutMs: 180000 };
        }
        const mcpCfg = this.plugin.settings.mcp;

        new Setting(containerEl)
            .setName("Bật NotebookLM MCP")
            .setDesc("Khi bật, lệnh $$NLM_TOOL$$ sẽ spawn subprocess notebooklm-mcp lần đầu được gọi (lazy-start).")
            .addToggle(t => t.setValue(!!mcpCfg.notebooklmEnabled).onChange(async v => {
                mcpCfg.notebooklmEnabled = v;
                await this.plugin.saveSettings();
                if (!v) this.plugin.stopMCP();
                this.display();
            }));

        if (!mcpCfg.notebooklmEnabled) return;

        new Setting(containerEl)
            .setName("Path tới notebooklm-mcp")
            .setDesc("Để 'notebooklm-mcp' nếu binary trong PATH; nhập absolute path nếu không (vd /Users/linhji/.local/bin/notebooklm-mcp). Verify path bằng 'which notebooklm-mcp' trong terminal.")
            .addText(t => {
                t.inputEl.style.width = "100%";
                t.setPlaceholder("notebooklm-mcp").setValue(mcpCfg.notebooklmCommand || "").onChange(async v => {
                    mcpCfg.notebooklmCommand = v.trim() || "notebooklm-mcp";
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName("MCP request timeout (ms)")
            .setDesc("Thời gian tối đa cho 1 tool call (notebook_query, source_add…). Notebook to cần 120000–300000ms. Default 180000. Sau khi đổi, TẮT rồi BẬT lại toggle ở trên để client mới respawn với timeout mới.")
            .addText(t => {
                t.inputEl.style.width = "100%";
                t.setPlaceholder("180000").setValue(String(mcpCfg.notebooklmTimeoutMs || 180000)).onChange(async v => {
                    const n = parseInt(v, 10);
                    mcpCfg.notebooklmTimeoutMs = (Number.isFinite(n) && n >= 10000) ? n : 180000;
                    await this.plugin.saveSettings();
                });
            });

        // ===== Whisper transcription (audio/video → text) =====
        containerEl.createEl("h3", { text: "🎤 Whisper transcription (audio/video)" });
        const whDesc = containerEl.createEl("p", { cls: "bob-section-desc" });
        whDesc.innerHTML = "Đính kèm <code>.mp3 / .m4a / .wav / .mp4 / .webm / .ogg / .flac / .mov</code> → tự gọi OpenAI Whisper API ra transcript. Limit 25MB/file. Cache theo nội dung trong session.";

        if (!this.plugin.settings.whisper) {
            this.plugin.settings.whisper = { enabled: false, apiKey: "", baseUrl: "https://api.openai.com/v1/audio/transcriptions", model: "whisper-1", language: "" };
        }
        const whCfg = this.plugin.settings.whisper;

        new Setting(containerEl)
            .setName("STT engine cho nút mic 🎙")
            .setDesc("Whisper = OpenAI-compatible (cần API key bên dưới). Gemini = dùng Google API key trong profile 'Google Gemini' (không cần bật Whisper). Lưu ý: transcribe FILE audio đính kèm vẫn dùng Whisper.")
            .addDropdown(d => {
                d.addOption("whisper", "Whisper (OpenAI-compatible)");
                d.addOption("gemini", "Gemini (dùng Google API key có sẵn)");
                d.setValue(whCfg.engine || "whisper").onChange(async v => {
                    whCfg.engine = v;
                    await this.plugin.saveSettings();
                    this.display();
                });
            });

        new Setting(containerEl)
            .setName("Bật Whisper transcription")
            .addToggle(t => t.setValue(!!whCfg.enabled).onChange(async v => {
                whCfg.enabled = v;
                await this.plugin.saveSettings();
                this.display();
            }));

        if (whCfg.enabled) {
            new Setting(containerEl)
                .setName("OpenAI API key")
                .setDesc("Lấy từ platform.openai.com/api-keys. Key chỉ lưu local trong data.json.")
                .addText(t => {
                    t.inputEl.type = "password";
                    t.inputEl.style.width = "100%";
                    t.setPlaceholder("sk-…").setValue(whCfg.apiKey || "").onChange(async v => {
                        whCfg.apiKey = v.trim();
                        await this.plugin.saveSettings();
                    });
                });

            new Setting(containerEl)
                .setName("Endpoint URL")
                .setDesc("Default OpenAI. Đổi nếu dùng Azure OpenAI / proxy / OpenAI-compat khác.")
                .addText(t => {
                    t.inputEl.style.width = "100%";
                    t.setPlaceholder("https://api.openai.com/v1/audio/transcriptions").setValue(whCfg.baseUrl || "").onChange(async v => {
                        whCfg.baseUrl = v.trim() || "https://api.openai.com/v1/audio/transcriptions";
                        await this.plugin.saveSettings();
                    });
                });

            new Setting(containerEl)
                .setName("Model")
                .setDesc("whisper-1 (rẻ, ổn) | gpt-4o-mini-transcribe (chất hơn, đắt hơn) | gpt-4o-transcribe (cao nhất).")
                .addText(t => {
                    t.setPlaceholder("whisper-1").setValue(whCfg.model || "whisper-1").onChange(async v => {
                        whCfg.model = v.trim() || "whisper-1";
                        await this.plugin.saveSettings();
                    });
                });

            new Setting(containerEl)
                .setName("Ngôn ngữ (ISO-639-1, tuỳ chọn)")
                .setDesc("Để trống = auto-detect. Vd: 'vi' tiếng Việt, 'en' tiếng Anh — set rõ tăng độ chính xác.")
                .addText(t => {
                    t.setPlaceholder("vi").setValue(whCfg.language || "").onChange(async v => {
                        whCfg.language = v.trim();
                        await this.plugin.saveSettings();
                    });
                });
        }

        // ===== YouTube transcript fallback (yt-dlp) =====
        containerEl.createEl("h3", { text: "📺 YouTube transcript fallback" });
        const ytDesc = containerEl.createEl("p", { cls: "bob-section-desc" });
        ytDesc.innerHTML = "Khi YouTube chặn fetch caption trực tiếp (đặc biệt với phụ đề tự động ASR), trợ lý sẽ gọi <code>yt-dlp</code> làm fallback. Cài: <code>pip install yt-dlp</code> hoặc <code>brew install yt-dlp</code>.";

        new Setting(containerEl)
            .setName("Path tới yt-dlp")
            .setDesc("Để 'yt-dlp' nếu trong PATH; nếu Obsidian không thấy (GUI macOS thường thiếu /opt/homebrew/bin), nhập absolute path. Verify bằng 'which yt-dlp' trong terminal.")
            .addText(t => {
                t.inputEl.style.width = "100%";
                t.setPlaceholder("yt-dlp").setValue(this.plugin.settings.ytDlpPath || "yt-dlp").onChange(async v => {
                    this.plugin.settings.ytDlpPath = v.trim() || "yt-dlp";
                    await this.plugin.saveSettings();
                });
            });

        // Status badge
        const statusEl = containerEl.createDiv();
        statusEl.style.padding = "10px";
        statusEl.style.borderRadius = "6px";
        statusEl.style.marginBottom = "10px";
        statusEl.style.fontSize = "0.9em";
        if (this.plugin.mcpNotebookLM && this.plugin.mcpNotebookLM.initialized) {
            statusEl.style.background = "rgba(34,197,94,0.1)";
            statusEl.style.border = "1px solid rgba(34,197,94,0.4)";
            const toolNames = this.plugin.mcpNotebookLM.tools.map(t => t.name);
            statusEl.innerHTML = `<strong>✓ Connected</strong> — ${toolNames.length} tools available`;
            const detail = statusEl.createDiv();
            detail.style.fontSize = "0.85em";
            detail.style.opacity = "0.8";
            detail.style.marginTop = "4px";
            detail.style.fontFamily = "monospace";
            detail.style.wordBreak = "break-all";
            detail.setText(toolNames.slice(0, 12).join(", ") + (toolNames.length > 12 ? `, … (+${toolNames.length - 12})` : ""));
        } else {
            statusEl.style.background = "rgba(156,163,175,0.1)";
            statusEl.style.border = "1px solid rgba(156,163,175,0.4)";
            statusEl.setText("◌ Chưa start (lazy — sẽ spawn khi LLM gọi $$NLM_TOOL$$ lần đầu, hoặc click 'Start now' bên dưới)");
        }

        const isRunning = !!(this.plugin.mcpNotebookLM && this.plugin.mcpNotebookLM.initialized);

        new Setting(containerEl)
            .setName("Test connection")
            .setDesc("Quản lý subprocess MCP. Hover button để xem tooltip.")
            .addButton(btn => {
                if (isRunning) {
                    btn.setIcon("square");
                    btn.setTooltip("Stop — kill subprocess MCP");
                    btn.setWarning();
                    btn.onClick(() => {
                        this.plugin.stopMCP();
                        new Notice("MCP stopped");
                        this.display();
                    });
                } else {
                    btn.setIcon("play");
                    btn.setTooltip("Start — spawn subprocess MCP");
                    btn.setCta();
                    btn.onClick(async () => {
                        btn.setDisabled(true);
                        try { await this.plugin.maybeStartMCP(); } catch {}
                        btn.setDisabled(false);
                        this.display();
                    });
                }
            })
            .addButton(btn => {
                btn.setIcon("refresh-cw");
                btn.setTooltip("Restart — stop rồi start lại");
                btn.onClick(async () => {
                    this.plugin.stopMCP();
                    btn.setDisabled(true);
                    try { await this.plugin.maybeStartMCP(); } catch {}
                    btn.setDisabled(false);
                    this.display();
                });
            })
            .addButton(btn => {
                btn.setIcon("book-open");
                btn.setTooltip("List notebooks — verify connection bằng cách gọi notebook_list");
                btn.onClick(async () => {
                    btn.setDisabled(true);
                    try {
                        if (!this.plugin.mcpNotebookLM || !this.plugin.mcpNotebookLM.initialized) {
                            await this.plugin.maybeStartMCP();
                        }
                        const r = await this.plugin.mcpNotebookLM.callTool("notebook_list", {});
                        const text = (r && r.content || []).map(c => c.text || "").join("\n").slice(0, 800);
                        new Notice(`Notebooks:\n${text}`, 15000);
                        console.log("[bob] notebook_list:", r);
                    } catch (e) {
                        new Notice(`List failed: ${e.message}`, 8000);
                    } finally {
                        btn.setDisabled(false);
                    }
                });
            });
    }

    renderProfileEditor(containerEl, profile) {
        const isActive = this.plugin.settings.activeProfileId === profile.id;

        const wrap = containerEl.createDiv({ cls: "obsidian-agent-profile-editor" });
        wrap.style.border = isActive
            ? "2px solid var(--interactive-accent)"
            : "1px solid var(--background-modifier-border)";
        wrap.style.borderRadius = "6px";
        wrap.style.padding = "12px";
        wrap.style.marginBottom = "12px";
        if (isActive) wrap.style.background = "var(--background-secondary)";

        const head = wrap.createDiv();
        head.style.display = "flex";
        head.style.justifyContent = "space-between";
        head.style.alignItems = "center";
        head.style.marginBottom = "8px";

        const titleBox = head.createDiv();
        titleBox.style.display = "flex";
        titleBox.style.alignItems = "center";
        titleBox.style.gap = "8px";
        titleBox.createEl("strong", { text: profile.name });
        if (isActive) {
            const badge = titleBox.createSpan();
            badge.style.fontSize = "0.75em";
            badge.style.padding = "2px 8px";
            badge.style.borderRadius = "10px";
            badge.style.background = "var(--interactive-accent)";
            badge.style.color = "var(--text-on-accent)";
            badge.style.fontWeight = "600";
            badge.style.display = "inline-flex";
            badge.style.alignItems = "center";
            badge.style.gap = "5px";
            const dot = badge.createSpan({ text: "●" });
            dot.style.color = "#22c55e";
            dot.style.textShadow = "0 0 4px rgba(34,197,94,0.8)";
            badge.createSpan({ text: "ĐANG DÙNG" });
        } else {
            const setActiveBtn = titleBox.createEl("button", { text: "Đặt làm active" });
            setActiveBtn.style.fontSize = "0.75em";
            setActiveBtn.style.padding = "2px 8px";
            setActiveBtn.onclick = async () => {
                this.plugin.settings.activeProfileId = profile.id;
                await this.plugin.saveSettings();
                this.plugin.refreshOpenViews();
                this.display();
            };
        }

        const headBtns = head.createDiv();
        const dupBtn = headBtns.createEl("button", { text: "Duplicate" });
        dupBtn.style.marginRight = "4px";
        dupBtn.onclick = async () => {
            const copy = { ...profile, id: newProfileId(), name: profile.name + " (copy)" };
            this.plugin.settings.profiles.push(copy);
            await this.plugin.saveSettings();
            this.display();
        };
        const delBtn = headBtns.createEl("button", { text: "Delete" });
        delBtn.onclick = async () => {
            if (!confirm(`Xoá profile "${profile.name}"?`)) return;
            this.plugin.settings.profiles = this.plugin.settings.profiles.filter(p => p.id !== profile.id);
            if (this.plugin.settings.activeProfileId === profile.id) {
                this.plugin.settings.activeProfileId = this.plugin.settings.profiles[0]?.id || "";
            }
            await this.plugin.saveSettings();
            this.display();
        };

        new Setting(wrap)
            .setName("Tên hiển thị")
            .addText(t => t.setValue(profile.name).onChange(async v => {
                profile.name = v.trim() || "(unnamed)";
                await this.plugin.saveSettings();
            }));

        new Setting(wrap)
            .setName("Provider type")
            .setDesc("Quy tắc dịch request/response. Đa số dùng 'openai-compatible'.")
            .addDropdown(dd => {
                for (const t of PROVIDER_TYPES) dd.addOption(t, t);
                dd.setValue(profile.provider);
                dd.onChange(async v => {
                    profile.provider = v;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(wrap)
            .setName("Base URL")
            .addText(t => {
                t.inputEl.style.width = "100%";
                t.setPlaceholder("https://...").setValue(profile.baseUrl).onChange(async v => {
                    profile.baseUrl = v.trim();
                    await this.plugin.saveSettings();
                });
            });

        if (profile.provider === "chatgpt-oauth") {
            this.renderOAuthSection(wrap, profile);
        } else if (profile.provider === "gemini-oauth") {
            this.renderGeminiOAuthSection(wrap, profile);
        } else if (profile.provider === "anthropic-oauth") {
            this.renderClaudeOAuthSection(wrap, profile);
        } else {
            new Setting(wrap)
                .setName("API Key")
                .setDesc(
                    profile.provider === "ollama"
                        ? "Ollama local không cần key — bỏ trống cũng được."
                        : (profile.provider === "gemini-web" ? "Nhập token của AgentBridge (lấy từ http://localhost:8765/token) làm API Key." : "")
                )
                .addText(t => {
                    t.inputEl.type = "password";
                    t.setPlaceholder("sk-...").setValue(profile.apiKey).onChange(async v => {
                        profile.apiKey = v.trim();
                        await this.plugin.saveSettings();
                    });
                });
        }

        // Model row + Fetch button + datalist for autocomplete
        const modelSetting = new Setting(wrap).setName("Model");
        let modelInput;
        modelSetting.addText(t => {
            modelInput = t.inputEl;
            t.setPlaceholder("model-id").setValue(profile.model).onChange(async v => {
                profile.model = v.trim();
                await this.plugin.saveSettings();
            });
        });

        // Vision toggle
        new Setting(wrap)
            .setName("Hỗ trợ ảnh (vision)")
            .setDesc("Bật nếu model này nhận input ảnh (gpt-4o, claude-sonnet-4, gemini-2.5-pro,…)")
            .addToggle(t => {
                t.setValue(!!profile.vision).onChange(async v => {
                    profile.vision = v;
                    await this.plugin.saveSettings();
                });
            });

        const datalistId = `models-${profile.id}`;
        const datalist = wrap.createEl("datalist");
        datalist.id = datalistId;
        if (modelInput) modelInput.setAttribute("list", datalistId);

        // Container hiện list models đã fetch dạng chips clickable
        const chipsBox = wrap.createDiv({ cls: "obsidian-agent-model-chips" });
        chipsBox.style.display = "flex";
        chipsBox.style.flexWrap = "wrap";
        chipsBox.style.gap = "6px";
        chipsBox.style.marginTop = "6px";
        chipsBox.style.maxHeight = "180px";
        chipsBox.style.overflowY = "auto";

        const renderChips = (models) => {
            chipsBox.empty();
            if (!models || models.length === 0) return;
            const header = chipsBox.createDiv();
            header.style.width = "100%";
            header.style.fontSize = "0.8em";
            header.style.opacity = "0.7";
            header.style.marginBottom = "2px";
            header.setText(`📋 ${models.length} models — click để chọn:`);
            for (const m of models) {
                const chip = chipsBox.createEl("button");
                chip.setText(m);
                chip.style.fontSize = "0.8em";
                chip.style.padding = "2px 8px";
                chip.style.cursor = "pointer";
                if (m === profile.model) {
                    chip.style.background = "var(--interactive-accent)";
                    chip.style.color = "var(--text-on-accent)";
                }
                chip.onclick = async (e) => {
                    e.preventDefault();
                    profile.model = m;
                    if (modelInput) modelInput.value = m;
                    await this.plugin.saveSettings();
                    renderChips(models); // re-render để highlight chip đang chọn
                };
            }
        };

        // Restore chips từ cache nếu có
        if (profile.fetchedModels && profile.fetchedModels.length > 0) {
            for (const m of profile.fetchedModels) {
                const opt = datalist.createEl("option");
                opt.value = m;
            }
            renderChips(profile.fetchedModels);
        }

        // (continues below — placeholder anchor)
        modelSetting.addButton(btn => {
            btn.setButtonText("⟳ Fetch models").setTooltip("Gọi endpoint lấy danh sách models");
            btn.onClick(async () => {
                btn.setDisabled(true);
                btn.setButtonText("Đang fetch...");
                try {
                    const models = await listModels(profile);
                    profile.fetchedModels = models;
                    await this.plugin.saveSettings();
                    datalist.empty();
                    for (const m of models) {
                        const opt = datalist.createEl("option");
                        opt.value = m;
                    }
                    renderChips(models);
                    this.plugin.refreshOpenViews();
                    new Notice(`Lấy được ${models.length} models.`);
                } catch (e) {
                    new Notice(`Fetch failed: ${e.message}`, 6000);
                    console.error(e);
                } finally {
                    btn.setDisabled(false);
                    btn.setButtonText("⟳ Fetch models");
                }
            });
        });
    }

    renderOAuthSection(wrap, profile) {
        const isLoggedIn = !!profile.refreshToken;
        const status = wrap.createDiv({ cls: "obsidian-agent-oauth-status" });
        status.style.padding = "10px";
        status.style.borderRadius = "6px";
        status.style.marginBottom = "10px";
        status.style.fontSize = "0.9em";

        if (isLoggedIn) {
            status.style.background = "rgba(34,197,94,0.1)";
            status.style.border = "1px solid rgba(34,197,94,0.4)";
            const line1 = status.createDiv();
            line1.innerHTML = `<strong>✓ Đã login</strong> — plan: <code>${profile.planType || "?"}</code>`;
            const line2 = status.createDiv();
            line2.style.fontSize = "0.85em";
            line2.style.opacity = "0.8";
            line2.innerHTML = `Account: <code>${profile.accountId || "?"}</code> · Hết hạn: ${profile.expiresAt ? new Date(profile.expiresAt).toLocaleString() : "?"}`;
        } else {
            status.style.background = "rgba(239,68,68,0.1)";
            status.style.border = "1px solid rgba(239,68,68,0.4)";
            status.setText("⚠ Chưa login. Click 'Bắt đầu Login' bên dưới.");
        }

        new Setting(wrap)
            .setName(isLoggedIn ? "Login lại / đổi tài khoản" : "Bắt đầu login")
            .setDesc("Mở browser để xác thực ChatGPT, sau đó copy URL callback paste lại đây.")
            .addButton(btn => {
                btn.setButtonText("Bắt đầu Login").setCta();
                btn.onClick(() => this.startCodexLogin(profile));
            });

        if (isLoggedIn) {
            new Setting(wrap)
                .setName("Refresh tokens thủ công")
                .setDesc("Force refresh access token ngay (bình thường tự động refresh khi gần hết hạn).")
                .addButton(btn => {
                    btn.setButtonText("⟳ Refresh");
                    btn.onClick(async () => {
                        btn.setDisabled(true);
                        try {
                            await ensureFreshCodexProfile(this.plugin, profile);
                            new Notice("Đã refresh tokens.");
                            this.display();
                        } catch (e) {
                            new Notice(`Refresh failed: ${e.message}`, 6000);
                        } finally {
                            btn.setDisabled(false);
                        }
                    });
                })
                .addButton(btn => {
                    btn.setButtonText("Logout").setWarning();
                    btn.onClick(async () => {
                        if (!confirm("Logout — xoá tokens khỏi profile này?")) return;
                        delete profile.accessToken;
                        delete profile.refreshToken;
                        delete profile.idToken;
                        delete profile.accountId;
                        delete profile.planType;
                        delete profile.expiresAt;
                        delete profile.lastRefreshAt;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });
        }
    }

    async startCodexLogin(profile) {
        const pkce = await generatePkce();
        const state = generateOAuthState();
        const url = buildCodexAuthorizeUrl(state, pkce.codeChallenge);

        const modal = new CodexLoginModal(this.app, this.plugin, profile, {
            authorizeUrl: url,
            expectedState: state,
            codeVerifier: pkce.codeVerifier,
            onDone: () => this.display(),
        });
        modal.open();
    }

    renderGeminiOAuthSection(wrap, profile) {
        const isLoggedIn = !!profile.refreshToken;
        const status = wrap.createDiv({ cls: "obsidian-agent-oauth-status" });
        status.style.padding = "10px";
        status.style.borderRadius = "6px";
        status.style.marginBottom = "10px";
        status.style.fontSize = "0.9em";

        if (isLoggedIn) {
            status.style.background = "rgba(34,197,94,0.1)";
            status.style.border = "1px solid rgba(34,197,94,0.4)";
            const line1 = status.createDiv();
            line1.innerHTML = `<strong>✓ Đã login</strong> — tier: <code>${profile.tier || "?"}</code>`;
            const line2 = status.createDiv();
            line2.style.fontSize = "0.85em";
            line2.style.opacity = "0.8";
            const projDisp = profile.projectId ? `<code>${profile.projectId}</code>` : "<em>(server-managed)</em>";
            line2.innerHTML = `Email: <code>${profile.email || "?"}</code> · Project: ${projDisp} · Hết hạn: ${profile.expiresAt ? new Date(profile.expiresAt).toLocaleString() : "?"}`;
        } else {
            status.style.background = "rgba(239,68,68,0.1)";
            status.style.border = "1px solid rgba(239,68,68,0.4)";
            status.setText("⚠ Chưa login. Click 'Bắt đầu Login' bên dưới.");
        }

        // Public installed-app creds của Gemini CLI — người dùng tự dán (KHÔNG hardcode trong plugin).
        new Setting(wrap)
            .setName("Gemini OAuth Client ID")
            .setDesc("Client ID công khai (installed-app) của Gemini CLI — bắt buộc để login OAuth.")
            .addText(t => {
                t.inputEl.style.width = "100%";
                t.setPlaceholder("xxxxx.apps.googleusercontent.com").setValue(profile.oauthClientId || "").onChange(async v => {
                    profile.oauthClientId = v.trim();
                    await this.plugin.saveSettings();
                });
            });
        new Setting(wrap)
            .setName("Gemini OAuth Client Secret")
            .setDesc("Client secret công khai đi kèm (GOCSPX-…) lấy từ Gemini CLI. Lưu trong data.json (đã gitignore).")
            .addText(t => {
                t.inputEl.type = "password";
                t.inputEl.style.width = "100%";
                t.setPlaceholder("GOCSPX-…").setValue(profile.oauthClientSecret || "").onChange(async v => {
                    profile.oauthClientSecret = v.trim();
                    await this.plugin.saveSettings();
                });
            });

        // Optional GCP project ID input — chỉ cần cho Standard/Enterprise tier
        new Setting(wrap)
            .setName("GCP Project ID (tuỳ chọn)")
            .setDesc("Để trống để Code Assist auto-detect / tự manage. Chỉ cần nhập nếu đang dùng Code Assist Standard/Enterprise và muốn bind project cụ thể.")
            .addText(t => {
                t.inputEl.style.width = "100%";
                t.setPlaceholder("my-gcp-project-id (optional)").setValue(profile.projectId || "").onChange(async v => {
                    profile.projectId = v.trim() || null;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(wrap)
            .setName(isLoggedIn ? "Login lại / đổi tài khoản" : "Bắt đầu login")
            .setDesc("Mở browser xác thực Google → Google sẽ hiển thị 1 đoạn code → copy code đó paste lại đây.")
            .addButton(btn => {
                btn.setButtonText("Bắt đầu Login").setCta();
                btn.onClick(() => this.startGeminiLogin(profile));
            });

        if (isLoggedIn) {
            new Setting(wrap)
                .setName("Refresh tokens thủ công")
                .setDesc("Force refresh access token ngay (bình thường tự động refresh khi gần hết hạn).")
                .addButton(btn => {
                    btn.setButtonText("⟳ Refresh");
                    btn.onClick(async () => {
                        btn.setDisabled(true);
                        try {
                            // Force refresh: clear lastRefreshAt + expiresAt
                            profile.lastRefreshAt = null;
                            profile.expiresAt = null;
                            await ensureFreshGeminiProfile(this.plugin, profile);
                            new Notice("Đã refresh tokens.");
                            this.display();
                        } catch (e) {
                            new Notice(`Refresh failed: ${e.message}`, 6000);
                        } finally {
                            btn.setDisabled(false);
                        }
                    });
                })
                .addButton(btn => {
                    btn.setButtonText("Logout").setWarning();
                    btn.onClick(async () => {
                        if (!confirm("Logout — xoá tokens khỏi profile này?")) return;
                        delete profile.accessToken;
                        delete profile.refreshToken;
                        delete profile.idToken;
                        delete profile.email;
                        delete profile.tier;
                        delete profile.expiresAt;
                        delete profile.lastRefreshAt;
                        delete profile.onboardedAt;
                        // Giữ projectId nếu user đã nhập tay (tiện login lại)
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });
        }
    }

    async startGeminiLogin(profile) {
        let creds;
        try { creds = geminiOAuthCreds(profile); }
        catch (e) { new Notice(e.message, 8000); return; }
        const pkce = await generatePkce();
        const state = generateOAuthState();
        const url = buildGeminiAuthorizeUrl(state, pkce.codeChallenge, creds.clientId);

        const modal = new GeminiLoginModal(this.app, this.plugin, profile, {
            authorizeUrl: url,
            expectedState: state,
            codeVerifier: pkce.codeVerifier,
            onDone: () => this.display(),
        });
        modal.open();
    }

    renderClaudeOAuthSection(wrap, profile) {
        const isLoggedIn = !!profile.refreshToken;
        const status = wrap.createDiv({ cls: "obsidian-agent-oauth-status" });
        status.style.padding = "10px";
        status.style.borderRadius = "6px";
        status.style.marginBottom = "10px";
        status.style.fontSize = "0.9em";

        if (isLoggedIn) {
            status.style.background = "rgba(34,197,94,0.1)";
            status.style.border = "1px solid rgba(34,197,94,0.4)";
            const line1 = status.createDiv();
            line1.innerHTML = `<strong>✓ Đã login</strong>${profile.planType ? ` — plan: <code>${profile.planType}</code>` : ""}`;
            const line2 = status.createDiv();
            line2.style.fontSize = "0.85em";
            line2.style.opacity = "0.8";
            line2.innerHTML = `Hết hạn: ${profile.expiresAt ? new Date(profile.expiresAt).toLocaleString() : "?"}`;
        } else {
            status.style.background = "rgba(239,68,68,0.1)";
            status.style.border = "1px solid rgba(239,68,68,0.4)";
            status.setText("⚠ Chưa login. Click 'Bắt đầu Login' bên dưới.");
        }

        const note = wrap.createDiv();
        note.style.padding = "8px 10px";
        note.style.background = "rgba(234,179,8,0.1)";
        note.style.border = "1px solid rgba(234,179,8,0.4)";
        note.style.borderRadius = "6px";
        note.style.marginBottom = "12px";
        note.style.fontSize = "0.85em";
        note.innerHTML = "<strong>⚠ Lưu ý:</strong> Provider này dùng token OAuth của <strong>subscription Claude Pro/Max</strong> (luồng login của Claude Code). Dùng subscription trong app bên thứ ba có thể <strong>vi phạm Terms của Anthropic</strong> — rủi ro khoá tài khoản. Cho personal use; muốn 'đúng luật' thì dùng provider <code>anthropic</code> bằng API key.";

        new Setting(wrap)
            .setName(isLoggedIn ? "Login lại / đổi tài khoản" : "Bắt đầu login")
            .setDesc("Mở browser xác thực Claude (claude.ai) → trang callback hiện 1 đoạn code → copy code đó paste lại đây.")
            .addButton(btn => {
                btn.setButtonText("Bắt đầu Login").setCta();
                btn.onClick(() => this.startClaudeLogin(profile));
            });

        if (isLoggedIn) {
            new Setting(wrap)
                .setName("Refresh tokens thủ công")
                .setDesc("Force refresh access token ngay (bình thường tự động refresh khi gần hết hạn).")
                .addButton(btn => {
                    btn.setButtonText("⟳ Refresh");
                    btn.onClick(async () => {
                        btn.setDisabled(true);
                        try {
                            profile.lastRefreshAt = null;
                            profile.expiresAt = null;
                            await ensureFreshClaudeProfile(this.plugin, profile);
                            new Notice("Đã refresh tokens.");
                            this.display();
                        } catch (e) {
                            new Notice(`Refresh failed: ${e.message}`, 6000);
                        } finally {
                            btn.setDisabled(false);
                        }
                    });
                })
                .addButton(btn => {
                    btn.setButtonText("Logout").setWarning();
                    btn.onClick(async () => {
                        if (!confirm("Logout — xoá tokens khỏi profile này?")) return;
                        delete profile.accessToken;
                        delete profile.refreshToken;
                        delete profile.idToken;
                        delete profile.accountId;
                        delete profile.planType;
                        delete profile.expiresAt;
                        delete profile.lastRefreshAt;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });
        }
    }

    async startClaudeLogin(profile) {
        const pkce = await generatePkce();
        const state = generateOAuthState();
        const url = buildClaudeAuthorizeUrl(state, pkce.codeChallenge);

        const modal = new ClaudeLoginModal(this.app, this.plugin, profile, {
            authorizeUrl: url,
            expectedState: state,
            codeVerifier: pkce.codeVerifier,
            onDone: () => this.display(),
        });
        modal.open();
    }
}

class CodexLoginModal extends Modal {
    constructor(app, plugin, profile, ctx) {
        super(app);
        this.plugin = plugin;
        this.profile = profile;
        this.ctx = ctx;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: "Login ChatGPT Subscription" });

        const step1 = contentEl.createDiv();
        step1.createEl("h4", { text: "1. Mở URL này trong browser:" });
        const linkBox = step1.createEl("div");
        linkBox.style.padding = "8px";
        linkBox.style.background = "var(--background-secondary)";
        linkBox.style.borderRadius = "4px";
        linkBox.style.wordBreak = "break-all";
        linkBox.style.fontSize = "0.8em";
        linkBox.style.fontFamily = "monospace";
        linkBox.setText(this.ctx.authorizeUrl);

        const btnRow = step1.createDiv();
        btnRow.style.display = "flex";
        btnRow.style.gap = "8px";
        btnRow.style.marginTop = "8px";

        const openBtn = btnRow.createEl("button", { text: "🌐 Mở browser" });
        openBtn.onclick = () => openExternalUrl(this.ctx.authorizeUrl);
        const copyBtn = btnRow.createEl("button", { text: "📋 Copy URL" });
        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(this.ctx.authorizeUrl);
            new Notice("Đã copy URL.");
        };

        const step2 = contentEl.createDiv();
        step2.style.marginTop = "20px";
        step2.createEl("h4", { text: "2. Sau khi consent, browser sẽ redirect tới localhost:1455 (báo lỗi không kết nối được — bình thường). Copy toàn bộ URL trên address bar paste vào đây:" });

        const ta = step2.createEl("textarea");
        ta.style.width = "100%";
        ta.style.height = "80px";
        ta.style.fontFamily = "monospace";
        ta.style.fontSize = "0.85em";
        ta.placeholder = "http://localhost:1455/auth/callback?code=...&state=...";

        const submitRow = contentEl.createDiv();
        submitRow.style.marginTop = "12px";
        submitRow.style.display = "flex";
        submitRow.style.justifyContent = "flex-end";
        submitRow.style.gap = "8px";

        const cancelBtn = submitRow.createEl("button", { text: "Huỷ" });
        cancelBtn.onclick = () => this.close();

        const submitBtn = submitRow.createEl("button", { text: "Hoàn tất login" });
        submitBtn.classList.add("mod-cta");
        submitBtn.onclick = async () => {
            const url = ta.value.trim();
            if (!url) { new Notice("Paste URL callback trước đã."); return; }
            submitBtn.disabled = true;
            submitBtn.textContent = "Đang xử lý...";
            try {
                const { code, state } = parseCodexCallbackUrl(url);
                if (state !== this.ctx.expectedState) throw new Error("State không khớp — có thể URL bị tamper hoặc sai phiên login.");
                const tokens = await codexExchangeCode(code, this.ctx.codeVerifier);
                const info = codexExtractAccountInfo(tokens.id_token, tokens.access_token);
                const exp = codexAccessTokenExpiry(tokens.access_token);
                const now = new Date();
                this.profile.accessToken = tokens.access_token;
                this.profile.refreshToken = tokens.refresh_token;
                this.profile.idToken = tokens.id_token || null;
                this.profile.accountId = info.accountId || null;
                this.profile.planType = info.planType || null;
                this.profile.expiresAt = exp ? exp.toISOString() : null;
                this.profile.lastRefreshAt = now.toISOString();
                await this.plugin.saveSettings();
                new Notice(`✓ Login OK — plan: ${info.planType || "?"}`);
                this.close();
                this.ctx.onDone && this.ctx.onDone();
            } catch (e) {
                new Notice(`Login failed: ${e.message}`, 8000);
                console.error(e);
                submitBtn.disabled = false;
                submitBtn.textContent = "Hoàn tất login";
            }
        };
    }
    onClose() { this.contentEl.empty(); }
}

class GeminiLoginModal extends Modal {
    constructor(app, plugin, profile, ctx) {
        super(app);
        this.plugin = plugin;
        this.profile = profile;
        this.ctx = ctx;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: "Login Gemini Code Assist (Google)" });

        const note = contentEl.createDiv();
        note.style.padding = "8px 10px";
        note.style.background = "rgba(234,179,8,0.1)";
        note.style.border = "1px solid rgba(234,179,8,0.4)";
        note.style.borderRadius = "6px";
        note.style.marginBottom = "12px";
        note.style.fontSize = "0.85em";
        note.innerHTML = "<strong>⚠ Lưu ý:</strong> Provider này dùng Code Assist API <code>v1internal</code> — endpoint nội bộ của Google, chia sẻ client_id với Gemini CLI. Schema có thể đổi không báo trước. Dùng cho personal use, KHÔNG khuyến khích deploy commercial.";

        const step1 = contentEl.createDiv();
        step1.createEl("h4", { text: "1. Mở URL này trong browser, login Google + Authorize:" });
        const linkBox = step1.createEl("div");
        linkBox.style.padding = "8px";
        linkBox.style.background = "var(--background-secondary)";
        linkBox.style.borderRadius = "4px";
        linkBox.style.wordBreak = "break-all";
        linkBox.style.fontSize = "0.8em";
        linkBox.style.fontFamily = "monospace";
        linkBox.setText(this.ctx.authorizeUrl);

        const btnRow = step1.createDiv();
        btnRow.style.display = "flex";
        btnRow.style.gap = "8px";
        btnRow.style.marginTop = "8px";

        const openBtn = btnRow.createEl("button", { text: "🌐 Mở browser" });
        openBtn.onclick = () => openExternalUrl(this.ctx.authorizeUrl);
        const copyBtn = btnRow.createEl("button", { text: "📋 Copy URL" });
        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(this.ctx.authorizeUrl);
            new Notice("Đã copy URL.");
        };

        const step2 = contentEl.createDiv();
        step2.style.marginTop = "20px";
        step2.createEl("h4", { text: "2. Sau khi authorize, Google hiển thị 1 đoạn code (vd '4/0Ab...'). Copy đoạn code đó paste vào đây:" });

        const ta = step2.createEl("textarea");
        ta.style.width = "100%";
        ta.style.height = "80px";
        ta.style.fontFamily = "monospace";
        ta.style.fontSize = "0.85em";
        ta.placeholder = "4/0Ab... (paste code hoặc full URL nếu redirect đi đâu đó)";

        const submitRow = contentEl.createDiv();
        submitRow.style.marginTop = "12px";
        submitRow.style.display = "flex";
        submitRow.style.justifyContent = "flex-end";
        submitRow.style.gap = "8px";

        const cancelBtn = submitRow.createEl("button", { text: "Huỷ" });
        cancelBtn.onclick = () => this.close();

        const submitBtn = submitRow.createEl("button", { text: "Hoàn tất login" });
        submitBtn.classList.add("mod-cta");
        submitBtn.onclick = async () => {
            const raw = ta.value.trim();
            if (!raw) { new Notice("Paste code trước đã."); return; }
            submitBtn.disabled = true;
            submitBtn.textContent = "Đang xử lý...";
            try {
                const { code, state } = parseGeminiCallbackInput(raw);
                // State chỉ check khi Google echo về (full URL); raw code không có state
                if (state && state !== this.ctx.expectedState) {
                    throw new Error("State không khớp — có thể URL bị tamper hoặc sai phiên login.");
                }
                submitBtn.textContent = "Trao đổi token...";
                const tokens = await geminiExchangeCode(code, this.ctx.codeVerifier, geminiOAuthCreds(this.profile));
                const now = new Date();
                const expiresAt = new Date(now.getTime() + (tokens.expires_in || 3600) * 1000);

                this.profile.accessToken = tokens.access_token;
                this.profile.refreshToken = tokens.refresh_token || null;
                this.profile.idToken = tokens.id_token || null;
                this.profile.email = geminiExtractEmail(tokens.id_token);
                this.profile.expiresAt = expiresAt.toISOString();
                this.profile.lastRefreshAt = now.toISOString();
                if (!this.profile.refreshToken) {
                    new Notice("⚠ Không nhận được refresh_token — có thể prompt=consent bị skip. Logout và login lại.", 8000);
                }
                await this.plugin.saveSettings();

                submitBtn.textContent = "Onboarding Code Assist...";
                try {
                    const setup = await geminiSetupUser(tokens.access_token, this.profile.projectId || null);
                    this.profile.tier = setup.tier;
                    if (setup.projectId) this.profile.projectId = setup.projectId;
                    this.profile.onboardedAt = new Date().toISOString();
                    await this.plugin.saveSettings();
                    new Notice(`✓ Login OK — tier: ${setup.tier}${setup.projectId ? ", project: " + setup.projectId : ""}`);
                } catch (setupErr) {
                    console.error("Code Assist setup failed:", setupErr);
                    new Notice(`Login OK nhưng onboarding lỗi: ${setupErr.message}. Có thể vẫn dùng được nếu account đã onboard sẵn.`, 10000);
                }
                this.close();
                this.ctx.onDone && this.ctx.onDone();
            } catch (e) {
                new Notice(`Login failed: ${e.message}`, 8000);
                console.error(e);
                submitBtn.disabled = false;
                submitBtn.textContent = "Hoàn tất login";
            }
        };
    }
    onClose() { this.contentEl.empty(); }
}

class ClaudeLoginModal extends Modal {
    constructor(app, plugin, profile, ctx) {
        super(app);
        this.plugin = plugin;
        this.profile = profile;
        this.ctx = ctx;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl("h2", { text: "Login Claude Subscription (Anthropic)" });

        const note = contentEl.createDiv();
        note.style.padding = "8px 10px";
        note.style.background = "rgba(234,179,8,0.1)";
        note.style.border = "1px solid rgba(234,179,8,0.4)";
        note.style.borderRadius = "6px";
        note.style.marginBottom = "12px";
        note.style.fontSize = "0.85em";
        note.innerHTML = "<strong>⚠ Lưu ý:</strong> Dùng token OAuth của subscription Claude Pro/Max trong app bên thứ ba có thể vi phạm Terms của Anthropic (rủi ro khoá tài khoản). Personal use.";

        const step1 = contentEl.createDiv();
        step1.createEl("h4", { text: "1. Mở URL này trong browser, login Claude + Authorize:" });
        const linkBox = step1.createEl("div");
        linkBox.style.padding = "8px";
        linkBox.style.background = "var(--background-secondary)";
        linkBox.style.borderRadius = "4px";
        linkBox.style.wordBreak = "break-all";
        linkBox.style.fontSize = "0.8em";
        linkBox.style.fontFamily = "monospace";
        linkBox.setText(this.ctx.authorizeUrl);

        const btnRow = step1.createDiv();
        btnRow.style.display = "flex";
        btnRow.style.gap = "8px";
        btnRow.style.marginTop = "8px";

        const openBtn = btnRow.createEl("button", { text: "🌐 Mở browser" });
        openBtn.onclick = () => openExternalUrl(this.ctx.authorizeUrl);
        const copyBtn = btnRow.createEl("button", { text: "📋 Copy URL" });
        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(this.ctx.authorizeUrl);
            new Notice("Đã copy URL.");
        };

        const step2 = contentEl.createDiv();
        step2.style.marginTop = "20px";
        step2.createEl("h4", { text: "2. Sau khi authorize, trang callback hiển thị 1 đoạn code (dạng 'xxxx#yyyy'). Copy toàn bộ paste vào đây:" });

        const ta = step2.createEl("textarea");
        ta.style.width = "100%";
        ta.style.height = "80px";
        ta.style.fontFamily = "monospace";
        ta.style.fontSize = "0.85em";
        ta.placeholder = "paste code (vd abc123#def456) hoặc full URL nếu redirect";

        const submitRow = contentEl.createDiv();
        submitRow.style.marginTop = "12px";
        submitRow.style.display = "flex";
        submitRow.style.justifyContent = "flex-end";
        submitRow.style.gap = "8px";

        const cancelBtn = submitRow.createEl("button", { text: "Huỷ" });
        cancelBtn.onclick = () => this.close();

        const submitBtn = submitRow.createEl("button", { text: "Hoàn tất login" });
        submitBtn.classList.add("mod-cta");
        submitBtn.onclick = async () => {
            const raw = ta.value.trim();
            if (!raw) { new Notice("Paste code trước đã."); return; }
            submitBtn.disabled = true;
            submitBtn.textContent = "Đang xử lý...";
            try {
                const { code, state } = parseClaudeCallbackInput(raw);
                if (state && this.ctx.expectedState && state !== this.ctx.expectedState) {
                    throw new Error("State không khớp — có thể sai phiên login. Login lại.");
                }
                submitBtn.textContent = "Trao đổi token...";
                const tokens = await claudeExchangeCode(code, state || this.ctx.expectedState, this.ctx.codeVerifier);
                const now = new Date();
                const expiresAt = new Date(now.getTime() + (tokens.expires_in || 3600) * 1000);
                const info = claudeExtractAccountInfo(tokens.access_token);

                this.profile.accessToken = tokens.access_token;
                this.profile.refreshToken = tokens.refresh_token || null;
                this.profile.accountId = info.accountId || null;
                this.profile.planType = info.planType || null;
                this.profile.expiresAt = expiresAt.toISOString();
                this.profile.lastRefreshAt = now.toISOString();
                if (!this.profile.refreshToken) {
                    new Notice("⚠ Không nhận được refresh_token — logout và login lại.", 8000);
                }
                await this.plugin.saveSettings();
                new Notice(`✓ Login OK${info.planType ? " — plan: " + info.planType : ""}`);
                this.close();
                this.ctx.onDone && this.ctx.onDone();
            } catch (e) {
                new Notice(`Login failed: ${e.message}`, 8000);
                console.error(e);
                submitBtn.disabled = false;
                submitBtn.textContent = "Hoàn tất login";
            }
        };
    }
    onClose() { this.contentEl.empty(); }
}

module.exports = class ObsidianAgentPlugin extends Plugin {
    async loadSettings() {
        const raw = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, raw || {});

        // Deep-merge userProfile (Object.assign nông sẽ clobber default nếu data.json lưu partial)
        this.settings.userProfile = Object.assign({}, DEFAULT_SETTINGS.userProfile, (raw && raw.userProfile) || {});
        this.settings.maintenance = Object.assign({}, DEFAULT_SETTINGS.maintenance, (raw && raw.maintenance) || {});

        // Auto-detect onboarded: nếu CHƯA onboarded nhưng vault đã có bộ não _agent/CLAUDE.md ⇒ coi như đã onboarded.
        // (Vault mới chưa onboard sẽ KHÔNG có _agent/CLAUDE.md — file này chỉ được tạo ở cuối onboarding.)
        if (!this.settings.onboarded) {
            const hasAgentBrain = !!this.app.vault.getAbstractFileByPath("_agent/CLAUDE.md");
            if (hasAgentBrain) {
                this.settings.onboarded = true;
                if (!this.settings.userProfile.honorific) this.settings.userProfile.honorific = "sếp";
                await this.saveSettings();
            }
        }

        // Migration: legacy flat config { apiKey, baseUrl, model } → 1 profile
        if (raw && raw.apiKey !== undefined && (!raw.profiles || raw.profiles.length === 0)) {
            const legacy = {
                id: newProfileId(),
                name: "Trollllm (legacy)",
                provider: "openai-compatible",
                apiKey: raw.apiKey || "",
                baseUrl: raw.baseUrl || PROVIDER_PRESETS.trollllm.baseUrl,
                model: raw.model || PROVIDER_PRESETS.trollllm.model
            };
            this.settings.profiles = [legacy];
            this.settings.activeProfileId = legacy.id;
            // Cleanup legacy keys
            delete this.settings.apiKey;
            delete this.settings.baseUrl;
            delete this.settings.model;
            await this.saveSettings();
        }

        // Migration: ensure every profile has vision flag (Phase 3 prep)
        let needSave = false;
        for (const p of this.settings.profiles) {
            if (typeof p.vision !== "boolean") {
                migrateProfileSchema(p);
                needSave = true;
            }
        }
        if (!Array.isArray(this.settings.contextExcludeFolders)) {
            this.settings.contextExcludeFolders = DEFAULT_FOLDER_EXCLUDES;
            needSave = true;
        }
        if (needSave) await this.saveSettings();
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    getActiveProfile() {
        if (!this.settings.profiles || this.settings.profiles.length === 0) return null;
        return this.settings.profiles.find(p => p.id === this.settings.activeProfileId)
            || this.settings.profiles[0];
    }

    refreshOpenViews() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_OBSIDIAN_AGENT);
        for (const leaf of leaves) {
            if (leaf.view && typeof leaf.view.refreshHeaderProfile === "function") {
                leaf.view.refreshHeaderProfile();
            }
        }
    }

    // === MCP NotebookLM lifecycle (lazy-start) ===
    async maybeStartMCP() {
        if (!this.settings.mcp || !this.settings.mcp.notebooklmEnabled) {
            throw new Error("NotebookLM MCP chưa bật trong Settings");
        }
        if (!require('obsidian').Platform.isDesktopApp) {
            throw new Error("MCP chỉ hoạt động trên desktop");
        }
        if (this.mcpNotebookLM && this.mcpNotebookLM.initialized) return this.mcpNotebookLM;
        if (this.mcpStartingPromise) return await this.mcpStartingPromise;

        this.mcpStartingPromise = (async () => {
            try {
                this.mcpNotebookLM = new MCPClient(
                    this.settings.mcp.notebooklmCommand,
                    this.settings.mcp.notebooklmArgs || [],
                    {
                        onLog: (...a) => console.log("[bob-mcp]", ...a),
                        requestTimeoutMs: this.settings.mcp.notebooklmTimeoutMs || 180000
                    }
                );
                await this.mcpNotebookLM.start();
                new Notice(`✓ NotebookLM MCP ready — ${this.mcpNotebookLM.tools.length} tools`);
                return this.mcpNotebookLM;
            } catch (e) {
                new Notice(`NotebookLM MCP start failed: ${e.message}`, 8000);
                console.error("[bob-mcp] start failed:", e);
                this.mcpNotebookLM = null;
                throw e;
            } finally {
                this.mcpStartingPromise = null;
            }
        })();
        return await this.mcpStartingPromise;
    }

    stopMCP() {
        if (this.mcpNotebookLM) {
            try { this.mcpNotebookLM.stop(); } catch {}
            this.mcpNotebookLM = null;
        }
    }

    // ============================================================
    // VAULT MAINTENANCE (deterministic) — registry, naming, config, snapshot
    // ============================================================
    _maintExclTop() {
        return new Set([".git", ".obsidian", ".omx", ".claude", "_agent", "Clippings"]);
    }

    _maintToday() {
        const d = new Date(), p = n => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    // Trả tên đúng theo công thức naming, null nếu đã đúng.
    _maintNamingFix(name) {
        let m;
        if ((m = name.match(/^(\d+)\.\s+(\S.*)$/))) return `${m[1]}.${m[2]}`;            // "1. WHY" -> "1.WHY"
        if ((m = name.match(/^(\d+(?:\.\d+)+)([^\s.\d].*)$/))) return `${m[1]} ${m[2]}`; // "6.1Active" -> "6.1 Active" (tên bắt đầu bằng ký tự không-số để tránh nuốt "2.2.10")
        return null;
    }

    _maintAllFolders() {
        return this.app.vault.getAllLoadedFiles().filter(f => f && f.children !== undefined && f.path && f.path !== "/");
    }

    _maintExcluded(path, excludeKalix) {
        const parts = path.split("/");
        if (this._maintExclTop().has(parts[0])) return true;
        if (parts.some(p => p === ".obsidian")) return true;
        if (excludeKalix && parts[0] === "99.KALIX SYSTEM") return true;
        return false;
    }

    async _maintIsInNestedVault(folderPath) {
        const parts = folderPath.split("/");
        for (let i = 1; i < parts.length; i++) { // tổ tiên (không gồm chính nó)
            const anc = parts.slice(0, i).join("/");
            try { if (await this.app.vault.adapter.exists(`${anc}/.obsidian`)) return true; } catch {}
        }
        return false;
    }

    _maintCountMd(folderPath, allMd) {
        const prefix = folderPath + "/";
        let c = 0;
        for (const f of allMd) {
            if (f.path.startsWith(prefix) && !f.path.includes("/.obsidian/")) c++;
        }
        return c;
    }

    async _maintFixNaming(excludeKalix) {
        const fixes = [];
        const cands = this._maintAllFolders()
            .filter(f => !this._maintExcluded(f.path, excludeKalix))
            .map(f => ({ f, newName: this._maintNamingFix(f.name) }))
            .filter(x => x.newName);
        cands.sort((a, b) => b.f.path.split("/").length - a.f.path.split("/").length); // sâu trước
        for (const { f, newName } of cands) {
            if (await this._maintIsInNestedVault(f.path)) continue;
            const parent = (f.parent && f.parent.path && f.parent.path !== "/") ? f.parent.path + "/" : "";
            const newPath = parent + newName;
            if (this.app.vault.getAbstractFileByPath(newPath)) { fixes.push(`SKIP (tồn tại): ${newPath}`); continue; }
            try { await this.app.fileManager.renameFile(f, newPath); fixes.push(`${f.path}  ->  ${newPath}`); }
            catch (e) { fixes.push(`FAIL: ${f.path} (${e.message})`); }
        }
        return fixes;
    }

    _maintScanFolders(maxDepth) {
        const allMd = this.app.vault.getMarkdownFiles();
        const rows = [];
        for (const f of this._maintAllFolders()) {
            const parts = f.path.split("/");
            if (this._maintExclTop().has(parts[0])) continue;
            if (parts.some(p => p === ".obsidian")) continue;
            if (parts.length > maxDepth) continue;
            rows.push({ path: f.path, count: this._maintCountMd(f.path, allMd) });
        }
        rows.sort((a, b) => a.path.localeCompare(b.path, "vi"));
        return rows;
    }

    _maintParseFoldersBlock(content) {
        const map = new Map();
        const m = content.match(/<!--\s*AUTO:FOLDERS:START\s*-->([\s\S]*?)<!--\s*AUTO:FOLDERS:END\s*-->/);
        if (!m) return map;
        for (const line of m[1].split("\n")) {
            const t = line.indexOf("\t");
            if (t > 0) { const p = line.slice(0, t).trim(); const c = parseInt(line.slice(t + 1)); if (p) map.set(p, isNaN(c) ? 0 : c); }
        }
        return map;
    }

    async _maintRegenFolders() {
        const path = "_agent/folders.md";
        const file = this.app.vault.getAbstractFileByPath(path);
        const oldMap = this._maintParseFoldersBlock(file ? await this.app.vault.read(file) : "");
        const rows = this._maintScanFolders(99); // liệt kê TẤT CẢ level (không cap depth)
        const newMap = new Map(rows.map(r => [r.path, r.count]));

        const added = [...newMap.keys()].filter(p => !oldMap.has(p));
        const removed = [...oldMap.keys()].filter(p => !newMap.has(p));
        const renames = [];
        const usedA = new Set();
        for (const r of removed) {
            const cand = added.find(a => !usedA.has(a) && newMap.get(a) === oldMap.get(r));
            if (cand) { usedA.add(cand); renames.push(`${r}  →?  ${cand} (cùng ${oldMap.get(r)} note)`); }
        }
        const pureAdded = added.filter(a => !usedA.has(a));
        const pureRemoved = removed.filter(r => !renames.some(x => x.startsWith(r + "  →?")));
        const emptyLeaf = rows.filter(r => r.count === 0).map(r => r.path);

        // build file
        const allMd = this.app.vault.getMarkdownFiles();
        const top = this._maintAllFolders()
            .filter(f => f.parent && f.parent.path === "/" && !this._maintExclTop().has(f.name))
            .map(f => ({ name: f.name, count: this._maintCountMd(f.path, allMd) }))
            .sort((a, b) => a.name.localeCompare(b.name, "vi"));
        const total = top.reduce((s, t) => s + t.count, 0);
        const now = `${this._maintToday()} ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
        const L = [];
        L.push("# Folders — Registry cấu trúc vault (TỰ ĐỘNG)\n");
        L.push("> **Nguồn cấu trúc CHUẨN** cho agent. Plugin obsidian-agent tự regenerate mỗi lần bảo trì.");
        L.push("> KHÔNG sửa tay file này — mọi thay đổi sẽ bị ghi đè. Đổi cấu trúc thì sửa folder thật rồi chạy bảo trì.");
        L.push(`> Cập nhật: ${now} · Machine block: liệt kê TẤT CẢ folder (mọi level) để route chính xác tới sub-folder sâu nhất.\n`);
        L.push("## Top-level (note đệ quy)\n");
        L.push("| Folder | Note |"); L.push("|---|---|");
        for (const t of top) L.push(`| \`${t.name}/\` | ${t.count} |`);
        L.push(`\n**Tổng (trừ _agent/Clippings/.obsidian): ~${total} note**\n`);
        L.push("## Machine block — path\\tnote_count (tất cả level)\n");
        L.push("<!-- AUTO:FOLDERS:START -->");
        L.push("```tsv");
        for (const r of rows) L.push(`${r.path}\t${r.count}`);
        L.push("```");
        L.push("<!-- AUTO:FOLDERS:END -->");
        await this._maintWriteFile(path, L.join("\n") + "\n");

        const summaryParts = [];
        if (renames.length) summaryParts.push(`possible rename/move (${renames.length}):\n` + renames.map(x => "  - " + x).join("\n"));
        if (pureAdded.length) summaryParts.push(`added (${pureAdded.length}):\n` + pureAdded.map(x => "  - " + x).join("\n"));
        if (pureRemoved.length) summaryParts.push(`removed (${pureRemoved.length}):\n` + pureRemoved.map(x => "  - " + x).join("\n"));
        const attention = [];
        if (emptyLeaf.length) attention.push(`Folder rỗng (${emptyLeaf.length}): ` + emptyLeaf.slice(0, 20).join(" · "));
        return { summary: summaryParts.join("\n") || "(không đổi)", attention, rows, top, total };
    }

    _maintReplaceBlock(content, name, inner) {
        const re = new RegExp(`(<!--\\s*AUTO:${name}:START\\s*-->)[\\s\\S]*?(<!--\\s*AUTO:${name}:END\\s*-->)`);
        if (!re.test(content)) return null;
        return content.replace(re, `$1\n${inner}\n$2`);
    }

    async _maintRegenAutoBlocks(scan) {
        const out = [];
        const NOTES = {
            "1.CAPTURE": "Inbox raw — chỉ đọc",
            "2.INPUT": "Kho tri thức chính (FOUNDATION/COGNITIVE/CHUYÊN MÔN + 4.DEV NOTE)",
            "3.PROCESS": "00.ACTIVE (phòng ban) + 02.PROJECTS (dự án Kalix)",
            "4.OUTPUT": "Artifact frozen (7 sub)",
            "5.RESOURCE": "Assets: template, people, books, attachments, marp-themes, tools-reference",
            "6.PROBLEM HUB": "6.1 Active / 6.2 Solved / 6.3 Symptoms / _Hub cha",
            "7.ARCHIVES": "Lỗi thời — tham chiếu",
            "8.TRACK": "Daily / Weekly / Monthly Reviews / Meetings",
            "99.KALIX SYSTEM": "Zone riêng — KHÔNG route từ PKM"
        };
        // CLAUDE.md snapshot
        const snapLines = [`**Tổng ~${scan.total} note** (.md, trừ \`.obsidian\` / \`Clippings\` / \`_agent\`) — cập nhật ${this._maintToday()}. Phân bổ theo top-folder:`, "", "| Folder | Note | Ghi chú |", "|---|---|---|"];
        for (const t of scan.top) snapLines.push(`| \`${t.name}/\` | ${t.count} | ${NOTES[t.name] || ""} |`);
        await this._maintUpdateFileBlock("_agent/CLAUDE.md", "SNAPSHOT", snapLines.join("\n"), out);

        // index.md inventory — depth ≤ 2, dạng cây
        const invRows = scan.rows.filter(r => r.path.split("/").length <= 2);
        const invLines = [`_Cập nhật ${this._maintToday()} — cấu trúc chi tiết: [[folders]]._`, ""];
        let curTop = "";
        for (const r of invRows) {
            const parts = r.path.split("/");
            if (parts.length === 1) { invLines.push(`- **\`${parts[0]}/\`** (${r.count})`); curTop = parts[0]; }
            else invLines.push(`  - \`${parts[1]}/\` (${r.count})`);
        }
        await this._maintUpdateFileBlock("_agent/index.md", "INVENTORY", invLines.join("\n"), out);
        return out;
    }

    // Regen block AUTO:REGISTRY trong index.md — gom MỌI entry note theo folder thật, de-dup theo basename, sort.
    // Agent append entry mới ở cuối file (sau marker END) → lần regen kế ABSORB vào block + dọn stray. KHÔNG đụng prose trước marker START.
    async _maintRegenIndex() {
        const file = this.app.vault.getAbstractFileByPath("_agent/index.md");
        if (!file || file.children) return { ok: false, reason: "không thấy index.md" };
        const content = await this.app.vault.read(file);
        // basename -> folder (note vault thật; vault.getMarkdownFiles tự loại .obsidian/.git/.claude)
        const base2folder = new Map();
        for (const f of this.app.vault.getMarkdownFiles()) {
            if (!base2folder.has(f.basename)) base2folder.set(f.basename, f.parent ? f.parent.path : "/");
        }
        // gom entry toàn file TRỪ block AUTO:INVENTORY → de-dup theo basename (giữ dòng dài nhất = nhiều summary nhất)
        const invRe = /<!--\s*AUTO:INVENTORY:START\s*-->[\s\S]*?<!--\s*AUTO:INVENTORY:END\s*-->/;
        const byBase = new Map();
        for (const line of content.replace(invRe, "").split("\n")) {
            const m = line.match(/^\s*-\s*\[\[([^\]|#]+)/);
            if (!m) continue;
            const b = m[1].trim(), cand = line.trim(), cur = byBase.get(b);
            if (!cur || cand.length > cur.length) byBase.set(b, cand);
        }
        const byFolder = new Map();
        for (const [b, line] of byBase) {
            const fo = base2folder.get(b);
            if (!fo) continue; // entry trỏ note không còn tồn tại → loại (orphan)
            if (!byFolder.has(fo)) byFolder.set(fo, []);
            byFolder.get(fo).push(line);
        }
        const reg = [`_Tự sinh bởi maintenance — gom theo folder, de-dup. ${byBase.size} note / ${byFolder.size} folder. KHÔNG sửa tay giữa marker._`, ""];
        for (const fo of [...byFolder.keys()].sort()) { reg.push("### " + fo); for (const l of byFolder.get(fo).sort()) reg.push(l); reg.push(""); }
        const inner = reg.join("\n");
        // head = phần TRƯỚC marker START (prose + inventory + stats). Phần từ START trở đi bị thay = block mới (absorb stray).
        const startIdx = content.search(/<!--\s*AUTO:REGISTRY:START\s*-->/);
        const head = startIdx >= 0
            ? content.slice(0, startIdx).replace(/\s*$/, "")
            : content.replace(/\s*$/, "") + "\n\n## Registry — toàn bộ note theo folder (tự động)\n> Maintenance tự regen block dưới (gom folder + de-dup).";
        const next = `${head}\n\n<!-- AUTO:REGISTRY:START -->\n${inner}\n<!-- AUTO:REGISTRY:END -->\n`;
        if (next !== content) await this.app.vault.modify(file, next);
        return { ok: true, notes: byBase.size, folders: byFolder.size };
    }

    // Regen block AUTO:STATS trong index.md — số liệu vault tự động (llm_managed, registry, capture ingest ratio).
    async _maintRegenStats(idxNotes) {
        const mc = this.app.metadataCache;
        const WIKI = new Set(["2.INPUT", "3.PROCESS", "4.OUTPUT", "6.PROBLEM HUB", "7.ARCHIVES", "8.TRACK"]);
        let llm = 0; const ingested = new Set(); const caps = [];
        for (const f of this.app.vault.getMarkdownFiles()) {
            const top = f.path.split("/")[0];
            if (top === "1.CAPTURE") { caps.push(f); continue; }
            if (!WIKI.has(top)) continue;
            const fm = mc.getFileCache(f) && mc.getFileCache(f).frontmatter;
            if (!fm) continue;
            if (fm.llm_managed === true) llm++;
            if (Array.isArray(fm.sources)) for (const s of fm.sources) {
                const m = String(s).match(/1\.CAPTURE\/(.+?)(?:\.md)?$/);
                if (m) ingested.add(m[1].split("/").pop());
            }
        }
        const traced = caps.filter(f => ingested.has(f.basename)).length;
        const missing = (idxNotes != null && llm > idxNotes) ? ` (⚠️ ~${llm - idxNotes} note chưa vào index — xem lint \`notesNotInIndex\`)` : "";
        const lines = [
            `_Tự động — cập nhật ${this._maintToday()}._`, "",
            `- Trang \`llm_managed\` (wiki): **${llm}**`,
            `- Note trong registry index: **${idxNotes != null ? idxNotes : "?"}**${missing}`,
            `- CAPTURE đã ingest (cite trong \`sources\`): **${traced}/${caps.length}**`,
            `- CAPTURE chưa ingest: **${caps.length - traced}** (1.CAPTURE là inbox raw — KHÔNG bắt buộc ingest; cận trên)`,
        ];
        const out = [];
        await this._maintUpdateFileBlock("_agent/index.md", "STATS", lines.join("\n"), out);
        return out;
    }

    async _maintUpdateFileBlock(path, blockName, inner, out) {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (!file || file.children) { out.push(`${path}: không tìm thấy`); return; }
        const content = await this.app.vault.read(file);
        const next = this._maintReplaceBlock(content, blockName, inner);
        if (next === null) {
            // Marker chưa có (vault mới) → self-heal: append block mới có marker (heading đúng theo từng block)
            const HEADINGS = {
                SNAPSHOT: "## Trạng thái vault (tự động)",
                INVENTORY: "## 0. Inventory cấu trúc (tự động)",
                STATS: "## Stats (tự động)",
                REGISTRY: "## Registry — toàn bộ note theo folder (tự động)"
            };
            const heading = `\n\n${HEADINGS[blockName] || `## ${blockName} (tự động)`}\n`;
            const block = `${heading}<!-- AUTO:${blockName}:START -->\n${inner}\n<!-- AUTO:${blockName}:END -->\n`;
            await this.app.vault.modify(file, content + block);
            out.push(`${path}: tạo mới block ${blockName} (self-heal) ✓`);
            return;
        }
        if (next !== content) { await this.app.vault.modify(file, next); out.push(`${path}: cập nhật block ${blockName} ✓`); }
        else out.push(`${path}: block ${blockName} không đổi`);
    }

    async _maintFixConfigPaths() {
        const fixes = [];
        const up = Object.assign({}, this.settings.userProfile || {});
        let changed = false;
        const tryFix = (key, isFolder) => {
            const val = (up[key] || "").replace(/^\/+|\/+$/g, "");
            if (!val) return;
            if (this.app.vault.getAbstractFileByPath(val)) return; // còn đúng
            const base = val.split("/").pop();
            const matches = isFolder
                ? this._maintAllFolders().filter(f => f.name === base)
                : this.app.vault.getFiles().filter(f => f.name === base);
            if (matches.length === 1) { up[key] = matches[0].path; changed = true; fixes.push(`${key}: "${val}" -> "${matches[0].path}"`); }
            else fixes.push(`${key}: "${val}" KHÔNG resolve (${matches.length} match) — cần sửa tay`);
        };
        tryFix("tasksFile", false);
        tryFix("templatesFolder", true);
        if (changed) { this.settings.userProfile = up; await this.saveSettings(); this.refreshOpenViews(); }
        return fixes;
    }

    // Phát hiện template mới/biến mất trong templatesFolder so với catalog _agent/templates.md
    async _maintRegenTemplates() {
        const tpl = (this.settings.userProfile && this.settings.userProfile.templatesFolder || "").replace(/^\/+|\/+$/g, "");
        if (!tpl) return { newTemplates: [], stale: [] };
        const folder = this.app.vault.getAbstractFileByPath(tpl);
        if (!folder || !folder.children) return { newTemplates: [], stale: [] };
        // self-heal: vault mới chưa có _agent/templates.md → tạo skeleton catalog (header + bảng chính rỗng + marker AUTO)
        let catFile = this.app.vault.getAbstractFileByPath("_agent/templates.md");
        if (!catFile) {
            const skeleton = `---\ntitle: Catalog Template\nllm_managed: true\n---\n\n# Templates — Catalog template\n\n> Bảng chọn template: trigger user gõ → file → type → dùng khi. Maintenance tự phát hiện template mới (block dưới); Bob phân loại điền vào BẢNG CHÍNH.\n\n## Bảng chính\n\n| Trigger | File | type | Dùng khi |\n|---|---|---|---|\n\n## Auto-detected (chờ phân loại)\n\n<!-- AUTO:TEMPLATES-NEW:START -->\n_(chưa có template mới)_\n<!-- AUTO:TEMPLATES-NEW:END -->\n`;
            try { catFile = await this.app.vault.create("_agent/templates.md", skeleton); }
            catch (e) { return { newTemplates: [], stale: [] }; }
        }
        if (!catFile || catFile.children) return { newTemplates: [], stale: [] };

        const actual = folder.children.filter(c => !c.children && c.name.endsWith(".md")).map(c => c.name);
        const content = await this.app.vault.read(catFile);
        const beforeBlock = content.split("<!-- AUTO:TEMPLATES-NEW:START -->")[0]; // chỉ tính filename ở phần curated
        const known = new Set(beforeBlock.match(/[A-Za-z0-9_-]+\.md/g) || []);
        const newTemplates = actual.filter(f => !known.has(f));
        const stale = [...known].filter(f => !actual.includes(f));

        // Xóa dòng bảng trỏ template đã bị xoá (đối xứng với add). Match filename nguyên token để không nuốt nhầm (vd "note.md" vs "daily-note.md").
        let working = content;
        if (stale.length) {
            working = working.split("\n").filter(line => {
                if (!line.trimStart().startsWith("|")) return true;            // giữ dòng không phải row bảng
                const files = line.match(/[A-Za-z0-9_-]+\.md/g) || [];
                return !files.some(f => stale.includes(f));                     // bỏ row trỏ file đã xoá
            }).join("\n");
        }

        let inner;
        if (newTemplates.length) {
            const rows = ["| Trigger (Bob điền) | File | type | Dùng khi (Bob điền) |", "|---|---|---|---|"];
            for (const f of newTemplates) {
                let type = "?";
                try {
                    const c = await this.app.vault.read(this.app.vault.getAbstractFileByPath(`${tpl}/${f}`));
                    const m = c.match(/^type:\s*([^\s#]+)/m);
                    if (m) type = m[1];
                } catch {}
                rows.push(`| ⚠️TODO-trigger | ${f} | ${type} | ⚠️TODO-dùng-khi |`);
            }
            inner = rows.join("\n");
        } else {
            inner = "_(chưa có template mới)_";
        }
        const replaced = this._maintReplaceBlock(working, "TEMPLATES-NEW", inner);
        const next = replaced !== null ? replaced : working;
        if (next !== content) await this.app.vault.modify(catFile, next);
        return { newTemplates, stale };
    }

    // LINT deterministic — phát hiện drift link/index/MOC/routing (dùng metadataCache, không đọc 1900 file)
    async _maintLint() {
        const mc = this.app.metadataCache;
        const vault = this.app.vault;
        const mdFiles = vault.getMarkdownFiles();
        const WIKI_TOPS = new Set(["2.INPUT", "3.PROCESS", "4.OUTPUT", "6.PROBLEM HUB", "7.ARCHIVES", "8.TRACK"]);
        const cap = (arr) => arr.length > 30 ? arr.slice(0, 30).concat([`…+${arr.length - 30} nữa`]) : arr;
        const r = { notesNotInIndex: [], brokenNav: [], brokenContent: [], captureLinks: [], fullPathLinks: [], mocMissingNotes: [], clustersNoMoc: [], routingMissingFolder: [], routingDeadFolder: [], captureNotIngested: [] };

        const readF = async (p) => { const f = vault.getAbstractFileByPath(p); return (f && !f.children) ? await vault.read(f) : ""; };
        const indexContent = await readF("_agent/index.md");
        const routingContent = await readF("_agent/routing-rules.md");
        const claudeContent = await readF("_agent/CLAUDE.md");

        // Nested vault (folder có .obsidian con) → loại khỏi mọi lint
        const nestedRoots = [];
        for (const fo of this._maintAllFolders()) {
            try { if (await vault.adapter.exists(fo.path + "/.obsidian")) nestedRoots.push(fo.path + "/"); } catch {}
        }
        const inNested = (p) => nestedRoots.some(nr => p.startsWith(nr));
        // Phạm vi quét LINK = note tri thức (WIKI_TOPS) + _agent/index.md. LOẠI: _agent/chats, log, rules (workflows/CLAUDE/routing/templates/memory), 1.CAPTURE, Clippings, 5.RESOURCE, 99.KALIX, nested vault.
        const inLinkScope = (f) => !inNested(f.path) && (WIKI_TOPS.has(f.path.split("/")[0]) || f.path === "_agent/index.md");

        const linkpathOf = (l) => (l.link || "").split("#")[0].split("|")[0].trim();
        // CT-1: nhận diện MOC nới rộng — type:moc HOẶC tên bắt đầu "moc" + space/gạch (bắt "MOC - X", "moc -X", "moc-x", hoa/thường)
        const isMocFile = (f, fm) => (fm && fm.type === "moc") || /^moc[\s\-—]/i.test(f.basename);
        const mocByFolder = new Map();
        const folderNoteCount = new Map();
        const ingestedCaps = new Set();   // basename capture đã được cite trong sources của wiki note
        const captureFiles = [];          // mọi file trong 1.CAPTURE/

        // pass 1: phân loại moc, đếm note/folder, note thiếu index, thu ingest-status của CAPTURE
        for (const f of mdFiles) {
            const top = f.path.split("/")[0];
            if (inNested(f.path)) continue;
            const fm = mc.getFileCache(f) && mc.getFileCache(f).frontmatter;
            const parent = f.parent ? f.parent.path : "/";
            folderNoteCount.set(parent, (folderNoteCount.get(parent) || 0) + 1);
            if (top === "1.CAPTURE") captureFiles.push(f);
            const isMoc = isMocFile(f, fm);
            if (isMoc && WIKI_TOPS.has(top)) mocByFolder.set(parent, f);
            if (WIKI_TOPS.has(top) && fm) {
                // thu basename capture được cite trong frontmatter sources (đối chiếu ingest-status)
                const srcs = fm.sources;
                if (Array.isArray(srcs)) for (const s of srcs) {
                    const m = String(s).match(/1\.CAPTURE\/(.+?)(?:\.md)?$/);
                    if (m) ingestedCaps.add(m[1].split("/").pop());
                }
                if (fm.llm_managed === true && !isMoc && !indexContent.includes(f.basename)) r.notesNotInIndex.push(f.path);
            }
        }
        // CAPTURE chưa ingest (ADVISORY): capture không note wiki nào cite trong sources.
        // Cận trên — capture đổi tên lúc ingest / cite bằng citation string sẽ không bắt được. 1.CAPTURE là inbox raw, không bắt buộc ingest.
        for (const f of captureFiles) {
            if (!ingestedCaps.has(f.basename)) r.captureNotIngested.push(f.path);
        }

        // pass 2: link checks — CHỈ quét file trong phạm vi (note tri thức + index.md)
        // lineCache: trích DÒNG NGUYÊN VĂN chứa link gãy → nhúng vào report làm old_text chính xác cho REPLACE
        const lineCache = new Map();
        const getLineText = async (f, l) => {
            const ln = l.position && l.position.start ? l.position.start.line : null;
            if (ln == null) return "";
            let lines = lineCache.get(f.path);
            if (!lines) { lines = (f.path === "_agent/index.md" ? indexContent : await vault.read(f)).split("\n"); lineCache.set(f.path, lines); }
            return lines[ln] || "";
        };
        for (const f of mdFiles) {
            if (!inLinkScope(f)) continue;
            const cache = mc.getFileCache(f);
            const all = [...((cache && cache.links) || []), ...((cache && cache.embeds) || [])];
            const isMeta = f.path === "_agent/index.md" || f.basename.startsWith("moc-");
            for (const l of all) {
                const lp = linkpathOf(l);
                if (!lp) continue;
                if (lp.startsWith("1.CAPTURE")) r.captureLinks.push(`${f.path} → [[${l.link}]]`);
                if (lp.includes("/") && isMeta) r.fullPathLinks.push(`${f.path} → [[${l.link}]]`);
                if (!mc.getFirstLinkpathDest(lp, f.path)) {
                    // NAV (index/MOC) = dangling thật → must-fix; note nội dung = thường forward-link cố ý → advisory
                    if (isMeta) {
                        const lineText = await getLineText(f, l);
                        r.brokenNav.push(lineText ? `${f.path} → [[${l.link}]]  | DÒNG NGUYÊN VĂN: ${lineText}` : `${f.path} → [[${l.link}]]`);
                    } else {
                        r.brokenContent.push(`${f.path} → [[${l.link}]]`);
                    }
                }
            }
        }

        // ===== pass 3 (CT-4): MOC coverage theo NEAREST-ANCESTOR MOC =====
        // Mỗi note/sub-MOC thuộc MOC gần nhất phía trên → MOC đó phải link. Sub có MOC → cha link sub-MOC;
        // sub chưa MOC → note bubble lên cha (đệ quy). Báo cả THIẾU (phải link) lẫn THỪA (link note đã có MOC con ôm).
        const parentOf = (p) => p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "/";
        const nearestAncestorMOC = (folderPath) => {
            let p = folderPath;
            while (p && p !== "/") {
                if (mocByFolder.has(p)) return { moc: mocByFolder.get(p), folder: p };
                p = parentOf(p);
            }
            return null;
        };
        const mocLinkSet = new Map(); // moc.path → Set(basename các link)
        for (const [folder, moc] of mocByFolder) {
            const c = mc.getFileCache(moc);
            mocLinkSet.set(moc.path, new Set(((c && c.links) || []).map(linkpathOf).map(s => s.split("/").pop())));
        }
        // 3a. note → MOC sở hữu (nearest ancestor) phải link
        for (const f of mdFiles) {
            if (inNested(f.path) || !WIKI_TOPS.has(f.path.split("/")[0])) continue;
            const fm = mc.getFileCache(f) && mc.getFileCache(f).frontmatter;
            if (isMocFile(f, fm) || !(fm && fm.llm_managed === true)) continue;
            const owner = nearestAncestorMOC(f.parent ? f.parent.path : "/");
            if (owner && owner.moc !== f && !mocLinkSet.get(owner.moc.path).has(f.basename)) {
                r.mocMissingNotes.push(`${owner.moc.basename} thiếu [[${f.basename}]]`);
            }
        }
        // 3b. sub-MOC → MOC cha gần nhất (TRÊN folder của sub-MOC) phải link
        for (const [folder, moc] of mocByFolder) {
            const owner = nearestAncestorMOC(parentOf(folder));
            if (owner && owner.moc !== moc && !mocLinkSet.get(owner.moc.path).has(moc.basename)) {
                r.mocMissingNotes.push(`${owner.moc.basename} thiếu [[${moc.basename}]] (sub-MOC)`);
            }
        }
        // 3c. link THỪA (lôm côm): MOC link item NẰM TRONG subtree nó nhưng thuộc MOC con gần hơn
        for (const [folder, moc] of mocByFolder) {
            const links = (mc.getFileCache(moc) && mc.getFileCache(moc).links) || [];
            const seen = new Set();
            for (const l of links) {
                const lp = linkpathOf(l); if (!lp) continue;
                const dest = mc.getFirstLinkpathDest(lp, moc.path);
                if (!dest || dest === moc || seen.has(dest.path)) continue;
                seen.add(dest.path);
                const dFolder = dest.parent ? dest.parent.path : "/";
                if (!dFolder.startsWith(folder + "/")) continue; // chỉ xét link XUỐNG subtree
                const dFm = mc.getFileCache(dest) && mc.getFileCache(dest).frontmatter;
                const owner = nearestAncestorMOC(isMocFile(dest, dFm) ? parentOf(dFolder) : dFolder);
                if (owner && owner.moc !== moc) {
                    r.mocMissingNotes.push(`${moc.basename} link THỪA [[${dest.basename}]] — thuộc [[${owner.moc.basename}]], nên gỡ`);
                }
            }
        }

        // ===== pass 4 (CT-2): cụm note CHƯA được MOC nào ôm (advisory) =====
        const uncovered = mdFiles.filter(f => {
            if (inNested(f.path) || !WIKI_TOPS.has(f.path.split("/")[0])) return false;
            const fm = mc.getFileCache(f) && mc.getFileCache(f).frontmatter;
            if (isMocFile(f, fm) || !(fm && fm.llm_managed === true)) return false;
            return !nearestAncestorMOC(f.parent ? f.parent.path : "/");
        });
        const wikiFolders = this._maintAllFolders().filter(fo => WIKI_TOPS.has(fo.path.split("/")[0]) && !inNested(fo.path));
        const uncoveredUnder = (fp) => uncovered.filter(f => { const pp = f.parent ? f.parent.path : "/"; return pp === fp || pp.startsWith(fp + "/"); }).length;
        for (const fo of wikiFolders) {
            const cnt = uncoveredUnder(fo.path);
            if (cnt < 15) continue;
            const pp = parentOf(fo.path);
            if (wikiFolders.some(x => x.path === pp) && uncoveredUnder(pp) >= 15) continue; // chỉ báo folder cao nhất của vùng
            r.clustersNoMoc.push(`${fo.path} (${cnt} note chưa được MOC nào ôm → nên tạo MOC)`);
        }

        // pass 5: routing-rules — folder domain (depth 2-3) tồn tại nhưng CHƯA nhắc + folder nhắc đã MẤT
        const allFolders = this._maintAllFolders();
        for (const fo of allFolders) {
            const parts = fo.path.split("/");
            if (!WIKI_TOPS.has(parts[0]) && parts[0] !== "2.INPUT") continue;
            if (parts.length < 2 || parts.length > 3) continue;        // chỉ cấp domain/layer
            if (parts.some(p => p === ".obsidian")) continue;
            if (!routingContent.includes(fo.name)) r.routingMissingFolder.push(fo.path);
        }
        // dead folder-ref trong routing + CLAUDE (advisory). routing-rules dùng path NGẮN → check theo BASENAME folder có tồn tại ở đâu đó trong vault, KHÔNG dùng full-path resolve (tránh 100+ false-positive).
        const folderBasenames = new Set(allFolders.map(f => f.name));
        for (const [p, content] of [["routing-rules.md", routingContent], ["CLAUDE.md", claudeContent]]) {
            const toks = content.match(/`(\d+[^`]*?\/[^`]*|\d+\.[^`\/]+)`/g) || [];
            const seen = new Set();
            for (const t of toks) {
                const path = t.replace(/`/g, "").replace(/\/+$/, "").trim();
                if (!path || path.includes("...") || path.includes("<") || path.includes("{") || path.includes(" — ") || seen.has(path)) continue;
                seen.add(path);
                const base = path.split("/").pop();
                // chỉ flag khi basename folder KHÔNG tồn tại ở bất kỳ đâu (folder thật đã đổi tên/mất) — bỏ qua path ngắn vẫn có folder hợp lệ
                if (!folderBasenames.has(base) && !vault.getAbstractFileByPath(path)) r.routingDeadFolder.push(`${p}: \`${path}\``);
            }
        }

        for (const k of Object.keys(r)) r[k] = cap(r[k]);
        return r;
    }

    async _maintWriteFile(path, content) {
        const f = this.app.vault.getAbstractFileByPath(path);
        if (f && !f.children) await this.app.vault.modify(f, content);
        else if (!f) await this.app.vault.create(path, content);
    }

    async _maintAppendLog(lines) {
        if (!lines.length) return;
        const f = this.app.vault.getAbstractFileByPath("_agent/log.md");
        if (f && !f.children) { const ex = await this.app.vault.read(f); await this.app.vault.modify(f, ex + "\n" + lines.join("\n") + "\n"); }
    }

    async _maintGit(args) {
        return new Promise((resolve) => {
            try {
                const { spawn } = require("child_process");
                const p = spawn("git", args, { cwd: this.app.vault.adapter.basePath });
                let out = "", err = "";
                p.stdout.on("data", d => out += d); p.stderr.on("data", d => err += d);
                p.on("close", code => resolve({ code, out, err }));
                p.on("error", e => resolve({ code: -1, out: "", err: e.message }));
            } catch (e) { resolve({ code: -1, out: "", err: e.message }); }
        });
    }

    async _maintGitCheckpoint(label) {
        if (!require("obsidian").Platform.isDesktopApp) return { ok: false, reason: "không phải desktop" };
        const repo = await this._maintGit(["rev-parse", "--is-inside-work-tree"]);
        if (repo.code !== 0) return { ok: false, reason: "không có git repo" };
        await this._maintGit(["add", "-A"]);
        const commit = await this._maintGit(["commit", "-m", label]);
        return { ok: true, committed: commit.code === 0 };
    }

    async runMaintenance(opts = {}) {
        const manual = !!opts.manual;
        const m = this.settings.maintenance;
        const today = this._maintToday();
        const report = [`# Maintenance Report — ${today} ${new Date().toLocaleTimeString("vi-VN")}`, `Mode: ${m.mode}${manual ? " (manual)" : " (scheduled)"}`, ""];
        const log = [];

        let gitOk = false;
        if (m.gitCheckpoint) {
            const cp = await this._maintGitCheckpoint(`chore(maintenance): checkpoint trước bảo trì ${today}`);
            gitOk = cp.ok;
            report.push(`## Git checkpoint`, cp.ok ? (cp.committed ? "✓ committed" : "✓ (nothing to commit)") : "✗ " + cp.reason, "");
        }

        const diffUser = await this._maintRegenFolders();                 // diff vs lần chạy trước = thay đổi của user
        const namingFixes = await this._maintFixNaming(m.excludeKalix);   // rename
        const scan = await this._maintRegenFolders();                     // refresh folders.md sau rename
        const cfgFixes = await this._maintFixConfigPaths();
        const tplRes = await this._maintRegenTemplates();
        const blockRes = await this._maintRegenAutoBlocks(scan);
        const idxRes = await this._maintRegenIndex();
        const statsRes = await this._maintRegenStats(idxRes.notes);
        const lint = await this._maintLint();

        report.push(`## Naming auto-fix (${namingFixes.length})`, namingFixes.length ? namingFixes.map(x => "- " + x).join("\n") : "- (không có)", "");
        report.push(`## Config path fix`, cfgFixes.length ? cfgFixes.map(x => "- " + x).join("\n") : "- (không có)", "");
        report.push(`## Templates`, [
            tplRes.newTemplates.length ? `Mới (chờ Bob phân loại): ${tplRes.newTemplates.join(", ")}` : "- không có template mới",
            tplRes.stale.length ? `Đã xoá khỏi catalog (file template không còn): ${tplRes.stale.join(", ")}` : ""
        ].filter(Boolean).join("\n"), "");
        report.push(`## Structure diff (thay đổi từ lần chạy trước)`, diffUser.summary, "");
        report.push(`## Auto-blocks`, blockRes.map(x => "- " + x).join("\n"), "");
        report.push(`## Index registry`, idxRes.ok ? `✓ regen: ${idxRes.notes} note / ${idxRes.folders} folder (gom theo folder, de-dup)` : "✗ " + idxRes.reason, "");
        report.push(`## Index stats`, statsRes.map(x => "- " + x).join("\n") || "- (không đổi)", "");

        // LINT — danh sách việc cụ thể cho Bob (Bob PHẢI xử từng item)
        const lintSec = (title, arr) => `### ${title} (${arr.length})\n` + (arr.length ? arr.map(x => "- " + x).join("\n") : "- (không có)");
        report.push("## LINT — Bob phải xử từng item bên dưới (KHÔNG báo 'clean' nếu còn item)",
            lintSec("Note thiếu trong index.md → thêm entry", lint.notesNotInIndex),
            lintSec("Broken link trong index/MOC (navigation dangling) → SỬA", lint.brokenNav),
            lintSec("Full-path wikilink trong index/MOC → đổi về bare [[basename]]", lint.fullPathLinks),
            lintSec("Link [[1.CAPTURE/...]] trong body wiki → gỡ", lint.captureLinks),
            lintSec("MOC coverage (nearest-ancestor) — THIẾU link phải có / THỪA link nên gỡ", lint.mocMissingNotes),
            lintSec("Folder domain tồn tại nhưng routing-rules CHƯA nhắc → bổ sung luật routing", lint.routingMissingFolder),
            "",
            "## LINT — ADVISORY (chỉ LIỆT KÊ, Bob KHÔNG tự sửa trừ khi user yêu cầu)",
            lintSec("Cụm note chưa được MOC nào ôm (≥15) → đề xuất tạo MOC", lint.clustersNoMoc),
            lintSec("📥 Backlog: capture chưa được cite trong wiki sources (1.CAPTURE là inbox raw — KHÔNG bắt buộc ingest; con số là cận trên)", lint.captureNotIngested),
            lintSec("⚠️ Broken link trong NOTE nội dung — phần lớn là forward-link CỐ Ý (trỏ note chưa tạo). KHÔNG tự xóa/sửa.", lint.brokenContent),
            lintSec("⚠️ folder-path trong routing/CLAUDE không resolve (có thể false-positive từ ví dụ SAI) → xem, sửa path nếu thật sự chết", lint.routingDeadFolder),
            "");

        const attention = [...new Set([...(diffUser.attention || []), ...(scan.attention || [])])];
        report.push(`## Cần phán đoán (folder rỗng...)`, (attention.length ? attention.map(x => "- " + x).join("\n") : "- (không có)"));
        await this._maintWriteFile("_agent/maintenance-report.md", report.join("\n") + "\n");

        const lintTotal = Object.values(lint).reduce((s, a) => s + a.filter(x => !String(x).startsWith("…+")).length, 0);
        log.push(`${today} | MAINTENANCE | deterministic${manual ? " (manual)" : ""}: rename ${namingFixes.length}, config ${cfgFixes.filter(s => s.includes("->")).length}, template-mới ${tplRes.newTemplates.length}, lint-items ${lintTotal}, blocks ${blockRes.length}`);
        for (const x of namingFixes) log.push(`${today} | MAINT-RENAME | ${x}`);
        for (const x of cfgFixes.filter(s => s.includes("->"))) log.push(`${today} | MAINT-CONFIG | ${x}`);
        if (tplRes.newTemplates.length) log.push(`${today} | MAINT-TEMPLATE | mới (chờ phân loại): ${tplRes.newTemplates.join(", ")}`);
        if (tplRes.stale.length) log.push(`${today} | MAINT-TEMPLATE | xoá khỏi catalog (file không còn): ${tplRes.stale.join(", ")}`);
        await this._maintAppendLog(log);

        if (m.gitCheckpoint && gitOk) { await this._maintGit(["add", "-A"]); await this._maintGit(["commit", "-m", `chore(maintenance): auto-sync ${today}`]); }
        return { namingFixes, cfgFixes, scan, gitOk };
    }

    async maybeRunMaintenance(opts = {}) {
        try {
            const m = this.settings.maintenance;
            if (!m || m.mode === "off") return;
            if (!this.settings.onboarded) return; // chờ onboard xong mới bảo trì (vault mới)
            const today = this._maintToday();
            if (!opts.force && m.lastRun === today) return;
            new Notice("🔧 Bob: đang chạy bảo trì vault…", 4000);
            const res = await this.runMaintenance({ manual: !!opts.manual });
            m.lastRun = today; await this.saveSettings();
            if (m.mode === "auto") {
                if (m.gitCheckpoint && !res.gitOk) {
                    new Notice("⚠️ Bob auto BỊ SKIP: git checkpoint thất bại (không có điểm khôi phục). Bật git hoặc tắt 'Git checkpoint' trong Settings.", 9000);
                } else {
                    await this.triggerBobMaintenance();
                }
            } else {
                new Notice("✓ Bảo trì (deterministic) xong — xem _agent/maintenance-report.md", 6000);
            }
        } catch (e) { console.error("[bob-maint] error:", e); new Notice("⚠️ Bảo trì lỗi: " + e.message, 6000); }
    }

    async triggerBobMaintenance() {
        try {
            await this.activateView();
            await new Promise(r => setTimeout(r, 700)); // chờ view render xong (tránh race khi mới tạo leaf)
            const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_OBSIDIAN_AGENT);
            const view = leaves.length ? leaves[0].view : null;
            if (view && typeof view.runMaintenanceTask === "function") {
                await view.runMaintenanceTask();
            }
        } catch (e) { console.error("[bob-maint] triggerBob error:", e); }
    }

    async onload() {
        await this.loadSettings();
        this.mcpNotebookLM = null;
        this.mcpStartingPromise = null;
        this.addSettingTab(new ObsidianAgentSettingTab(this.app, this));

        this.registerView(
            VIEW_TYPE_OBSIDIAN_AGENT,
            (leaf) => new ObsidianAgentChatView(leaf, this)
        );

        this.addRibbonIcon('message-circle', 'Mở Wiki Agent', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-obsidian-agent',
            name: 'Mở khung chat ObsidianAgent',
            callback: () => {
                this.activateView();
            }
        });

        // Add Context Menu to send files/folders directly to Agent
        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                menu.addItem((item) => {
                    item
                        .setTitle("Gửi vào Wiki Agent")
                        .setIcon("message-circle")
                        .onClick(async () => {
                            await this.activateView();
                            const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_OBSIDIAN_AGENT);
                            if (leaves.length > 0) {
                                const view = leaves[0].view;
                                await view.appendFilesToChat([file]);
                            }
                        });
                });
            })
        );

        // Lệnh chạy bảo trì thủ công
        this.addCommand({
            id: 'run-vault-maintenance',
            name: 'Chạy bảo trì vault ngay',
            callback: () => { this.maybeRunMaintenance({ manual: true, force: true }); }
        });

        // Maintenance scheduler — chạy 1 lần/ngày khi Obsidian mở + check mỗi giờ
        this.app.workspace.onLayoutReady(() => {
            setTimeout(() => this.maybeRunMaintenance(), 8000);
        });
        this.registerInterval(window.setInterval(() => this.maybeRunMaintenance(), 60 * 60 * 1000));
    }

    async onunload() {
        this.stopMCP();
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_OBSIDIAN_AGENT);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_OBSIDIAN_AGENT);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_OBSIDIAN_AGENT, active: true });
        }

        workspace.revealLeaf(leaf);
    }
}
