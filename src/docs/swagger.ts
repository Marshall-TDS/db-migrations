import swaggerJsdoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'DB Migrations API',
    version: '1.0.0',
    description:
      'API dedicada para gerenciar versões e migrations do banco de dados PostgreSQL.\n\n' +
      'Todas as rotas respondem com JSON e estão versionadas sob `/api`.',
  },
  servers: [
    {
      url: 'http://localhost:3444/api',
      description: 'Desenvolvimento local',
    },
  ],
  tags: [
    { name: 'Health', description: 'Status do serviço' },
    { name: 'Migrations', description: 'Execução e gerenciamento de migrations' },
  ],
  components: {
    schemas: {
      RunMigrationInput: {
        type: 'object',
        properties: {
          direction: {
            type: 'string',
            enum: ['up', 'down'],
            default: 'up',
            description: 'Direção da migration: "up" para aplicar, "down" para reverter',
            example: 'up',
          },
        },
      },
      RunMigrationResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
          result: {
            type: 'object',
            properties: {
              total: {
                type: 'number',
                description: 'Número total de migrations encontradas e executadas',
                example: 2,
              },
              direction: {
                type: 'string',
                enum: ['up', 'down'],
                example: 'up',
              },
              executedAt: {
                type: 'string',
                format: 'date-time',
                example: '2025-11-25T10:30:00.000Z',
              },
            },
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
          service: {
            type: 'string',
            example: 'db-migrations',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Descrição do erro',
          },
          details: {
            type: 'object',
            nullable: true,
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica status da API',
        description: 'Endpoint de health-check para verificar se o serviço está operante',
        responses: {
          200: {
            description: 'Serviço operante',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/migrations/run': {
      post: {
        tags: ['Migrations'],
        summary: 'Executa migrations do banco de dados',
        description:
          'Executa todas as migrations pendentes na direção especificada.\n\n' +
          '- **up**: Aplica as migrations (cria/atualiza tabelas)\n' +
          '- **down**: Reverte as migrations (remove tabelas)\n\n' +
          'As migrations são executadas na ordem definida pelo campo `id` de cada migration.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RunMigrationInput',
              },
              example: {
                direction: 'up',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Migrations executadas com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RunMigrationResponse',
                },
                example: {
                  status: 'ok',
                  result: {
                    total: 2,
                    direction: 'up',
                    executedAt: '2025-11-25T10:30:00.000Z',
                  },
                },
              },
            },
          },
          422: {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  message: 'Falha de validação',
                  details: {
                    fieldErrors: {
                      direction: ['direction deve ser "up" ou "down"'],
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Erro ao executar migrations',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  message: 'Erro ao conectar com o banco de dados',
                },
              },
            },
          },
        },
      },
    },
  },
}

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)

