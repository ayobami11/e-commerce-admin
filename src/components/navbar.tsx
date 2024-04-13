import MainNavbar from "@/components/main-navbar";
import StoreSwitcher from "@/components/store-switcher";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import SignoutButton from "./signout-button";

const Navbar = async () => {

    const session = await getServerSession(authOptions);

    if (!session?.userId) {
        redirect('/api/auth/signin');
    }

    const stores = await prismadb.store.findMany({
        where: {
            userId: session.userId
        }
    });

    return (
        <nav className='border-b'>
            <div className='flex h-16 items-center px-4'>
                <StoreSwitcher items={stores} />
                <MainNavbar className='mx-6' />
                <div className='ml-auto flex items-center space-x-4'>
                    <SignoutButton />
                </div>
            </div>
        </nav>
    )
}

export default Navbar;