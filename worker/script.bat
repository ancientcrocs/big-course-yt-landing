@echo off
cd /d %~dp0

echo [1/4] Menjalankan updatecache.js...
node updatecache.js
if errorlevel 1 (
  echo ❌ Gagal menjalankan updatecache.js
  pause
  exit /b
)

echo [2/4] Menyalin cache ke direktori utama...
xcopy /Y /Q "cache\*.json" "..\cache\"

echo [3/4] Commit ke Git...
cd ..
for /f %%i in ('powershell -command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set dt=%%i
git add cache\playlists.json cache\videos.json
git commit -m "Update cache via script (%dt%)"
git pull origin main --rebase
git push

echo [4/4] Selesai.
pause
