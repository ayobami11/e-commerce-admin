'use client'

import useSWRMutation from 'swr/mutation';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
    name: z.string().min(1)
});

const createNewStore = async (url: string, { arg }: { arg: { name: string } }) => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(arg)
    });

    return response.json();
};

export const StoreModal = () => {

    const storeModal = useStoreModal();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // todo: create store
        console.log(values);

        try {
            const result = await trigger(values);

            // redirects to the  corresponding store
            window.location.assign(`/${result.id}`);
        } catch (error) {
            toast.error('Something went wrong.');
            console.log(error);
        }
    }

    const { trigger, isMutating } = useSWRMutation('/api/stores', createNewStore);

    return (
        <Modal
            title='Create store'
            description='Add a new store to manage products and categories'
            isOpen={storeModal.isOpen}
            onClose={storeModal.onClose}
        >
            <div>
                <div className='space-y-4 py-2 pb-4'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isMutating}
                                                placeholder='E-commerce'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='pt-6 space-x-2 flex items-center justify-end w-full'>
                                <Button
                                    disabled={isMutating}
                                    variant='outline'
                                    onClick={storeModal.onClose}
                                >Cancel</Button>
                                <Button
                                    disabled={isMutating}
                                    type='submit'
                                >Continue</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </Modal>
    )
}