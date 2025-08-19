# 🔥 Preview ao Vivo - Hot Reload

Este guia mostra como ter um preview em tempo real de todas as alterações do sistema.

## 🚀 **Opção 1: Desenvolvimento Local (Recomendado)**

### **Iniciar o servidor de desenvolvimento:**
```bash
# Terminal 1 - Backend (Node.js/Express)
npm run dev

# OU diretamente:
NODE_ENV=development tsx server/index.ts
```

### **Iniciar o frontend com Vite (se necessário):**
```bash
# Terminal 2 - Frontend (React/Vite)
npm run build:watch
# OU
npx vite --host
```

### **Acessar o sistema:**
```
🌐 URL: http://localhost:5000
```

---

## ⚡ **Como funciona o Hot Reload:**

### **Backend (Node.js):**
- ✅ **Auto-restart** quando você modifica arquivos `.ts`
- ✅ **Logs em tempo real** no terminal
- ✅ **Detecção de erros** instantânea
- ✅ **Recarregamento automático** das rotas

### **Frontend (React/Vite):**
- ✅ **Hot Module Replacement (HMR)**
- ✅ **Atualização instantânea** sem perder estado
- ✅ **CSS hot reload**
- ✅ **TypeScript** compilação automática

---

## 🛠️ **Configurações para Preview ao Vivo**

### **1. Vite Config (Frontend)**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Permite acesso externo
    watch: {
      usePolling: true // Melhor para alguns sistemas
    }
  }
});
```

### **2. Server Config (Backend)**
```typescript
// server/index.ts
const app = express();

// Middleware para CORS em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
  }));
}
```

---

## 📱 **Preview em Diferentes Dispositivos**

### **Acesso Local:**
```
🌐 Desktop: http://localhost:5000
📱 Mobile: http://192.168.1.100:5000 (seu IP local)
```

### **Acesso Externo (se necessário):**
```bash
# Expor porta para internet (ngrok)
npx ngrok http 5000

# URL gerada: https://abc123.ngrok.io
```

---

## 🔧 **Ferramentas de Desenvolvimento**

### **1. Browser DevTools:**
- **Console** - Logs e erros
- **Network** - Requisições API
- **Elements** - Inspetor de HTML/CSS
- **React DevTools** - Componentes React

### **2. Terminal Logs:**
```bash
# Backend logs
[INFO] Server running on port 5000
[INFO] Database connected
[INFO] API request: GET /api/appointments

# Frontend logs (console do browser)
console.log('Dados carregados:', data);
```

### **3. Hot Reload Indicators:**
- **Backend:** Terminal mostra "restarting..."
- **Frontend:** Browser mostra indicador de atualização

---

## 🎯 **Fluxo de Desenvolvimento com Preview**

### **1. Fazer alteração no código:**
```typescript
// Modificar um componente React
function AppointmentsList() {
  return (
    <div className="bg-blue-500"> {/* Mudança de cor */}
      <h1>Agendamentos</h1>
    </div>
  );
}
```

### **2. Preview automático:**
- ✅ **Frontend** atualiza instantaneamente
- ✅ **Backend** reinicia automaticamente
- ✅ **Browser** mostra mudanças em tempo real

### **3. Testar funcionalidades:**
- ✅ **Login/Logout**
- ✅ **CRUD** de dados
- ✅ **APIs** e endpoints
- ✅ **Responsividade** mobile

---

## 🚨 **Solução de Problemas**

### **Problema: Servidor não inicia**
```bash
# Verificar dependências
npm install

# Verificar variáveis de ambiente
echo $DATABASE_URL

# Verificar porta
lsof -i :5000
```

### **Problema: Frontend não atualiza**
```bash
# Limpar cache do Vite
rm -rf node_modules/.vite

# Reiniciar servidor
npm run dev
```

### **Problema: Banco não conecta**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
node -e "console.log(process.env.DATABASE_URL)"
```

---

## 📊 **Monitoramento em Tempo Real**

### **1. Logs do Sistema:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend (se necessário)
npx vite --host

# Terminal 3 - Logs do banco
tail -f logs/database.log
```

### **2. Métricas de Performance:**
- **Tempo de resposta** das APIs
- **Uso de memória** do servidor
- **Queries** do banco de dados
- **Erros** em tempo real

---

## 🎨 **Preview de Design**

### **1. Responsividade:**
- **Desktop:** 1920x1080
- **Tablet:** 768x1024
- **Mobile:** 375x667

### **2. Temas:**
- **Light/Dark mode**
- **Cores personalizadas**
- **Tipografia**

### **3. Componentes:**
- **Storybook** (se configurado)
- **Isolation** de componentes
- **Props** dinâmicas

---

## 🔄 **Deploy com Preview**

### **1. Render (Produção):**
- **Auto-deploy** após push no GitHub
- **Preview URL** disponível
- **Rollback** automático em caso de erro

### **2. GitHub Actions:**
- **CI/CD** pipeline
- **Testes** automáticos
- **Preview** antes do merge

---

## 🎯 **Comandos Rápidos**

```bash
# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build

# Testar localmente
npm start

# Limpar cache
npm run clean

# Verificar tipos TypeScript
npm run check
```

---

## ✅ **Checklist de Preview ao Vivo**

- [ ] **Servidor rodando** em `http://localhost:5000`
- [ ] **Hot reload** funcionando
- [ ] **Logs** aparecendo no terminal
- [ ] **Browser** atualizando automaticamente
- [ ] **APIs** respondendo corretamente
- [ ] **Banco de dados** conectado
- [ ] **Responsividade** testada
- [ ] **Funcionalidades** principais funcionando

---

**🎉 Agora você tem preview ao vivo de todas as alterações!**

**Qualquer mudança que você fizer no código será refletida instantaneamente no browser!** 🚀
