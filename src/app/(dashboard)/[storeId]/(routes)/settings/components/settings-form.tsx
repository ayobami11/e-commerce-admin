'use client'

import { useState } from "react";

import { Store } from "@prisma/client";

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

import { ApiAlert } from "@/components/ui/api-alert";


interface SettingsFormProps {
    initialData: Store
}

const formSchema = z.object({
    name: z.string().min(1)
});

type SettingsFormValues = z.infer<typeof formSchema>;

const updateStore = async (url: string, { arg }: { arg: SettingsFormValues }) => {
    const response = await fetch(url, {
        method: 'PATCH',
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

const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();

    const {
        trigger: triggerStoreUpdate,
        isMutating: isMutatingStoreUpdate
    } = useSWRMutation(`/api/stores/${params.storeId}`, updateStore);

    const {
        trigger: triggerStoreDelete,
        isMutating: isMutatingStoreDelete
    } = useSWRMutation(`/api/stores/${params.storeId}`, deleteStore);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    });

    const onSubmit = async (data: SettingsFormValues) => {
        console.log(data);

        try {

            await triggerStoreUpdate(data);

            router.refresh();
            toast.success('Store updated.');

        } catch (error) {

            console.log(error);
            toast.error('Something went wrong');
        }
    }

    const onDelete = async () => {
        try {

            await triggerStoreDelete();

            router.refresh();
            router.push('/');
            toast.success('Store deleted');
        } catch (error) {
            console.log(error);
            toast.error('Make sure you removed all products and categories first.');
        } finally {
            setIsOpen(false);
        }
    }


    return (
        <>
            <AlertModal
                isOpen={isOpen}
                isLoading={isMutatingStoreUpdate}
                onClose={() => setIsOpen(false)}
                onConfirm={onDelete}
            />
            <div className='flex items-center justify-between'>
                <Heading
                    title='Settings'
                    description='Manage user preferences'
                />
                <Button
                    disabled={isMutatingStoreUpdate}
                    variant='destructive'
                    size='icon'
                    onClick={() => setIsOpen(true)}
                >
                    <Trash className='w-4 h-4' />
                </Button>
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
                                            placeholder='Store name'
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
                        Save changes
                    </Button>
                </form>
            </Form>
            <Separator />
            <ApiAlert
                title='NEXT_PUBLIC_API_URL'
                description={`${origin}/api/${params.storeId}`}
                variant='public'
            />
        </>
    )
}

export default SettingsForm;