# APK do Meu Dinheiro

O app do celular é o mesmo `controle-de-gastos.html`, empacotado como app
Android (WebView carregando `file:///android_asset/index.html`). Roda **sem
internet e sem servidor** — e quando o celular e o PC estão na mesma rede, as
duas bases se acertam sozinhas (juntando o que cada lado mudou).

## Baixar no celular

O jeito fácil, com o servidor ligado em modo rede:

1. No PC: `rodar.bat --rede` (o servidor mostra o endereço, tipo
   `http://192.168.0.10:8000`).
2. No celular, na mesma rede Wi-Fi, abra esse endereço com `/app.apk` no final:
   `http://192.168.0.10:8000/app.apk`.
3. Instale (o Android vai pedir pra permitir instalar de "origem desconhecida").

Também dá pra copiar o `meu-dinheiro.apk` por cabo/Drive e instalar direto.

## Configurar o servidor

Na primeira vez, abra o app → aba **Mais** → **Servidor do site**: digite o
endereço do PC (`http://192.168.0.10:8000`) e toque em **Usar**. O mesmo
endereço aparece no `rodar.bat --rede`.

- Sem endereço configurado: o app funciona só no celular (nada se perde).
- Ao encontrar o servidor: ele manda o que você lançou no celular e traz o que
  mudou no PC. Se os dois mudaram, ele **junta** os dois (não perde lançamento).
- A sincronização acontece com o app aberto (e ao voltar pra tela). Não há
  serviço rodando em segundo plano.

## Compilar

Precisa do JDK 17+ e do Android SDK (build-tools 34 e platform 34):

```powershell
powershell -ExecutionPolicy Bypass -File android\build.ps1 -Servidor "http://192.168.0.10:8000"
```

O `-Servidor` é só o endereço inicial embutido (`window.SV_PADRAO`); dá pra
trocar no app depois. Sem gradle: o script chama `aapt2`, `javac`, `d8`,
`zipalign` e `apksigner` na mão. O APK sai em `android/meu-dinheiro.apk`
(assinado com `android/debug.keystore`, que fica no repositório de propósito,
pra qualquer clone conseguir buildar e atualizar o mesmo app).

Se o SDK não estiver no lugar padrão (`%LOCALAPPDATA%\Android\Sdk`), passe
`-Sdk C:\caminho\do\Sdk`.
