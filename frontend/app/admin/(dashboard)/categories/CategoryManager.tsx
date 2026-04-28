"use client";

import { useState, useTransition } from "react";
import {
  addSiteCategory,
  deleteCategoryEverywhere,
  renameCategory,
} from "@/app/actions/categories";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";

interface CategoryManagerProps {
  categories: {
    name: string;
    productCount: number;
    managed: boolean;
  }[];
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const onAdd = () => {
    startTransition(async () => {
      const result = await addSiteCategory(newCategory);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      setNewCategory("");
      showToast("Category added", "success");
      router.refresh();
    });
  };

  const onDelete = (name: string) => {
    startTransition(async () => {
      const result = await deleteCategoryEverywhere(name);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      showToast("Category removed (products moved to Uncategorized)", "warning");
      router.refresh();
    });
  };

  const onRename = (oldName: string) => {
    startTransition(async () => {
      const result = await renameCategory(oldName, editedName);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      showToast("Category updated", "success");
      setEditingCategory(null);
      setEditedName("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-base font-semibold text-foreground">Add Category</h2>
        <p className="mt-1 text-xs text-muted">
          Categories added here appear in the home page &quot;Shop by Category&quot; section.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Kanjivaram"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={onAdd}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Add Category"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-base font-semibold text-foreground">Existing Categories</h2>
        {categories.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No managed categories yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="rounded-xl border border-border bg-surface-alt px-3 py-2 text-sm"
              >
                {editingCategory === cat.name ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onRename(cat.name)}
                        disabled={isPending}
                        className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditedName("");
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{cat.name}</p>
                        {cat.productCount === 0 && (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        {cat.productCount} product{cat.productCount !== 1 ? "s" : ""} ·{" "}
                        {cat.managed ? "managed" : "from products"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat.name);
                          setEditedName(cat.name);
                        }}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(cat.name)}
                        disabled={isPending}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
