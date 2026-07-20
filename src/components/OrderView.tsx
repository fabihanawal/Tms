/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, CheckCircle, Clock, Truck, FileText, Printer, 
  ChevronRight, Award, ShieldCheck, AlertCircle, X, MapPin 
} from "lucide-react";
import { Order, OrderStatus } from "../types";

interface OrderViewProps {
  language: "bn" | "en";
  user: any;
  onRefreshUser: () => void;
}

export default function OrderView({ language, user, onRefreshUser }: OrderViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "delivered" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders/my", {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.log("Error loading orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const t = {
    bn: {
      title: "আপনার কেনাকাটা ও অর্ডার ট্র্যাকিং",
      subtitle: "সরিষার তেলের অর্ডার খতিয়ান, ডেলিভারি ট্র্যাকিং এবং পেমেন্ট রশিদ প্রিন্ট করুন।",
      pendingTab: "প্রক্রিয়াধীন অর্ডার",
      deliveredTab: "ডেলিভারড হয়েছে",
      allTab: "সব কেনাকাটা",
      activationTitle: "মাসিক একটিভেশন টার্গেট মিটার",
      activationActive: "✓ আপনার আইডি একটিভ রয়েছে!",
      activationPending: "⚠ আপনার আইডি নিষ্ক্রিয় রয়েছে!",
      activationDesc: "চলতি মাসে আপনার মোট অনুমোদনকৃত কেনাকাটা: ৳{purchase} / টার্গেট: ৳৫০০। আপনি ৫-স্তরের টিম কমিশন পাওয়ার জন্য যোগ্য।",
      orderId: "অর্ডার আইডি",
      totalAmount: "সর্বমোট বিল",
      paymentMethod: "পেমেন্ট মাধ্যম",
      status: "অবস্থা",
      trackCreated: "অর্ডার রিসিভড",
      trackApproved: "অনুমোদিত ও প্যাকিং",
      trackDelivered: "ডেলিভারড সফল",
      invoiceBtn: "রশিদ / চালান প্রিন্ট",
      noOrders: "কোনো ক্রয়ের ইতিহাস খুঁজে পাওয়া যায়নি।"
    },
    en: {
      title: "Your Shopping Orders & Tracking",
      subtitle: "Trace your e-commerce order statuses, tracking timelines, and print receipts.",
      pendingTab: "Pending Orders",
      deliveredTab: "Delivered",
      allTab: "All Purchases",
      activationTitle: "Monthly Status Activation Meter",
      activationActive: "✓ Your ID is currently Active!",
      activationPending: "⚠ Your ID is currently Inactive!",
      activationDesc: "Your total purchases this month: {purchase} TK / Target: 500 TK. Buy more to unlock team commissions.",
      orderId: "Order ID",
      totalAmount: "Total Payable",
      paymentMethod: "Payment Method",
      status: "Status",
      trackCreated: "Order Received",
      trackApproved: "Approved & Packed",
      trackDelivered: "Delivered",
      invoiceBtn: "Print Invoice",
      noOrders: "No shopping history found."
    }
  }[language];

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl border my-12">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-extrabold text-gray-800 text-lg">অর্ডার দেখতে লগইন করুন</h3>
        <p className="text-xs text-gray-500 mt-1">আপনার কেনাকাটা এবং পেমেন্ট রশিদ দেখতে দয়া করে প্রথমে লগইন করুন।</p>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (activeTab === "pending") return o.status === "pending" || o.status === "approved";
    if (activeTab === "delivered") return o.status === "delivered";
    return true; // "all"
  });

  // Calculate monthly purchase progression
  const targetThreshold = 500;
  const currentPurchase = user.currentMonthPurchase;
  const progressionPercent = Math.min(100, Math.round((currentPurchase / targetThreshold) * 100));

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      
      {/* Title */}
      <section className="space-y-1">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
          <ShoppingBag className="w-6 h-6 text-[#0F7A39] mr-2" />
          <span>{t.title}</span>
        </h2>
        <p className="text-xs text-gray-500">
          {t.subtitle}
        </p>
      </section>

      {/* Repurchase Monthly Status Tracker */}
      <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-gray-800 flex items-center">
            <Award className="w-5 h-5 text-[#E7B416] mr-2" />
            <span>{t.activationTitle}</span>
          </h3>
          <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
            currentPurchase >= targetThreshold 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {currentPurchase >= targetThreshold ? t.activationActive : t.activationPending}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-bold text-gray-600">
            <span>{language === "bn" ? `ক্রয় পরিমাণ: ৳${currentPurchase}` : `Purchased: ${currentPurchase} TK`}</span>
            <span>{language === "bn" ? `টার্গেট: ৳৫০০` : `Target: 500 TK`}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${progressionPercent}%` }}
              className="h-full bg-gradient-to-r from-[#0F7A39] to-emerald-500 rounded-full transition-all duration-500"
            ></div>
          </div>
          <p className="text-[11px] text-gray-400 leading-normal">
            {t.activationDesc.replace("{purchase}", currentPurchase.toString())}
          </p>
        </div>
      </section>

      {/* Tabs list & filters */}
      <section className="space-y-4">
        <div className="flex border-b border-gray-200">
          {[
            { id: "all", label: t.allTab },
            { id: "pending", label: t.pendingTab },
            { id: "delivered", label: t.deliveredTab }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold transition border-b-2 -mb-px ${
                activeTab === tab.id 
                  ? "border-[#0F7A39] text-[#0F7A39]" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label} ({tab.id === "all" ? orders.length : tab.id === "pending" ? orders.filter(o => o.status === "pending" || o.status === "approved").length : orders.filter(o => o.status === "delivered").length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            {language === "bn" ? "অপেক্ষা করুন, অর্ডার হিস্ট্রি লোড হচ্ছে..." : "Loading order details..."}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border text-gray-500 text-xs">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>{t.noOrders}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between space-y-4">
                
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-gray-50 pb-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{t.orderId}</p>
                    <p className="font-mono font-black text-[#0F7A39] text-xs">{order.id}</p>
                    <p className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleString(language === "bn" ? "bn-BD" : "en-US", { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    order.status === "delivered" 
                      ? "bg-green-50 text-green-700 border border-green-100" 
                      : order.status === "approved"
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : order.status === "cancelled"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-yellow-50 text-yellow-700 border border-yellow-100 animate-pulse"
                  }`}>
                    {order.status === "delivered" ? t.trackDelivered : order.status === "approved" ? t.trackApproved : order.status === "cancelled" ? "অর্ডার বাতিল" : t.trackCreated}
                  </span>
                </div>

                {/* Items Purchased details */}
                <div className="space-y-1.5 text-xs">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-gray-700 font-semibold">
                      <span>{it.productName} ({it.size}) <strong className="text-[#0F7A39] ml-1">x{it.quantity}</strong></span>
                      <span className="font-mono">৳{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-dashed text-xs text-gray-400 font-bold">
                    <span>{t.paymentMethod}: {order.paymentMethod}</span>
                    <span className="text-gray-800 font-black font-mono text-sm">{t.totalAmount}: ৳{order.totalAmount}</span>
                  </div>
                </div>

                {/* Deliver Tracking timeline */}
                {order.status !== "cancelled" && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{language === "bn" ? "ডেলিভারি ট্র্যাকিং" : "Delivery Tracking Status"}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 relative">
                      
                      <div className="absolute left-4 right-4 top-2 h-0.5 bg-gray-200 z-0"></div>
                      <div className={`absolute left-4 top-2 h-0.5 bg-[#0F7A39] z-0 transition-all duration-500`} style={{
                        width: order.status === "delivered" ? "100%" : order.status === "approved" ? "50%" : "0%"
                      }}></div>

                      {/* timeline 1: received */}
                      <div className="flex flex-col items-center space-y-1 z-10">
                        <div className="w-5.5 h-5.5 rounded-full bg-[#0F7A39] text-white flex items-center justify-center text-[10px]">✓</div>
                        <span className="text-[#0F7A39]">{t.trackCreated}</span>
                      </div>

                      {/* timeline 2: approved */}
                      <div className="flex flex-col items-center space-y-1 z-10">
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] ${
                          order.status === "approved" || order.status === "delivered" ? "bg-[#0F7A39] text-white" : "bg-gray-200 text-gray-400"
                        }`}>{order.status === "approved" || order.status === "delivered" ? "✓" : "২"}</div>
                        <span className={order.status === "approved" || order.status === "delivered" ? "text-[#0F7A39]" : ""}>{t.trackApproved}</span>
                      </div>

                      {/* timeline 3: delivered */}
                      <div className="flex flex-col items-center space-y-1 z-10">
                        <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] ${
                          order.status === "delivered" ? "bg-[#0F7A39] text-white" : "bg-gray-200 text-gray-400"
                        }`}>{order.status === "delivered" ? "✓" : "৩"}</div>
                        <span className={order.status === "delivered" ? "text-[#0F7A39]" : ""}>{t.trackDelivered}</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* Print button */}
                <button
                  id={`print_invoice_btn_${order.id}`}
                  onClick={() => setSelectedInvoice(order)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs border border-slate-200 transition flex items-center justify-center space-x-1"
                >
                  <FileText className="w-4 h-4 text-[#0F7A39]" />
                  <span>{t.invoiceBtn}</span>
                </button>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invoice Receipt Modal Dialog (Print ready) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-[#0F7A39] text-white p-4 flex items-center justify-between print:hidden">
              <h4 className="font-extrabold text-sm flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#E7B416]" />
                <span>মেম্বার পেমেন্ট চালান / রশিদ</span>
              </h4>
              <div className="flex space-x-2">
                <button 
                  id="invoice_print_action_btn"
                  onClick={handlePrint}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded text-xs font-bold border border-white/20 flex items-center space-x-1"
                >
                  <Printer className="w-4 h-4 text-[#E7B416]" />
                  <span className="hidden sm:inline">প্রিন্ট</span>
                </button>
                <button 
                  id="invoice_modal_close"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Print Body */}
            <div className="flex-1 p-8 overflow-y-auto space-y-6 print:p-0" id="print-area">
              
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-[#0F7A39]">টিএমএস (TMS) সরিষার তেল</h2>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">বদলগাছী উপজেলা গেট সংলগ্ন, নওগাঁ, বাংলাদেশ</p>
                  <p className="text-[10px] text-gray-500 font-mono">হেল্পলাইন: ০১৯৬৬-২৯১১৭৬ | support@tmsbd.com</p>
                </div>
                <div className="text-right">
                  <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wider">OFFICIAL INVOICE</h3>
                  <p className="text-xs font-bold font-mono text-[#0F7A39] mt-1">{selectedInvoice.id}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Bill to metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="font-bold text-gray-500 text-[10px] uppercase mb-1">বিল টু (Bill To):</p>
                  <p className="font-extrabold text-gray-800">{selectedInvoice.userName}</p>
                  <p className="text-gray-600 font-mono">ID: {selectedInvoice.memberId}</p>
                  <p className="text-gray-600 font-mono">Mob: {selectedInvoice.userMobile}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="font-bold text-gray-500 text-[10px] uppercase mb-1">শিপিং ঠিকানা (Shipping):</p>
                  <p className="text-gray-700 leading-normal font-semibold flex items-start">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-red-500 shrink-0 mt-0.5" />
                    <span>{selectedInvoice.shippingAddress}</span>
                  </p>
                </div>
              </div>

              {/* Products Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 font-bold text-gray-600 uppercase border-b">
                    <th className="py-2 px-3">পণ্যের বিবরণ (Items)</th>
                    <th className="py-2 px-3 text-center">সাইজ</th>
                    <th className="py-2 px-3 text-center">পরিমাণ</th>
                    <th className="py-2 px-3 text-right">মূল্য</th>
                    <th className="py-2 px-3 text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx} className="border-b font-medium text-gray-700">
                      <td className="py-3 px-3 font-extrabold">{it.productName}</td>
                      <td className="py-3 px-3 text-center font-mono">{it.size}</td>
                      <td className="py-3 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">৳{it.price}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-800">৳{it.price * it.quantity}</td>
                    </tr>
                  ))}
                  <tr className="font-bold text-gray-800 border-t-2">
                    <td colSpan={3} className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right">ডেলিভারি চার্জ:</td>
                    <td className="py-3 px-3 text-right font-mono">৳৬০</td>
                  </tr>
                  <tr className="font-extrabold text-base text-[#0F7A39] bg-emerald-50">
                    <td colSpan={3} className="py-3 px-3"></td>
                    <td className="py-3 px-3 text-right">সর্বমোট বিল:</td>
                    <td className="py-3 px-3 text-right font-mono">৳{selectedInvoice.totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Verified seal and signature */}
              <div className="flex justify-between items-end pt-6 border-t border-dashed">
                <div className="border border-green-500 bg-green-50/50 p-2.5 rounded-xl flex items-center space-x-2">
                  <ShieldCheck className="w-7 h-7 text-green-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-green-800">✓ টিএমএস আসল পণ্য নিশ্চিতকরণ</p>
                    <p className="text-[8px] text-gray-400">QR Code Batch Verified</p>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <div className="w-32 border-b border-gray-400 mx-auto"></div>
                  <p className="text-[10px] font-bold text-gray-600 text-center uppercase">ভারপ্রাপ্ত কর্মকর্তা স্বাক্ষর</p>
                  <p className="text-[8px] text-gray-400 text-center">টিএমএস নওগাঁ প্রধান শাখা কার্যালয়</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
