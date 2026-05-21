# Proposal: 行程圖片本地化 — 從網路抓取真實照片

## Why

目前 [index.html](../../index.html) 的景點與美食卡片使用 **Unsplash 通用圖**（透過 `IMG` 常數熱連結，約 198 處引用），與實際地點、店家不符，使用者反饋「圖片看起來沒有變化」。  
行程中標示 **IG熱點** 的項目同樣需要**貼近實際地點**的視覺，但**不要求**從 Instagram 抓圖；改從 Wikimedia、觀光官網、店家官網等公開來源各找**一張代表圖**即可。

本變更建立**可重複執行的圖片管線**：從合法公開來源取得 URL → 下載至 `images/` → 更新行程資料，讓 GitHub Pages 可穩定離線顯示真實場景。**使用者無需準備任何 IG 貼文連結。**

## What Changes

- 新增 `images/`（`days/`、`spots/`、`foods/`）存放壓縮後的本地圖片
- 新增 `data/image-manifest.json` 作為每張圖的來源、狀態、本地路徑唯一真相
- 新增 `scripts/` 管線：`extract-items` → `fetch-wikimedia` / 官網 og:image → `download-images` → `apply-images`
- **景點**：優先 Wikimedia Commons + 觀光協會/景點官網
- **美食**：優先店家官網 `og:image`；代表名店先補齊（約 40 筆），其餘分階段
- **IG熱點項目**：與一般景點相同流程（Wikimedia → 觀光局/官網）；**IG 貼文為可選**，預設不實作、不要求使用者提供
- 更新 `index.html`：每筆 `img` 改為相對路徑（如 `images/spots/d09-spot-palm-swing.jpg`）；移除或精簡 `IMG` Unsplash 常數
- README 補充圖片來源、授權與重跑腳本說明

## Capabilities

### New Capabilities

- `image-manifest`：從行程資料抽出圖片清單、manifest 欄位與狀態機（pending / ok / manual / fallback）
- `image-fetch-pipeline`：Wikimedia API、官網 og:image、下載壓縮、回寫 HTML 的腳本與目錄規範
- `ig-image-handling`：定義 IG熱點 標籤的圖片優先順序（官網/觀光局/Wikimedia 為主；IG 僅可選、預設略過）

### Modified Capabilities

- `spot-cards`：景點卡片封面圖 SHALL 使用本地 `images/` 路徑；載入失敗降級行為保留
- `food-cards`：美食卡片封面圖 SHALL 使用本地 `images/` 路徑；載入失敗降級行為保留

## Impact

- **檔案**：`index.html`、新增 `images/**`、`scripts/**`、`data/image-manifest.json`、`README.md`
- **Repo 體積**：預估 +15~25MB（400px JPEG）；超過 50MB 需再壓縮或 Git LFS
- **部署**：GitHub Pages 直接 serve 靜態圖，不再依賴 Unsplash CDN
- **與 fukuoka-data-layer 關係**：資料結構（spots/foods 物件、`maps`、`tags`）不變，僅 `img` 欄位語意由「外站 URL」改為「本地相對路徑」
- **明確不做**：Google Places API、Tabelog 爬蟲、IG 登入爬蟲、後端服務
