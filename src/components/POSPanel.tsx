import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Sale } from '../types';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export const POSPanel: React.FC = () => {
  const { products, recordSale } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Sale['paymentMethod']>('Tunai');
  const [cashAmount, setCashAmount] = useState<string>('');
  
  // Checkout feedback message
  const [checkoutResult, setCheckoutResult] = useState<{
    success: boolean;
    message: string;
    invoiceNumber?: string;
    change?: number;
  } | null>(null);

  // Extract all categories in active products + brand default
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['Semua', ...Array.from(list)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Total invoice calculation
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  }, [cart]);

  // Handle add item to basket
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Double check stock limit
        if (existingItem.quantity >= product.stock) {
          alert(`Stok maksimal untuk "${product.name}" adalah ${product.stock} ${product.unit}.`);
          return prevCart;
        }
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    // Clear previous checkouts
    if (checkoutResult) setCheckoutResult(null);
  };

  // Modify cart quantity
  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          const originalProduct = products.find(p => p.id === productId);
          
          if (newQty <= 0) return null; // mark for deletion
          if (originalProduct && newQty > originalProduct.stock) {
            alert(`Stok maksimal adalah ${originalProduct.stock} ${originalProduct.unit}.`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Clear Basket
  const clearCart = () => {
    setCart([]);
    setCashAmount('');
    setCheckoutResult(null);
  };

  // Handle transaction payment submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Local cashier change calculations if checkout is in Cash/Tunai
    let changeValue = 0;
    if (paymentMethod === 'Tunai') {
      const cashNum = parseFloat(cashAmount) || 0;
      if (cashNum < cartTotal) {
        setCheckoutResult({
          success: false,
          message: "Uang tunai yang dibayar kurang dari nilai subtotal transaksi."
        });
        return;
      }
      changeValue = cashNum - cartTotal;
    }

    // Submit transaction
    const cartItemsPayload = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));

    const result = recordSale(cartItemsPayload, paymentMethod);

    if (result.success) {
      setCheckoutResult({
        success: true,
        message: result.message,
        invoiceNumber: result.invoiceNumber,
        change: changeValue
      });
      // Flush active cart items on success
      setCart([]);
      setCashAmount('');
    } else {
      setCheckoutResult({
        success: false,
        message: result.message
      });
    }
  };

  return (
    <div id="pos-panel-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT: Products Grid (60%) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              <span>Menu Kasir Pos</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Pilih produk di bawah untuk mencatat penjualan</p>
          </div>

          {/* Search bar helper */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Cari SKU atau Nama Produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 mb-5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid Results */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-150 rounded-2xl">
            <p className="text-sm text-slate-500 font-medium">Tidak ada produk ditemukan.</p>
            <p className="text-xs text-slate-400 mt-0.5">Coba ubah kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredProducts.map(product => {
              const isLowStock = product.stock <= product.minStock;
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
                    isOutOfStock 
                      ? 'bg-slate-50/70 border-slate-100 opacity-60 cursor-not-allowed' 
                      : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 select-all">{product.sku}</span>
                      {isOutOfStock ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">Habis</span>
                      ) : isLowStock ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded animate-pulse">Menipis</span>
                      ) : null}
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 h-10 leading-tight mb-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium">Harga Jual</p>
                      <p className="text-sm font-bold text-slate-900 font-mono">
                        Rp {product.sellPrice.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-medium">Stok</p>
                      <p className={`text-xs font-bold font-mono ${isLowStock ? 'text-rose-600' : 'text-slate-600'}`}>
                        {product.stock} {product.unit}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: Active Cashier Shopping Cart (40%) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center space-x-2 text-slate-800">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-bold tracking-tight">Keranjang Belanja</h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-slate-500 font-semibold hover:text-rose-600 flex items-center space-x-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Checkout Results Toast Banner feedback */}
        {checkoutResult && (
          <div
            className={`p-4 rounded-xl mb-4 text-xs font-medium flex items-start space-x-2.5 ${
              checkoutResult.success 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' 
                : 'bg-rose-50 text-rose-800 border border-rose-150'
            }`}
          >
            {checkoutResult.success ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{checkoutResult.message}</p>
                  <p className="font-mono text-[10px] text-emerald-700">No. Invoice: {checkoutResult.invoiceNumber}</p>
                  {checkoutResult.change !== undefined && checkoutResult.change > 0 && (
                    <p className="font-semibold text-slate-700 text-[11px] mt-1 pt-1 border-t border-emerald-100">
                      Uang Kembalian: <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded">Rp {checkoutResult.change.toLocaleString('id-ID')}</span>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-normal">{checkoutResult.message}</p>
              </>
            )}
          </div>
        )}

        {/* Cart Item rows */}
        {cart.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-2.5 border border-slate-100">
              <ShoppingCart className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold">Keranjang Kosong</p>
            <p className="text-xs text-slate-400 mt-0.5">Pilih produk di panel kiri untuk memulai transaksi.</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.map(item => (
                <div key={item.product.id} className="py-3 flex items-start justify-between space-x-2">
                  <div className="flex-1">
                    <p className="text-xs font-mono font-semibold text-slate-400">{item.product.sku}</p>
                    <p className="text-sm font-bold text-slate-800 leading-tight pr-1">{item.product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      Rp {item.product.sellPrice.toLocaleString('id-ID')} / {item.product.unit}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-1.5">
                    {/* Quantity Selector Action buttons */}
                    <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded transition cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold font-mono px-2 text-slate-800 bg-white shadow-xs rounded border border-slate-100 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded transition cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Subtotal preview block */}
                    <p className="text-xs font-bold font-mono text-slate-800">
                      Rp {(item.product.sellPrice * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[10px] text-slate-400 font-semibold hover:text-rose-600 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations summaries */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Jumlah Item</span>
                <span className="font-mono font-bold text-slate-800">{cart.reduce((sum, item) => sum + item.quantity, 0)} Pcs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">Total Tagihan</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  Rp {cartTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method selector buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Metode Pembayaran</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Tunai', 'QRIS', 'Transfer', 'Debit'] as Sale['paymentMethod'][]).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-[11px] font-bold rounded-lg transition border cursor-pointer text-center ${
                      paymentMethod === method
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Paid input (shown only if Payment Method is Tunai/Cash) */}
            {paymentMethod === 'Tunai' && (
              <div className="space-y-1.5 pt-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">Jumlah Uang Dibayar (Rp)</label>
                  {cartTotal > 0 && (
                    <button
                      type="button"
                      onClick={() => setCashAmount(String(cartTotal))}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100"
                    >
                      Uang Pas
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-mono font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 100000"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                {parseFloat(cashAmount) > 0 && parseFloat(cashAmount) >= cartTotal && (
                  <p className="text-[10px] text-slate-550 font-semibold font-mono">
                    Kembalian: <span className="text-emerald-700 font-bold">Rp {(parseFloat(cashAmount) - cartTotal).toLocaleString('id-ID')}</span>
                  </p>
                )}
              </div>
            )}

            {/* Submit Transaction Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-xl cursor-pointer transition shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-200 flex items-center justify-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Bayar Transaksi Rp {cartTotal.toLocaleString('id-ID')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
