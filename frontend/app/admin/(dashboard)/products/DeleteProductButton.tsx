"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

export default function DeleteProductButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    setDeleting(true);
    const result = await deleteProduct(productId);
    if (result.error) {
      showToast(result.error, "error");
      setDeleting(false);
      return;
    }

    showToast(`"${productTitle}" deleted successfully`, "success");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={deleting}
        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
      >
        {deleting ? "..." : "Delete"}
      </button>

      {/* Confirm dialog — centered popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-toast-in">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-foreground mb-1">
              Delete Product?
            </h3>
            <p className="text-center text-sm text-muted mb-6">
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{productTitle}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium
                           hover:bg-surface-alt transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold
                           hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
