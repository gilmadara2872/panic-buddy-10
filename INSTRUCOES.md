# SafeGuard - Instrucoes de execucao (upgrade)

## 1. PostgreSQL (ja instalado)

Banco: panic_buddy, usuario: panic, senha: panic123, porta 5432.
Tabela panic_alerts criada automaticamente.

## 2. Backend (Node/Express)

cd server
npm install
node index.js

# API em http://localhost:3001

## 3. Frontend

Na raiz do projeto:
npm install --legacy-peer-deps
npm run dev

# App em http://localhost:5173 (ou porta indicada)

## 4. n8n (Docker)

Voce tem n8n em Docker. Importe n8n-local/n8n-workflow.json.
Altere o no Send Email:

- sendTo: email de TESTE (nao use email real de autoridades em testes)
- Em producao, troque para o email/contato das autoridades.
  Webhook: http://localhost:5678/webhook/4b60c7f8-59e6-4dfe-8c0e-fd10a18bf14a

## Novidades

- Botao de panico agora permite anexar foto (camera) e relato do ocorrido.
- Dados salvos no PostgreSQL local (tabela panic_alerts com foto base64 e relato).
- Historico le do backend local.
- n8n recebe foto e relato no payload.

## Observacao

O app original (Lovable) foi preservado; apenas adicionadas as funcionalidades acima.
EOF
