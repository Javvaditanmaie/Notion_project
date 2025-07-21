const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Collaborative Document Editor API",
    version: "1.0.0",
    description: "API documentation for the Notion-like collaborative editor using Firebase, Yjs, and WebRTC.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development server",
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
  apis: ["./index.js"], // Adjust path based on your entry file
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
