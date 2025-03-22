# Node Auth Strategies

- Initial server setup and folders.

- Prisma ORM setup - Run `npx prisma init` to initialise prisma which creates prisma directory with schema.prisma where you define models (i.e tables or collections)

Next steps:

1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.
5. Tip: Explore how you can extend the ORM with scalable connection pooling, global caching, and real-time database events. Read: https://pris.ly/cli/beyond-orm

Run `npx prisma` to see list of options available to execute for various usecase. Run `npx prisma generate` to generate which generates ./prisma/client where you can use model schema from prisma client.

- Add Typescript setup and create tsconfig.json file to use typescript with node:

  ### TypeScript & Type Definitions

  npm install --save-dev typescript @types/express @types/node

  ### Development tools

  npm install --save-dev ts-node-dev nodemon

  ### Optional (for testing)

  npm install --save-dev jest @types/jest ts-jest

  run `npx tsc --init` to create tsconfig file initialise

- Created session table for storing session information and refresh token so as to check if session valid create access token using refresh token else if session is expired remove it from session table.

  1.  created auth routes

  /login - take user mail and password if user exists generates access token and refresh token where refresh token store in session.If access token expired then we check this refresh token in sessionif not expired we create new access token using `/refresh-token` route controller.

  /signup - takes email, password, username if email exists throws error else create user then generate access token and refresh token pass it to client in response.

  /refresh-token - to get new access token from refresh token if its valid refresh token in session.

  /logout - clear session from session table

  2. created authCheck middleware which check user access token from header and if valid then moves to next else throws error.
