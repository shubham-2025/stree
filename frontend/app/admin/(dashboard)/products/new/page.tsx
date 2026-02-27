import ProductForm from "@/components/ProductForm";

export const metadata = {
  title: "Add Product — Admin — स्त्री",
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Add Product</h1>
      <div className="bg-white rounded-xl border border-border p-3 sm:p-6">
        <ProductForm />
      </div>
    </div>
  );
}

