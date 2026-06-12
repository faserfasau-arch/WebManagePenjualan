import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Sale } from '../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Award, Layers, ClipboardList, Wallet, FileText, ChevronDown, ChevronUp, AlertCircle, ShoppingBag } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const { sales, products, lowStockProducts } = useApp();
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  // Toggle transaction accordion detail
  const toggleExpand = (saleId: string) => {
    setExpandedSaleId(prev => prev === saleId ? null : saleId);
  };

  // General KPIs metrics
  const kpiStats = useMemo(() => {
    let revenue = 0;
    let profit = 0;
    
    // Today's boundaries
    const todayStr = new Date().toISOString().slice(0, 10);
    let todayRevenue = 0;
    let todaySalesCount = 0;

    sales.forEach(sale => {
      revenue += sale.totalAmount;
      profit += sale.totalProfit;
      
      if (sale.timestamp.startsWith(todayStr)) {
        todayRevenue += sale.totalAmount;
        todaySalesCount++;
      }
    });

    return {
      revenue,
      profit,
      transactionCount: sales.length,
      lowStockCount: lowStockProducts.length,
      todayRevenue,
      todaySalesCount
    };
  }, [sales, lowStockProducts]);

  // Transform 7 days of sales performance for AreaChart
  const weeklyChartData = useMemo(() => {
    const data: { [key: string]: { date: string; label: string; revenue: number; profit: number } } = {};
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Initialize 7 days ago until today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
      
      const dayName = dayNames[d.getDay()];
      const dayNumeric = d.getDate();
      const monthNumeric = d.getMonth() + 1;
      
      data[dateKey] = {
        date: dateKey,
        label: `${dayName} (${dayNumeric}/${monthNumeric})`,
        revenue: 0,
        profit: 0
      };
    }

    // Accumulate actual sales matching dates
    sales.forEach(sale => {
      const saleDateKey = sale.timestamp.slice(0, 10);
      if (data[saleDateKey]) {
        data[saleDateKey].revenue += sale.totalAmount;
        data[saleDateKey].profit += sale.totalProfit;
      }
    });

    return Object.values(data);
  }, [sales]);

  // Transform category metrics for BarChart
  const categorySalesData = useMemo(() => {
    const rawCategories: { [cat: string]: number } = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Look up original product to identify category if needed, or fallback
        const originalProd = products.find(p => p.id === item.productId);
        const cat = originalProd ? originalProd.category : "Minyak & Pokok";
        rawCategories[cat] = (rawCategories[cat] || 0) + item.subtotal;
      });
    });

    return Object.entries(rawCategories).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [sales, products]);

  // Color options for Bar charts
  const BAR_COLORS = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div id="analytics-panel-root" className="space-y-6">
      
      {/* 4 KPI Metrics Card Grid */}
      <div id="analytics-kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-50 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
            <TrendingUp className="h-28 w-28 stroke-[1.5]" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center space-x-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Total Pendapatan</span>
          </p>
          <h3 className="text-lg sm:text-2xl font-bold font-mono mt-1 pr-1 truncate">
            Rp {kpiStats.revenue.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-emerald-100/90 font-medium mt-1.5 border-t border-white/20 pt-1.5 flex justify-between">
            <span>Hari Ini:</span>
            <span className="font-bold">Rp {kpiStats.todayRevenue.toLocaleString('id-ID')}</span>
          </p>
        </div>

        {/* Total Profit */}
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-xl shadow-blue-50 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
            <Award className="h-28 w-28 stroke-[1.5]" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center space-x-1">
            <Award className="h-3.5 w-3.5" />
            <span>Total Laba Bersih</span>
          </p>
          <h3 className="text-lg sm:text-2xl font-bold font-mono mt-1 pr-1 truncate">
            Rp {kpiStats.profit.toLocaleString('id-ID')}
          </h3>
          <p className="text-[10px] text-blue-100/90 font-medium mt-1.5 border-t border-white/20 pt-1.5 flex justify-between">
            <span>Profit Margin:</span>
            <span className="font-bold">
              {kpiStats.revenue > 0 ? Math.round((kpiStats.profit / kpiStats.revenue) * 100) : 0}%
            </span>
          </p>
        </div>

        {/* Total sales transactions */}
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-50 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
            <Layers className="h-28 w-28 stroke-[1.5]" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-100 flex items-center space-x-1">
            <Layers className="h-3.5 w-3.5" />
            <span>Riwayat Transaksi</span>
          </p>
          <h3 className="text-lg sm:text-2xl font-bold font-mono mt-1 truncate">
            {kpiStats.transactionCount} Selesai
          </h3>
          <p className="text-[10px] text-indigo-100/90 font-medium mt-1.5 border-t border-white/20 pt-1.5 flex justify-between">
            <span>Kecepatan Hari Ini:</span>
            <span className="font-bold">{kpiStats.todaySalesCount} trx</span>
          </p>
        </div>

        {/* Low stock notifications */}
        <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-xl shadow-amber-50 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-15">
            <AlertCircle className="h-28 w-28 stroke-[1.5]" />
          </div>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-100 flex items-center space-x-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Stok Masalah</span>
          </p>
          <h3 className="text-lg sm:text-2xl font-bold font-mono mt-1 truncate">
            {kpiStats.lowStockCount} Produk
          </h3>
          <p className="text-[10px] text-amber-105 font-medium mt-1.5 border-t border-white/20 pt-1.5 flex justify-between">
            <span>Status:</span>
            <span className={`font-bold px-1 rounded ${kpiStats.lowStockCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : ''}`}>
              {kpiStats.lowStockCount > 0 ? 'Perlu Restock' : 'Semua Aman'}
            </span>
          </p>
        </div>

      </div>

      {/* Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Trend line chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">Tren Pendapatan & Laba 7 Hari Terakhir</h3>
              <p className="text-[10px] text-slate-400">Menghitung laba bersih dari (harga jual - harga beli) tiap kuantitas transaksi</p>
            </div>
            <div className="flex items-center space-x-3.5 text-[11px] font-semibold">
              <span className="flex items-center space-x-1 text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Omset</span>
              </span>
              <span className="flex items-center space-x-1 text-blue-500">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span>Laba</span>
              </span>
            </div>
          </div>

          <div className="h-68">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  tickLine={false} 
                  stroke="#94a3b8" 
                  style={{ fontSize: '10px', fontWeight: 500 }}
                />
                <YAxis 
                  tickLine={false} 
                  stroke="#94a3b8"
                  style={{ fontSize: '9px', fontWeight: 500 }}
                  tickFormatter={(val) => `${val/1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`]}
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area 
                  type="monotone" 
                  name="Pendapatan (Omset)"
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  name="Laba Bersih"
                  dataKey="profit" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Contribution Graph */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Kinerja Penjualan Kategori</h3>
            <p className="text-[10px] text-slate-400">Total volume penjualan berdasarkan kategori produk</p>
          </div>

          <div className="h-68 mt-5 flex flex-col justify-between">
            {categorySalesData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <ShoppingBag className="h-8 w-8 text-slate-300 mb-1" />
                <span>Belum ada omset penjualan</span>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart layout="vertical" data={categorySalesData.slice(0, 5)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tickLine={false} stroke="#64748b" style={{ fontSize: '9px', fontWeight: 600 }} />
                      <Tooltip formatter={(v: any) => `Rp ${v.toLocaleString('id-ID')}`} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={12}>
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend and stats */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-650 max-h-32 overflow-y-auto">
                  {categorySalesData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 truncate pr-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}></span>
                        <span className="truncate text-slate-700">{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        Rp {item.value.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Sales Transactions Logs Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-emerald-600" />
              <span>Log Transaksi Penjualan Terakhir</span>
            </h3>
            <p className="text-[10px] text-slate-400">Riwayat transaksi POS real-time lengkap dengan detail barang yang terjual</p>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-semibold">Belum Ada Transaksi</p>
            <p className="text-xs text-slate-400">Lakukan penjualan di tab Kasir untuk melihat riwayat di sini.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-120 overflow-y-auto">
            {sales.map((sale) => {
              const isOpen = expandedSaleId === sale.id;
              
              return (
                <div 
                  key={sale.id}
                  className={`border rounded-xl transition overflow-hidden ${
                    isOpen ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-200 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  {/* Summary Bar */}
                  <div 
                    onClick={() => toggleExpand(sale.id)}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer text-xs font-semibold text-slate-700"
                  >
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                      <span className="text-slate-900 font-bold font-mono bg-slate-100 rounded px-2 py-0.75">{sale.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border">
                        {new Date(sale.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })} - {new Date(sale.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 font-bold flex items-center space-x-1">
                        <Wallet className="h-2.5 w-2.5" />
                        <span>{sale.paymentMethod}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-medium">Beli: Rp {sale.totalAmount.toLocaleString('id-ID')}</p>
                        <p className="text-xs font-bold text-emerald-600 font-mono">Laba +Rp {sale.totalProfit.toLocaleString('id-ID')}</p>
                      </div>
                      
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Expandable detailed drawer */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Detail Rincian Barang:</p>
                      <div className="space-y-2">
                        {sale.items.map((item, idx) => {
                          const profitVal = item.sellPrice - item.buyPrice;
                          
                          return (
                            <div key={idx} className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                              <div>
                                <h4 className="font-bold text-slate-850">{item.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 font-mono">
                                  {item.quantity}  x  Rp {item.sellPrice.toLocaleString('id-ID')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold font-mono text-slate-800">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                                <p className="text-[9px] font-bold text-emerald-600 leading-none">Laba: Rp {(profitVal * item.quantity).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cashier Metadata summaries */}
                      <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-end">
                        <div className="w-full sm:w-64 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Subtotal Belanja</span>
                            <span className="font-mono font-bold text-slate-800">Rp {sale.totalAmount.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t">
                            <span>Total Keuntungan Bersih</span>
                            <span className="font-mono font-bold">Rp {sale.totalProfit.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
