# 🚨 SafeGuard - n8n Local (pasta pronta)

Essa pasta tem tudo pronto pra rodar o **n8n** no seu PC sem dor de cabeça.

---

## ⚠️ ANTES DE COMEÇAR — Node.js v22 LTS

O n8n **não funciona com Node v25**. Você precisa do **Node.js v22 LTS**.

1. Desinstala o Node atual (Painel de Controle → Programas → Node.js → Desinstalar)
2. Baixa o **LTS (v22)** em: https://nodejs.org/en/download
3. Instala normal (next, next, next)
4. Fecha e abre o VS Code de novo
5. Confere no terminal:
   ```
   node -v
   ```
   Tem que aparecer algo tipo `v22.x.x`

---

## 🚀 Como rodar (3 passos)

### 1. Abre o terminal nessa pasta

No VS Code: clique direito na pasta `n8n-local` → **"Abrir em terminal integrado"**

### 2. Roda o script

**Windows:** dá dois cliques no `start-windows.bat`
**ou no terminal:**
```bash
start-windows.bat
```

**Mac/Linux:**
```bash
chmod +x start-mac-linux.sh
./start-mac-linux.sh
```

A primeira vez vai demorar uns 2-5 minutos baixando o n8n. Depois é instantâneo.

### 3. Abre o navegador

Quando aparecer `Editor is now accessible via: http://localhost:5678`, abre essa URL.

---

## 📥 Importar o workflow

1. Na tela do n8n, cria uma conta (primeira vez)
2. Clica em **Workflows** → **Add workflow** → **Import from File**
3. Seleciona o arquivo `n8n-workflow.json` (que está nessa pasta)
4. Clica no nó **Send Email** e configura SMTP:
   - **Host:** `smtp.gmail.com`
   - **Port:** `587`
   - **User:** seu email Gmail
   - **Password:** senha de app (gera em https://myaccount.google.com/apppasswords)
5. **Salva** e clica em **Active** (canto superior direito)

---

## ✅ Pronto!

O webhook tá ativo em:
```
http://localhost:5678/webhook/4b60c7f8-59e6-4dfe-8c0e-fd10a18bf14a
```

Agora roda o SafeGuard normal (`bun dev`) e aperta o botão de pânico. O email de TESTE vai para o endereco configurado no no Send Email (altere para o email das autoridades em producao).

---

## 🆘 Deu erro?

| Erro | Solução |
|---|---|
| `command not found: npm` | Node não instalado. Volta no passo do Node v22 |
| `EBADENGINE` ou erro de versão | Você não tá no Node v22. Confere `node -v` |
| `EADDRINUSE :::5678` | Já tem n8n rodando. Fecha o outro terminal |
| Email não chega | Workflow não tá **Active**, ou senha SMTP errada (usa senha de app, não a normal) |
