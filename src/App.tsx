/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { POSPanel } from './components/POSPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ShoppingCart, Layers, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'analytics'>('analytics');
  const { lowStockProducts } = useApp();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Real-Time Stock alert banner at the very top of screen if any items are understocked */}
      {lowStockProducts.length > 0 && (
        <div id="urgent-lowstock-alert-bar" className="bg-rose-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center space-x-2 animate-pulse shadow-md z-45">
          <AlertCircle className="h-4 w-4" />
          <span>PERINGATAN: Ada {lowStockProducts.length} produk dengan stok kritis di bawah batas minimum! Segera restock untuk menghindari kekosongan barang.</span>
        </div>
      )}

      {/* Header component */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Flat Segmented view switcher */}
        <div id="view-segmented-navigator" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {activeTab === 'analytics' ? 'Ringkasan Laporan Toko' : activeTab === 'inventory' ? 'Kelola Stok Toko' : 'Kasir Penjualan'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {activeTab === 'analytics' 
                ? 'Analisis omset, margin keuntungan kotor, kontribusi kategori, dan log riwayat transaksi.' 
                : activeTab === 'inventory' 
                ? 'Tabel inventaris produk, update harga grosir, adjustment stok, and setup limit minumum.' 
                : 'Pilih produk, masukkan jumlah kuantitas, tentukan metode pembayaran, dan cetak invoice.'}
            </p>
          </div>

          {/* Segmented Control Pills */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200/60 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                  : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50/40'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Laporan & Grafik</span>
            </button>

            <button
              onClick={() => setActiveTab('pos')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'pos'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                  : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50/40'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5 text-emerald-600" />
              <span>POS Kasir</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 cursor-pointer relative ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50'
                  : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50/40'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
              <span>Stok Inventaris</span>
              
              {lowStockProducts.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Workspace views loader */}
        <div id="active-workspace-panel" className="transition-all duration-300">
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'pos' && <POSPanel />}
          {activeTab === 'inventory' && <InventoryPanel />}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} Sistem Inventaris dan Penjualan Real-time. All Rights Reserved.</p>
          <div className="flex items-center space-x-4 mt-3 md:mt-0">
            <span className="flex items-center space-x-1 text-emerald-650 bg-emerald-50 px-2.5 py-1 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Penyimpanan Lokal Aktif & Aman</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
