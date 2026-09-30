set NODE_OPTIONS=--max-old-space-size=8192
set SMS_MONITORING_ENABLED=1
set SMS_AI_DECISION_LOGGING=1
set PATH=C:\Users\JB01\AppData\Local\Programs\cursor\resources\app\resources\helpers;%PATH%
cd /d C:\Projects\veri-temp\backend
"C:\Users\JB01\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe" node_modules\@nestjs\cli\bin\nest.js start --watch > nest-runtime.log 2> nest-runtime.err.log
