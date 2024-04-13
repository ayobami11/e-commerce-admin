'use client'

import { useState } from "react";

import { Category, Color, Image, Product, Size } from "@prisma/client";

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
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { AlertModal } from "@/components/modals/alert-modal";

import ImageUpload from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";


interface ProductFormProps {
    initialData: Product & {
        images: Image[]
    } | null,
    categories: Category[],
    colors: Color[],
    sizes: Size[]
}

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    categoryId: z.string().min(1),
    colorId: z.string().min(1),
    sizeId: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

const updateStore = async (
    { url, method }: { url: string, method: string },
    { arg }: { arg: ProductFormValues }
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

const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    sizes,
    colors
}) => {

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const params = useParams();
    const router = useRouter();

    const title = initialData ? "Edit product" : "Create product";
    const description = initialData ? "Edit a product" : "Add a new product";
    const toastMessage = initialData ? "Product updated." : "Product created.";
    const action = initialData ? "Save changes" : "Create";

    const {
        trigger: triggerStoreUpdate,
        isMutating: isMutatingStoreUpdate
    } = useSWRMutation({
        url: initialData ?
            `/api/${params.storeId}/products/${params.productId}` : `/api/${params.storeId}/products`,
        method: initialData ? "PATCH" : "POST"
    }, updateStore);

    const {
        trigger: triggerStoreDelete,
        isMutating: isMutatingStoreDelete
    } = useSWRMutation(`/api/${params.storeId}/products/${params.productId}`, deleteStore);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price))
        } : {
            name: "",
            images: [],
            price: 0,
            categoryId: "",
            colorId: "",
            sizeId: "",
            isFeatured: false,
            isArchived: false
        }
    });

    const onSubmit = async (data: ProductFormValues) => {
        console.log(data);

        try {

            await triggerStoreUpdate(data);

            router.refresh();
            router.push(`/${params.storeId}/products`);
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
            router.push(`/${params.storeId}/products`);
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
                        name="images"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value.map((image) => image.url)}
                                        disabled={isMutatingStoreUpdate}
                                        onChange={(url) => field.onChange([...field.value, { url }])}
                                        onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
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
                                            placeholder='Product name'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='price'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            disabled={isMutatingStoreUpdate}
                                            placeholder='9.99'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='categoryId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
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
                                                    placeholder="Select a category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='sizeId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Size</FormLabel>
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
                                                    placeholder="Select a size"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sizes.map((size) => (
                                                <SelectItem
                                                    key={size.id}
                                                    value={size.id}>
                                                    {size.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='colorId'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
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
                                                    placeholder="Select a color"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {colors.map((color) => (
                                                <SelectItem
                                                    key={color.id}
                                                    value={color.id}>
                                                    {color.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='isFeatured'
                            render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 space-y-0 rounded border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Featured</FormLabel>
                                        <FormDescription>This product will appear on the home page</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='isArchived'
                            render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 space-y-0 rounded border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Archived</FormLabel>
                                        <FormDescription>This product will not appear anywhere in the store</FormDescription>
                                    </div>
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

export default ProductForm;