'use client'

import { useState } from "react";

import { Size } from "@prisma/client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

import * as z from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { AlertModal } from "@/components/modals/alert-modal";


interface SizeFormProps {
    initialData: Size | null
}

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1)
});

type SizeFormValues = z.infer<typeof formSchema>;

const updateStore = async (
    { url, method }: { url: string, method: string },
    { arg }: { arg: SizeFormValues }
) => {

    const response = await fetch(url, {
        method,
        body: JSON.stringify(arg)
    });

    return response.json();
}

const deleteStore = async (url: string) => {
    const response = await fetch(url, {
        method: 'DELETE'
    });

    return response.json();
}

const SizeForm: React.FC<SizeFormProps> = ({ initialData }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit size" : "Create size";
    const description = initialData ? "Edit a size" : "Add a new size";
    const toastMessage = initialData ? "Size updated." : "Size created.";
    const action = initialData ? "Save changes" : "Create";

    const {
        trigger: triggerStoreUpdate,
        isMutating: isMutatingStoreUpdate
    } = useSWRMutation({
        url: initialData ?
            `/api/${params.storeId}/sizes/${params.sizeId}` : `/api/${params.storeId}/sizes`,
        method: initialData ? "PATCH" : "POST"
    }, updateStore);

    const {
        trigger: triggerStoreDelete,
        isMutating: isMutatingStoreDelete
    } = useSWRMutation(`/api/${params.storeId}/sizes/${params.sizeId}`, deleteStore);

    const form = useForm<SizeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: ""
        }
    });

    const onSubmit = async (data: SizeFormValues) => {
        console.log(data);

        try {

            await triggerStoreUpdate(data);

            router.refresh();
            router.push(`/${params.storeId}/sizes`);
            toast.success(toastMessage);

        } catch (error) {

            console.log(error);
            toast.error('Something went wrong');
        }
    }

    const onDelete = async () => {
        try {

            await triggerStoreDelete();

            router.refresh();
            router.push(`/${params.storeId}/sizes`);
            toast.success('Size deleted');
        } catch (error) {
            console.log(error);
            toast.error('Make sure you removed all products using this size first.');
        } finally {
            setIsOpen(false);
        }
    }


    return (
        <>
            <AlertModal
                isOpen={isOpen}
                isLoading={isMutatingStoreDelete}
                onClose={() => setIsOpen(false)}
                onConfirm={onDelete}
            />
            <div className='flex items-center justify-between'>
                <Heading
                    title={title}
                    description={description}
                />
                {initialData ?
                    (<Button
                        disabled={isMutatingStoreDelete}
                        variant='destructive'
                        size='icon'
                        onClick={() => setIsOpen(true)}
                    >
                        <Trash className='w-4 h-4' />
                    </Button>)
                    : null
                }
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8 w-full'
                >
                    <div className='grid grid-cols-3 gap-8'>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isMutatingStoreUpdate}
                                            placeholder='Size name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='value'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isMutatingStoreUpdate}
                                            placeholder='Size value'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button
                        disabled={isMutatingStoreUpdate}
                        className='ml-auto'
                        type='submit'
                    >
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    )
}

export default SizeForm;