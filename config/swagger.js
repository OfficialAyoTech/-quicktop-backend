const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "QuickTop API",
      version: "1.0.0",
      description:
        "Production-ready fintech backend for QuickTop.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development",
      },
      {
        url: "https://YOUR-RENDER-URL.onrender.com",
        description: "Production",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    "./routes/*.js",
    "./controllers/*.js",
  ],
};

module.exports = swaggerJsdoc(options);