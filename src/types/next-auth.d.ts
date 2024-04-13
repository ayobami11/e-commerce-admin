import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {

    interface Profile {
        id?: string
    }

    interface Session {
        accessToken: string,
        userId: string
    }

}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string,
        id?: string
    }
}