"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProduct, updateProduct } from "@/app/actions/products";
import { CATEGORIES, FABRICS, COLORS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import type { Product } from "@/lib/types";

interface ProductFormProps {
  product?: Product;
}

const MAX_IMAGES = 6;

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = !!product;

  // Dynamic lists (merge defaults + DB values)
  const [allCategories, setAllCategories] = useState<string[]>([...CATEGORIES]);
  const [allFabrics, setAllFabrics] = useState<string[]>([...FABRICS]);
  const [allColors, setAllColors] = useState<{ name: string; hex: string }[]>(
    [...COLORS]
  );

  // "Add new" toggles
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showNewFabric, setShowNewFabric] = useState(false);
  const [newFabric, setNewFabric] = useState("");
  const [showNewColor, setShowNewColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#999999");

  // Fetch existing values from DB
  useEffect(() => {
    const fetchMeta = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("category, fabric, colors");
      if (!data) return;

      // Categories
      const dbCats = Array.from(
        new Set(data.map((d) => d.category).filter(Boolean))
      );
      setAllCategories((prev) =>
        Array.from(new Set([...prev, ...dbCats])).sort()
      );

      // Fabrics
      const dbFabs = Array.from(
        new Set(data.map((d) => d.fabric).filter(Boolean) as string[])
      );
      setAllFabrics((prev) =>
        Array.from(new Set([...prev, ...dbFabs])).sort()
      );

      // Colors
      const dbColorNames = Array.from(
        new Set(data.flatMap((d) => d.colors || []))
      );
      setAllColors((prev) => {
        const existing = new Set(prev.map((c) => c.name));
        const newOnes = dbColorNames
          .filter((n) => !existing.has(n))
          .map((n) => ({ name: n, hex: "#999999" }));
        return [...prev, ...newOnes];
      });
    };
    fetchMeta();
  }, []);

  const [form, setForm] = useState({
    title: product?.title || "",
    slug: product?.slug || "",
    price: product?.price || 0,
    mrp: product?.mrp || 0,
    category: product?.category || CATEGORIES[0],
    fabric: product?.fabric || "",
    colors: product?.colors || [],
    stock_qty: product?.stock_qty || 0,
    description: product?.description || "",
    is_active: product?.is_active ?? true,
  });

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === "number") {
      setForm({ ...form, [name]: parseInt(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm({
      ...form,
      title,
      slug: isEdit ? form.slug : slugify(title),
    });
  };

  const toggleColor = (color: string) => {
    setForm({
      ...form,
      colors: form.colors.includes(color)
        ? form.colors.filter((c) => c !== color)
        : [...form.colors, color],
    });
  };

  // Sets of default (non-deletable) items
  const defaultCategorySet = new Set<string>(CATEGORIES as unknown as string[]);
  const defaultFabricSet = new Set<string>(FABRICS as unknown as string[]);
  const defaultColorSet = new Set<string>(
    (COLORS as unknown as { name: string }[]).map((c) => c.name)
  );

  // Add new category
  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (!allCategories.includes(trimmed)) {
      setAllCategories((prev) => [...prev, trimmed].sort());
    }
    setForm({ ...form, category: trimmed });
    setNewCategory("");
    setShowNewCategory(false);
  };

  // Delete custom category
  const handleDeleteCategory = (cat: string) => {
    setAllCategories((prev) => prev.filter((c) => c !== cat));
    if (form.category === cat) {
      setForm({ ...form, category: allCategories.find((c) => c !== cat) || CATEGORIES[0] });
    }
  };

  // Add new fabric
  const handleAddFabric = () => {
    const trimmed = newFabric.trim();
    if (!trimmed) return;
    if (!allFabrics.includes(trimmed)) {
      setAllFabrics((prev) => [...prev, trimmed].sort());
    }
    setForm({ ...form, fabric: trimmed });
    setNewFabric("");
    setShowNewFabric(false);
  };

  // Delete custom fabric
  const handleDeleteFabric = (fab: string) => {
    setAllFabrics((prev) => prev.filter((f) => f !== fab));
    if (form.fabric === fab) {
      setForm({ ...form, fabric: "" });
    }
  };

  // Add new color
  const handleAddColor = () => {
    const trimmed = newColorName.trim();
    if (!trimmed) return;
    if (!allColors.find((c) => c.name === trimmed)) {
      setAllColors((prev) => [...prev, { name: trimmed, hex: newColorHex }]);
    }
    setForm({ ...form, colors: [...form.colors, trimmed] });
    setNewColorName("");
    setNewColorHex("#999999");
    setShowNewColor(false);
  };

  // Delete custom color
  const handleDeleteColor = (colorName: string) => {
    setAllColors((prev) => prev.filter((c) => c.name !== colorName));
    setForm({ ...form, colors: form.colors.filter((c) => c !== colorName) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setError(
        `Only ${remaining} more image(s) can be added. Max is ${MAX_IMAGES}.`
      );
    }

    setUploading(true);
    setError("");
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Not authenticated. Please refresh and log in again.");
      setUploading(false);
      return;
    }

    const newUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadProgress(`Uploading ${i + 1} of ${filesToUpload.length}...`);

      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image. Skipped.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`"${file.name}" is too large (max 5MB). Skipped.`);
        continue;
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        if (uploadError.message.includes("Bucket not found")) {
          setError(
            'Storage bucket "product-images" not found. Create it in Supabase Dashboard → Storage.'
          );
        } else {
          setError(`Upload failed: ${uploadError.message}`);
        }
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      newUrls.push(urlData.publicUrl);
    }

    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    setUploadProgress("");
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!form.title.trim()) {
      setError("Title is required.");
      setSaving(false);
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required.");
      setSaving(false);
      return;
    }
    if (form.price <= 0) {
      setError("Price must be greater than 0.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      images,
      mrp: form.mrp > 0 ? form.mrp : null,
    };

    let result;
    if (isEdit && product) {
      result = await updateProduct(product.id, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result.error) {
      setError(result.error);
      showToast(result.error, "error");
      setSaving(false);
      return;
    }

    showToast(
      isEdit ? `"${form.title}" updated successfully!` : `"${form.title}" created successfully!`,
      "success"
    );
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Title + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            placeholder="Kanjivaram Silk Saree"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            required
            value={form.slug}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            placeholder="kanjivaram-silk-saree"
          />
        </div>
      </div>

      {/* Price + MRP + Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Price (₹) *
          </label>
          <input type="number" name="price" required min={1} value={form.price || ""} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            placeholder="2500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">MRP (₹)</label>
          <input type="number" name="mrp" min={0} value={form.mrp || ""} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            placeholder="3500 (optional)" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Stock Qty *</label>
          <input type="number" name="stock_qty" required min={0} value={form.stock_qty} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            placeholder="10" />
        </div>
      </div>

      {/* Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Category *
          </label>
          {showNewCategory ? (
            <div className="flex gap-2">
              <input type="text" value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="New category name" autoFocus />
              <button type="button" onClick={handleAddCategory}
                className="px-3 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
                Add
              </button>
              <button type="button" onClick={() => setShowNewCategory(false)}
                className="px-3 py-2.5 border border-border rounded-lg text-sm hover:bg-surface-alt transition-colors">
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select name="category" required value={form.category} onChange={handleChange}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
                {allCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNewCategory(true)}
                className="px-3 py-2.5 border border-dashed border-brand text-brand rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors whitespace-nowrap">
                + New
              </button>
            </div>
          )}
          {/* Custom category chips with delete */}
          {allCategories.filter((c) => !defaultCategorySet.has(c)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allCategories.filter((c) => !defaultCategorySet.has(c)).map((c) => (
                <span key={c} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-brand-50 text-brand text-xs rounded-full font-medium">
                  {c}
                  <button type="button" onClick={() => handleDeleteCategory(c)}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-brand hover:text-white transition-colors text-[10px] leading-none"
                    title={`Remove ${c}`}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Fabric */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Fabric
          </label>
          {showNewFabric ? (
            <div className="flex gap-2">
              <input type="text" value={newFabric}
                onChange={(e) => setNewFabric(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddFabric(); } }}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                placeholder="New fabric name" autoFocus />
              <button type="button" onClick={handleAddFabric}
                className="px-3 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
                Add
              </button>
              <button type="button" onClick={() => setShowNewFabric(false)}
                className="px-3 py-2.5 border border-border rounded-lg text-sm hover:bg-surface-alt transition-colors">
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select name="fabric" value={form.fabric} onChange={handleChange}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand">
                <option value="">Select fabric (optional)</option>
                {allFabrics.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <button type="button" onClick={() => setShowNewFabric(true)}
                className="px-3 py-2.5 border border-dashed border-brand text-brand rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors whitespace-nowrap">
                + New
              </button>
            </div>
          )}
          {/* Custom fabric chips with delete */}
          {allFabrics.filter((f) => !defaultFabricSet.has(f)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allFabrics.filter((f) => !defaultFabricSet.has(f)).map((f) => (
                <span key={f} className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-brand-50 text-brand text-xs rounded-full font-medium">
                  {f}
                  <button type="button" onClick={() => handleDeleteFabric(f)}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-brand hover:text-white transition-colors text-[10px] leading-none"
                    title={`Remove ${f}`}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">Colors</label>
          {!showNewColor && (
            <button type="button" onClick={() => setShowNewColor(true)}
              className="text-xs text-brand font-medium hover:underline">
              + Add Custom Color
            </button>
          )}
        </div>

        {showNewColor && (
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <input type="text" value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddColor(); } }}
              className="flex-1 min-w-[120px] px-3 sm:px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="Color name (e.g. Teal)" autoFocus />
            <input type="color" value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0" />
            <button type="button" onClick={handleAddColor}
              className="px-3 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
              Add
            </button>
            <button type="button" onClick={() => setShowNewColor(false)}
              className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-surface-alt transition-colors">
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => (
            <div key={c.name} className="relative group/color">
              <button
                type="button"
                onClick={() => toggleColor(c.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                  form.colors.includes(c.name)
                    ? "border-brand bg-brand-50 text-brand font-medium"
                    : "border-border text-foreground hover:border-muted"
                } ${!defaultColorSet.has(c.name) ? "pr-7" : ""}`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </button>
              {/* Delete button for custom colors only */}
              {!defaultColorSet.has(c.name) && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteColor(c.name); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full
                             text-[10px] flex items-center justify-center leading-none
                             opacity-0 group-hover/color:opacity-100 transition-opacity
                             hover:bg-red-600 shadow-sm"
                  title={`Remove ${c.name}`}
                >×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-y"
          placeholder="Describe the saree — fabric quality, weaving style, occasion, etc."
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Images{" "}
          <span className="text-muted font-normal">
            ({images.length}/{MAX_IMAGES})
          </span>
        </label>
        <p className="text-xs text-muted mb-3">
          Upload up to {MAX_IMAGES} images. First image is the thumbnail.
        </p>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group">
                <img src={url} alt={`Product image ${i + 1}`}
                  className={`w-24 h-28 object-cover rounded-lg border-2 ${
                    i === 0 ? "border-brand" : "border-border"
                  }`} />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-brand text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    Main
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                  {i > 0 && (
                    <button type="button" onClick={() => moveImage(i, i - 1)}
                      className="bg-white text-foreground w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-surface-alt"
                      title="Move left">←</button>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    className="bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                    title="Remove">×</button>
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => moveImage(i, i + 1)}
                      className="bg-white text-foreground w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-surface-alt"
                      title="Move right">→</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length < MAX_IMAGES && (
          <label className={`inline-flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-sm ${
            uploading ? "border-muted text-muted cursor-wait" : "border-border text-muted hover:border-brand hover:text-brand"
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v13.5A1.5 1.5 0 0 0 3.75 21ZM12 9.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
            {uploading ? uploadProgress || "Uploading..." : "Upload Images (max 5MB each)"}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple
              onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
        )}
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}
          className="accent-brand w-4 h-4" />
        <span className="text-sm font-medium text-foreground">Active (visible on shop)</span>
      </label>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button type="submit" disabled={saving || uploading}
          className="w-full sm:w-auto px-8 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors text-sm disabled:opacity-60">
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="w-full sm:w-auto px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-surface-alt transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
