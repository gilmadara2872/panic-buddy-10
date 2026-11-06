# 🚨 SafeGuard - Configuração Local

Este guia explica como rodar o SafeGuard no seu PC (VS Code) e configurar o n8n para enviar emails automaticamente.

---

## 📋 Pré-requisitos

- **Node.js** instalado: https://nodejs.org
- **n8n** instalado globalmente: `npm install -g n8n`
- **Bun** instalado: https://bun.sh

---

## 🚀 Passo a passo

### 1. Rodar o n8n (em um terminal)

```bash
n8n start
```

- O n8n vai abrir em: http://localhost:5678
- Crie sua conta na primeira vez

### 2. Importar o workflow de alerta

1. Abra o n8n no navegador: http://localhost:5678
2. Vá em **Workflows** → **Import from file**
3. Selecione o arquivo: `local-setup/n8n-workflow.json`
4. **Importante**: Configure o nó "Send Email" com seu servidor SMTP:
   - Clique no nó "Send Email"
   - Em "Credential for SMTP", clique em "Create New Credential"
   - Preencha:
     - **Host**: `smtp.gmail.com` (para Gmail)
     - **Port**: `587`
     - **User**: seu-email@gmail.com
     - **Password**: sua senha de app do Gmail (não a senha normal!)
   - Salve

> 💡 **Senha de app do Gmail**: Vá em https://myaccount.google.com/apppasswords e gere uma senha de app para "Email".

### 3. Ativar o workflow

1. Clique no workflow "SafeGuard - Alerta de Panico"
2. Clique no botão **Active** (canto superior direito)
3. O webhook já está configurado com o ID: `4b60c7f8-59e6-4dfe-8c0e-fd10a18bf14a`

### 4. Rodar o SafeGuard (em outro terminal)

```bash
bun install
bun dev
```

- A aplicação vai abrir em: http://localhost:3000

---

## ✅ Testar

1. Abra o app no navegador: http://localhost:3000
2. Cadastre seu nome e telefone
3. Pressione o botão **PANICO**
4. Verifique se o email chegou em: **kennethcorrea@gmail.com**

---

## 📁 Estrutura dos arquivos

```
safeguard/
├── src/
│   └── routes/
│       └── index.tsx          ← Código do botão de pânico
├── local-setup/
│   ├── README.md              ← Este arquivo
│   └── n8n-workflow.json      ← Workflow do n8n para importar
├── package.json
└── ...
```

---

## 🔧 Solução de problemas

| Problema                 | Solução                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| Email não chega          | Verifique se o workflow está **Active** e se as credenciais SMTP estão corretas |
| Webhook falha            | Confirme que o n8n está rodando em `localhost:5678`                             |
| CORS error               | O n8n aceita requisições de `localhost:3000` por padrão                         |
| Senha do Gmail rejeitada | Use uma **senha de app** do Google, não sua senha normal                        |

---

## 📧 Onde o email vai?

O workflow está configurado para enviar para: **kennethcorrea@gmail.com**

Se quiser mudar, edite o nó "Send Email" no workflow do n8n e altere o campo "Send To".
