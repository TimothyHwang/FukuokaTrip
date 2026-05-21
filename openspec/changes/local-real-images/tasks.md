# Tasks: local-real-images

## 1. 基礎建設

- [x] 1.1 建立 `images/days`、`images/spots`、`images/foods` 目錄
- [x] 1.2 實作 `scripts/extract-items.js`，產生 `data/image-manifest.json`
## 2. 景點圖片取得（含 IG熱點，同一流程）

- [x] 2.1 實作 `scripts/fetch-wikimedia.js`（Commons API 搜尋 + 寫回 manifest）
- [x] 2.2 內建觀光局/景點官網固定 URL 對照表（糸島、太宰府、別府、宮地嶽等約 20 筆高優先地標）
- [x] 2.3 為 10 張每日封面解析並下載至 `images/days/`

## 3. 美食圖片

- [x] 3.1 為約 40 間代表美食填入官網 URL 並解析 og:image
- [x] 3.2 其餘美食/景點暫標 `fallback`，記錄於 manifest

## 3b. 可選：IG 貼文（預設略過，不要求使用者）

- [x] 3b.1 （可選）略過 — 未實作 IG oEmbed

## 4. 下載與回寫

- [x] 4.1 實作 `scripts/download-images.js`（下載、節流、備援）
- [x] 4.2 實作 `scripts/apply-images.js`，回寫 `index.html` 的 `img` 為 `localPath`
- [x] 4.3 移除 `IMG` Unsplash 常數，改由資料列內嵌路徑

## 5. 文件與驗證

- [x] 5.1 更新 README：圖片來源（Wikimedia/官網）、授權說明、腳本執行順序（註明 IG 非必須）
- [x] 5.2 本地抽查：Day 9 糸島、Day 6 別府、Day 8 太宰府/宮地嶽、代表美食店
- [x] 5.3 確認 repo 體積；必要時再壓縮（目前約 36MB）
- [ ] 5.4 git commit + push，驗證 GitHub Pages 圖片可載入
