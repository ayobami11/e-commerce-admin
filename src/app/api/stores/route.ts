import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";
import { authOptions } from "@/lib/next-auth";

export async function POST(req: Request) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();

        const { name }: { name: string } = body;

        if (!name) {
            return new NextResponse('Name is required', { status: 404 });
        }

        console.log(session.user)

        const store = await prismadb.store.create({
            data: {
                name,
                userId: session.userId
            }
        });

        return NextResponse.json(store);

    } catch (error) {
        console.log('[STORES_POST]', error);

        return new NextResponse('Internal error', { status: 500 });
    }
}