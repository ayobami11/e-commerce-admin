"use client"

import useSWRMutation from "swr/mutation";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductColumn } from "./columns"
import { Button } from "@/components/ui/button"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"
import toast from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
    data: ProductColumn
}

const deleteProduct = async (url: string) => {
    const response = await fetch(url, {
        method: 'DELETE'
    });

    return response.json();
}


export const CellAction: React.FC<CellActionProps> = ({ data }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const router = useRouter();
    const params = useParams();

    const {
        trigger,
        isMutating
    } = useSWRMutation(`/api/${params.storeId}/products/${data.id}`, deleteProduct);

    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Product ID copied to clipboard.");
    }

    const onDelete = async () => {
        try {

            await trigger();

            router.refresh();
            toast.success('Product deleted');
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong.');
        } finally {
            setIsOpen(false);
        }
    }

    return (
        <>
            <AlertModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={onDelete}
                isLoading={isMutating}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopy(data.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsOpen(true)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}