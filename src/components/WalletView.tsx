/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Wallet, Banknote, ArrowUpRight, Clock, CheckCircle, XCircle, 
  ChevronRight, AlertCircle, RefreshCw, Send, Landmark, HelpCircle 
} from "lucide-react";
import { CommissionLog, WithdrawalRequest } from "../types";

interface WalletViewProps {
  language: "bn" | "en";
  user: any;
  onRefreshUser: () => void;
}

export default function WalletView({ language, user, onRefreshUser }: WalletViewProps) {
  const [commissions, setCommissions] = useState<CommissionLog[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"commissions" | "withdrawals">("commissions");
  const [loading, setLoading] = useState(true);

  // Form states
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"bKash" | "Nagad" | "Bank">("bKash");
  const [accountDetails, setAccountDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/transactions", {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCommissions(data.commissions || []);
        setWithdrawals(data.withdrawals || []);
      }
    } catch (e) {
      console.log("Error loading transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg("");
    setSuccessMsg("");

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg(language === "bn" ? "দয়া করে সঠিক অংক লিখুন।" : "Please enter a valid amount.");
      return;
    }
    if (numericAmount < 500) {
      setErrorMsg(language === "bn" ? "সর্বনিম্ন উত্তোলনের পরিমাণ ৫০০ টাকা।" : "Minimum withdrawal amount is 500 TK.");
      return;
    }
    if (numericAmount > user.walletBalance) {
      setErrorMsg(language === "bn" ? "আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।" : "Insufficient wallet balance.");
      return;
    }
    if (!accountDetails.trim()) {
      setErrorMsg(language === "bn" ? "অ্যাকাউন্ট বা মোবাইল নাম্বার প্রদান করুন।" : "Please provide account details.");
      return;
    }

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          amount: numericAmount,
          method,
          details: accountDetails
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(language === "bn" ? "উত্তোলন অনুরোধ সফলভাবে জমা হয়েছে।" : "Withdrawal request submitted successfully.");
        setAmount("");
        setAccountDetails("");
        onRefreshUser(); // update wallet balance in state
        fetchData(); // refresh table log
      } else {
        setErrorMsg(data.error || "Submission failed");
      }
    } catch (err) {
      setErrorMsg("Error communicating with server.");
    }
  };

  const t = {
    bn: {
      title: "টিএমএস মেম্বার ওয়ালেট ও ক্যাশআউট",
      subtitle: "আপনার উপার্জিত কমিশন ক্যাশআউট করুন এবং ট্রানজেকশন হিস্ট্রি ট্র্যাকিং করুন।",
      balanceCard: "চলতি ব্যালেন্স (ওয়ালেট)",
      withdrawBtn: "উত্তোলনের অনুরোধ পাঠান",
      detailsLabel: "টাকা পাঠানোর মোবাইল বা ব্যাংক হিসাব নাম্বার",
      detailsPlaceholder: "বিকাশ/নগদ নম্বর অথবা ব্যাংকের নাম, একাউন্ট ও ব্রাঞ্চ লিখুন",
      minAlert: "নূন্যতম ৫০০ টাকা উত্তোলন করা যাবে। ৪৭ ঘণ্টার মধ্যে পেমেন্ট ক্লিয়ার করা হয়।",
      commissionsTab: "কমিশন লগ",
      withdrawalsTab: "উত্তোলন হিস্ট্রি",
      buyerCol: "ক্রেতা মেম্বার",
      levelCol: "ধাপ",
      amountCol: "পরিমাণ",
      dateCol: "তারিখ",
      statusCol: "অবস্থা",
      pending: "প্রক্রিয়াধীন",
      approved: "অনুমোদিত",
      rejected: "বাতিল",
      noData: "কোনো বিবরণী খুঁজে পাওয়া যায়নি।"
    },
    en: {
      title: "TMS Wallet & Cashout Panel",
      subtitle: "Withdraw your earned unilevel commissions and trace your transactional history ledger.",
      balanceCard: "Available Wallet Balance",
      withdrawBtn: "Send Withdrawal Request",
      detailsLabel: "Payment Account Number or Bank wire details",
      detailsPlaceholder: "Enter bKash/Nagad mobile or Bank, Account & Branch",
      minAlert: "Minimum payout: 500 TK. Processed within 47 working hours.",
      commissionsTab: "Commissions Ledger",
      withdrawalsTab: "Withdrawals History",
      buyerCol: "Buyer Downline",
      levelCol: "Level",
      amountCol: "Earnings",
      dateCol: "Date",
      statusCol: "Status",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      noData: "No transactional history found."
    }
  }[language];

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl border my-12">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-extrabold text-gray-800 text-lg">ওয়ালেট দেখতে লগইন করুন</h3>
        <p className="text-xs text-gray-500 mt-1">ব্যালেন্স উত্তোলন এবং কমিশন লগ দেখতে দয়া করে প্রথমে লগইন করুন।</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      
      {/* Title */}
      <section className="space-y-1">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
          <Wallet className="w-6 h-6 text-[#0F7A39] mr-2" />
          <span>{t.title}</span>
        </h2>
        <p className="text-xs text-gray-500">
          {t.subtitle}
        </p>
      </section>

      {/* Wallet Balance Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Main Wallet (Purple) */}
        <div className="bg-[#1E293B] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden md:col-span-2 border border-slate-700">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider">{t.balanceCard}</span>
          <div className="my-3 flex items-center justify-between">
            <span className="text-3xl md:text-4xl font-black font-mono text-[#E7B416]">৳{user.walletBalance}</span>
            <Wallet className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-[10px] text-gray-300 font-medium">
            {language === "bn" ? "*যেকোনো সময় ক্যাশআউট করতে পারবেন।" : "*Withdrawable anytime to bank/mobile."}
          </p>
        </div>

        {/* Retail Profit Summary (Blue) */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider">খুচরা লাভ (Retail Profit)</span>
          <div className="my-1.5">
            <span className="text-2xl font-black text-blue-950 font-mono">৳{user.retailProfit}</span>
          </div>
          <span className="text-[10px] text-blue-400">ব্যক্তিগত কেনাকাটা বোনাস</span>
        </div>

        {/* Level Commission Summary (Green) */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">টিম কমিশন (Level Commission)</span>
          <div className="my-1.5">
            <span className="text-2xl font-black text-emerald-950 font-mono">৳{user.levelCommission}</span>
          </div>
          <span className="text-[10px] text-emerald-500">৫-লেভেল ডাউনলাইন থেকে কমিশন</span>
        </div>

      </section>

      {/* Main Core Area: Payout Request Form & History Logs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Withdrawal form card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3 flex items-center">
            <Banknote className="w-5 h-5 text-[#0F7A39] mr-1.5" />
            <span>{language === "bn" ? "ওয়ালেট থেকে ক্যাশআউট করুন" : "Request Payout"}</span>
          </h3>

          {errorMsg && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-[#0F7A39] text-xs font-bold rounded">
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleWithdrawal} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 block">{language === "bn" ? "ক্যাশআউট পদ্ধতি" : "Method"}</label>
                <select
                  id="withdraw_method_select"
                  value={method}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setMethod(val);
                    // Autofill details based on user settings
                    if (user && user.bankDetails) {
                      if (val === "bKash") setAccountDetails(user.bankDetails.bkashNo || "");
                      else if (val === "Nagad") setAccountDetails(user.bankDetails.nagadNo || "");
                      else setAccountDetails(user.bankDetails.bankName ? `${user.bankDetails.bankName}, A/C: ${user.bankDetails.accountNumber}` : "");
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                >
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Bank">ব্যাংক (Bank Transfer)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 block">{language === "bn" ? "টাকার পরিমাণ" : "Amount (TK)"}</label>
                <input
                  id="withdraw_amount_input"
                  type="number"
                  required
                  placeholder="যেমন: ৫০০"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-600 block">
                {t.detailsLabel}
              </label>
              <textarea
                id="withdraw_details_input"
                required
                rows={2}
                placeholder={t.detailsPlaceholder}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>

            <div className="p-3 bg-gray-50 border rounded-lg text-[10px] text-gray-500 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-[#E7B416] shrink-0 mt-0.5" />
              <span>{t.minAlert}</span>
            </div>

            <button
              id="withdraw_submit_btn"
              type="submit"
              className="w-full bg-[#0F7A39] hover:bg-[#0b5c2a] text-white font-bold py-2.5 rounded-lg text-xs transition shadow"
            >
              {t.withdrawBtn}
            </button>

          </form>
        </div>

        {/* Transaction History Logs Ledger */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex space-x-2">
              <button
                id="wallet_tab_comms_btn"
                onClick={() => setActiveTab("commissions")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "commissions" ? "bg-[#0F7A39]/10 text-[#0F7A39] border border-[#0F7A39]/20" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                📊 {t.commissionsTab} ({commissions.length})
              </button>
              <button
                id="wallet_tab_withdraws_btn"
                onClick={() => setActiveTab("withdrawals")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "withdrawals" ? "bg-[#0F7A39]/10 text-[#0F7A39] border border-[#0F7A39]/20" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                💸 {t.withdrawalsTab} ({withdrawals.length})
              </button>
            </div>
            
            <button 
              id="wallet_refresh_logs_btn"
              onClick={fetchData} 
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto min-h-[220px]">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                {language === "bn" ? "অপেক্ষা করুন, ট্রানজেকশন খতিয়ান লোড হচ্ছে..." : "Loading transaction history..."}
              </div>
            ) : activeTab === "commissions" ? (
              commissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p>{t.noData}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-1">{t.buyerCol}</th>
                      <th className="py-2 px-1 text-center">{t.levelCol}</th>
                      <th className="py-2 px-1 text-right">{t.amountCol}</th>
                      <th className="py-2 px-1 text-right">{t.dateCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map(com => (
                      <tr key={com.id} className="border-b border-gray-50 font-medium hover:bg-gray-50/50">
                        <td className="py-3 px-1">
                          <p className="font-extrabold text-gray-800">{com.buyerName}</p>
                          <p className="text-[9px] text-gray-400 font-mono">ID: {com.buyerMemberId}</p>
                        </td>
                        <td className="py-3 px-1 text-center">
                          <span className="bg-[#0F7A39]/10 text-[#0F7A39] px-2 py-0.5 rounded-full font-bold">L{com.level}</span>
                        </td>
                        <td className="py-3 px-1 text-right font-mono font-bold text-emerald-700">+৳{com.amount}</td>
                        <td className="py-3 px-1 text-right text-gray-400 font-mono text-[10px]">
                          {new Date(com.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              withdrawals.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p>{t.noData}</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b text-gray-400 font-bold uppercase text-[10px]">
                      <th className="py-2 px-1">ID / একাউন্ট</th>
                      <th className="py-2 px-1 text-right">টাকা</th>
                      <th className="py-2 px-1 text-center">{t.statusCol}</th>
                      <th className="py-2 px-1 text-right">{t.dateCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map(w => (
                      <tr key={w.id} className="border-b border-gray-50 font-medium hover:bg-gray-50/50">
                        <td className="py-3 px-1">
                          <p className="font-extrabold text-gray-800">{w.id}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{w.method}: {w.details.slice(0,18)}...</p>
                        </td>
                        <td className="py-3 px-1 text-right font-mono font-bold text-gray-700">৳{w.amount}</td>
                        <td className="py-3 px-1 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center space-x-1 ${
                            w.status === "approved" 
                              ? "bg-green-50 text-green-700 border border-green-100" 
                              : w.status === "rejected" 
                              ? "bg-red-50 text-red-700 border border-red-100" 
                              : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          }`}>
                            <span>
                              {w.status === "approved" ? t.approved : w.status === "rejected" ? t.rejected : t.pending}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-1 text-right text-gray-400 font-mono text-[10px]">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>

        </div>

      </section>

    </div>
  );
}
