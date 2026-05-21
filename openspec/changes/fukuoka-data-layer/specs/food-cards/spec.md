## ADDED Requirements

### Requirement: 美食多選項橫向卡片
每個時段的美食推薦 SHALL 以橫向可滑動的卡片列呈現，提供 4~10 間店家供使用者自行選擇。

#### Scenario: 美食卡片橫向排列
- **WHEN** 使用者展開任意時段
- **THEN** 美食區塊顯示 `<div class="food-cards">` 容器，卡片橫向排列可滑動

#### Scenario: 美食卡片數量下限
- **WHEN** 渲染任意白天時段（早餐、上午/下午、晚餐）
- **THEN** 顯示至少 4 張美食卡片

#### Scenario: 各地美食依地點篩選
- **WHEN** Day 2 長崎時段渲染美食
- **THEN** 只顯示長崎當地店家（四海樓、文明堂等），不混入福岡店家

---

### Requirement: 美食卡片點擊開 Google Maps
每張美食卡片 SHALL 在使用者點擊時，於新分頁開啟對應店家的 Google Maps 搜尋。

#### Scenario: 有 maps 欄位的店家
- **WHEN** 使用者點擊含 maps 欄位的美食卡片
- **THEN** 新分頁開啟 `https://www.google.com/maps/search/?api=1&query={maps}`，以日文店名搜尋

#### Scenario: 無 maps 欄位的店家
- **WHEN** 使用者點擊無 maps 欄位的美食卡片
- **THEN** 無任何動作，不跳轉

---

### Requirement: 美食來源標籤
每張美食卡片 SHALL 根據 tags 陣列顯示對應顏色標籤，標示店家的推薦來源。

標籤顏色定義：
- `台灣推薦` → 藍 `#60a5fa`（台灣旅遊部落格推薦）
- `Tabelog 3.xx` → 橘 `#fb923c`（含 Tabelog 評分數字）
- `IG 打卡` → 粉紫 `#c084fc`（IG 熱門、顏值高）

#### Scenario: Tabelog 評分標籤
- **WHEN** 店家 tags 含「Tabelog 3.72」格式字串
- **THEN** 顯示橘色標籤「⭐ 3.72」

#### Scenario: 多來源標籤疊加
- **WHEN** 店家同時有「台灣推薦」與「Tabelog 3.58」
- **THEN** 兩個標籤均顯示於卡片底部

---

### Requirement: 深夜時段美食深色樣式
深夜（late）時段的美食卡片 SHALL 使用深色主題，與白天時段視覺明確區隔。

#### Scenario: 深夜美食卡片背景
- **WHEN** 時段類型為 `late`
- **THEN** `.food-card` 背景色為 `#1a1a30`，文字為淺色，標籤顏色加深處理

#### Scenario: 深夜時段無強制美食數量
- **WHEN** 深夜時段渲染
- **THEN** 美食/場所項目數量不限，可為 2~6 項
