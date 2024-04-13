import { redirect } from 'next/navigation';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';

import prismadb from '@/lib/prismadb';

import Navbar from '@/components/navbar';

const DashboardLayout = async ({
    children,
    params
}: {
    children: React.ReactNode,
    params: { storeId: string }
}) => {

    const session = await getServerSession(authOptions);

    if (!session?.userId) {
        redirect('/api/auth/signin');
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId: session.userId
        }
    });

    if (!store) {
        redirect('/');
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}

export default DashboardLayout;