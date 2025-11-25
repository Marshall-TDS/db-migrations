## DB Migrations API

Serviço dedicado a versionar o banco de dados de forma independente das APIs de domínio. Expõe endpoints HTTP para acionar migrations e mantém uma convenção clara de pastas por tarefa (Notion/Jira).

### Stack
- Node.js 20+
- TypeScript 5
- Express 5
- Zod para validações
- Swagger/OpenAPI para documentação

### Scripts
- `npm run dev` — executa a API com reload automático
- `npm run build` — compila para `dist`
- `npm start` — sobe a versão compilada
- `npm run lint` — checa tipos (sem emitir JS)

### Estrutura
```
src
├── app.ts                         # Configuração do Express
├── config/env.ts                  # Variáveis de ambiente
├── core                           # AppError + middlewares globais
├── docs/
│   └── swagger.ts                 # Configuração do Swagger/OpenAPI
├── infra/database
│   ├── connection.ts              # Client único (alterar aqui para Postgres etc.)
│   ├── migrations/                # Contratos, loader e runner
│   └── versions/                  # Pasta por versão/tarefa
│       └── 0.1.0/
│           ├── TASK-0001__20250101001-create-users-table.ts
│           └── index.ts
├── modules/migrations             # Camada MVC desta API
│   ├── controllers/
│   ├── services/
│   └── validators/
└── routes/index.ts                # Rotas públicas
```

### Convenção de Versions
1. Crie uma pasta `src/infra/database/versions/<versao>/` (ex.: `0.2.0` ou `TASK-0123`).
2. Dentro dela, adicione arquivos iniciando com o ID da task (`TASK-XXXX__TIMESTAMP-descricao.ts`).
3. Exporte o array `migrations` no `index.ts` da própria versão.
4. O loader (`migrations/index.ts`) varre todas as versões automaticamente e ordena pelo campo `id`.

### Endpoints
| Método | Rota                 | Descrição |
|--------|----------------------|-----------|
| GET    | `/api/health`        | Health-check do serviço |
| POST   | `/api/migrations/run`| Executa migrations (`direction`: `up` ou `down`, default `up`) |

### Como usar
```bash
cp .env.example .env
npm install
npm run dev
# Disparar migrations (ex.: via HTTPie)
http POST :3444/api/migrations/run direction=up
```

API disponível em `http://localhost:3444/api`.

### Documentação Swagger
- Acesse `http://localhost:3444/docs` após subir o servidor (`npm run dev`).
- Endpoint base configurado como `http://localhost:3444/api`.
- Inclui documentação completa dos endpoints de health-check e execução de migrations, com exemplos de requisições e respostas.

### Notas
O client real do banco deve ser implementado em `src/infra/database/connection.ts`. Basta substituir o `FakeDatabaseClient` por Prisma/Knex/pg, mantendo o restante intacto.

