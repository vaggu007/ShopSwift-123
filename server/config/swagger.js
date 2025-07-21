const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopSwift E-commerce API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce API built with Node.js, Express.js, and MongoDB',
      contact: {
        name: 'ShopSwift Support',
        email: 'support@shopswift.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.shopswift.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              example: 'Detailed error information',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d0',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            phone: {
              type: 'string',
              example: '+1234567890',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'moderator'],
              example: 'user',
            },
            isEmailVerified: {
              type: 'boolean',
              example: true,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            avatar: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                publicId: { type: 'string' },
                alt: { type: 'string' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d0',
            },
            name: {
              type: 'string',
              example: 'Premium Wireless Headphones',
            },
            slug: {
              type: 'string',
              example: 'premium-wireless-headphones',
            },
            description: {
              type: 'string',
              example: 'High-quality wireless headphones with noise cancellation',
            },
            price: {
              type: 'number',
              example: 299.99,
            },
            discountPrice: {
              type: 'number',
              example: 249.99,
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' },
                  alt: { type: 'string' },
                  isPrimary: { type: 'boolean' },
                },
              },
            },
            category: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d1',
            },
            brand: {
              type: 'string',
              example: 'TechBrand',
            },
            sku: {
              type: 'string',
              example: 'TB-WH-001',
            },
            stock: {
              type: 'number',
              example: 50,
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'draft', 'out-of-stock'],
              example: 'active',
            },
            averageRating: {
              type: 'number',
              example: 4.5,
            },
            numReviews: {
              type: 'number',
              example: 25,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d0',
            },
            name: {
              type: 'string',
              example: 'Electronics',
            },
            slug: {
              type: 'string',
              example: 'electronics',
            },
            description: {
              type: 'string',
              example: 'Electronic devices and accessories',
            },
            image: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                publicId: { type: 'string' },
                alt: { type: 'string' },
              },
            },
            parent: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d1',
            },
            level: {
              type: 'number',
              example: 0,
            },
            isVisible: {
              type: 'boolean',
              example: true,
            },
            productCount: {
              type: 'number',
              example: 150,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d0',
            },
            orderNumber: {
              type: 'string',
              example: 'ORD-2024-001234',
            },
            customer: {
              type: 'string',
              example: '64f8a8b8c8d4e5f6a7b8c9d1',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
            subtotal: {
              type: 'number',
              example: 299.99,
            },
            tax: {
              type: 'number',
              example: 24.00,
            },
            shipping: {
              type: 'number',
              example: 9.99,
            },
            total: {
              type: 'number',
              example: 333.98,
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              example: 'confirmed',
            },
            paymentInfo: {
              type: 'object',
              properties: {
                method: { type: 'string' },
                status: { type: 'string' },
                paymentIntentId: { type: 'string' },
                paidAt: { type: 'string', format: 'date-time' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and account management',
      },
      {
        name: 'Products',
        description: 'Product management and catalog',
      },
      {
        name: 'Categories',
        description: 'Product category management',
      },
      {
        name: 'Users',
        description: 'User profile and account operations',
      },
      {
        name: 'Orders',
        description: 'Order management and processing',
      },
      {
        name: 'Payments',
        description: 'Payment processing and management',
      },
      {
        name: 'Upload',
        description: 'File upload and media management',
      },
    ],
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js',
  ],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  // Swagger UI setup
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info .description { color: #34495e; }
    `,
    customSiteTitle: 'ShopSwift API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  }));

  // JSON API docs endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

module.exports = { swaggerSetup, specs };