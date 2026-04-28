import { sendOrderEmail } from "../lib/email";

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function run() {
  const sampleItems = [
    {
      title: "Banarasi Silk Saree - Maroon Gold",
      price: 2899,
      qty: 1,
      color: "Maroon",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80",
    },
    {
      title: "Chiffon Printed Saree - Teal",
      price: 1499,
      qty: 2,
      color: "Teal",
      image:
        "https://images.unsplash.com/photo-1593005510329-ce4f1e0229cb?auto=format&fit=crop&w=300&q=80",
    },
    {
      title: "Cotton Daily Wear Saree - Indigo",
      price: 999,
      qty: 1,
      color: "Indigo",
      image:
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const pickedItems = [randomFrom(sampleItems), randomFrom(sampleItems)];
  const totalAmount = pickedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const result = await sendOrderEmail({
    orderId: `TEST-${Date.now()}`,
    customer_name: "Test Customer",
    customer_email: "info.streesarees@gmail.com",
    phone: "9876543210",
    address_line1: "221B, Sector 12",
    address_line2: "Near City Mall",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226001",
    landmark: "Metro Station Gate 2",
    items: pickedItems,
    total_amount: totalAmount,
  });

  console.log("Order email test result:", result);
}

run().catch((error) => {
  console.error("Order email test failed:", error);
  process.exit(1);
});
