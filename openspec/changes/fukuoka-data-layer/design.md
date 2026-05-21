## Context

`index.html` 是一個單檔案的靜態旅遊行程網頁，所有資料、渲染邏輯、CSS 均內嵌其中。
目前景點（spots）為純字串陣列，美食（foods）為物件陣列但缺少 Google Maps 連結且選項稀少。
本次升級在**不引入任何外部依賴或後端**的前提下，完成資料層與 UI 的全面強化。

## Goals / Non-Goals

**Goals:**
- 景點改為帶圖片卡片，橫向可滑動，點擊開 Google Maps
- 美食每個時段擴充至 6~10 間選項，點擊開 Google Maps
- 每間店/景點標示來源標籤（IG 熱點 / 攻略必去 / Tabelog 評分 / 台灣推薦）
- Day 9 行程由福岡市區改為糸島半島
- 宮地嶽神社光之道加入適當天次
- 最終 git push 同步至 GitHub Pages

**Non-Goals:**
- 串接 Google Places API 或 Tabelog API
- 後端資料庫或任何伺服器端邏輯
- 使用者登入、收藏、筆記功能
- 多語言切換

## Decisions

### D1：資料結構：spots 改為物件陣列

**決定**：spots 從 `string[]` 改為 `{name, desc, img, maps, tags}[]`

```js
// Before
spots: ["太宰府天滿宮（學業祈願）"]

// After
spots: [
  {
    name: "太宰府天滿宮",
    desc: "學業祈願・學問之神",
    img: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&q=80",
    maps: "太宰府天満宮",
    tags: ["攻略必去", "IG熱點"]
  }
]
```

**理由**：純字串無法承載圖片 URL、地圖關鍵字與分類標籤，改為物件後向後相容且可擴充。

---

### D2：美食結構：新增 maps、tags、tabelog 欄位

```js
foods: [
  {
    name: "一蘭拉麵 博多本店",
    desc: "獨立隔間・濃厚豚骨・24H 營業",
    img: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=300&q=80",
    maps: "一蘭ラーメン 博多本店",
    tags: ["台灣推薦", "Tabelog 3.71"]
  }
]
```

**理由**：標籤讓使用者一眼判斷店家定位，tabelog 分數直接寫入 tags 字串省去額外欄位解析。

---

### D3：Google Maps 連結格式

**決定**：使用 Google Maps 搜尋 URL，不用 Place ID

```
https://www.google.com/maps/search/?api=1&query=一蘭ラーメン+博多本店
```

**理由**：
- Place ID 需要 API Key 且有費用限制
- 搜尋 URL 免費、無需金鑰、手機上自動跳 Google Maps App
- 對一般使用者而言搜尋結果已足夠精準

**替代方案考慮**：Google Maps Embed API（有免費額度）→ 排除，因為嵌入地圖會增加頁面複雜度且行動端體驗較差。

---

### D4：圖片來源使用 Unsplash 直連

**決定**：所有圖片使用 `images.unsplash.com` 直連 URL，格式：
```
https://images.unsplash.com/photo-{ID}?w=400&q=80&fit=crop
```

**理由**：
- 免費、無需 API Key
- 支援 CDN 加速，全球讀取速度快
- 可透過 URL 參數控制尺寸與品質

**降級處理**：所有 `<img>` 加上 `onerror` handler，圖片載入失敗時顯示 emoji 佔位符。

---

### D5：橫向滑動卡片佈局

**決定**：景點與美食卡片均採用 `display: flex; overflow-x: auto; gap: 12px` 橫向排列

**景點卡片尺寸**：寬 150px，圖片高 100px，下方文字區 + tags + 地圖按鈕
**美食卡片尺寸**：寬 160px，圖片高 110px，下方店名 + 描述 + tags + 地圖按鈕

**理由**：橫向滑動在手機上最自然，不占垂直空間，適合同時展示 6~10 個選項。

---

### D6：標籤顏色系統

| 標籤類型 | 顏色 | 說明 |
|---------|------|------|
| 📸 IG 熱點 | 粉紫 `#c084fc` | IG 打卡爆款 |
| 📖 攻略必去 | 琥珀 `#f59e0b` | 旅遊部落格高頻推薦 |
| 🇹🇼 台灣推薦 | 藍 `#60a5fa` | 台灣人習慣口味 |
| ⭐ Tabelog x.xx | 橘 `#fb923c` | 日本最大餐廳評分 |

## Risks / Trade-offs

| 風險 | 緩解方式 |
|------|---------|
| Unsplash 圖片 URL 失效 | `onerror` 自動降級為 emoji 佔位符 |
| Google Maps 搜尋結果不精準 | 使用日文店名作為關鍵字，精準度較高 |
| 手機橫向滑動與頁面左右滑動衝突 | 卡片容器設定 `touch-action: pan-x` 限制 |
| 離線無法顯示圖片 | 純旅遊展示用途，預設連線環境，可接受 |
| index.html 檔案過大（JS 資料量大） | 目前約 30~40KB，瀏覽器快取後不影響 |

## Migration Plan

1. 直接覆蓋 `index.html`，無需資料庫 migration
2. `git add index.html && git commit && git push`
3. GitHub Pages 自動部署（約 1~2 分鐘生效）
4. 舊版本可透過 git history 還原

## Open Questions

- 糸島行程安排在 Day 9，宮地嶽神社光之道建議放在 Day 8 傍晚（太宰府回程順路）是否合適？
- 深夜時段的地圖連結是否要直接連結到中洲區域地圖，而非個別店家？
