@echo off
echo ========================================
echo   SafeGuard - Iniciando n8n local
echo ========================================
echo.

REM Verifica versao do Node
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo Node.js detectado: %NODE_VER%
echo.

REM Instala dependencias se nao existir node_modules
if not exist node_modules (
    echo Instalando n8n... (pode demorar uns minutos na primeira vez)
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERRO: Falha ao instalar n8n.
        echo Verifique se voce esta usando Node.js v20 ou v22 LTS.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo  Abrindo n8n em: http://localhost:5678
echo  Para parar: Ctrl+C
echo ========================================
echo.

call npx n8n start
pause
