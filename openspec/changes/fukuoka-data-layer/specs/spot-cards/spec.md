## ADDED Requirements

### Requirement: 景點圖片卡片渲染
每個時段的景點區塊 SHALL 以橫向可滑動的圖片卡片列呈現，取代原本的純文字標籤。

#### Scenario: 景點卡片正常渲染
- **WHEN** 使用者展開任意行程天的時段
- **THEN** 景點區塊顯示 `<div class="spot-cards">` 容器，內含多張 `.spot-card` 圖片卡片

#### Scenario: 卡片尺寸與版型
- **WHEN** 景點卡片渲染於桌機瀏覽器
- **THEN** 每張卡片寬 150px，封面圖高 100px，下方含名稱、描述與標籤

#### Scenario: 手機橫向滑動
- **WHEN** 使用者在行動裝置上水平滑動景點卡片區塊
- **THEN** 卡片可左右滾動，不觸發整個頁面的水平位移

---

### Requirement: 景點卡片點擊開啟 Google Maps
每張景點卡片 SHALL 在使用者點擊時，於新分頁開啟對應的 Google Maps 搜尋頁面。

#### Scenario: 有 maps 欄位的景點點擊
- **WHEN** 使用者點擊含 maps 欄位的景點卡片
- **THEN** 新分頁開啟 `https://www.google.com/maps/search/?api=1&query={maps}`

#### Scenario: 手機點擊跳 Google Maps App
- **WHEN** 使用者在 iOS/Android 手機上點擊景點卡片
- **THEN** 系統詢問是否用 Google Maps App 開啟（標準行為，由 OS 處理）

---

### Requirement: 景點圖片載入降級
景點卡片的封面圖 SHALL 在載入失敗時優雅降級，不影響頁面整體排版。

#### Scenario: Unsplash 圖片無法載入
- **WHEN** 景點 img URL 回傳錯誤或超時
- **THEN** `onerror` 觸發，圖片替換為含 emoji 的佔位符 div，卡片尺寸維持不變

---

### Requirement: 景點來源標籤
景點卡片 SHALL 根據 tags 陣列顯示對應顏色的來源標籤。

標籤顏色定義：
- `IG熱點` → 粉紫 `#c084fc`
- `攻略必去` → 琥珀 `#f59e0b`
- `🗓 季節限定` → 紅橘 `#f97316`（用於宮地嶽神社等）

#### Scenario: 多標籤顯示
- **WHEN** 景點 tags 陣列含多個值
- **THEN** 所有標籤依序顯示於卡片底部，超出卡片寬度時換行

#### Scenario: 無標籤景點
- **WHEN** 景點 tags 陣列為空或不存在
- **THEN** 標籤區塊不顯示，卡片版型正常
