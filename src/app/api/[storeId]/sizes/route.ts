import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";
import { authOptions } from "@/lib/next-auth";


export async function GET(req: Request,
    { params }: { params: { storeId: string } }) {
    try {

        if (!params.storeId) {
            return new NextResponse('Store ID is required', { status: 400 });
        }

        const sizes = await prismadb.size.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(sizes);

    } catch (error) {
        console.log('[SIZES_GET]', error);

        return new NextResponse('Internal error', { status: 500 });
    }
}

export async function POST(req: Request,
    { params }: { params: { storeId: string } }) {
    try {

        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        const body = await req.json();

        const { name, value }: { name: string, value: string } = body;

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!value) {
            return new NextResponse('Value is required', { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse('Store ID is required', { status: 400 });
        }

        console.log(session.user);

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId: session.userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const size = await prismadb.size.create({
            data: {
                name,
                value,
                storeId: params.storeId
            }
        });

        return NextResponse.json(size);

    } catch (error) {
        console.log('[SIZES_POST]', error);

        return new NextResponse('Internal error', { status: 500 });
    }
}