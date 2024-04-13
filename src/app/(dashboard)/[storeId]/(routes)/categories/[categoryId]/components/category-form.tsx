'use client'

import { useState } from "react";

import { Billboard, Category } from "@prisma/client";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface CategoryFormProps {
    initialData: Category | null,
    billboards: Billboard[]
}

const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().min(1)
});

type CategoryFormValues = z.infer<typeof formSchema>;

const updateStore = async (
    { url, method }: { url: string, method: string },
    { arg }: { arg: CategoryFormValues }
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

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, billboards }) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit category" : "Create category";
    const description = initialData ? "Edit a category" : "Add a new category";
    const toastMessage = initialData ? "Category updated." : "Category created.";
    const action = initialData ? "Save changes" : "Create";

    const {
        trigger: triggerStoreUpdate,
        isMutating: isMutatingStoreUpdate
    } = useSWRMutation({
        url: initialData ?
            `/api/${params.storeId}/categories/${params.categoryId}` : `/api/${params.storeId}/categories`,
        method: initialData ? "PATCH" : "POST"
    }, updateStore);

    const {
        trigger: triggerStoreDelete,
        isMutating: isMutatingStoreDelete
    } = useSWRMutation(`/api/${params.storeId}/categories/${params.categoryId}`, deleteStore);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            billboardId: ""
        }
    });

    const onSubmit = async (data: CategoryFormValues) => {
        console.log(data);

        try {

            await triggerStoreUpdate(data);

            router.refresh();
            router.push(`/${params.storeId}/categories`);
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
            router.push(`/${params.storeId}/categories`);
            toast.success('Category deleted');
        } catch (error) {
            console.log(error);
            toast.error('Make sure you removed all categories using this category first.');
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
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isMutatingStoreUpdate}
                                            placeholder='Category name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='billboardId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billboard</FormLabel>
                                    <Select
                                        disabled={isMutatingStoreUpdate}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder="Select a billboard"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {billboards.map((billboard) => (
                                                <SelectItem
                                                    key={billboard.id}
                                                    value={billboard.id}>
                                                    {billboard.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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

export default CategoryForm;