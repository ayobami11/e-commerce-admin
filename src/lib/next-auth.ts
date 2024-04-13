import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, profile }) {

            if (account && profile) {
                token.accessToken = account.access_token,
                token.id = String(profile.id);
            }

            return token;
        },
        async session({ session, token }) {
            if (token.accessToken && token.id) {
                session.accessToken = token.accessToken;
                session.userId = token.id;
            }

            return session;
        }
    }
}
