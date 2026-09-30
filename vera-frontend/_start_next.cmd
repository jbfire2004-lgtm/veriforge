set NODE_OPTIONS=--max-old-space-size=8192
set PATH=C:\Users\JB01\AppData\Local\Programs\cursor\resources\app\resources\helpers;%PATH%
cd /d C:\Projects\veri-temp\vera-frontend
"C:\Users\JB01\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" node_modules\next\dist\bin\next dev --webpack -p 3000 > next-runtime.log 2> next-runtime.err.log
