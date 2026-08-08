# Cash Point Tendry — Fanaovana APK amin'ny GitHub

## 1. Ny firaketana ao amin'ny repo GitHub

Alefaso (push) amin'ny repo GitHub ao ny **rakitra sy ny fonctionnalités rehetra ato anaty ity dossier ity**, mitovy tanteraka amin'ity fandaharana ity:

```
.
├── .github/
│   └── workflows/
│       └── build-apk.yml      ← workflow hanaovana APK automatika
├── resources/
│   ├── icon.png                ← icon (1024x1024)
│   ├── icon-foreground.png     ← icon adaptive (foreground)
│   ├── icon-background.png     ← icon adaptive (background)
│   ├── splash.png              ← ecran splash (mode clair)
│   └── splash-dark.png         ← ecran splash (mode sombre)
├── www/
│   ├── index.html               ← IREO RAKITRA NASIANA DATY (efa vaovao)
│   ├── style.css
│   ├── script.js
│   └── manifest.json
├── package.json                 ← VAOVAO
├── capacitor.config.json        ← VAOVAO
└── README.md
```

**Fanamarihana**: ny `index.html`, `style.css`, `script.js`, `manifest.json` ao anaty `www/` dia ireo rakitra efa nasiako ilay fonctionnalité "daty + historique feno" farany teo. Tsy misy zavatra hafa mila ovaina intsony ao aminy — ampy ny mametraka azy ireo ao anaty dossier `www/`.

## 2. Ireo rakitra VAOVAO nampiana (tsy nisy teo aloha)

| Rakitra | Anjara raharaha |
|---|---|
| `package.json` | Milaza ny dépendances (@capacitor/core, @capacitor/android, @capacitor/assets) |
| `capacitor.config.json` | Config ny app (anarana, appId, couleur splash) |
| `.github/workflows/build-apk.yml` | Workflow GitHub Actions manao ny APK **automatika** isaky ny "push" na "workflow_dispatch" |
| `resources/icon.png` + `icon-foreground.png` + `icon-background.png` | Loharanon-kevitra icon (ny `capacitor-assets` no manavaka azy ho isan-tsokajiny rehetra: mipmap-hdpi, mipmap-xxxhdpi, sns.) |
| `resources/splash.png` + `splash-dark.png` | Loharanon-kevitra ecran splash |

## 3. Ny dingana atao (raha vao voapetraka ao GitHub ny rakitra)

1. Mankanesa amin'ny tab **Actions** eo amin'ny repo-nao GitHub.
2. Tsindrio ny workflow **"Build APK - Cash Point Tendry"**.
3. Tsindrio **"Run workflow"** (raha tsy niandry ny push automatika).
4. Andraso ~3-5 mn (mametraka Node, JDK, mampiditra ny platform Android, mamorona ny icon/splash, dia manangana ny APK).
5. Rehefa vita, dia hisy fichier **"cash-point-tendry-apk"** eo ambanin'ny run, azo alaina (download) — ao anatiny ny `app-debug.apk`.
6. Alefaso any amin'ny finday Android ilay APK dia ampidiro (installation manuelle, tsy avy amin'ny Play Store).

## 4. Raha te hanova ny anaran'ny app na icon indray

- Anarana app / appId → `capacitor.config.json`
- Icon → soloy ny `resources/icon.png` (1024x1024, kanto tsy misy alpha)
- Icon adaptive (endrika rondrona amin'ny Android maoderina) → `resources/icon-foreground.png` (misy alpha, ny sary eo afovoany ihany) sy `resources/icon-background.png` (loko fototra)
- Splash → soloy ny `resources/splash.png` (2732x2732, ny logo eo afovoany indrindra mba tsy ho voatapaka)

Rehefa avy nanova ireo sary ireo dia averina alefa (push) any GitHub ary averina alefa ny workflow.

## 5. Raha tianao hatao APK "release" (signé, azo apetraka ao Play Store)

Ny workflow eto dia manao **debug APK** fotsiny (ampy ho an'ny fitsapana sy fampiasana manokana). Raha ilaina ny APK "release" voasonia (signé) ho an'ny Play Store, dia mila:
1. Mamorona keystore (`keytool -genkey ...`)
2. Mametraka azy ho GitHub Secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, sns.)
3. Manampy dingana `./gradlew assembleRelease` misy signing config ao amin'ny workflow

Azafady ampahafantaro ahy raha te hanao izany ianao, dia hataoko ho anao ny dingana.
