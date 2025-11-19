# Notetime --- Setup do Projeto

Este guia descreve como configurar e executar o projeto **Notetime**
localmente.\
Certifique-se de seguir todos os passos para que o backend e o frontend
funcionem corretamente.

------------------------------------------------------------------------

## ✅ Pré-requisitos

Antes de iniciar, verifique se você possui instalado na sua máquina:

-   **Docker**\
-   **Docker Compose**
-   **PostgreSQL**
-   **Node.js** (versão recomendada: LTS)

------------------------------------------------------------------------

## 📦 Configuração do Backend

### 1. Acesse a pasta do backend:

``` sh
cd backend/
```

### 2. Crie o arquivo `.env` na raiz do backend contendo:

``` env
DATABASE_URL="postgresql://notetime:notetime_dev@localhost:5432/notetime"
JWT_SECRET="meu-super-secret-jwt-muito-seguro-com-mais-de-32-caracteres"
JWT_EXPIRES_IN="8h"
PORT=3000
NODE_ENV=development
```

### 3. Instale as dependências:

``` sh
npm install
```

------------------------------------------------------------------------

## 🐳 Subindo os serviços com Docker

Volte para a **raiz do projeto** e execute:

``` sh
docker-compose up -d
```

Verifique se está rodando:

``` sh
docker ps
```

------------------------------------------------------------------------

## 🗄️ Configuração do Prisma

Volte para o backend:

``` sh
cd backend/
```

Execute os comandos:

``` sh
npx prisma init
npx prisma migrate dev --name init
node prisma/seed.js
```

------------------------------------------------------------------------

## 🚀 Inicializando o Backend

Ainda dentro do backend, execute:

``` sh
npm run dev
```

O servidor estará rodando em:

    http://localhost:3000

------------------------------------------------------------------------

## 💻 Configuração do Frontend

Abra outro terminal e acesse:

``` sh
cd frontend/
```

Instale as dependências:

``` sh
npm install
```

Inicie o projeto:

``` sh
npm run dev
```

A aplicação estará disponível no endereço mostrado no terminal
(geralmente `http://localhost:5173`).

------------------------------------------------------------------------

## ✔️ Pronto!

Seu ambiente está configurado! O backend e o frontend devem estar
rodando corretamente.
