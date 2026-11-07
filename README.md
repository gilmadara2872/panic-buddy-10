# SafeGuard — Botão de Pânico

Aplicativo de segurança pessoal com botão de pânico, captura de localização GPS, anexo de foto e envio de alerta por e-mail para as autoridades competentes.

## Visão Geral

O SafeGuard permite que um usuário, em situação de emergência, pressione um botão que:
- Captura a localização GPS do dispositivo
- Anexa uma foto (opcional)
- Registra um relato (opcional)
- Salva o alerta no banco de dados
- Dispara um webhook para o n8n, que envia um e-mail para a autoridade competente (Polícia Civil ou Militar do Piauí) com todos os dados e link do Google Maps

## Arquitetura

```
Frontend (Vite + React + TanStack Router)  →  Backend (Node/Express)  →  PostgreSQL
                                                          ↓
                                                    n8n (webhook)  →  E-mail (SMTP)
```

## Pré-requisitos

- Node.js v20+ (testado com v26)
- PostgreSQL 16+ com banco `panic_buddy` e usuário `panic` / senha `panic123`
- n8n (Docker) rodando em `localhost:5678`
- Mailpit (opcional, para testes de e-mail) em `localhost:8025`

## Instalação

### 1. Banco de dados

```bash
psql -U panic -d panic_buddy -f db/init.sql
```

### 2. Backend

```bash
cd server
npm install
# Configure server/.env (veja abaixo)
node index.js
# API em http://localhost:3001
```

### 3. Frontend

```bash
npm install --legacy-peer-deps
npm run dev
# App em http://localhost:8080
```

### 4. n8n

1. Importe `n8n-local/n8n-workflow.json` no n8n
2. Configure o nó "Send Email" com credencial SMTP
3. Ative o workflow

## Variáveis de Ambiente (server/.env)

```env
PORT=3001
DB_USER=panic
DB_HOST=localhost
DB_NAME=panic_buddy
DB_PASSWORD=<defina no .env>
DB_PORT=5432
JWT_SECRET=<defina uma chave segura>
CORS_ORIGIN=http://localhost:8080
MAX_PHOTO_BYTES=5242880
ADMIN_PASSWORD=<defina uma senha segura>
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login admin (retorna token + refreshToken) |
| POST | `/api/auth/refresh` | Renova access token |
| POST | `/api/auth/logout` | Invalida refresh token |
| GET | `/api/alerts?page=1&limit=20` | Lista alertas (requer Bearer token) |
| POST | `/api/alerts` | Cria alerta de pânico |

## Fluxo de Uso

1. Usuário acessa o app e cadastra nome + telefone
2. Em emergência, pressiona o botão "Pânico"
3. O app captura GPS, anexa foto/relato e envia para o backend
4. O backend salva no PostgreSQL (foto em base64)
5. O frontend dispara webhook para o n8n
6. O n8n envia e-mail para a autoridade competente com todos os dados

## Credenciais de Acesso

- **Usuário comum**: cadastro na tela inicial (nome + telefone)
- **Administrador**: usuário `admin` / senha definida em `ADMIN_PASSWORD` (gerada aleatoriamente se não definida)
- Acesso ao histórico: http://localhost:8080/login

## Contatos Oficiais das Autoridades (Piauí)

| Instituição | E-mail | Tipo de ocorrência |
|-------------|--------|-------------------|
| Polícia Militar do Piauí | comando@pm.pi.gov.br | Assalto, Acidente |
| Polícia Civil do Piauí | ouvidoria@pc.pi.gov.br | Violência, Outros |
| Polícia Federal | Fala.BR (plataforma web) | Não possui e-mail direto |

## Testes

```bash
# TypeScript
npx tsc --noEmit

# Lint
npm run lint

# Teste E2E (Playwright)
npx --yes --package playwright node test_panic2.js
```

## Estrutura do Projeto

```
panic-buddy-10/
├── src/
│   ├── routes/          # Páginas (index, cadastro, historico, login)
│   ├── components/ui/   # Componentes Radix UI
│   └── integrations/    # Supabase (não utilizado ativamente)
├── server/
│   └── index.js         # Backend Express + PostgreSQL
├── db/
│   └── init.sql         # Schema da tabela panic_alerts
├── n8n-local/
│   └── n8n-workflow.json # Workflow do n8n
├── public/
│   ├── sw.js            # Service Worker (PWA)
│   └── manifest.json    # Manifest PWA
└── package.json
```

## Segurança

- Senha admin configurável via `ADMIN_PASSWORD`
- Tokens JWT com refresh (24h access, refresh em memória)
- Rate limiting (60 req/min) nas rotas `/api/`
- Sanitização de inputs (remoção de HTML)
- Validação de foto (tipo e tamanho, máx 5MB)

## Licença

Projeto privado — uso interno.
