## MODIFIED Requirements

### Requirement: 景點圖片載入降級

景點卡片的封面圖 SHALL 使用 **本地相對路徑**（`images/spots/` 或 `images/days/`），在載入失敗時優雅降級，不影響頁面整體排版。

#### Scenario: 本地圖片正常載入

- **WHEN** 景點 `img` 為 `images/spots/d08-spot-dazaifu.jpg` 且檔案存在
- **THEN** 卡片顯示該真實場景圖片

#### Scenario: 本地圖片無法載入

- **WHEN** 景點 img 路徑回傳 404 或檔案缺失
- **THEN** `onerror` 觸發，圖片替換為含 emoji 的佔位符 div，卡片尺寸維持不變

#### Scenario: fallback 項目

- **WHEN** manifest 該筆 `status` 仍為 `fallback` 且使用外站 URL
- **THEN** 行為與現行 onerror 降級相同，直至補齊本地圖
