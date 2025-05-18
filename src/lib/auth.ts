import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Gantilah ini dengan validasi user di database atau hardcoded
        const user = {
          id: '1',
          name: 'Admin',
          email: 'admin@example.com',
        };

        if (
          credentials?.email === 'admin@example.com' &&
          credentials?.password === 'admin123'
        ) {
          return user;
        }
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};
