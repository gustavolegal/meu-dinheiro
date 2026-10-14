package com.gustavo.medinheiro;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Casca do "Meu Dinheiro" no celular.
 *
 * O app inteiro é um arquivo único (assets/index.html), então roda na rua sem
 * internet e sem servidor. Quando o celular encontra o servidor de casa (o
 * endereço vem do window.SV_PADRAO que o build embute, ou da aba Mais →
 * "Servidor do site") as duas bases se acertam sozinhas, juntando o que cada
 * lado mudou.
 */
public class MainActivity extends Activity {
  private WebView web;

  @Override
  protected void onCreate(Bundle estado) {
    super.onCreate(estado);
    web = new WebView(this);
    WebSettings cfg = web.getSettings();
    cfg.setJavaScriptEnabled(true);
    cfg.setDomStorageEnabled(true);
    cfg.setLoadWithOverviewMode(true);
    cfg.setUseWideViewPort(true);
    cfg.setAllowFileAccess(true);
    /* a página vem de file:// e precisa poder chamar http:// no servidor de
       casa (o servidor também responde CORS, mas o WebView bloqueia antes) */
    cfg.setAllowFileAccessFromFileURLs(true);
    cfg.setAllowUniversalAccessFromFileURLs(true);
    /* alert/confirm/prompt do site (o app usa bastante) */
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient());
    if (estado == null) web.loadUrl("file:///android_asset/index.html");
    else web.restoreState(estado);
    setContentView(web);
  }

  @Override
  protected void onSaveInstanceState(Bundle estado) {
    super.onSaveInstanceState(estado);
    if (web != null) web.saveState(estado);
  }

  @Override
  public void onBackPressed() {
    if (web != null && web.canGoBack()) web.goBack();
    else super.onBackPressed();
  }
}
