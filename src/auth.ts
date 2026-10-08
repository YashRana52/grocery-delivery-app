import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDb();

        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) {
          return null;
        }

        const user = await User.findOne({ email });
        // google se bane user ke paas password nahi hota
        if (!user || !user.password) {
          return null;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return null;
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    //token k andr user ka data dalta h

    async signIn({ user, account }) {
      if (account?.provider == "google") {
        await connectDb();
        let dbUser = await User.findOne({ email: user.email?.toLowerCase() });
        if (!dbUser) {
          //agr user nhi milega to creATE KRENGE ACCOUNT
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      // role client se nahi lete, DB se dobara padhte hain
      if (trigger == "update" && token.id) {
        await connectDb();
        const dbUser = await User.findById(token.id).select("role");
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // seconds me (10 din)
  },
  secret: process.env.AUTH_SECRET,
});
