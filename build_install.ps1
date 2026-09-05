$ErrorActionPreference = "Stop"

Write-Host "Step 1: Pre-build Metro bundle..."
cd c:\Users\manoj\Downloads\instantatoz\apps\mobile
New-Item -ItemType Directory -Force -Path android\app\build\generated\assets\createBundleReleaseJsAndAssets | Out-Null
New-Item -ItemType Directory -Force -Path android\app\build\generated\res\createBundleReleaseJsAndAssets | Out-Null

$env:NODE_OPTIONS = "--max-old-space-size=8192"
npx expo export:embed --platform android --dev false --entry-file node_modules/expo-router/entry.js --bundle-output android/app/build/generated/assets/createBundleReleaseJsAndAssets/index.android.bundle --assets-dest android/app/build/generated/res/createBundleReleaseJsAndAssets --minify true

Write-Host "Step 2: Build APK..."
cd android
.\gradlew.bat assembleRelease -x lintVitalAnalyzeRelease -x lintVitalRelease -x lintVitalReportRelease --no-daemon

Write-Host "Step 3: Install..."
$adb = "C:\Users\manoj\AppData\Local\Android\Sdk\platform-tools\adb.exe"
& $adb install -r "app\build\outputs\apk\release\app-release.apk"

Write-Host "Done!"
