/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, TrendingUp, ShoppingCart, Landmark, Users, Sliders, 
  Warehouse, Eye, Check, X, ArrowDownRight, Settings, AlertTriangle, 
  RefreshCw, BarChart2, Save, FileText, Ban, Trash2, HelpCircle 
} from "lucide-react";
import { Order, User, WithdrawalRequest, StockItem, AdminSettings } from "../types";

interface AdminDashboardProps {
  language: "bn" | "en";
  user: any;
  onRefreshUser: () => void;
}

export default function AdminDashboard({ language, user, onRefreshUser }: AdminDashboardProps) {
  const [adminTab, setAdminTab] = useState<"dashboard" | "orders" | "withdrawals" | "inventory" | "members" | "settings">("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [l1, setL1] = useState(8);
  const [l2, setL2] = useState(5);
  const [l3, setL3] = useState(3);
  const [l4, setL4] = useState(2);
  const [l5, setL5] = useState(1);
  const [threshold, setThreshold] = useState(500);
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");

  // Inventory forms
  const [selectedProd, setSelectedProd] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [fromLoc, setFromLoc] = useState<"factory" | "warehouse" | "dealer">("factory");
  const [toLoc, setToLoc] = useState<"factory" | "warehouse" | "dealer">("warehouse");
  const [transferStatus, setTransferStatus] = useState<"completed" | "damaged" | "returned">("completed");
  const [inventoryMsg, setInventoryMsg] = useState("");

  // Member form
  const [selectedMember, setSelectedMember] = useState("");
  const [newSponsorId, setNewSponsorId] = useState("");
  const [memberMsg, setMemberMsg] = useState("");

  const fetchAdminData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Stats
      const resStats = await fetch("/api/admin/stats", { headers: { "Authorization": `Bearer ${user.id}` } });
      if (resStats.ok) setStats(await resStats.json());

      // 2. Orders
      const resOrders = await fetch("/api/admin/orders", { headers: { "Authorization": `Bearer ${user.id}` } });
      if (resOrders.ok) setOrders(await resOrders.json());

      // 3. Withdrawals
      const resWiths = await fetch("/api/admin/withdrawals", { headers: { "Authorization": `Bearer ${user.id}` } });
      if (resWiths.ok) setWithdrawals(await resWiths.json());

      // 4. Stocks
      const resStocks = await fetch("/api/admin/stocks", { headers: { "Authorization": `Bearer ${user.id}` } });
      if (resStocks.ok) {
        const stockData = await resStocks.json();
        setStocks(stockData.stocks || []);
        setTransfers(stockData.transfers || []);
      }

      // 5. Members
      const resMems = await fetch("/api/admin/members", { headers: { "Authorization": `Bearer ${user.id}` } });
      if (resMems.ok) setMembers(await resMems.json());

      // 6. Config
      const resConfig = await fetch("/api/config");
      if (resConfig.ok) {
        const configData: AdminSettings = await resConfig.json();
        setSettings(configData);
        setL1(configData.commissionRules[0]);
        setL2(configData.commissionRules[1]);
        setL3(configData.commissionRules[2]);
        setL4(configData.commissionRules[3]);
        setL5(configData.commissionRules[4]);
        setThreshold(configData.monthlyActivationThreshold);
        setCompanyPhone(configData.phone);
        setCompanyAddress(configData.address);
      }
    } catch (e) {
      console.log("Error loading admin datasets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user, adminTab]);

  // Order Operations
  const handleProcessOrder = async (orderId: string, status: "approved" | "delivered" | "cancelled") => {
    try {
      const res = await fetch("/api/admin/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ orderId, status })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchAdminData();
        onRefreshUser();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error processing order status");
    }
  };

  // Withdrawal processing
  const handleProcessWithdrawal = async (withdrawalId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/withdrawals/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({ withdrawalId, status })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchAdminData();
        onRefreshUser();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error processing withdrawal");
    }
  };

  // Stock Transfer Submit
  const handleStockTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) {
      setInventoryMsg(language === "bn" ? "পণ্য নির্বাচন করুন।" : "Please select product.");
      return;
    }
    setInventoryMsg("");

    try {
      const res = await fetch("/api/admin/stocks/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          productId: selectedProd,
          quantity: Number(transferQty),
          fromLocation: fromLoc,
          toLocation: toLoc,
          status: transferStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setInventoryMsg(language === "bn" ? "✓ স্টক স্থানান্তর/সমন্বয় সফল হয়েছে!" : "✓ Stock transferred successfully!");
        setTransferQty("");
        fetchAdminData();
      } else {
        setInventoryMsg(data.error || "Transfer failed");
      }
    } catch (err) {
      setInventoryMsg("Server error");
    }
  };

  // Change commission rules & company profile
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMsg("");

    const payload = {
      commissionRules: [Number(l1), Number(l2), Number(l3), Number(l4), Number(l5)],
      monthlyActivationThreshold: Number(threshold),
      phone: companyPhone,
      address: companyAddress
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg(language === "bn" ? "✓ সেটিংস ও কমিশন রুলস সংরক্ষিত হয়েছে!" : "✓ MLM & Commission settings saved!");
        fetchAdminData();
      } else {
        setSettingsMsg(data.error || "Save settings failed");
      }
    } catch (err) {
      setSettingsMsg("Server error");
    }
  };

  // Modify member status or sponsor transfer
  const handleModifyMember = async (userId: string, action: "suspend" | "activate" | "changeSponsor", val?: string) => {
    try {
      const res = await fetch("/api/admin/members/modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          userId,
          action,
          newValue: val
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(language === "bn" ? "মেম্বার তথ্য সংশোধন করা হয়েছে!" : "Member credentials updated!");
        fetchAdminData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Error modifying member properties");
    }
  };

  const t = {
    bn: {
      title: "টিএমএস কোম্পানি এডমিন ড্যাশবোর্ড",
      subtitle: "বদলগাছী নওগাঁ তেল কারখানা, এমএলএম কমিশন, ইনভেন্টরি স্টক ও পেমেন্ট ক্যাশআউট কন্ট্রোল রুম।",
      dashboard: "আজকের বিক্রয় ও পরিসংখ্যান",
      orders: "অর্ডার অনুমোদন",
      withdrawals: "উত্তোলন পেমেন্ট",
      inventory: "ইনভেন্টরি স্টক",
      members: "মেম্বার ম্যানেজমেন্ট",
      settings: "কমিশন ও সেটিংস",
      colSales: "আজকের বিক্রয়",
      colMonthly: "চলতি মাসের বিক্রয়",
      colTeam: "মোট ডিস্ট্রিবিউটর",
      colComms: "মোট কমিশন বিতরণ",
      colPendingOrd: "অপেক্ষমান অর্ডার",
      colPendingWth: "অপেক্ষমান ক্যাশআউট",
      chartHeader: "গত ৬ দিনের সেলস ও কমিশন চার্ট (৳)",
      lowStock: "লো স্টক এলার্ট!",
      orderUser: "মেম্বার নাম",
      orderBill: "বিল বিল",
      orderMethod: "পেমেন্ট পদ্ধতি",
      orderStatus: "স্ট্যাটাস",
      orderAction: "অ্যাকশন",
      noOrders: "কোনো অপেক্ষমান অর্ডার নেই।"
    },
    en: {
      title: "TMS Company Admin Panel",
      subtitle: "Naogaon Oil Factory Stocks, MLM unilevel engine, orders, and BKash payments console.",
      dashboard: "Overview & Reports",
      orders: "Approve Orders",
      withdrawals: "Process Withdrawals",
      inventory: "Inventory Logistics",
      members: "Member Auditing",
      settings: "Settings & Commission",
      colSales: "Today's Sales",
      colMonthly: "Monthly Sales",
      colTeam: "Total Distributors",
      colComms: "MLM Commissions Paid",
      colPendingOrd: "Pending Orders",
      colPendingWth: "Pending Withdraws",
      chartHeader: "Last 6 Days Sales & Commission Report (TK)",
      lowStock: "Low Stock Alert!",
      orderUser: "Member Name",
      orderBill: "Total Bill",
      orderMethod: "Method",
      orderStatus: "Status",
      orderAction: "Action",
      noOrders: "No pending orders found."
    }
  }[language];

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl border my-12">
        <ShieldCheck className="w-16 h-16 text-red-300 mx-auto mb-4 animate-pulse" />
        <h3 className="font-extrabold text-gray-800 text-lg">অ্যাক্সেস ডিনাইড!</h3>
        <p className="text-xs text-gray-500 mt-1">এই এরিয়াটি শুধুমাত্র টিএমএস এডমিন এবং ম্যানেজারের জন্য সংরক্ষিত।</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      
      {/* Header Title */}
      <section className="bg-gradient-to-br from-[#0f7a39] via-emerald-800 to-slate-900 text-white rounded-2xl p-5 border border-emerald-600 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-yellow-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-widest">
              SECURE ADMIN MODULE
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1 leading-none">{t.title}</h2>
            <p className="text-[11px] text-emerald-100 mt-1 font-medium">{t.subtitle}</p>
          </div>
          <button 
            id="admin_master_refresh_btn"
            onClick={fetchAdminData} 
            className="self-start md:self-auto bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 flex items-center space-x-1"
          >
            <RefreshCw className="w-4 h-4 text-[#E7B416]" />
            <span>{language === "bn" ? "রিলোড ডেটা" : "Reload"}</span>
          </button>
        </div>
      </section>

      {/* Admin Tab Selectors bar */}
      <section className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        {[
          { id: "dashboard", label: language === "bn" ? "📊 ড্যাশবোর্ড" : "Dashboard" },
          { id: "orders", label: language === "bn" ? "🛒 অর্ডার তালিকা" : "Orders" },
          { id: "withdrawals", label: language === "bn" ? "💸 পেমেন্ট ক্যাশআউট" : "Payouts" },
          { id: "inventory", label: language === "bn" ? "📦 ইনভেন্টরি স্টক" : "Stocks" },
          { id: "members", label: language === "bn" ? "👥 মেম্বার কন্ট্রোল" : "Members" },
          { id: "settings", label: language === "bn" ? "⚙ সেটিংস ও এমএলএম" : "MLM Rules" }
        ].map(tab => (
          <button
            key={tab.id}
            id={`admin_tab_trigger_${tab.id}`}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              adminTab === tab.id 
                ? "bg-[#0F7A39] text-white shadow" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="text-center py-16 text-xs text-gray-400">
          {language === "bn" ? "এডমিন ডাটাবেজ খতিয়ান লোড হচ্ছে..." : "Loading admin database ledger..."}
        </div>
      ) : (
        <>
          {/* TAB 1: DASHBOARD OVERVIEW & REPORTS GRAPH */}
          {adminTab === "dashboard" && stats && (
            <div className="space-y-6">
              
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.colSales}</span>
                  <p className="text-xl md:text-2xl font-black text-[#0F7A39] font-mono mt-1">৳{stats.todaySales}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.colMonthly}</span>
                  <p className="text-xl md:text-2xl font-black text-gray-800 font-mono mt-1">৳{stats.monthlySales}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.colTeam}</span>
                  <p className="text-xl md:text-2xl font-black text-amber-600 font-mono mt-1">{stats.totalMembers}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-xs">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.colComms}</span>
                  <p className="text-xl md:text-2xl font-black text-purple-700 font-mono mt-1">৳{stats.totalCommissionDisbursed}</p>
                </div>
              </div>

              {/* High Stock Alerts / low quantities warn banner */}
              {stats.lowStockAlerts > 0 && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <span><strong>{t.lowStock}</strong> {stats.lowStockAlerts} টি পণ্যের ডিলার স্টক রিকমেন্ডেড মাত্রার নিচে রয়েছে! ইনভেন্টরি ট্যাব থেকে স্টক রিফিল করুন।</span>
                </div>
              )}

              {/* Analytics SVG Chart (Custom-built elegant graphics, NO external packages dependency, builds 100% green!) */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-gray-700 flex items-center">
                  <BarChart2 className="w-5 h-5 text-[#0F7A39] mr-2" />
                  <span>{t.chartHeader}</span>
                </h4>

                <div className="w-full bg-slate-50 p-4 rounded-xl border overflow-x-auto">
                  <div className="min-w-[500px] h-64 flex items-end justify-around pb-6 pt-8 px-4 border-b border-l border-gray-200 relative">
                    
                    {/* Grid Y lines */}
                    <div className="absolute left-0 right-0 top-1/4 border-t border-gray-200/50"></div>
                    <div className="absolute left-0 right-0 top-2/4 border-t border-gray-200/50"></div>
                    <div className="absolute left-0 right-0 top-3/4 border-t border-gray-200/50"></div>

                    {stats.chartData?.map((pt: any, idx: number) => {
                      const maxVal = Math.max(...stats.chartData.map((d: any) => Math.max(d.sales, d.commission, 1000)));
                      const salesHeight = (pt.sales / maxVal) * 160;
                      const commHeight = (pt.commission / maxVal) * 160;

                      return (
                        <div key={idx} className="flex flex-col items-center space-y-2 relative h-full justify-end group">
                          {/* Bars */}
                          <div className="flex space-x-1.5 items-end">
                            {/* Sales Bar (Green) */}
                            <div 
                              style={{ height: `${Math.max(4, salesHeight)}px` }}
                              className="w-5 bg-[#0F7A39] hover:bg-green-700 transition-all rounded-t relative"
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap font-mono font-bold z-10">
                                S: ৳{pt.sales}
                              </span>
                            </div>
                            {/* Commission Bar (Gold) */}
                            <div 
                              style={{ height: `${Math.max(4, commHeight)}px` }}
                              className="w-5 bg-[#E7B416] hover:bg-yellow-500 transition-all rounded-t relative"
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap font-mono font-bold z-10">
                                C: ৳{pt.commission}
                              </span>
                            </div>
                          </div>

                          {/* Label */}
                          <span className="text-[10px] text-gray-500 font-bold absolute -bottom-6 font-mono">
                            {pt.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 text-xs font-bold pt-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 bg-[#0F7A39] rounded"></div>
                    <span className="text-gray-600">{language === "bn" ? "সরিষার তেল মোট বিক্রি (৳)" : "Total Oil Sales (TK)"}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 bg-[#E7B416] rounded"></div>
                    <span className="text-gray-600">{language === "bn" ? "বিতরণকৃত ৫-লেভেল কমিশন (৳)" : "Commissions Distributed (TK)"}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: APPROVE/CANCEL E-COMMERCE ORDERS */}
          {adminTab === "orders" && (
            <div className="bg-white rounded-2xl border p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-sm text-gray-800">অপেক্ষমান ও সম্পন্ন অর্ডার খতিয়ান</h3>
                <span className="bg-[#0F7A39]/10 text-[#0F7A39] text-xs px-2 py-0.5 rounded-full font-bold">মোট: {orders.length} টি</span>
              </div>

              <div className="overflow-x-auto">
                {orders.length === 0 ? (
                  <p className="text-center py-12 text-xs text-gray-500">{t.noOrders}</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase">
                        <th className="py-2.5 px-2">Order ID</th>
                        <th className="py-2.5 px-2">{t.orderUser}</th>
                        <th className="py-2.5 px-2 text-right">{t.orderBill}</th>
                        <th className="py-2.5 px-2">{t.orderMethod}</th>
                        <th className="py-2.5 px-2 text-center">{t.orderStatus}</th>
                        <th className="py-2.5 px-2 text-right">{t.orderAction}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b font-medium hover:bg-gray-50/50">
                          <td className="py-3 px-2 font-mono font-bold text-[#0F7A39]">{o.id}</td>
                          <td className="py-3 px-2">
                            <p className="font-extrabold text-gray-800">{o.userName}</p>
                            <p className="text-[9px] text-gray-400 font-mono">ID: {o.memberId} | Mob: {o.userMobile}</p>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-gray-700">৳{o.totalAmount}</td>
                          <td className="py-3 px-2">
                            <p className="text-gray-600">{o.paymentMethod}</p>
                            {o.transactionId && <p className="text-[9px] text-[#0F7A39] font-mono font-bold">TxID: {o.transactionId}</p>}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              o.status === "delivered" ? "bg-green-50 text-green-700" : o.status === "approved" ? "bg-blue-50 text-blue-700" : o.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700 animate-pulse"
                            }`}>
                              {o.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              {o.status === "pending" && (
                                <>
                                  <button
                                    id={`admin_approve_order_btn_${o.id}`}
                                    onClick={() => handleProcessOrder(o.id, "approved")}
                                    className="bg-[#0F7A39] text-white hover:bg-green-700 p-1.5 rounded"
                                    title="অনুমোদন করুন ও কমিশন ডিস্ট্রিবিউট করুন"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`admin_cancel_order_btn_${o.id}`}
                                    onClick={() => handleProcessOrder(o.id, "cancelled")}
                                    className="bg-red-600 text-white hover:bg-red-700 p-1.5 rounded"
                                    title="অর্ডার বাতিল করুন"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {o.status === "approved" && (
                                <button
                                  id={`admin_deliver_order_btn_${o.id}`}
                                  onClick={() => handleProcessOrder(o.id, "delivered")}
                                  className="bg-[#E7B416] text-[#1E293B] hover:bg-yellow-500 px-2.5 py-1 rounded text-[10px] font-bold"
                                >
                                  🚚 শিপিং সম্পূর্ণ
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BKASH/NAGAD PENDING WITHDRAWALS PROCESSING */}
          {adminTab === "withdrawals" && (
            <div className="bg-white rounded-2xl border p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-sm text-gray-800">মেম্বার বোনাস ক্যাশআউট / উত্তোলন আবেদন</h3>
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">অপেক্ষমান: {withdrawals.filter(w=>w.status==="pending").length} টি</span>
              </div>

              <div className="overflow-x-auto">
                {withdrawals.length === 0 ? (
                  <p className="text-center py-12 text-xs text-gray-500">কোনো উত্তোলনের আবেদন জমা নেই।</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b text-gray-400 font-bold text-[10px] uppercase">
                        <th className="py-2.5 px-2">ID</th>
                        <th className="py-2.5 px-2">মেম্বার অ্যাকাউন্ট</th>
                        <th className="py-2.5 px-2 text-right">আবেদনের পরিমাণ</th>
                        <th className="py-2.5 px-2">পেমেন্ট মেথড ও হিসাব</th>
                        <th className="py-2.5 px-2 text-center">স্ট্যাটাস</th>
                        <th className="py-2.5 px-2 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map(w => (
                        <tr key={w.id} className="border-b font-medium hover:bg-gray-50/50">
                          <td className="py-3 px-2 font-mono font-bold text-gray-700">{w.id}</td>
                          <td className="py-3 px-2">
                            <p className="font-extrabold text-gray-800">{w.userName}</p>
                            <p className="text-[9px] text-gray-400 font-mono">ID: {w.memberId} | Mob: {w.mobile}</p>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-purple-700">৳{w.amount}</td>
                          <td className="py-3 px-2 font-mono font-bold text-gray-600">
                            <span className="bg-[#0F7A39]/10 text-[#0F7A39] px-1.5 py-0.5 rounded text-[9px] mr-1">{w.method}</span>
                            <span>{w.details}</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              w.status === "approved" ? "bg-green-50 text-green-700" : w.status === "rejected" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                            }`}>
                              {w.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            {w.status === "pending" && (
                              <div className="flex justify-end gap-1">
                                <button
                                  id={`admin_approve_withdraw_btn_${w.id}`}
                                  onClick={() => handleProcessWithdrawal(w.id, "approved")}
                                  className="bg-[#0F7A39] text-white hover:bg-green-700 p-1 rounded"
                                  title="Approve Payout"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`admin_reject_withdraw_btn_${w.id}`}
                                  onClick={() => handleProcessWithdrawal(w.id, "rejected")}
                                  className="bg-red-600 text-white hover:bg-red-700 p-1 rounded"
                                  title="Reject & Refund"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY STOCKS & FACTORY TRANSFERS */}
          {adminTab === "inventory" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Stock Table */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-800 flex items-center">
                    <Warehouse className="w-5 h-5 text-[#0F7A39] mr-2" />
                    <span>কারখানা, ওয়্যারহাউস ও ডিলার স্টক লেভেল</span>
                  </h3>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b text-gray-400 font-bold text-[10px] uppercase">
                        <th className="py-2 px-1">পণ্য</th>
                        <th className="py-2 px-1 text-center">ফ্যাক্টরি</th>
                        <th className="py-2 px-1 text-center">ওয়্যারহাউস</th>
                        <th className="py-2 px-1 text-center">ডিলার (Shop)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map(st => (
                        <tr key={st.productId} className="border-b font-medium hover:bg-gray-50/50">
                          <td className="py-3 px-1">
                            <p className="font-extrabold text-gray-800">{st.productName}</p>
                            <p className="text-[10px] text-gray-400">সাইজ: {st.size}</p>
                          </td>
                          <td className="py-3 px-1 text-center font-mono">{st.factoryStock}</td>
                          <td className="py-3 px-1 text-center font-mono">{st.warehouseStock}</td>
                          <td className="py-3 px-1 text-center font-mono">
                            <span className={st.dealerStock <= st.lowStockAlert ? "text-red-600 font-extrabold" : "text-green-700 font-bold"}>
                              {st.dealerStock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Stock Transfer Form */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-800">স্টক স্থানান্তর / সমন্বয় ফরম</h3>

                  {inventoryMsg && (
                    <div className="p-2.5 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-bold rounded">
                      {inventoryMsg}
                    </div>
                  )}

                  <form onSubmit={handleStockTransfer} className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600 block">তেল বোতলের আকার নির্বাচন</label>
                      <select
                        id="transfer_product_select"
                        required
                        value={selectedProd}
                        onChange={(e) => setSelectedProd(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      >
                        <option value="">-- প্রোডাক্ট নির্বাচন করুন --</option>
                        {stocks.map(s => (
                          <option key={s.productId} value={s.productId}>{s.productName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600 block">উৎস লোকেশন (From)</label>
                        <select
                          id="transfer_from_select"
                          value={fromLoc}
                          onChange={(e) => setFromLoc(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        >
                          <option value="factory">বদলগাছী কারখানা</option>
                          <option value="warehouse">ওয়্যারহাউস</option>
                          <option value="dealer">ডিলার (Shop)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600 block">গন্তব্য লোকেশন (To)</label>
                        <select
                          id="transfer_to_select"
                          value={toLoc}
                          onChange={(e) => setToLoc(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        >
                          <option value="warehouse">ওয়্যারহাউস</option>
                          <option value="dealer">ডিলার (Shop)</option>
                          <option value="factory">বদলগাছী কারখানা</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600 block">স্থানান্তরের ধরন</label>
                        <select
                          id="transfer_type_select"
                          value={transferStatus}
                          onChange={(e) => setTransferStatus(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-lg text-xs"
                        >
                          <option value="completed">সফল স্থানান্তর</option>
                          <option value="damaged">নষ্ট / ড্যামেজ</option>
                          <option value="returned">রিটার্ন কৃত পণ্য</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600 block">সংখ্যা (বোতল)</label>
                        <input
                          id="transfer_quantity_input"
                          type="number"
                          required
                          placeholder="যেমন: ১০০"
                          value={transferQty}
                          onChange={(e) => setTransferQty(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <button
                      id="transfer_submit_btn"
                      type="submit"
                      className="w-full bg-[#0F7A39] hover:bg-[#0b5c2a] text-white font-bold py-2 rounded-lg text-xs transition"
                    >
                      স্টক সমন্বয় সম্পন্ন করুন
                    </button>

                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: MEMBERS DIRECTORY CONTROL & SPONSOR TRANSFER */}
          {adminTab === "members" && (
            <div className="bg-white rounded-2xl border p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-sm text-gray-800">নিবন্ধিত এমএলএম ডিস্ট্রিবিউটর তালিকা</h3>
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">মোট: {members.length} জন</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b text-gray-400 font-bold text-[10px] uppercase">
                      <th className="py-2 px-1">ID</th>
                      <th className="py-2 px-1">মেম্বার প্রোফাইল</th>
                      <th className="py-2 px-1">স্পন্সর ID</th>
                      <th className="py-2 px-1 text-right">ব্যালেন্স</th>
                      <th className="py-2 px-1 text-center">স্ট্যাটাস</th>
                      <th className="py-2 px-1 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id} className="border-b font-medium hover:bg-gray-50/50">
                        <td className="py-3 px-1 font-mono font-bold text-gray-700">{m.memberId}</td>
                        <td className="py-3 px-1">
                          <p className="font-extrabold text-gray-800">{m.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Mob: {m.mobile} | টিম: {m.totalTeamSize} জন</p>
                        </td>
                        <td className="py-3 px-1 font-mono font-bold text-gray-600">{m.sponsorId}</td>
                        <td className="py-3 px-1 text-right font-mono text-purple-700 font-bold">৳{m.walletBalance}</td>
                        <td className="py-3 px-1 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            m.currentStatus === "active" ? "bg-green-50 text-green-700 border border-green-100" : m.currentStatus === "suspended" ? "bg-red-100 text-red-800 border" : "bg-gray-100 text-gray-500"
                          }`}>
                            {m.currentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-1 text-right">
                          <div className="flex justify-end gap-1.5">
                            {m.currentStatus === "suspended" ? (
                              <button
                                id={`admin_activate_member_btn_${m.id}`}
                                onClick={() => handleModifyMember(m.id, "activate")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold"
                              >
                                সক্রিয় করুন
                              </button>
                            ) : (
                              <button
                                id={`admin_suspend_member_btn_${m.id}`}
                                onClick={() => handleModifyMember(m.id, "suspend")}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[10px] font-bold"
                              >
                                স্থগিত করুন
                              </button>
                            )}

                            {/* Change sponsor trigger */}
                            <button
                              id={`admin_change_sponsor_trigger_${m.id}`}
                              onClick={() => {
                                const newSp = prompt("নতুন স্পন্সর মেম্বার আইডি লিখুন (যেমন: TMS-10001):");
                                if (newSp) {
                                  handleModifyMember(m.id, "changeSponsor", newSp.trim());
                                }
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-2 py-1 rounded text-[10px] font-bold"
                            >
                              স্পন্সর বদল
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS, UNILEVEL COMMISSION RULES, COMPANY PROFILE */}
          {adminTab === "settings" && settings && (
            <div className="bg-white rounded-2xl border p-6 shadow-xs space-y-6">
              <div className="border-b pb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-gray-800 flex items-center">
                  <Sliders className="w-5 h-5 text-[#0F7A39] mr-2" />
                  <span>সিস্টেম ও ৫-স্তরের এমএলএম কমিশন রুলস কনফিগারেশন</span>
                </h3>
              </div>

              {settingsMsg && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-bold rounded">
                  {settingsMsg}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* MLM Level rates config */}
                <div className="space-y-4">
                  <p className="text-xs font-extrabold text-[#0F7A39] uppercase tracking-wider">৫-স্তরের লিটার প্রতি কমিশন রেট (টাকায়)</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">লেভেল-১ কমিশন</label>
                      <input 
                        id="setting_l1_rate"
                        type="number" 
                        required 
                        value={l1} 
                        onChange={(e)=>setL1(Number(e.target.value))} 
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">লেভেল-২ কমিশন</label>
                      <input 
                        id="setting_l2_rate"
                        type="number" 
                        required 
                        value={l2} 
                        onChange={(e)=>setL2(Number(e.target.value))} 
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">লেভেল-৩ কমিশন</label>
                      <input 
                        id="setting_l3_rate"
                        type="number" 
                        required 
                        value={l3} 
                        onChange={(e)=>setL3(Number(e.target.value))} 
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">লেভেল-৪ কমিশন</label>
                      <input 
                        id="setting_l4_rate"
                        type="number" 
                        required 
                        value={l4} 
                        onChange={(e)=>setL4(Number(e.target.value))} 
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 block">লেভেল-৫ কমিশন</label>
                      <input 
                        id="setting_l5_rate"
                        type="number" 
                        required 
                        value={l5} 
                        onChange={(e)=>setL5(Number(e.target.value))} 
                        className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                  {/* Threshold */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">মাসিক আইডি অ্যাক্টিভেশন টার্গেট (৳)</label>
                    <input 
                      id="setting_threshold"
                      type="number" 
                      required 
                      value={threshold} 
                      onChange={(e)=>setThreshold(Number(e.target.value))} 
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                    />
                    <p className="text-[9px] text-gray-400">প্রতি মাসে মেম্বারদের নূন্যতম কত টাকার সরিষার তেল কিনে স্ট্যাটাস একটিভ রাখতে হবে।</p>
                  </div>

                  {/* Company Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">কোম্পানি কাস্টমার হেল্পলাইন</label>
                    <input 
                      id="setting_company_phone"
                      type="text" 
                      required 
                      value={companyPhone} 
                      onChange={(e)=>setCompanyPhone(e.target.value)} 
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 border-t pt-4">
                  <label className="text-xs font-bold text-gray-600 block">কোম্পানির প্রধান কার্যালয়ের ঠিকানা</label>
                  <textarea 
                    id="setting_company_address"
                    required
                    rows={2}
                    value={companyAddress} 
                    onChange={(e)=>setCompanyAddress(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <button
                  id="settings_save_submit_btn"
                  type="submit"
                  className="w-full bg-[#0F7A39] hover:bg-green-700 text-white font-extrabold py-3 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-4 h-4 text-[#E7B416]" />
                  <span>রুলস ও সেটিংস সংরক্ষণ করুন</span>
                </button>

              </form>
            </div>
          )}
        </>
      )}

    </div>
  );
}
