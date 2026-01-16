import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BlogPro API',
      version: '1.0.0',
      description: 'Комплексная API документация для BlogPro - профессиональной блог-платформы',
      contact: {
        name: 'BlogPro Support',
        email: 'support@blogpro.local'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://blogpro.tech' : 'https://blogpro.tech',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      schemas: {
        StandardSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        StandardError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' },
            requestId: { type: 'string' }
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'editor', 'user'] },
            emailVerified: { type: 'boolean' },
            profileImageUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
        },
        BlogPost: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            categoryId: { type: 'number' },
            imageUrl: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            projectUrl: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            slug: { type: 'string' },
            status: { type: 'string', enum: ['published', 'draft', 'archived'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            parentId: { type: 'number', nullable: true },
            sortOrder: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MediaFile: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            mimeType: { type: 'string' },
            size: { type: 'number' },
            url: { type: 'string' },
            thumbnailUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Contact: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            message: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                items: { type: 'array' },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'number' },
                    limit: { type: 'number' },
                    total: { type: 'number' },
                    totalPages: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Номер страницы',
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Количество элементов на странице',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Поле для сортировки',
          schema: { type: 'string', default: 'createdAt' }
        },
        OrderParam: {
          name: 'order',
          in: 'query',
          description: 'Порядок сортировки',
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
        }
      }
    },
  },
  apis: ['./server/api/**/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  const swaggerOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'BlogPro API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true
    }
  };
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
  app.get('/api-docs.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};