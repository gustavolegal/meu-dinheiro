# Meu Dinheiro

Controle de gastos por **ciclo** — o ciclo começa no dia em que o salário cai e termina no dia anterior ao próximo pagamento.

É um arquivo HTML só: sem cadastro, sem instalação, sem nuvem. Tudo fica na sua máquina.

**Testar agora:** https://gustavolegal.github.io/meu-dinheiro/controle-de-gastos.html

---

## 1. Testar sem instalar nada (só o navegador)

1. Abra o link acima.
2. Vai aparecer a mensagem *"Modo navegador: dados só neste navegador"* — é o esperado. Seus lançamentos ficam salvos no **próprio navegador** (localStorage).
3. Comece pela aba **Renda** e siga o passo a passo abaixo.

> Nesse modo cada pessoa tem os próprios dados, e se você limpar os dados do navegador eles vão embora. Para guardar de verdade: **Mais → Histórico → Baixar backup**.

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

### Passo 3 — Metas

1. **Criar meta** → nome, valor alvo e *Guardar por mês*.
2. Na meta, clique em **Guardar** (ou "Guardar mais") e informe quanto guardou neste ciclo.
3. O valor guardado aparece no Resumo como **Metas** — dinheiro que saiu da conta mas continua sendo seu.

### Passo 4 — Resumo

É a leitura do ciclo:

- **Sobra prevista** (número grande) = renda − fixos − variáveis − metas − dívidas. Ele **já desconta contas que ainda não foram pagas**;
- **Em caixa agora** = renda − o que já saiu. É o número que mais se parece com o extrato do banco;
- **Ainda a pagar** = contas fixas + variáveis que faltam;
- **Posso gastar por dia** = a sobra dividida pelos dias que restam no ciclo;
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

## 3. Rodar no seu computador (com banco de dados de verdade)

Assim os dados ficam num arquivo **SQLite** (`gastos.db`) e não se perdem ao limpar o navegador.

**Precisa:** [Node.js 22.13 ou mais novo](https://nodejs.org) (não instala nenhuma biblioteca — usa só o que vem no Node).

```bash
# 1. baixe o repositório (Code → Download ZIP) ou clone:
git clone https://github.com/gustavolegal/meu-dinheiro.git
cd meu-dinheiro

# 2. rode:
node server.js
```

Depois abra **http://localhost:8000**.

- Salva tudo em `gastos.db`, na mesma pasta.
- Faz **backup diário automático** do banco em `backups/`.
- Trocar a porta: `PORTA=9000 node server.js`.

### Abrir no celular (mesmo Wi-Fi)

```bash
node server.js --rede
```

Ele imprime um endereço tipo `http://192.168.0.10:8000` — abra esse endereço no navegador do celular.

> Nesse modo qualquer pessoa no seu Wi-Fi consegue abrir o app. Use só em casa.

---

## 4. Onde ficam os dados

| como você abriu | onde fica salvo |
|---|---|
| pelo link do GitHub Pages | no navegador (localStorage) |
| por `node server.js` | `gastos.db` (SQLite) |

Os `.db` e os backups **não** estão no repositório — cada pessoa cria os seus.

---

## 5. Arquivos do repositório

```
controle-de-gastos.html   o app inteiro (HTML + CSS + JS num arquivo só)
server.js                 servidor local (Node, sem dependências)
.gitignore                mantém banco, backups e dados pessoais fora do Git
```

Nada de dado pessoal sobe para o Git: `gastos.db`, `*.db`, `backups/`, `*.html.bak` e `meu-dinheiro-backup.json` estão no `.gitignore`.
