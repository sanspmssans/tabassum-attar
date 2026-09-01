'use client';

import { useTransition } from 'react';
import { deleteProduct } from './actions';

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove "${productName}" from the store?`)) {
      startTransition(async () => {
        await deleteProduct(productId);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded text-[11px] font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
    >
      {isPending ? 'Removing...' : '🗑️ Delete'}
    </button>
  );
}