# Meu Dinheiro

Controle de gastos por **ciclo** — o ciclo começa no dia em que o salário cai e termina no dia anterior ao próximo pagamento.

É um arquivo HTML só: sem cadastro, sem nuvem, sem instalar biblioteca nenhuma. Roda no seu computador e os dados ficam num banco **SQLite** na sua própria pasta.

---

## 1. Baixar e rodar no seu computador

> É assim que o app é feito pra ser usado: você baixa a pasta, roda no seu PC e os dados ficam no seu banco `gastos.db`. O link de demonstração lá no fim é só pra dar uma espiada rápida.

A única coisa que precisa estar instalada é o **[Node.js](https://nodejs.org)** (baixe o instalador "LTS", next-next-finish).

**Passo a passo:**

1. Baixe o projeto: botão verde **Code → Download ZIP** — ou, se preferir terminal:
   ```bash
   git clone https://github.com/gustavolegal/meu-dinheiro.git
   ```
2. Extraia a pasta (se baixou o ZIP).
3. **Windows:** clique duas vezes em **`rodar.bat`**. Ele confere se o Node está instalado, liga o servidor e abre o navegador sozinho.
   **Mac/Linux:** no terminal, dentro da pasta: `node server.js`
4. Vai abrir em **http://localhost:8000** — comece pela aba **Renda**.

Pronto. A partir daí:

- tudo que você lançar é salvo em **`gastos.db`** (banco SQLite) na própria pasta;
- o servidor faz **backup diário automático** do banco em `backups/`;
- pode fechar à vontade: na próxima vez, rode o `rodar.bat` de novo e seus dados estão lá.

### Abrir no celular (mesmo Wi-Fi)

No terminal, dentro da pasta:

```bash
node server.js --rede
```

Ele mostra um endereço tipo `http://192.168.0.10:8000` — abra esse endereço no navegador do celular. O `rodar.bat` também aceita esse modo: `rodar.bat --rede`.

> Nesse modo, qualquer aparelho no seu Wi-Fi consegue abrir o app. Use só em casa ou num Wi-Fi seu.

### Trocar a porta

```bash
PORTA=9000 node server.js     # Mac/Linux
set PORTA=9000 && node server.js   # Windows (cmd)
```

### Só quer espiar, sem instalar nada?

<https://gustavolegal.github.io/meu-dinheiro/controle-de-gastos.html>

Nesse modo o app entra em **"Modo navegador"**: os dados ficam no próprio navegador (localStorage) e não viram banco. Serve pra olhar como fica; pra usar de verdade, rode local (item 1).

---

## 2. Passo a passo do app

### Passo 1 — Renda (fazer primeiro)

1. **Salário base** → escreva o valor → **Salvar**.
   Marque *"Aplicar também aos próximos ciclos"* para ele se repetir todo mês automaticamente.
2. **Entradas adicionais** (comissão, hora extra, bico):
   escolha o tipo, escreva a descrição, o valor e clique em **Adicionar**.
   - Toda entrada nasce como **"a confirmar" (○)** e **não conta** na renda.
   - Quando o dinheiro cair de verdade, clique no **○** → vira **✓** e só aí entra na conta.
   - É isso que impede o Resumo de mostrar dinheiro que ainda não chegou.
3. **Pagamento** → *Dia do salário* (ex.: `10`) → **Salvar dia**.
   Esse dia define o ciclo: de 10/10 até 09/11, por exemplo.

### Passo 2 — Gastos

Use as três abas do topo:

| aba | o que entra |
|---|---|
| **Fixos** | aluguel, internet, telefone, assinaturas — repetem no próximo ciclo |
| **Variáveis** | mercado, comida, lazer — só deste ciclo |
| **Dívidas** | o que ficou parcelado/em atraso, com valor total e valor por mês |

Em cada item da lista:

- **○ / ✓** → marcar como pago (pago fica riscado e sai do "Ainda a pagar");
- **✎** → editar o valor;
- **Cancelar** → só em Fixos: para de repetir nos próximos ciclos;
- **✕** → remover.

Abaixo das listas tem a **calculadora de repasse** — *Quanto mandar (pix)*: clique nas
contas e no que falta de cada dívida pra ver o total na hora e **Copiar detalhe**
pra colar na conversa. Serve pra não errar a conta na hora de mandar o dinheiro.

### Passo 3 — Metas

1. **Criar meta** → nome, valor alvo e *Guardar por mês*.
2. Na meta, clique em **Guardar** (ou "Guardar mais") e informe quanto guardou neste ciclo.
3. O valor guardado aparece no Resumo como **Metas** — dinheiro que saiu da conta mas continua sendo seu.

### Passo 4 — Resumo

É a leitura do ciclo:

- **Sobra prevista** (número grande) = renda − fixos − variáveis − metas − dívidas. Ele **já desconta contas que ainda não foram pagas**;
- **Em caixa agora** = o que sobrou do ciclo anterior + renda − o que já saiu. É o número que mais se parece com o extrato do banco;
- **Ainda a pagar** = contas fixas + variáveis que faltam;
- **Posso gastar por dia** = a sobra dividida pelos dias que restam no ciclo;
- **Fechamento do ciclo** (no topo do Resumo) = você escreve com quanto o ciclo realmente terminou (o saldo do banco). O app mostra a diferença pro que ele previa, e esse valor passa a ser o saldo inicial do próximo ciclo sozinho;
- a **barra colorida** mostra para onde a renda foi; passe o mouse (ou use Tab) em cada trecho para ver o valor;
- por baixo, as **Recomendações** (referências gerais, tipo a regra 50/30/20 — não é aconselhamento financeiro).

### Passo 5 — Mais

- **Tema e aparência** — modo automático (claro de dia, escuro à noite) e vários temas;
- **Para onde foi o dinheiro** — gastos agrupados por categoria;
- **Histórico** — abrir ciclos antigos, **Baixar backup**, **Restaurar backup** e **Apagar todos os dados**;
- **Histórico de metas** — tudo que já foi guardado.

### Ciclos

No topo, `‹` vai para o ciclo anterior, `›` para o próximo e **Hoje** volta para o ciclo atual. Ciclos futuros servem para planejar (o app copia os fixos e as metas).

---

## 3. Onde ficam os dados

| como você abriu | onde fica salvo |
|---|---|
| `rodar.bat` / `node server.js` | `gastos.db` (SQLite) na pasta do projeto |
| link do GitHub Pages | no navegador (localStorage) |

Os `.db` e os backups **não** estão no repositório — cada pessoa cria os seus. Nada de dado pessoal sobe pro Git: `gastos.db`, `*.db`, `backups/`, `*.html.bak` e `meu-dinheiro-backup.json` estão no `.gitignore`.

---

## 4. Arquivos do repositório

```
controle-de-gastos.html   o app inteiro (HTML + CSS + JS num arquivo só)
server.js                 servidor local (Node, sem dependências) — node server.js
rodar.bat                 atalho do Windows: liga o servidor e abre o navegador
.gitignore                mantém banco, backups e dados pessoais fora do Git
```
