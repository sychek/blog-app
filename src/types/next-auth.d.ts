import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    image?: string;
  }
}

