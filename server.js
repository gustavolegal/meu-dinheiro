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

// backup diário do banco
if (fs.existsSync(DB)) {
  const pasta = path.join(__dirname, "backups");
  fs.mkdirSync(pasta, { recursive: true });
  const destino = path.join(pasta, `gastos-${new Date().toISOString().slice(0, 10)}.db`);
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

function responder(res, codigo, corpo = "", tipo = "application/json") {
  res.writeHead(codigo, { "Content-Type": tipo, "Cache-Control": "no-store" });
  res.end(corpo);
}

const servidor = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/dados") {
    const r = ler.get();
    return responder(res, 200, r ? r.conteudo : "{}");
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    return responder(res, 200, fs.readFileSync(PAGINA), "text/html; charset=utf-8");
  }
  if (req.method === "PUT" && req.url === "/api/dados") {
    let corpo = "";
    req.on("data", (c) => (corpo += c));
    req.on("end", () => {
      try { JSON.parse(corpo); } catch { return responder(res, 400); }
      gravar.run(corpo);
      responder(res, 200, "{}");
    });
    return;
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
