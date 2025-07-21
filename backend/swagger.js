// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Collaborative Document API",
    version: "1.0.0",
    description: "API documentation for the collaborative document backend (with Firebase + JWT Auth)",
  },
  servers: [
    {
      url: "http://localhost:5000", // Update to production URL later
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
};

const options = {
  swaggerDefinition,
  apis: ["./index.js"], // Path to the files containing annotations
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;
