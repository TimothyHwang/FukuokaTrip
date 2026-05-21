## 1. CSS 樣式升級

- [ ] 1.1 新增 `.spot-cards` 容器樣式（橫向 flex、overflow-x auto、gap 12px、touch-action pan-x）
- [ ] 1.2 新增 `.spot-card` 卡片樣式（寬 150px、圓角、cursor pointer、hover 上浮效果）
- [ ] 1.3 新增 `.spot-card img` 與 `.spot-card-placeholder` 樣式（高 100px、object-fit cover）
- [ ] 1.4 新增 `.spot-card-info` 下方文字區塊樣式（名稱粗體、描述小字、tags 行）
- [ ] 1.5 新增 `.card-tag` 標籤樣式（IG熱點=粉紫、攻略必去=琥珀、台灣推薦=藍、Tabelog=橘）
- [ ] 1.6 新增 `.food-cards` 容器樣式（同 spot-cards 但 gap 10px）
- [ ] 1.7 更新 `.food-card` 為縱向卡片（寬 160px、圖片高 110px 置頂）
- [ ] 1.8 深夜時段 `.time-slot.late-night` 內的卡片深色樣式覆寫

## 2. JavaScript 渲染函式升級

- [ ] 2.1 新增 `createSpotCard(spot)` 函式，渲染單張景點卡片（含圖片、名稱、描述、tags、地圖連結）
- [ ] 2.2 更新 `createSlotHTML` 中景點區塊：從 `spots.map(s => \`<span>\`)` 改為 `<div class="spot-cards">` + `createSpotCard`
- [ ] 2.3 更新 `createFoodCard(food)` 函式，新增 maps 連結點擊事件與 tags 標籤渲染
- [ ] 2.4 新增 `openMaps(query)` 輔助函式，組成 Google Maps 搜尋 URL 並 `window.open`
- [ ] 2.5 確認 `onerror` 圖片降級邏輯在 spot-card 與 food-card 均正常運作

## 3. 行程資料：景點升級（spots 改為物件陣列）

- [ ] 3.1 Day 1（博多）：4 個景點改為物件，加入 img URL 與 maps 關鍵字與 tags
- [ ] 3.2 Day 2（佐世保+長崎）：4 個景點升級
- [ ] 3.3 Day 3（長崎+熊本）：5 個景點升級
- [ ] 3.4 Day 4（熊本+返福岡）：4 個景點升級
- [ ] 3.5 Day 5（由布院）：5 個景點升級，金鱗湖加「秋冬早晨朝霧 5:00~8:00」標注
- [ ] 3.6 Day 6（別府+返福岡）：4 個景點升級
- [ ] 3.7 Day 7（門司港+下關）：5 個景點升級
- [ ] 3.8 Day 8（太宰府+柳川）：將宮地嶽神社光之道加入傍晚時段，標注「2月/10月下旬限定」
- [ ] 3.9 Day 9：整體行程替換為糸島半島（棕櫚樹鞦韆、夫婦岩、天使之翼、PALM BEACH 海景咖啡等）
- [ ] 3.10 Day 10（返程）：3 個景點升級

## 4. 行程資料：美食擴充（foods 增至 6~10 間）

- [ ] 4.1 Day 1 早餐：擴充至 6 間（加 gelato pique cafe、グラニフカフェ、和カフェTsumugi 等）
- [ ] 4.2 Day 1 午餐：擴充拉麵選項（一蘭、ShinShin、一双、兼虎、大砲、一叶、麵屋ISHII、萬田うどん）
- [ ] 4.3 Day 1 晚餐：擴充（ShinShin、兼虎、一蘭、天麩羅ひらお、博多華味鳥、もつ鍋一慶）
- [ ] 4.4 Day 2（佐世保）午餐：擴充漢堡選項（Big Man、LOG KIT、ヒカリ、いずみや）
- [ ] 4.5 Day 2（長崎）晚餐：擴充（四海樓、江山樓、文明堂、福砂屋、思案橋ラーメン）
- [ ] 4.6 Day 3（熊本）：擴充馬肉、拉麵（黒亭、天外天、利用閣）
- [ ] 4.7 Day 4（返福岡）晚餐：擴充天神拉麵選項
- [ ] 4.8 Day 5（由布院）：早餐擴充（茶房天井桟敷、カフェラリューシュ、Cafe Duo、ゆふふ）；街道小食（飛驒牛可樂餅、銀の彩、溫泉饅頭）
- [ ] 4.9 Day 6（別府）：擴充（岡本屋、ひょうたん温泉、とよ常、別府ぷくぷく）
- [ ] 4.10 Day 7（門司港+下關）：擴充（伽哩本舗、BEAR FRUITS、唐戶市場海鮮丼、春帆楼河豚）
- [ ] 4.11 Day 8（太宰府+柳川）：擴充梅枝餅選項與柳川鰻魚飯選項
- [ ] 4.12 Day 9（糸島）：新增糸島特色美食（牡蠣小屋冬季限定、海膽丼、一蘭之森限定版）
- [ ] 4.13 Day 10（返程）：擴充機場伴手禮與最後一碗拉麵選項
- [ ] 4.14 所有 foods 加入 maps 欄位與 tags 欄位

## 5. 驗證與部署

- [ ] 5.1 在瀏覽器開啟 index.html，確認景點卡片渲染正確
- [ ] 5.2 點擊景點卡片，確認 Google Maps 在新分頁正確開啟
- [ ] 5.3 確認圖片載入失敗時 emoji 佔位符正常顯示
- [ ] 5.4 確認手機模擬器（F12 DevTools）下橫向滑動正常
- [ ] 5.5 確認深夜時段卡片顯示深色樣式
- [ ] 5.6 `git add index.html && git commit -m "upgrade spot/food cards with Google Maps and expanded options" && git push`
- [ ] 5.7 確認 GitHub Pages 更新生效（約 1~2 分鐘）
