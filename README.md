# Qulager — Ет және сүт өнімдері дүкені

Түркістандағы Qulager дүкенінің сайты (HTML + CSS + JavaScript, серверсіз).

## Құрылымы

```
qulager/
├── index.html          ← басты бет
├── meat.html           ← Ет өнімдері
├── dairy.html          ← Сүт өнімдері
├── poultry.html        ← Аң-құс
├── sub.html            ← Суб набор
├── spices.html         ← Дәмдеуіштер
├── own.html            ← Біздің өнімдер
├── css/style.css       ← барлық беттің ортақ стилі
├── js/cart.js          ← себет (localStorage), барлық бетте қосылған
├── js/main.js          ← басты беттің скрипті (мәзір, FAQ, анимация)
├── js/reviews.js       ← пікірлер (оқу, жазу, өз пікірін өшіру)
├── js/firebase-config.js ← пікірлердің ортақ дерекқорына қосылу баптауы
├── firestore.rules     ← Firebase қауіпсіздік ережелері
├── images/             ← логотип, санаттар, өнім суреттері
└── database/qulager.sql← SQL дерекқор (санаттар, өнімдер, тапсырыстар)
```

## Себет қалай жұмыс істейді
- «Себетке қосу» батырмасында `data-id`, `data-name`, `data-price` бар.
- `cart.js` себетті `localStorage` (`qulager_cart` кілті) ішіне сақтайды, сондықтан беттен бетке өткенде **жоғалмайды**.
- Бірдей өнімді қайта қоссаң, саны (`qty`) артады; себетте +/− және өшіру бар.
- «WhatsApp арқылы тапсырыс беру» себеттегі тізімді `+7 776 727 8100` нөміріне жібереді.

## Жергілікті ашу
`index.html` файлын екі рет шерту арқылы ашуға болады. Бірақ кейбір браузер (Firefox) `file://` режимінде
себетті беттер арасында бөліспейді, сондықтан VS Code-та **Live Server** кеңейтімімен ашқан дұрыс
(немесе төменде GitHub Pages сілтемесімен).

## Жаңа өнім қосу
Санат бетіндегі (мысалы `meat.html`) `<article class="menu-card">` блогын көшіріп, `data-id`, `data-name`, `data-price`
және `images/products/...` суретін өзгерт.

Нақты фото қою: суретті `images/products/` ішіне салып (мысалы `beef.jpg`), HTML-дегі `src="images/products/beef.svg"` жолын `beef.jpg` деп өзгерт.

## Дерекқор (SQL)
```bash
sqlite3 qulager.db < database/qulager.sql
```
Файлдың соңында емтиханға арналған мысал сұраулар (JOIN, GROUP BY, WHERE) бар.

## GitHub-қа салу
```bash
cd qulager
git init
git add .
git commit -m "Qulager дүкенінің сайты"
git branch -M main
git remote add origin https://github.com/<логин>/qulager.git
git push -u origin main
```
Содан кейін GitHub-та: **Settings → Pages → Branch: main / (root) → Save**.
Сайт `https://<логин>.github.io/qulager/` мекенжайында ашылады.

## Пікірлерді барлығына көрсету (Firebase)

Сайт GitHub Pages-та тұрғандықтан серверi жоқ. Пікірлерді барлық келуші көріп, жаза алуы үшін тегін
**Firebase** дерекқорын қосу керек (бір рет, ~5 минут). Қосылмаса, сайт «демо режимде» жұмыс істейді:
пікірлер тек сол адамның өз браузерінде сақталады, басқалар көрмейді.

1. https://console.firebase.google.com → **Add project** (Analytics керек емес).
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**.
3. **Build → Firestore Database → Create database** (region: `eur3` немесе `europe-west`).
   Содан **Rules** қойындысына `firestore.rules` файлының мәтінін толық қойып, **Publish** бас.
4. **Project settings (⚙) → Your apps → Web (`</>`)** → қолданбаны тіркеп, шыққан `firebaseConfig`
   мәндерін `js/firebase-config.js` ішіне көшір (`apiKey`, `authDomain`, `projectId`, `appId`).
5. Өзгерісті GitHub-қа жібер (`git add . && git commit -m "firebase" && git push`).

Ереже: пікірді кез келген адам оқиды және жазады; өшіруді **тек пікірді жазған адам** жасай алады
(ол браузерде жасырын `uid` арқылы анықталады). Басқа құрылғыдан немесе браузер деректерін тазалағаннан кейін
өз пікірін өшіре алмайды; ал сен (иесі) Firebase консолінде кез келген пікірді өшіре аласың.
Жіберу арасында 20 секунд күту және мәтінге 3–500 таңба шектеуі бар (спамнан қорғау үшін).

## Телефон нөмірлері мен тапсырыс
- Байланыс бөлімінде екі нөмір: `8 747 727 8100` және `8 776 727 8100` (басса — қоңырау, жанындағы батырма — WhatsApp).
- Себеттен тапсырыс `js/cart.js` ішіндегі `PHONE` нөміріне (қазір `77767278100`) жіберіледі; ауыстыруға болады.

## «Qulager» жүктеу экраны
Тек сайтқа (басты бетке) алғаш кіргенде бір рет шығады. Беттер арасында жүргенде, басты бетке қайтқанда
қайта шықпайды (браузер қойындысын жапқанша).
