import { redirect } from 'next/navigation';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

import prismadb from "@/lib/prismadb";

const SetupLayout = async ({ children }: { children: React.ReactNode }) => {

    const session = await getServerSession(authOptions);

    if (!session?.userId) {
        redirect('/api/auth/signin');
    }

    const store = await prismadb.store.findFirst({
        where: {
            userId: session.userId
        }
    });

    if (store) {
        redirect(`/${store.id}`);
    }

    return (
        <>
            {children}
        </>
    )
}

export default SetupLayout;