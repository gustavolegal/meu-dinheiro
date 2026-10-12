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

set n=0
:espera
ping -n 2 127.0.0.1 >nul
set /a n+=1
powershell -NoProfile -Command "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',8000);$c.Close();exit 0}catch{exit 1}" >nul 2>&1
if errorlevel 1 if %n% lss 20 goto espera

if errorlevel 1 (
  echo.
  echo O servidor nao subiu. Veja o que apareceu na janelinha "Meu Dinheiro".
  pause
  exit /b 1
)

start "" http://localhost:8000
echo.
echo Pronto: http://localhost:8000
echo Seus dados ficam em gastos.db nesta pasta (com backup diario em backups).
echo Para parar o servidor, feche a janelinha "Meu Dinheiro".
echo.
ping -n 6 127.0.0.1 >nul
endlocal
