const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "QuickTop API",
      version: "2.0.0",
      description: "Production-ready fintech backend for QuickTop.",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development",
      },
      {
        url: "https://quicktop-backend-8aon.onrender.com",
        description: "Production Server",
      },
    ],

    tags: [
      {
        name: "Authentication",
        description: "User authentication endpoints",
      },
      {
        name: "Profile",
        description: "User profile management",
      },
      {
        name: "Transaction PIN",
        description: "Transaction PIN management",
      },
      {
        name: "Wallet",
        description: "Wallet operations",
      },
      {
        name: "Payments",
        description: "Wallet funding",
      },
      {
        name: "Airtime",
        description: "Airtime purchase",
      },
      {
        name: "Data",
        description: "Data purchase",
      },
      {
        name: "Data Plans",
        description: "Available data plans",
      },
      {
        name: "Electricity",
        description: "Electricity bills",
      },
      {
        name: "Cable TV",
        description: "Cable TV subscriptions",
      },
      {
        name: "Transactions",
        description: "Transaction history",
      },
      {
        name: "Dashboard",
        description: "Dashboard analytics",
      },
      {
        name: "Notifications",
        description: "User notifications",
      },
      {
        name: "Favorites",
        description: "Saved beneficiaries",
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

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    "./routes/*.js",
    "./controllers/*.js",
  ],
};

module.exports = swaggerJsdoc(options);