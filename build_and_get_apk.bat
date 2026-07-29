@echo off
set ANDROID_HOME=C:\Users\balaj\AppData\Local\Android\Sdk
echo ===================================================
echo   Ervizhi Mobile App - Automated APK Build
echo ===================================================

echo [1/3] Prebuilding Native Android Project...
cd mobile
call npx expo prebuild --platform android

echo [2/3] Compiling Release APK via Gradle...
cd android
call gradlew.bat assembleRelease

cd ..\..
echo [3/3] Copying APK to Workspace Root...
if exist "mobile\android\app\build\outputs\apk\release\app-release.apk" (
    copy "mobile\android\app\build\outputs\apk\release\app-release.apk" "Ervizhi_App.apk"
    echo ===================================================
    echo SUCCESS: Ervizhi_App.apk is ready in your root directory!
    echo ===================================================
) else (
    echo ===================================================
    echo ERROR: APK build failed. Please check build logs above.
    echo ===================================================
)
