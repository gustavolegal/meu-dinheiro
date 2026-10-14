/* Põe o app (arquivo único) pra dentro do APK e embute o endereço do servidor
   de casa como padrão (window.SV_PADRAO). Uso (rodando de dentro de android\):
     node preparar.js <controle-de-gastos.html> <assets/index.html> [http://ip:8000]
   O endereço é só um chute inicial: dá pra trocar no app em Mais → Servidor. */
const fs = require("fs");
const path = require("path");

const origem = process.argv[2];
const destino = process.argv[3];
const servidor = process.argv[4] || "";
if (!origem || !destino) {
  console.error("uso: node preparar.js <html> <assets/index.html> [http://ip:8000]");
  process.exit(1);
}

const html = fs.readFileSync(origem, "utf8");
/* marca: o primeiro <script> com IIFE do arquivo (o do tema, no <head>):
   entrar antes dele garante que o SV_PADRAO já existe quando o app rodar */
const marca = "<script>\n      (function () {";
const i = html.indexOf(marca);
if (i < 0) {
  console.error("nao achei o script do app em " + origem);
  process.exit(1);
}
const padrao = servidor
  ? '<script>window.SV_PADRAO=' + JSON.stringify(servidor) + ";</script>\n    "
  : "";
fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, html.slice(0, i) + padrao + html.slice(i));
console.log(
  "asset pronto: " +
    destino +
    " (" +
    (servidor ? "servidor padrao " + servidor : "sem servidor padrao") +
    ")",
);
