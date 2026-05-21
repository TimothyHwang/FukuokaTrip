## MODIFIED Requirements

### Requirement: 美食多選項橫向卡片

每個時段的美食推薦 SHALL 以橫向可滑動的卡片列呈現，提供 4~10 間店家供使用者自行選擇；卡片封面圖 SHALL 優先使用 **本地路徑** `images/foods/`。

#### Scenario: 美食卡片橫向排列

- **WHEN** 使用者展開任意時段
- **THEN** 美食區塊顯示 `<div class="food-cards">` 容器，卡片橫向排列可滑動

#### Scenario: 美食卡片數量下限

- **WHEN** 渲染任意白天時段（早餐、上午/下午、晚餐）
- **THEN** 顯示至少 4 張美食卡片

#### Scenario: 本地美食圖載入

- **WHEN** 美食 `img` 為 `images/foods/d01-food-ichiran.jpg` 且檔案存在
- **THEN** 卡片顯示該店家相關圖片（非通用 Unsplash）

#### Scenario: 各地美食依地點篩選

- **WHEN** Day 2 長崎時段渲染美食
- **THEN** 只顯示長崎當地店家，不混入福岡店家
