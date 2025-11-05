import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import client from "../../../lib/db"
import "next-auth/jwt"
import { getUserById } from "../actions"
import { authConfig } from "../auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client),

    session: { strategy: "jwt" },
    callbacks: {


        async jwt({ token, trigger, session, account }) {

            if (!token.sub) return token
            const existinguser = await getUserById(token.sub)
            if (!existinguser) return token
            token.name = existinguser.name
            token.email = existinguser.email
            token.role = existinguser.role

            return token
        },

        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
                session.user.role = token.role
            }
            return session
        },
    },
    secret: process.env.AUTH_SECRET,
    ...authConfig
})


