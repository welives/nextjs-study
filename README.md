## Overview

This is a simple demo using the following stack:

- Framework - [Next.js 14](https://nextjs.org)
- Language - [TypeScript](https://www.typescriptlang.org)
- Styling - [UnoCSS](https://unocss.dev/)
- Components - [Ant Design](https://ant-design.antgroup.com/index-cn)
- Database - [PostgreSQL](https://www.postgresql.org/docs/14/index.html)
- Database ORM - [Drizzle-orm](https://orm.drizzle.team/)
- Schema Validations - [Zod](https://zod.dev)
- State Management - [Zustand](https://zustand-demo.pmnd.rs)
- Auth - [Auth.js](https://authjs.dev/)
- Linting - [ESLint](https://eslint.org)
- Formatting - [Prettier](https://prettier.io)
- Docker [Docker](https://www.docker.com/)


## Getting Started

Follow these steps to clone the repository and start the development server:

- `git clone https://github.com/welives/nextjs-study.git`
- `pnpm i`
- Create a `.env.local` file by copying the example environment file: `cp .env.example .env.local`
- Add the required environment variables to the `.env.local` file.
- Create a Docker network: `docker network create -d bridge next-study`
- Start up the database Docker  `make start-database`
- Migrate datebase: `pnpm drizzle:action` and select the `migrate` option
- Start the development server `pnpm dev`

You should now be able to access the application at [http://localhost:3000](http://localhost:3000)

If you want to initial datebase, you also can run `pnpm seed`
