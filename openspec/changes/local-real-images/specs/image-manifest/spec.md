## ADDED Requirements

### Requirement: 圖片清單自行程資料萃取

系統 SHALL 提供腳本從 [index.html](../../../../index.html) 的 `days` 陣列萃取所有需圖片的項目，並寫入 `data/image-manifest.json`。

萃取範圍 MUST 包含：

- 每日封面 `day.img`
- 各時段 `spots[]` 與 `foods[]` 的 `name`、`maps`、`tags`（若有）
- 項目類型 `day-cover` | `spot` | `food`

#### Scenario: 首次產生 manifest

- **WHEN** 執行 `scripts/extract-items.js`
- **THEN** 產生 `data/image-manifest.json`，每筆含唯一 `id`、初始 `status: pending`、預計 `localPath`

#### Scenario: 穩定 id 命名

- **WHEN** 同一景點在 manifest 中註冊
- **THEN** `id` 格式為 `d{day}-{type}-{slug}`（僅 ASCII），例如 `d09-spot-palm-swing`

---

### Requirement: manifest 欄位結構

每筆 manifest 項目 SHALL 包含以下欄位：

| 欄位 | 必填 | 說明 |
|------|------|------|
| `id` | 是 | 唯一識別 |
| `name` | 是 | 顯示名稱（中文） |
| `maps` | 否 | Google Maps 搜尋字串 |
| `type` | 是 | day-cover / spot / food |
| `tags` | 否 | 複製自行程 tags，供 IG 優先級判斷 |
| `source` | 否 | wikimedia / official / og-image / ig-oembed / manual-file / fallback |
| `sourceUrl` | 否 | 下載來源 URL |
| `localPath` | 是 | 相對路徑，如 `images/spots/d09-spot-palm-swing.jpg` |
| `status` | 是 | pending / ok / manual / fallback |

#### Scenario: IG熱點標記保留

- **WHEN** 行程項目 tags 含 `IG熱點`
- **THEN** manifest 該筆 `tags` 陣列保留 `IG熱點`，供後續 ig-image-handling 流程優先處理
