'use client'

import { useState } from "react";

import { Billboard } from "@prisma/client";

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

import ImageUpload from "@/components/ui/image-upload";


interface BillboardFormProps {
    initialData: Billboard | null
}

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1)
});

type BillboardFormValues = z.infer<typeof formSchema>;

const updateStore = async (
    { url, method }: { url: string, method: string },
    { arg }: { arg: BillboardFormValues }
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

const BillboardForm: React.FC<BillboardFormProps> = ({ initialData }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit billboard" : "Create billboard";
    const description = initialData ? "Edit a billboard" : "Add a new billboard";
    const toastMessage = initialData ? "Billboard updated." : "Billboard created.";
    const action = initialData ? "Save changes" : "Create";

    const {
        trigger: triggerStoreUpdate,
        isMutating: isMutatingStoreUpdate
    } = useSWRMutation({
        url: initialData ?
            `/api/${params.storeId}/billboards/${params.billboardId}` : `/api/${params.storeId}/billboards`,
        method: initialData ? "PATCH" : "POST"
    }, updateStore);

    const {
        trigger: triggerStoreDelete,
        isMutating: isMutatingStoreDelete
    } = useSWRMutation(`/api/${params.storeId}/billboards/${params.billboardId}`, deleteStore);

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: "",
            imageUrl: ""
        }
    });

    const onSubmit = async (data: BillboardFormValues) => {
        console.log(data);

        try {

            await triggerStoreUpdate(data);

            router.refresh();
            router.push(`/${params.storeId}/billboards`);
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
            router.push(`/${params.storeId}/billboards`);
            toast.success('Billboard deleted');
        } catch (error) {
            console.log(error);
            toast.error('Make sure you removed all categories using this billboard first.');
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
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value ? [field.value] : []}
                                        disabled={isMutatingStoreUpdate}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='grid grid-cols-3 gap-8'>
                        <FormField
                            control={form.control}
                            name='label'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isMutatingStoreUpdate}
                                            placeholder='Billboard label'
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

export default BillboardForm;