# Build do APK do Meu Dinheiro sem gradle:
#   aapt2 (recursos/assets) -> javac -> d8 (dex) -> zipalign -> apksigner
#
# Uso (de qualquer lugar):
#   powershell -ExecutionPolicy Bypass -File android\build.ps1
#   powershell -ExecutionPolicy Bypass -File android\build.ps1 -Servidor "http://192.168.0.10:8000"
#
# -Servidor é só o chute inicial de endereço que fica embutido no APK
# (window.SV_PADRAO); dá pra trocar no app em Mais → Servidor do site.
#
# Detalhe do Windows: aapt2/zipalign não abrem caminho com acento, então o
# script entra na pasta android\ e trabalha com caminhos relativos.
param(
  [string]$Servidor = "",
  [string]$Sdk = "$env:LOCALAPPDATA\Android\Sdk"
)

$ErrorActionPreference = "Stop"
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$raiz = Split-Path -Parent $aqui
$bt = Join-Path $Sdk "build-tools\34.0.0"
$aapt2 = Join-Path $bt "aapt2.exe"
$d8 = Join-Path $bt "d8.bat"
$zipalign = Join-Path $bt "zipalign.exe"
$apksigner = Join-Path $bt "apksigner.bat"
$androidjar = Join-Path $Sdk "platforms\android-34\android.jar"
$ks = "debug.keystore"
$apk = "meu-dinheiro.apk"
$build = "build"

foreach ($f in @($aapt2, $d8, $zipalign, $apksigner, $androidjar, (Join-Path $aqui $ks))) {
  if (-not (Test-Path $f)) { throw "faltando $f (instale com sdkmanager: platforms;android-34 build-tools;34.0.0)" }
}

Push-Location $aqui
try {
  Remove-Item build -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path "build\classes", "build\dex", "assets" | Out-Null

  Write-Host "1/6 html -> assets (servidor padrao: $(if ($Servidor) { $Servidor } else { 'nenhum' }))"
  node "preparar.js" (Join-Path $raiz "controle-de-gastos.html") "assets\index.html" $Servidor

  Write-Host "2/6 recursos"
  & $aapt2 compile --dir res -o "build\res.zip"
  if ($LASTEXITCODE -ne 0) { throw "aapt2 compile falhou" }

  Write-Host "3/6 manifest + assets"
  & $aapt2 link -o "build\base.apk" --manifest "AndroidManifest.xml" `
    -I $androidjar -R "build\res.zip" --auto-add-overlay -A "assets" `
    --min-sdk-version 26 --target-sdk-version 34 `
    --version-code 1 --version-name 1.0
  if ($LASTEXITCODE -ne 0) { throw "aapt2 link falhou" }

  Write-Host "4/6 java -> class -> dex"
  $java = Get-ChildItem -Recurse -Filter *.java src | ForEach-Object { Resolve-Path -Relative $_.FullName }
  & javac -nowarn -source 8 -target 8 -encoding UTF-8 -classpath $androidjar -d "build\classes" $java
  if ($LASTEXITCODE -ne 0) { throw "javac falhou" }
  $classes = Get-ChildItem -Recurse -Filter *.class build\classes | ForEach-Object { Resolve-Path -Relative $_.FullName }
  & $d8 --release --lib $androidjar --min-api 26 --output "build\dex" $classes
  if ($LASTEXITCODE -ne 0) { throw "d8 falhou" }

  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $zip = [System.IO.Compression.ZipFile]::Open((Join-Path $aqui "build\base.apk"), 'Update')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $aqui "build\dex\classes.dex"), "classes.dex") | Out-Null
  $zip.Dispose()

  Write-Host "5/6 zipalign"
  & $zipalign -f -p 4 "build\base.apk" "build\aligned.apk"
  if ($LASTEXITCODE -ne 0) { throw "zipalign falhou" }

  Write-Host "6/6 assinatura"
  & $apksigner sign --ks $ks --ks-pass pass:android --key-pass pass:android `
    --ks-key-alias androiddebugkey --out $apk "build\aligned.apk"
  if ($LASTEXITCODE -ne 0) { throw "apksigner falhou" }

  Write-Host "6/6 conferindo"
  & $apksigner verify --print-certs $apk | Select-Object -First 3
  & $aapt2 dump badging $apk | Select-Object -First 4
  $mb = [math]::Round((Get-Item $apk).Length / 1MB, 2)
  Write-Host "`nAPK pronto: $(Join-Path $aqui 'meu-dinheiro.apk') ($mb MB)"
} finally {
  Pop-Location
}
