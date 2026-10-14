// Servidor local do Meu Dinheiro (Node 22.13 ou mais novo, sem instalar nada).
// Guarda tudo em um banco SQLite (gastos.db) na mesma pasta deste arquivo.
//   node servidor.js          (só neste computador)
//   node servidor.js --rede   (também no celular, no mesmo Wi-Fi)
// Depois abra http://localhost:8000 no navegador.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { DatabaseSync } = require("node:sqlite");

const PORTA = Number(process.env.PORTA) || 8000;
const REDE = process.argv.includes("--rede");
const DB = path.join(__dirname, "gastos.db");
const PAGINA = path.join(__dirname, "controle-de-gastos.html");
const APK = path.join(__dirname, "android", "meu-dinheiro.apk");

// backup diário do banco (data local: às 22h ainda é o dia de hoje, não o de amanhã)
if (fs.existsSync(DB)) {
  const pasta = path.join(__dirname, "backups");
  fs.mkdirSync(pasta, { recursive: true });
  const hoje = new Date();
  const dois = (n) => String(n).padStart(2, "0");
  const dia = `${hoje.getFullYear()}-${dois(hoje.getMonth() + 1)}-${dois(hoje.getDate())}`;
  const destino = path.join(pasta, `gastos-${dia}.db`);
  if (!fs.existsSync(destino)) fs.copyFileSync(DB, destino);
}

const db = new DatabaseSync(DB);
db.exec(`create table if not exists dados(
  id integer primary key check(id = 1),
  conteudo text not null,
  atualizado text default current_timestamp)`);
const ler = db.prepare("select conteudo from dados where id = 1");
const gravar = db.prepare(`insert into dados(id, conteudo, atualizado)
  values(1, ?, current_timestamp)
  on conflict(id) do update set conteudo = excluded.conteudo, atualizado = current_timestamp`);

/* O app do celular (APK) abre a página de dentro dele mesmo (file://), então
   o PUT chega de outra origem: sem estes cabeçalhos o navegador barra antes
   de enviar (é o "preflight" do OPTIONS). Vale só dentro da sua rede. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "600",
};

function responder(res, codigo, corpo = "", tipo = "application/json") {
  res.writeHead(codigo, {
    "Content-Type": tipo,
    "Cache-Control": "no-store",
    ...CORS,
  });
  res.end(corpo);
}

const LIMITE_CORPO = 5 * 1024 * 1024; // 5 MB (o app manda ~60 KB)

const servidor = http.createServer((req, res) => {
  const rota = (req.url || "").split("?")[0]; // ?v=2 não pode virar 404
  if ((req.method === "GET" || req.method === "HEAD") && rota === "/api/dados") {
    const r = ler.get();
    return responder(res, 200, r ? r.conteudo : "{}");
  }
  if (req.method === "GET" && rota === "/app.apk") {
    /* O APK do celular fica na pasta android/. Baixar no celular:
       http://<ip-do-pc>:8000/app.apk (servidor precisa estar no modo --rede) */
    if (!fs.existsSync(APK)) return responder(res, 404, "APK nao encontrado");
    res.writeHead(200, {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="meu-dinheiro.apk"',
      "Content-Length": fs.statSync(APK).size,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    });
    return fs.createReadStream(APK).pipe(res);
  }
  if ((req.method === "GET" || req.method === "HEAD") && (rota === "/" || rota === "/index.html")) {
    return responder(res, 200, fs.readFileSync(PAGINA), "text/html; charset=utf-8");
  }
  if (req.method === "PUT" && rota === "/api/dados") {
    const partes = [];
    let tamanho = 0;
    req.on("data", (c) => {
      tamanho += c.length;
      if (tamanho > LIMITE_CORPO) {
        responder(res, 413);
        req.destroy();
        return;
      }
      partes.push(c);
    });
    req.on("end", () => {
      // Buffer.concat + utf8: somando os pedaços com "+" um acento partido
      // entre dois pacotes virava "P��o". E o corpo precisa ser um objeto.
      const corpo = Buffer.concat(partes).toString("utf8");
      let dados;
      try {
        dados = JSON.parse(corpo);
      } catch {
        return responder(res, 400);
      }
      if (typeof dados !== "object" || dados === null || Array.isArray(dados))
        return responder(res, 400);
      gravar.run(corpo);
      responder(res, 200, "{}");
    });
    return;
  }
  if (req.method === "OPTIONS") {
    /* pré-voo do CORS (o app do celular manda PUT de outra origem) */
    res.writeHead(204, { ...CORS, Allow: "GET, HEAD, PUT, OPTIONS" });
    return res.end();
  }
  responder(res, 404);
});

servidor.listen(PORTA, REDE ? "0.0.0.0" : "127.0.0.1", () => {
  console.log(`Meu Dinheiro rodando em http://localhost:${PORTA}`);
  if (REDE) {
    for (const lista of Object.values(os.networkInterfaces()))
      for (const i of lista)
        if (i.family === "IPv4" && !i.internal) console.log(`No celular (mesmo Wi-Fi): http://${i.address}:${PORTA}`);
    console.log("Atenção: nesse modo qualquer pessoa no seu Wi-Fi consegue abrir o app.");
  }
  console.log("Banco de dados:", DB);
  console.log("Feche esta janela (ou Ctrl+C) para parar.");
});
