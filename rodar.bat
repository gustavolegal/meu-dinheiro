@echo off
REM Meu Dinheiro - liga o servidor local e abre o navegador.
REM So precisa ter o Node.js instalado: https://nodejs.org
REM Uso: clique duas vezes. Pro celular (mesmo Wi-Fi): rode pelo terminal com  rodar.bat --rede
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js nao encontrado.
  echo  Baixe em https://nodejs.org - pegue o instalador "LTS" - instale e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

echo Ligando o servidor...
start "Meu Dinheiro" /min cmd /c "node server.js %*"

REM o servidor sobe em ~1s; se der erro, a janelinha do Node mostra
timeout /t 2 >nul

start "" http://localhost:8000
echo.
echo Pronto: http://localhost:8000
echo Seus dados ficam em gastos.db nesta pasta (com backup diario em backups).
echo Para parar o servidor, feche a janelinha "Meu Dinheiro".
echo.
timeout /t 5 >nul
endlocal
