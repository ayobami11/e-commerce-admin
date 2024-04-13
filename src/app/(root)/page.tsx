'use client'

import { useEffect } from "react";

import { Modal } from "@/components/ui/modal";
import { useStoreModal } from "@/hooks/use-store-modal";

const SetupPage = () => {

  const isOpen = useStoreModal(state => state.isOpen);
  const onOpen = useStoreModal(state => state.onOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }

  }, [isOpen, onOpen]);

  return (
    <main>
      <div className='p-4'>
          Children
      </div>
    </main>
  );
}

export default SetupPage;