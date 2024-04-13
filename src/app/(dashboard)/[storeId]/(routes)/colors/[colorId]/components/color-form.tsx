'use client'

import { useState } from "react";

import { Color } from "@prisma/client";

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


interface ColorFormProps {
    initialData: Color | null
}

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1).regex(/^#/, {
        message: "String must be a valid hex code"
    })
});

type ColorFormValues = z.infer<typeof formSchema>;

const updateStore = async (
    { url, method }: { url: string, method: string },
    { arg }: { arg: ColorFormValues }
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

const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit color" : "Create color";
    const description = initialData ? "Edit a color" : "Add a new color";
    const toastMessage = initialData ? "Color updated." : "Color created.";
    const action = initialData ? "Save changes" : "Create";

    const {
        trigger: triggerStoreUpdate,
        isMutating: isMutatingStoreUpdate
    } = useSWRMutation({
        url: initialData ?
            `/api/${params.storeId}/colors/${params.colorId}` : `/api/${params.storeId}/colors`,
        method: initialData ? "PATCH" : "POST"
    }, updateStore);

    const {
        trigger: triggerStoreDelete,
        isMutating: isMutatingStoreDelete
    } = useSWRMutation(`/api/${params.storeId}/colors/${params.colorId}`, deleteStore);

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: ""
        }
    });

    const onSubmit = async (data: ColorFormValues) => {
        console.log(data);

        try {

            await triggerStoreUpdate(data);

            router.refresh();
            router.push(`/${params.storeId}/colors`);
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
            router.push(`/${params.storeId}/colors`);
            toast.success('Color deleted');
        } catch (error) {
            console.log(error);
            toast.error('Make sure you removed all products using this color first.');
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
                                            placeholder='Color name'
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
                                        <div className="flex items-center gap-x-4">
                                            <Input
                                                disabled={isMutatingStoreUpdate}
                                                placeholder='Color value'
                                                {...field}
                                            />
                                            <div
                                                className="border p-4 rounded-full"
                                                style={{ backgroundColor: field.value }}
                                            />
                                        </div>
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

export default ColorForm;