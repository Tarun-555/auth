import swaggerJSDoc, { SwaggerDefinition, xOptions } from "swagger-jsdoc";
import { version } from "../../package.json";

const options: xOptions = {
  definition: {
    openApi: "3.0.0",
    info: {
      title: "Auth strategies",
      version: version,
    },
    servers: [
      {
        url: "http://localhost:3002",
        description: "Development server",
      },
    ],
    schemes: ["http://localhost:3002"],
    // schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
  },
  apis: ["src/routes/*.ts"],
};

export const openApiSpecs = swaggerJSDoc(options);
