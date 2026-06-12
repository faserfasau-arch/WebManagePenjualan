import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, AlertTriangle, RefreshCw, Layers, CheckCircle2, ShoppingBag } from 'lucide-react';

export const Header: React.FC = () => {
  const { lowStockProducts, adjustStock, clearAllData } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleQuickRestock = (id: string) => {
    // Restock 10 units instantly
    adjustStock(id, 10);
  };

  return (
    <header id="header-container" className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div id="brand-logo" className="flex items-center space-x-3">
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center">
            <Layers className="h-6 w-6 stroke-[2.25]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">
              Sistem Inventaris Toko
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manajemen Inventaris & Penjualan Real-Time
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div id="header-action-controls" className="flex items-center space-x-4">
          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm("Reset ulang semua data inventaris dan penjualan ke contoh awal?")) {
                clearAllData();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Reset Data ke Konfigurasi Awal"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Automatic Low Stock Notification Hub */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition relative ${
                lowStockProducts.length > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white'
              }`}
            >
              <Bell className={`h-5 w-5 ${lowStockProducts.length > 0 ? 'text-amber-600 animate-swing' : 'text-slate-600'}`} />
              
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                id="notification-hub-dropdown" 
                className="absolute right-0 mt-3 w-84 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Peringatan Stok Menipis</span>
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                    {lowStockProducts.length} Produk
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Semua stok aman!</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tidak ada produk di bawah batas min.</p>
                    </div>
                  ) : (
                    lowStockProducts.map(product => (
                      <div key={product.id} className="p-4 hover:bg-slate-50 transition flex items-start justify-between space-x-3">
                        <div className="flex-1">
                          <p className="text-xs font-mono text-emerald-600 font-bold mb-0.5">{product.sku}</p>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{product.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-slate-500">
                              Kategori: <b className="text-slate-700 font-medium">{product.category}</b>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center space-x-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              <span>Stok: {product.stock} {product.unit} (Min: {product.minStock})</span>
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleQuickRestock(product.id)}
                          className="shrink-0 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 hover:border-emerald-300 transition flex items-center space-x-1"
                        >
                          <span>+10 Stok</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {lowStockProducts.length > 0 && (
                  <div className="p-3 bg-rose-50 border-t border-rose-100 text-center">
                    <p className="text-[11px] text-rose-700 font-medium">
                      ⚠️ Segera lakukan pengisian stok untuk mencegah kehabisan barang.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shop Indicator */}
          <div id="shop-indicator-badge" className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-200">
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800">Admin Toko</p>
              <p className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.25 rounded">Live Online</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
