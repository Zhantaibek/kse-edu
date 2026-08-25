import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Educational CRM API',
      version: '1.0.0',
      description: 'API documentation for Educational CRM',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/auth/login': {
        post: {
          tags: ['Auth'],
          security: [],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'OK' } },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          security: [],
          summary: 'Register',
          responses: { 201: { description: 'Created' } },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user',
          responses: { 200: { description: 'OK' } },
        },
      },
      '/students': {
        get: { tags: ['Students'], summary: 'List students', responses: { 200: { description: 'OK' } } },
      },
      '/courses': {
        get: { tags: ['Courses'], summary: 'List courses', responses: { 200: { description: 'OK' } } },
      },
      '/analytics/dashboard': {
        get: { tags: ['Analytics'], summary: 'Dashboard analytics', responses: { 200: { description: 'OK' } } },
      },
    },
  },
  apis: [],
});
