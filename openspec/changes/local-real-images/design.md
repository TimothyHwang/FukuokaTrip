# Design: 行程圖片本地化管線

## Context

- 現況：[index.html](../../index.html) 使用 `IMG` 物件指向 Unsplash（約 70 key、198 引用），與實際景點/店家不符。
- 前置變更 [fukuoka-data-layer](../fukuoka-data-layer/design.md) 已完成卡片 UI、Google Maps、`tags`（含 `IG熱點`），並約定不串 Places/Tabelog API。
- 使用者需求：混合來源（景點 Wikimedia/觀光局、美食官網）、**圖片存本地 repo**；並詢問 **IG 能否抓圖**。

## Goals / Non-Goals

**Goals:**

- 每個景點/美食卡片盡可能顯示**與地點相符**的本地圖片
- 透過 manifest + 腳本可重複更新、可人工修正單筆
- `IG熱點` 項目優先使用**官方或使用者提供的 IG 貼文縮圖**（下載後本地化）
- GitHub Pages 部署後圖片穩定、不依賴外站熱連結

**Non-Goals:**

- Instagram 平台**自動化大量爬蟲**（違反 Meta 服務條款、需登入、易失效）
- Google Places Photos API、Tabelog 圖片爬取
- 即時同步 IG 新貼文
- 引入後端或 build 時必須連外網的 runtime 依賴（腳本僅在開發者機器執行）

## Decisions

### D1：manifest 為唯一真相來源

**決定**：`data/image-manifest.json` 記錄每筆圖片的 `id`、`name`、`maps`、`type`、`source`、`sourceUrl`、`localPath`、`status`。

**理由**：198 筆不宜手改 HTML；腳本可 diff、重跑、人工標 `manual`。

**status 值**：

| status | 說明 |
|--------|------|
| `pending` | 尚未解析來源 |
| `ok` | 已下載至 `localPath` |
| `manual` | 人工填入 `sourceUrl`（含 IG 貼文） |
| `fallback` | 暫用 Unsplash 或 emoji 占位 |

---

### D2：景點圖 — Wikimedia API 為主

**決定**：`scripts/fetch-wikimedia.js` 以 `maps`（日文店名/地名）搜尋 Commons，取 `imageinfo` 縮圖 URL（寬 400）。

**備援**：內建 ~15 筆觀光局/景點官網固定 URL（海地獄、金鱗湖、櫛田神社等）。

**替代方案**：Wikipedia 條目主圖 — 覆蓋率較低，僅作第二備援。

---

### D3：美食圖 — 官網 og:image + 半自動

**決定**：代表店在 manifest 手動或半自動填入官網 URL；`scripts/fetch-og-image.js`（可併入 download 前步驟）解析 `<meta property="og:image">`。

**理由**：Tabelog 列表頁反爬且條款不允許批量抓圖；官網 og:image 合法且穩定。

**分階段**：先 ~40 間晚餐/名店；其餘標 `fallback` 後續補。

---

### D4：IG熱點標籤 — 不要求 IG，與其他景點同一套來源

**決定**：`tags` 含 `IG熱點` 僅代表行程分類，**不觸發** IG 下載流程。每個項目（含糸島鞦韆、太宰府星巴克）只需從下列來源取得**一張**圖：

1. **景點/觀光官網**（內建固定 URL 對照表，如 PALM BEACH、宮地嶽神社、別府地獄）
2. **Wikimedia Commons**（以 `maps` 日文關鍵字自動搜尋）
3. **店家官網 og:image**（美食）
4. **fallback**（仍找不到時暫用主題圖或占位）

**IG 為可選增強（預設不做）**：若日後有人提供 `data/ig-posts.json` 貼文 URL，才執行 oEmbed 下載；實作與使用者皆**不必**準備。

**禁止**：IG 登入爬蟲、hashtag 批量搜尋。

**理由**：使用者已確認可不從 IG 找圖；官網與 Wikimedia 足以讓卡片「看得出是哪裡」，且合法、可全自動。

---

### D5：本地檔案命名與壓縮

**決定**：

- 路徑：`images/{days|spots|foods}/{id}.jpg`
- `id` 例：`d09-spot-palm-swing`（英文 slug，避免中文路徑）
- 下載後寬度：景點/封面 400px、美食 300px，JPEG quality ~80

---

### D6：回寫 index.html 策略

**決定**：`scripts/apply-images.js` 依 manifest `id` ↔ 行程項（以 `maps` + `name` 匹配）更新 `img:` 欄位；長期可將 `days` 抽至 `data/itinerary.json`，本次最小改動只改 HTML。

**刪除 `IMG` 常數**：避免雙重維護；未匹配項保留 `onerror` 占位。

## Risks / Trade-offs

| 風險 | 緩解 |
|------|------|
| Wikimedia 搜尋到錯圖 | manifest 人工改 `sourceUrl` 後重跑 download |
| IG oEmbed 失效或限流 | 改用手動下載圖檔；README 說明步驟 |
| 官網無 og:image | fallback 或 Wikimedia 料理圖 |
| repo 過大 | 壓縮、僅保留 Web 用尺寸 |
| 版權 | README 標註來源與個人行程用途；CC 圖保留 author 欄位（可選 credits.json） |

## Migration Plan

1. 執行 `extract-items` 產生 manifest（全 `pending`）
2. `fetch-wikimedia` 處理 spots
3. 填入 `ig-posts.json` + 官網 URL（IG熱點優先）
4. `download-images` → `images/`
5. `apply-images` 更新 `index.html`
6. 本地開頁抽查 → commit → push GitHub Pages
7. 未完成的 `fallback` 項目不阻擋上線

**Rollback**：還原 `index.html` 的 `IMG` Unsplash 常數；刪除 `images/` 提交。

## Open Questions

- 是否要建立 `credits.json` 列出 Wikimedia author？（建議：Phase 2）
- IG 貼文清單由誰維護？（建議：實作時提供 `ig-posts.example.json` 模板）
