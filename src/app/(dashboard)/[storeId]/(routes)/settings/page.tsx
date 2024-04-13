import { authOptions } from '@/lib/next-auth';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import SettingsForm from './components/settings-form';

interface SettingsPageProps {
    params: {
        storeId: string
    }
};

const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {

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
        <div className='flex-col'>
            <div className='flex1 space-y-4 p-8 pt-6'>
                <SettingsForm initialData={store} />
            </div>
        </div>
    )

}

export default SettingsPage;