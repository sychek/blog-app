# Blog app

## Author

Pinchuk Andrii

## Technologies

- Next.js
- Typescript
- TailwindCSS
- Prisma
- tRPC
- NextAuth
- Zod
- Date-fns

## Setting Up and Running the Blog App

### 1. Clone the Repository

If you haven't already cloned the project, run the following command:

```bash
git clone https://github.com/sychek/blog-app.git
cd blog-app
```

### 2. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 3. Set Up Environment Variables

Ensure you have a .env file at the root of the project. Add the following environment variables to the .env file:

```bash
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
```

### 4. Generate Prisma Client and Run Migrations

```bash
npx prisma generate
npx prisma migrate dev
```

or

```bash
yarn prisma generate
yarn prisma migrate dev
```

### 5. Start the Development Server

```bash
npm run dev
```

or

```bash
yarn dev
```

### 6. Access the Blog App

Open your browser and navigate to http://localhost:3000 to access the blog app.
