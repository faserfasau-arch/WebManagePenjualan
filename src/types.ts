export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  sellPrice: number;
  buyPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  timestamp: string; // ISO format
  items: SaleItem[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'Tunai' | 'QRIS' | 'Transfer' | 'Debit';
}

export const CATEGORIES = [
  "Makanan & Minuman",
  "Bahan Pokok",
  "Alat Tulis Kantor",
  "Kebutuhan Rumah Tangga",
  "Kesehatan & Kebersihan"
];

export const UNITS = ["Pcs", "Kotak", "Pouch", "Karung", "Botol", "Box", "Pack", "Lusin"];

// Helper to generate past dates
const getDateDaysAgo = (days: number, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "FNB-001",
    name: "Kopi Arabika Toraja 250g",
    category: "Makanan & Minuman",
    stock: 18,
    minStock: 5,
    buyPrice: 45000,
    sellPrice: 60000,
    unit: "Pcs",
    createdAt: getDateDaysAgo(30)
  },
  {
    id: "prod-2",
    sku: "FNB-002",
    name: "Susu UHT Full Cream 1L",
    category: "Makanan & Minuman",
    stock: 4,
    minStock: 10,
    buyPrice: 14000,
    sellPrice: 18500,
    unit: "Kotak",
    createdAt: getDateDaysAgo(28)
  },
  {
    id: "prod-3",
    sku: "BHK-001",
    name: "Beras Ramos Sentra 5kg",
    category: "Bahan Pokok",
    stock: 35,
    minStock: 8,
    buyPrice: 62000,
    sellPrice: 75000,
    unit: "Karung",
    createdAt: getDateDaysAgo(25)
  },
  {
    id: "prod-4",
    sku: "BHK-002",
    name: "Minyak Goreng Refill 2L",
    category: "Bahan Pokok",
    stock: 3,
    minStock: 12,
    buyPrice: 28000,
    sellPrice: 34000,
    unit: "Pouch",
    createdAt: getDateDaysAgo(24)
  },
  {
    id: "prod-5",
    sku: "ATK-001",
    name: "Buku Tulis Kiky A5",
    category: "Alat Tulis Kantor",
    stock: 48,
    minStock: 15,
    buyPrice: 4500,
    sellPrice: 6500,
    unit: "Pcs",
    createdAt: getDateDaysAgo(20)
  },
  {
    id: "prod-6",
    sku: "HRT-001",
    name: "Deterjen Cair Pewangi 800ml",
    category: "Kebutuhan Rumah Tangga",
    stock: 15,
    minStock: 6,
    buyPrice: 16500,
    sellPrice: 21000,
    unit: "Pouch",
    createdAt: getDateDaysAgo(15)
  },
  {
    id: "prod-7",
    sku: "KSH-001",
    name: "Sabun Cuci Tangan Antiseptik 400ml",
    category: "Kesehatan & Kebersihan",
    stock: 2,
    minStock: 6,
    buyPrice: 11000,
    sellPrice: 15000,
    unit: "Botol",
    createdAt: getDateDaysAgo(12)
  },
  {
    id: "prod-8",
    sku: "BHK-003",
    name: "Gula Pasir Premium 1kg",
    category: "Bahan Pokok",
    stock: 28,
    minStock: 10,
    buyPrice: 13000,
    sellPrice: 16500,
    unit: "Pcs",
    createdAt: getDateDaysAgo(10)
  }
];

export const INITIAL_SALES: Sale[] = [
  // 6 Days Ago
  {
    id: "sale-1",
    invoiceNumber: "INV-20260606-001",
    timestamp: getDateDaysAgo(6, 10),
    paymentMethod: "Tunai",
    items: [
      { productId: "prod-1", name: "Kopi Arabika Toraja 250g", quantity: 2, buyPrice: 45000, sellPrice: 60000, subtotal: 120000 },
      { productId: "prod-3", name: "Beras Ramos Sentra 5kg", quantity: 1, buyPrice: 62000, sellPrice: 75000, subtotal: 75000 }
    ],
    totalAmount: 195000,
    totalProfit: 43000
  },
  // 5 Days Ago
  {
    id: "sale-2",
    invoiceNumber: "INV-20260607-001",
    timestamp: getDateDaysAgo(5, 14),
    paymentMethod: "QRIS",
    items: [
      { productId: "prod-2", name: "Susu UHT Full Cream 1L", quantity: 4, buyPrice: 14000, sellPrice: 18500, subtotal: 74000 },
      { productId: "prod-8", name: "Gula Pasir Premium 1kg", quantity: 3, buyPrice: 13000, sellPrice: 16500, subtotal: 49500 }
    ],
    totalAmount: 123500,
    totalProfit: 28500
  },
  // 4 Days Ago
  {
    id: "sale-3",
    invoiceNumber: "INV-20260608-001",
    timestamp: getDateDaysAgo(4, 11),
    paymentMethod: "Debit",
    items: [
      { productId: "prod-4", name: "Minyak Goreng Refill 2L", quantity: 5, buyPrice: 28000, sellPrice: 34000, subtotal: 170000 },
      { productId: "prod-5", name: "Buku Tulis Kiky A5", quantity: 10, buyPrice: 4500, sellPrice: 6500, subtotal: 65000 }
    ],
    totalAmount: 235000,
    totalProfit: 50000
  },
  // 3 Days Ago
  {
    id: "sale-4",
    invoiceNumber: "INV-20260609-001",
    timestamp: getDateDaysAgo(3, 16),
    paymentMethod: "QRIS",
    items: [
      { productId: "prod-1", name: "Kopi Arabika Toraja 250g", quantity: 3, buyPrice: 45000, sellPrice: 60000, subtotal: 180000 },
      { productId: "prod-6", name: "Deterjen Cair Pewangi 800ml", quantity: 2, buyPrice: 16500, sellPrice: 21000, subtotal: 42000 }
    ],
    totalAmount: 222000,
    totalProfit: 54000
  },
  // 2 Days Ago
  {
    id: "sale-5",
    invoiceNumber: "INV-20260610-001",
    timestamp: getDateDaysAgo(2, 13),
    paymentMethod: "Tunai",
    items: [
      { productId: "prod-3", name: "Beras Ramos Sentra 5kg", quantity: 2, buyPrice: 62000, sellPrice: 75000, subtotal: 150000 },
      { productId: "prod-8", name: "Gula Pasir Premium 1kg", quantity: 5, buyPrice: 13000, sellPrice: 16500, subtotal: 82500 },
      { productId: "prod-7", name: "Sabun Cuci Tangan Antiseptik 400ml", quantity: 1, buyPrice: 11000, sellPrice: 15000, subtotal: 15000 }
    ],
    totalAmount: 247500,
    totalProfit: 47500
  },
  // Yesterday
  {
    id: "sale-6",
    invoiceNumber: "INV-20260611-001",
    timestamp: getDateDaysAgo(1, 15),
    paymentMethod: "QRIS",
    items: [
      { productId: "prod-1", name: "Kopi Arabika Toraja 250g", quantity: 4, buyPrice: 45000, sellPrice: 60000, subtotal: 240000 },
      { productId: "prod-2", name: "Susu UHT Full Cream 1L", quantity: 6, buyPrice: 14000, sellPrice: 18500, subtotal: 111000 }
    ],
    totalAmount: 351000,
    totalProfit: 87000
  },
  // Today's earlier transaction
  {
    id: "sale-7",
    invoiceNumber: "INV-20260612-001",
    timestamp: getDateDaysAgo(0, 9),
    paymentMethod: "Transfer",
    items: [
      { productId: "prod-3", name: "Beras Ramos Sentra 5kg", quantity: 3, buyPrice: 62000, sellPrice: 75000, subtotal: 225000 },
      { productId: "prod-4", name: "Minyak Goreng Refill 2L", quantity: 2, buyPrice: 28000, sellPrice: 34000, subtotal: 68000 }
    ],
    totalAmount: 293000,
    totalProfit: 51000
  }
];
