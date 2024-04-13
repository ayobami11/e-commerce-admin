'use client'

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

const SignoutButton = () => {

    return (
        <Button onClick={() => signOut()}>
            Sign out
        </Button>
    );
}

export default SignoutButton;