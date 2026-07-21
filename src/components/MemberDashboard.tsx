/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, Smartphone, Shield, Key, Share2, Clipboard, UserCheck, 
  HelpCircle, CreditCard, Banknote, Save, PhoneCall, AlertCircle, RefreshCw 
} from "lucide-react";

interface MemberDashboardProps {
  language: "bn" | "en";
  user: any;
  onLoginSuccess: (user: any, token: string) => void;
  onRefreshUser: () => void;
  onNavigate: (view: string) => void;
}

export default function MemberDashboard({ language, user, onLoginSuccess, onRefreshUser, onNavigate }: MemberDashboardProps) {
  // Auth Form states
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [sponsorId, setSponsorId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Profile Form States
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNo, setRoutingNo] = useState("");
  const [bkashNo, setBkashNo] = useState("");
  const [nagadNo, setNagadNo] = useState("");
  const [bankUpdateMsg, setBankUpdateMsg] = useState("");

  // Sync profile forms if user exists
  useEffect(() => {
    if (user && user.bankDetails) {
      setBankName(user.bankDetails.bankName || "");
      setAccountName(user.bankDetails.accountName || "");
      setAccountNumber(user.bankDetails.accountNumber || "");
      setBranchName(user.bankDetails.branchName || "");
      setRoutingNo(user.bankDetails.routingNo || "");
      setBkashNo(user.bankDetails.bkashNo || "");
      setNagadNo(user.bankDetails.nagadNo || "");
    }
  }, [user]);

  // Handle OTP request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length < 10) {
      setAuthError(language === "bn" ? "সঠিক ১১-সংখ্যার মোবাইল নম্বর দিন।" : "Please enter a valid 11-digit mobile number.");
      return;
    }
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setSimulatedOtp(data.code); // Store for easy developer display
        setAuthSuccess(language === "bn" ? "ওটিপি আপনার মোবাইল নম্বরে পাঠানো হয়েছে।" : "OTP Code sent successfully.");
      } else {
        setAuthError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setAuthError("Server communication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Login or Registration Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setAuthError(language === "bn" ? "ওটিপি কোডটি লিখুন।" : "Please enter OTP code.");
      return;
    }
    setAuthError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          code: otp,
          isRegister,
          name,
          sponsorId: sponsorId || "TMS-ADMIN"
        })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, data.token);
      } else {
        setAuthError(data.error || "Verification failed");
      }
    } catch (err) {
      setAuthError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Save bank details
  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBankUpdateMsg("");

    try {
      const res = await fetch("/api/user/update-bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.id}`
        },
        body: JSON.stringify({
          bankName, accountName, accountNumber, branchName, routingNo, bkashNo, nagadNo
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBankUpdateMsg(language === "bn" ? "✓ পেমেন্ট অ্যাকাউন্ট তথ্য সফলভাবে আপডেট হয়েছে!" : "✓ Payment accounts updated successfully!");
        onRefreshUser();
      } else {
        setBankUpdateMsg(data.error || "Update failed");
      }
    } catch (err) {
      setBankUpdateMsg("Connection error");
    }
  };

  // Copy referral link to clipboard
  const handleCopyReferral = () => {
    if (!user) return;
    const referralUrl = `${window.location.origin}/?sponsor=${user.memberId}`;
    navigator.clipboard.writeText(referralUrl);
    alert(language === "bn" ? "রেফারেল লিংকটি কপি করা হয়েছে! আপনার বন্ধুদের সাথে শেয়ার করুন।" : "Referral link copied! Share with your friends.");
  };

  const t = {
    bn: {
      authTitle: "টিএমএস মেম্বার লগইন ও রেজিস্ট্রেশন",
      loginHeader: "মেম্বার ড্যাশবোর্ড অ্যাক্সেস",
      signupHeader: "নতুন পরিবেশক রেজিস্ট্রেশন ফর্ম",
      mobileLabel: "মোবাইল নম্বর",
      mobilePlaceholder: "যেমন: ০১৭১১২২৩৩৪৪",
      otpLabel: "৪-সংখ্যার ওটিপি কোড লিখুন",
      otpPlaceholder: "যেমন: ১২৩৪",
      sponsorLabel: "স্পন্সর মেম্বার আইডি (ঐচ্ছিক)",
      sponsorPlaceholder: "যেমন: TMS-10001",
      nameLabel: "পরিবেশকের নাম (বাংলা বা ইংরেজি)",
      namePlaceholder: "যেমন: আব্দুর রহমান",
      sendOtpBtn: "ওটিপি পাঠান (OTP)",
      verifyBtn: "যাচাই করে ড্যাশবোর্ডে প্রবেশ করুন",
      switchToSignup: "আপনার অ্যাকাউন্ট নেই? নতুন মেম্বার রেজিস্ট্রেশন করুন",
      switchToLogin: "ইতিমধ্যে অ্যাকাউন্ট আছে? মেম্বার লগইন করুন",
      testOtpAlert: "টেস্ট সুবিধার জন্য ওটিপি কোড:",
      statsTitle: "আপনার ব্যবসায়িক পরিসংখ্যান",
      balanceTitle: "ওয়ালেট ব্যালেন্স",
      monthlyIncome: "মাসিক উপার্জন",
      monthlyPurchase: "মাসিক পণ্য ক্রয়",
      totalTeam: "মোট টিম মেম্বার",
      statusLabel: "মেম্বার স্ট্যাটাস",
      statusActive: "সক্রিয় মেম্বার (Active)",
      statusInactive: "নিষ্ক্রিয় মেম্বার (Inactive)",
      refTitle: "আপনার পার্সোনাল রেফারেল লিংক",
      copyLink: "লিংক কপি করুন",
      bankTitle: "উত্তোলন পেমেন্ট অ্যাকাউন্ট বিবরণী",
      bankSubtitle: "ওয়ালেট বোনাস ক্যাশআউট করতে আপনার মোবাইল ব্যাংকিং অথবা ব্যাংক হিসাবের তথ্য আপডেট করুন।",
      bkashLabel: "বিকাশ নম্বর (Personal)",
      nagadLabel: "নগদ নম্বর (Personal)",
      supportTitle: "গ্রাহক সেবা ও তাৎক্ষণিক সহায়তা",
      supportSubtitle: "বদলগাছী হেড অফিস ২৪/৭ কাস্টমার সাপোর্ট হেল্পলাইন।",
      monthlyActivationReminder: "মাসিক একটিভেশন রিমাইন্ডার: প্রতি মাসে নূন্যতম ৫০০ টাকার পণ্য ক্রয় করলেই কেবল আপনার ৫-স্তরের টিম কমিশন সক্রিয় থাকবে।"
    },
    en: {
      authTitle: "TMS Member Login & Signup",
      loginHeader: "Member Dashboard Sign In",
      signupHeader: "New Distributor Registration",
      mobileLabel: "Mobile Number",
      mobilePlaceholder: "Example: 01711223344",
      otpLabel: "Enter 4-Digit OTP",
      otpPlaceholder: "Example: 1234",
      sponsorLabel: "Sponsor Member ID (Optional)",
      sponsorPlaceholder: "Example: TMS-10001",
      nameLabel: "Distributor Name",
      namePlaceholder: "Example: Abdur Rahman",
      sendOtpBtn: "Send OTP",
      verifyBtn: "Verify & Enter Dashboard",
      switchToSignup: "Don't have an account? Register as Distributor",
      switchToLogin: "Already registered? Login as Member",
      testOtpAlert: "For easy developer testing, OTP is:",
      statsTitle: "Your MLM Business Metrics",
      balanceTitle: "Wallet Balance",
      monthlyIncome: "Monthly Earnings",
      monthlyPurchase: "Monthly Purchase",
      totalTeam: "Total Team Members",
      statusLabel: "Member Status",
      statusActive: "Active Member",
      statusInactive: "Inactive Member",
      refTitle: "Your Personal Referral Link",
      copyLink: "Copy Link",
      bankTitle: "Withdrawal Account Credentials",
      bankSubtitle: "Configure your mobile wallet (bKash/Nagad) or Bank Account info to cashout.",
      bkashLabel: "bKash Number (Personal)",
      nagadLabel: "Nagad Number (Personal)",
      supportTitle: "Customer Care & Hotline Support",
      supportSubtitle: "Badalgachhi Office 24/7 Helpline Support.",
      monthlyActivationReminder: "Monthly Status Reminder: Purchase at least 500 TK of oil every month to keep your 5-level downline commissions unlocked."
    }
  }[language];

  // LOGGED OUT: Show clean Mobile OTP Login & Registration
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-fade-in space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#0F7A39] text-white rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow border-2 border-[#E7B416]">
            TMS
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">
            {t.authTitle}
          </h2>
          <p className="text-xs text-gray-500">
            {language === "bn" ? "টিএমএস সরিষার তেল আনিলিস্ট ডিস্ট্রিবিউটর পোর্টাল" : "TMS Premium Mustard Oil Distributor Portal"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md space-y-4">
          
          <div className="flex border-b pb-3">
            <button
              onClick={() => {
                setIsRegister(false);
                setOtpSent(false);
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 py-1 text-center font-bold text-sm border-r ${!isRegister ? "text-[#0F7A39]" : "text-gray-400"}`}
            >
              {language === "bn" ? "মেম্বার লগইন" : "Member Login"}
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setOtpSent(false);
                setAuthError("");
                setAuthSuccess("");
              }}
              className={`flex-1 py-1 text-center font-bold text-sm ${isRegister ? "text-[#0F7A39]" : "text-gray-400"}`}
            >
              {language === "bn" ? "নতুন মেম্বারশিপ" : "Register"}
            </button>
          </div>

          <h3 className="font-extrabold text-sm text-gray-700">
            {isRegister ? t.signupHeader : t.loginHeader}
          </h3>

          {authError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-green-50 border-l-4 border-[#0F7A39] text-green-700 text-xs rounded">
              {authSuccess}
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {isRegister && (
                <>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 block">
                      {t.nameLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="auth_name_input"
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-600 block">
                      {t.sponsorLabel}
                    </label>
                    <input
                      id="auth_sponsor_input"
                      type="text"
                      placeholder={t.sponsorPlaceholder}
                      value={sponsorId}
                      onChange={(e) => setSponsorId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-xs font-mono uppercase"
                    />
                    <p className="text-[9px] text-gray-400">
                      {language === "bn" ? "*স্পন্সর না থাকলে খালি রাখুন (অটোমেটিক এডমিন সংযুক্ত হবে)।" : "*Leave empty if you do not have a sponsor."}
                    </p>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">
                  {t.mobileLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    id="auth_mobile_input"
                    type="tel"
                    required
                    placeholder={t.mobilePlaceholder}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <button
                id="auth_send_otp_btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F7A39] hover:bg-[#0b5c2a] text-white font-bold py-2.5 rounded-lg text-xs transition"
              >
                {loading ? "Loading..." : t.sendOtpBtn}
              </button>

            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              {simulatedOtp && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs flex justify-between items-center">
                  <span>{t.testOtpAlert} <strong className="font-mono text-sm text-[#0F7A39] ml-1">{simulatedOtp}</strong></span>
                  <span className="text-[9px] text-gray-400">({language === "bn" ? "অটোমেটিক জেনারেটেড" : "Auto simulated"})</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 block">
                  {t.otpLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    id="auth_otp_code_input"
                    type="number"
                    required
                    placeholder={t.otpPlaceholder}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs font-mono font-bold text-center tracking-widest text-lg"
                  />
                </div>
              </div>

              <button
                id="auth_verify_otp_btn"
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F7A39] hover:bg-[#0b5c2a] text-white font-bold py-2.5 rounded-lg text-xs transition"
              >
                {loading ? "Verifying..." : t.verifyBtn}
              </button>

              <button
                id="auth_back_to_mobile"
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-[10px] text-gray-500 hover:underline"
              >
                {language === "bn" ? "মোবাইল নম্বর পরিবর্তন করুন" : "Change mobile number"}
              </button>

            </form>
          )}

          <div className="border-t pt-3 text-center">
            <button
              id="auth_toggle_mode_btn"
              onClick={() => {
                setIsRegister(!isRegister);
                setOtpSent(false);
                setAuthError("");
                setAuthSuccess("");
              }}
              className="text-xs text-[#0F7A39] font-bold hover:underline"
            >
              {isRegister ? t.switchToLogin : t.switchToSignup}
            </button>
          </div>

        </div>

      </div>
    );
  }

  // LOGGED IN: Show full unilevel distributor dashboard panel
  // Destructure required stats
  const totalCommission = user.directBonus + user.levelCommission + user.retailProfit;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      
      {/* Greetings Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-5 border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <span className="bg-[#E7B416] text-[#1E293B] font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            {user.role === "admin" ? "COMPANY ADMIN" : "OFFICIAL DISTRIBUTOR"}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-none">
            {language === "bn" ? `আসসালামু আলাইকুম, ${user.name}` : `Welcome Back, ${user.name}`}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300 font-mono">
            <p>ID: <span className="text-yellow-400 font-bold">{user.memberId}</span></p>
            <p>Mobile: <span className="font-bold">{user.mobile}</span></p>
            <p>Sponsor ID: <span className="text-gray-100">{user.sponsorId}</span></p>
          </div>
        </div>

        {/* Dashboard Actions */}
        <div className="flex flex-wrap gap-2">
          <button 
            id="db_refresh_profile"
            onClick={onRefreshUser}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition flex items-center justify-center border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button 
            id="db_nav_ecommerce"
            onClick={() => onNavigate("home")}
            className="bg-[#0F7A39] text-white hover:bg-green-700 font-bold text-xs px-4 py-2.5 rounded-lg transition"
          >
            {language === "bn" ? "🛒 তেল অর্ডার করুন" : "🛒 Shop Mustard Oil"}
          </button>
        </div>
      </section>

      {/* Active status alerts / monthly maintenance check */}
      <section className="p-4 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed bg-yellow-50/50 border-yellow-200 text-yellow-800">
        <AlertCircle className="w-5 h-5 text-[#E7B416] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">{language === "bn" ? "মাসিক একটিভেশন গাইডলাইন:" : "Monthly Activation Guideline:"}</p>
          <p className="mt-0.5">{t.monthlyActivationReminder}</p>
        </div>
      </section>

      {/* Metrics Card Grid (Strict specified color rule: Income: Blue, Purchases: Green, Team: Orange, Wallet: Purple, Status: Red/Green) */}
      <section className="space-y-4">
        <h3 className="font-black text-gray-800 text-base flex items-center">
          <UserCheck className="w-5 h-5 text-[#0F7A39] mr-1.5" />
          <span>{t.statsTitle}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Monthly Income (Blue) */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider">{t.monthlyIncome}</span>
            <div className="my-2">
              <span className="text-3xl font-black text-blue-900 font-mono">৳{totalCommission}</span>
            </div>
            <div className="text-[10px] text-blue-500 font-medium space-y-0.5">
              <p>{language === "bn" ? `খুচরা লাভ: ৳${user.retailProfit}` : `Retail Profit: ৳${user.retailProfit}`}</p>
              <p>{language === "bn" ? `লেভেল কমিশন: ৳${user.levelCommission}` : `Downline Comm: ৳${user.levelCommission}`}</p>
            </div>
          </div>

          {/* Card 2: Monthly Oil Purchases (Green) */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <span className="text-[10px] text-green-700 font-black uppercase tracking-wider">{t.monthlyPurchase}</span>
            <div className="my-2">
              <span className="text-3xl font-black text-green-900 font-mono">৳{user.currentMonthPurchase}</span>
            </div>
            <div className="text-[10px] text-green-600 font-medium">
              <p>{language === "bn" ? `টার্গেট: ৳৫০০` : `Target: 500 TK`}</p>
              <p className="font-bold text-[#0F7A39] mt-0.5">
                {user.currentMonthPurchase >= 500 
                  ? (language === "bn" ? "✓ সম্পূর্ণ হয়েছে" : "✓ Completed") 
                  : (language === "bn" ? `বাকি: ৳${500 - user.currentMonthPurchase}` : `Pending: ${500 - user.currentMonthPurchase} TK`)}
              </p>
            </div>
          </div>

          {/* Card 3: Total Team Size (Orange) */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <span className="text-[10px] text-amber-700 font-black uppercase tracking-wider">{t.totalTeam}</span>
            <div className="my-2">
              <span className="text-3xl font-black text-amber-900 font-mono">{user.totalTeamSize}</span>
            </div>
            <button 
              id="stats_nav_team_btn"
              onClick={() => onNavigate("team")}
              className="text-[10px] text-amber-600 font-bold hover:underline text-left mt-2"
            >
              {language === "bn" ? "→ ৫-লেভেল টিম ভিউ দেখুন" : "→ View 5-Level Team"}
            </button>
          </div>

          {/* Card 4: Wallet Balance (Purple) */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[120px]">
            <span className="text-[10px] text-purple-700 font-black uppercase tracking-wider">{t.balanceTitle}</span>
            <div className="my-2">
              <span className="text-3xl font-black text-purple-900 font-mono">৳{user.walletBalance}</span>
            </div>
            <button 
              id="stats_nav_wallet_btn"
              onClick={() => onNavigate("wallet")}
              className="text-[10px] text-purple-600 font-bold hover:underline text-left mt-2"
            >
              {language === "bn" ? "→ ক্যাশআউট / উত্তোলন করুন" : "→ Withdraw Funds"}
            </button>
          </div>

          {/* Card 5: Current Status (Red/Green based on Active state) */}
          <div className={`border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[120px] ${
            user.currentStatus === "active" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}>
            <span className={`text-[10px] font-black uppercase tracking-wider ${user.currentStatus === "active" ? "text-emerald-700" : "text-rose-700"}`}>
              {t.statusLabel}
            </span>
            <div className="my-2">
              <span className={`text-xl font-black ${user.currentStatus === "active" ? "text-emerald-800" : "text-rose-800"}`}>
                {user.currentStatus === "active" ? t.statusActive : t.statusInactive}
              </span>
            </div>
            <p className="text-[9px] text-gray-500 leading-normal">
              {user.currentStatus === "active" 
                ? (language === "bn" ? "আপনার আইডি ৫-স্তরের কমিশন পাওয়ার জন্য সম্পূর্ণ একটিভ রয়েছে।" : "Your ID is active and eligible for downstream commissions.") 
                : (language === "bn" ? "কমিশন আনলক করতে এখনই সরিষার তেল কিনে একটিভ হোন।" : "Purchase mustard oil today to unlock unilevel bonus.")}
            </p>
          </div>

        </div>
      </section>

      {/* Referral Link Card */}
      <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-3">
        <h4 className="font-extrabold text-sm text-gray-800 flex items-center">
          <Share2 className="w-5 h-5 text-[#0F7A39] mr-2" />
          <span>{t.refTitle}</span>
        </h4>
        <p className="text-xs text-gray-500">
          {language === "bn" ? "নিচের ইউনিক লিঙ্কটি কপি করে সামাজিক যোগাযোগ মাধ্যমে শেয়ার করুন। আপনার ডাউনলাইনে কেউ রেজিস্ট্রেশন করলেই কমিশন জেনারেট শুরু হবে।" : "Copy your referral link. Once a downline user registers or purchases through this link, unilevel commissions generate automatically."}
        </p>
        <div className="flex max-w-xl border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <input
            id="referral_link_input"
            type="text"
            readOnly
            value={`${window.location.origin}/?sponsor=${user.memberId}`}
            className="flex-1 bg-transparent px-3 py-2.5 text-xs font-mono text-[#0F7A39] font-semibold select-all focus:outline-none"
          />
          <button
            id="referral_link_copy_btn"
            onClick={handleCopyReferral}
            className="bg-[#0F7A39] text-white hover:bg-green-700 px-4 py-2 text-xs font-bold transition flex items-center space-x-1"
          >
            <Clipboard className="w-4 h-4 text-[#E7B416]" />
            <span className="hidden sm:inline">{t.copyLink}</span>
          </button>
        </div>
      </section>

      {/* Bank Account Settings & Mobile Banking Settings */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-gray-800 flex items-center border-b pb-3">
            <CreditCard className="w-5 h-5 text-[#0F7A39] mr-2" />
            <span>{t.bankTitle}</span>
          </h4>
          <p className="text-xs text-gray-500 leading-normal">
            {t.bankSubtitle}
          </p>

          {bankUpdateMsg && (
            <div className="p-2.5 bg-green-50 border-l-4 border-green-500 text-[#0F7A39] text-xs font-bold rounded">
              {bankUpdateMsg}
            </div>
          )}

          <form onSubmit={handleUpdateBank} className="space-y-3.5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 block">{t.bkashLabel}</label>
                <input
                  id="bank_bkash_input"
                  type="tel"
                  placeholder="যেমন: ০১৭********"
                  value={bkashNo}
                  onChange={(e) => setBkashNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 block">{t.nagadLabel}</label>
                <input
                  id="bank_nagad_input"
                  type="tel"
                  placeholder="যেমন: ০১৯********"
                  value={nagadNo}
                  onChange={(e) => setNagadNo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <p className="text-[11px] font-extrabold text-[#0F7A39]">{language === "bn" ? "ব্যাংক হিসাব বিবরণী (Bank Account Details)" : "Or Bank Account Wire Details"}</p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 block">{language === "bn" ? "ব্যাংকের নাম" : "Bank Name"}</label>
                <input
                  id="bank_name_input"
                  type="text"
                  placeholder="Sonali Bank / DBBL / Islami Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">{language === "bn" ? "একাউন্ট হোল্ডারের নাম" : "Account Holder Name"}</label>
                  <input
                    id="bank_acc_holder_input"
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">{language === "bn" ? "একাউন্ট নম্বর" : "Account Number"}</label>
                  <input
                    id="bank_acc_number_input"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">{language === "bn" ? "শাখার নাম" : "Branch Name"}</label>
                  <input
                    id="bank_branch_input"
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">{language === "bn" ? "রাউটিং নম্বর" : "Routing Number"}</label>
                  <input
                    id="bank_routing_input"
                    type="text"
                    value={routingNo}
                    onChange={(e) => setRoutingNo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              id="bank_details_save_btn"
              type="submit"
              className="w-full bg-[#0F7A39] hover:bg-green-700 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1"
            >
              <Save className="w-4 h-4 text-[#E7B416]" />
              <span>{language === "bn" ? "পেমেন্ট হিসাব তথ্য সংরক্ষণ করুন" : "Save Payment Details"}</span>
            </button>

          </form>
        </div>

        {/* 24/7 Helpline & Support Module */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-5">
          <h4 className="font-extrabold text-sm text-gray-800 flex items-center border-b pb-3">
            <HelpCircle className="w-5 h-5 text-[#0F7A39] mr-2" />
            <span>{t.supportTitle}</span>
          </h4>
          
          <p className="text-xs text-gray-500 leading-relaxed">
            {t.supportSubtitle} {language === "bn" ? "অর্ডার সরবরাহ, পেমেন্ট সংক্রান্ত যেকোনো বিষয়ে নওগাঁ প্রধান শাখা অফিসে কথা বলুন।" : "Call Naogaon branch for orders or commission details."}
          </p>

          <div className="bg-[#0F7A39]/5 border border-[#0F7A39]/20 rounded-xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-[#0F7A39] text-white rounded-full">
              <PhoneCall className="w-5 h-5 text-[#E7B416]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{language === "bn" ? "জরুরি হেল্পলাইন নম্বর" : "Hotline Helpline"}</p>
              <a href="tel:01966291176" className="text-lg font-black text-[#0F7A39] font-mono hover:underline">
                01966-291176
              </a>
              <p className="text-[9px] text-gray-400">{language === "bn" ? "(বদলগাছী উপজেলা গেট সংলগ্ন, নওগাঁ)" : "(Beside Badalgachhi Upazila Gate, Naogaon)"}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
            <h5 className="font-bold text-xs text-gray-700">{language === "bn" ? "অনলাইন ডাউনলোড সেন্টার" : "Digital Support Files"}</h5>
            <p className="text-[11px] text-gray-500">
              {language === "bn" ? "ব্যবসায়িক প্রচারের জন্য লিফলেট, ব্যানার, পোস্টার এবং তেল পরীক্ষার সার্টিফিকেট ফাইল ডাউনলোড করতে ডিরেক্টরিতে যান।" : "Download leaflets, posters, catalogues, brochures, and training resources."}
            </p>
            <button
              id="support_nav_downloads_btn"
              onClick={() => onNavigate("downloads")}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs border border-slate-300 transition"
            >
              📥 {language === "bn" ? "ডাউনলোড সেন্টার ফাইল" : "Go to Downloads"}
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
