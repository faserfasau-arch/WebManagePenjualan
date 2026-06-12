import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Sale, SaleItem, INITIAL_PRODUCTS, INITIAL_SALES } from '../types';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  lowStockProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, amount: number) => void;
  recordSale: (
    cartItems: { productId: string; quantity: number }[],
    paymentMethod: Sale['paymentMethod']
  ) => { success: boolean; message: string; invoiceNumber?: string };
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Load initial data
  useEffect(() => {
    const savedProducts = localStorage.getItem('tokoease_products');
    const savedSales = localStorage.getItem('tokoease_sales');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('tokoease_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      setSales(INITIAL_SALES);
      localStorage.setItem('tokoease_sales', JSON.stringify(INITIAL_SALES));
    }
  }, []);

  // Save changes helper
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('tokoease_products', JSON.stringify(newProducts));
  };

  const saveSales = (newSales: Sale[]) => {
    setSales(newSales);
    localStorage.setItem('tokoease_sales', JSON.stringify(newSales));
  };

  // Add a product
  const addProduct = (p: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    saveProducts([...products, newProduct]);
  };

  // Update a product
  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const updated = products.map(p => (p.id === id ? { ...p, ...updatedFields } : p));
    saveProducts(updated);
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
  };

  // Quick stock adjuster
  const adjustStock = (id: string, amount: number) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const newStock = Math.max(0, p.stock + amount);
        return { ...p, stock: newStock };
      }
      return p;
    });
    saveProducts(updated);
  };

  // Record a transaction sale
  const recordSale = (
    cartItems: { productId: string; quantity: number }[],
    paymentMethod: Sale['paymentMethod']
  ): { success: boolean; message: string; invoiceNumber?: string } => {
    // 1. Validate stock first
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return { success: false, message: `Produk dengan ID ${item.productId} tidak ditemukan.` };
      }
      if (product.stock < item.quantity) {
        return { 
          success: false, 
          message: `Stok "${product.name}" tidak mencukupi. Tersedia: ${product.stock} ${product.unit}, dimasukkan: ${item.quantity}.` 
        };
      }
    }

    // 2. Process sale items and accumulate profit & amount
    const processedItems: SaleItem[] = [];
    let totalAmount = 0;
    let totalProfit = 0;

    const updatedProducts = [...products];

    for (const item of cartItems) {
      const prodIdx = updatedProducts.findIndex(p => p.id === item.productId);
      const product = updatedProducts[prodIdx];

      // Deduct stock
      updatedProducts[prodIdx] = {
        ...product,
        stock: product.stock - item.quantity
      };

      const itemSubtotal = product.sellPrice * item.quantity;
      const itemProfit = (product.sellPrice - product.buyPrice) * item.quantity;

      totalAmount += itemSubtotal;
      totalProfit += itemProfit;

      processedItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
        subtotal: itemSubtotal
      });
    }

    // 3. Generate invoice number
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todaysSalesCount = sales.filter(s => s.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length;
    const invoiceNumber = `INV-${todayStr}-${String(todaysSalesCount + 1).padStart(3, '0')}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      timestamp: new Date().toISOString(),
      items: processedItems,
      totalAmount,
      totalProfit,
      paymentMethod
    };

    // 4. Save both
    saveProducts(updatedProducts);
    saveSales([newSale, ...sales]); // Prepends so latest sale is on top

    return { success: true, message: "Transaksi berhasil dicatat!", invoiceNumber };
  };

  // Reset demo data
  const clearAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    localStorage.setItem('tokoease_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('tokoease_sales', JSON.stringify(INITIAL_SALES));
  };

  // Dynamically compute low stock items (where stock <= minStock)
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <AppContext.Provider
      value={{
        products,
        sales,
        lowStockProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        recordSale,
        clearAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
