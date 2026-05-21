## ADDED Requirements

### Requirement: Wikimedia 景點圖片解析

`scripts/fetch-wikimedia.js` SHALL 對 `type` 為 `spot` 或 `day-cover` 且 `status` 為 `pending` 的項目，以 `maps` 或日文關鍵字查詢 Wikimedia Commons API，並將取得的縮圖 URL 寫入 `sourceUrl`、`source: wikimedia`。

#### Scenario: 成功取得 Commons 縮圖

- **WHEN** API 回傳至少一張相關圖片
- **THEN** manifest 該筆 `sourceUrl` 設為 400px 寬縮圖 URL，`source` 為 `wikimedia`

#### Scenario: 查無圖片

- **WHEN** API 無結果
- **THEN** `status` 維持 `pending` 或改為需 `manual`，不寫入錯誤 URL

---

### Requirement: 官網 og:image 解析

系統 SHALL 支援對 manifest 中已填 `sourceUrl`（官網首頁）的項目，解析 HTML `og:image` 作為實際下載 URL，`source` 標為 `og-image`。

#### Scenario: 店家官網有 og:image

- **WHEN** 對美食項目執行 og 解析且頁面含 `og:image`
- **THEN** 更新 manifest 的實際圖片 URL 供 download 使用

---

### Requirement: 圖片下載與壓縮

`scripts/download-images.js` SHALL 依 manifest 的 `sourceUrl` 下載檔案至 `localPath`，並將圖片寬度限制為：景點/封面最大 400px、美食最大 300px。

#### Scenario: 下載成功

- **WHEN** HTTP 回應 200 且為圖片
- **THEN** 檔案寫入 `localPath`，`status` 更新為 `ok`

#### Scenario: 請求節流

- **WHEN** 批次下載多筆
- **THEN** 相鄰請求間隔至少 500ms

#### Scenario: 下載失敗

- **WHEN** URL 失效或逾時
- **THEN** `status` 設為 `fallback`，不刪除 manifest 該筆

---

### Requirement: 回寫行程 HTML

`scripts/apply-images.js` SHALL 將 `status: ok` 的項目之 `localPath` 寫回 [index.html](../../../../index.html) 對應的 `img` 欄位。

#### Scenario: 本地路徑寫入

- **WHEN** manifest 項目 `d08-spot-dazaifu` 的 `localPath` 為 `images/spots/d08-spot-dazaifu.jpg`
- **THEN** 太宰府天滿宮對應資料列的 `img` 為該相對路徑

#### Scenario: 目錄結構

- **WHEN** 專案部署至 GitHub Pages
- **THEN** 瀏覽器可透過相對路徑載入 `images/` 下檔案
