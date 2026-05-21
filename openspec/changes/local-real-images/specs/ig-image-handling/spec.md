## ADDED Requirements

### Requirement: IG熱點標籤不要求 Instagram 來源

`tags` 含 `IG熱點` 的項目 SHALL 與其他景點/美食使用**相同**圖片取得流程；**不得**要求使用者提供 IG 貼文連結作為實作前提。

#### Scenario: 預設實作路徑

- **WHEN** 執行圖片管線且項目僅有 `IG熱點` 標籤
- **THEN** 依 image-fetch-pipeline 從官網、觀光局、Wikimedia 取得一張代表圖即可

#### Scenario: 無 ig-posts.json

- **WHEN** 專案中不存在 `data/ig-posts.json` 或檔案為空陣列
- **THEN** 管線仍須完成其餘項目的下載，不得失敗或跳過 IG熱點 項目

---

### Requirement: IG熱點項目圖片優先順序

對 manifest 中 `tags` 含 `IG熱點` 的項目，圖片取得 SHALL 依下列優先順序嘗試（每項只需**一張**圖）：

1. 景點/店家**官方網站**或觀光協會公開宣傳圖（內建固定 URL 對照表優先）
2. **Wikimedia Commons**（以 `maps` 搜尋）
3. 店家官網 **og:image**（若為美食）
4. `fallback`（主題圖或占位符）

#### Scenario: 糸島棕櫚樹鞦韆無 IG

- **WHEN** `d09-spot-palm-swing` 標有 `IG熱點` 且未提供任何 IG URL
- **THEN** 從 PALM BEACH 官網或 Wikimedia 下載至 `images/spots/d09-spot-palm-swing.jpg`，`source` 為 `official` 或 `wikimedia`

#### Scenario: 太宰府星巴克

- **WHEN** `d08-spot-dazaifu-starbucks` 需圖片
- **THEN** 優先使用觀光/建築相關公開圖，不需 IG 貼文

---

### Requirement: 禁止 Instagram 自動化爬蟲

系統 MUST NOT 實作以下行為：

- 登入 Instagram 帳號批量下載
- 依 hashtag、地點標籤、關鍵字搜尋 IG 並自動抓圖
- 使用未授權第三方 IG scraper 服務

#### Scenario: 腳本邊界檢查

- **WHEN** 實作圖片取得腳本
- **THEN** 不得包含 IG 搜尋或動態牆爬取邏輯

---

### Requirement: 可選 IG 貼文增強（非必須）

若存在 `data/ig-posts.json` 且某筆含有效 `postUrl`，系統 MAY 透過 oEmbed 下載該貼文縮圖並覆寫對應 `localPath`。

#### Scenario: 有提供 ig-posts 時

- **WHEN** `ig-posts.json` 含 `manifestId` 與公開 `postUrl`
- **THEN** 可選執行 oEmbed 下載，`source` 標為 `ig-oembed`

#### Scenario: 未提供 ig-posts 時

- **WHEN** 使用者未維護 `ig-posts.json`
- **THEN** 跳過 oEmbed 步驟，不影響主要管線完成度
