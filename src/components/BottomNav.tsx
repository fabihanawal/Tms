/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Home, User, Users, Wallet, ShoppingBag, ShieldCheck } from "lucide-react";
import { UserRole } from "../types";

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language: "bn" | "en";
  user: any;
}

export default function BottomNav({ currentView, onNavigate, language, user }: BottomNavProps) {
  const t = {
    bn: {
      home: "শপ",
      dashboard: "ড্যাশবোর্ড",
      orders: "অর্ডার",
      wallet: "ওয়ালেট",
      team: "টিম",
      admin: "এডমিন"
    },
    en: {
      home: "Shop",
      dashboard: "Dashboard",
      orders: "Orders",
      wallet: "Wallet",
      team: "Team",
      admin: "Admin"
    }
  }[language];

  // Helper to check if view is active
  const isActive = (view: string) => currentView === view;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg select-none pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        
        {/* 1. Home / Shop */}
        <button
          id="nav_btn_home"
          onClick={() => onNavigate("home")}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
            isActive("home") ? "text-[#0F7A39]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Home className={`w-5.5 h-5.5 transition-transform ${isActive("home") ? "scale-110 text-[#0F7A39]" : ""}`} />
          <span className="mt-1 leading-none">{t.home}</span>
        </button>

        {/* 2. Member Dashboard */}
        <button
          id="nav_btn_dashboard"
          onClick={() => onNavigate("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
            isActive("dashboard") ? "text-[#0F7A39]" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <User className={`w-5.5 h-5.5 transition-transform ${isActive("dashboard") ? "scale-110 text-[#0F7A39]" : ""}`} />
          <span className="mt-1 leading-none">{t.dashboard}</span>
        </button>

        {/* 3. Orders (Visible to logged-in users) */}
        {user && (
          <button
            id="nav_btn_orders"
            onClick={() => onNavigate("orders")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              isActive("orders") ? "text-[#0F7A39]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ShoppingBag className={`w-5.5 h-5.5 transition-transform ${isActive("orders") ? "scale-110 text-[#0F7A39]" : ""}`} />
            <span className="mt-1 leading-none">{t.orders}</span>
          </button>
        )}

        {/* 4. Team (Visible to logged-in users) */}
        {user && (
          <button
            id="nav_btn_team"
            onClick={() => onNavigate("team")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              isActive("team") ? "text-[#0F7A39]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Users className={`w-5.5 h-5.5 transition-transform ${isActive("team") ? "scale-110 text-[#0F7A39]" : ""}`} />
            <span className="mt-1 leading-none">{t.team}</span>
          </button>
        )}

        {/* 5. Wallet (Visible to logged-in users) */}
        {user && (
          <button
            id="nav_btn_wallet"
            onClick={() => onNavigate("wallet")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              isActive("wallet") ? "text-[#0F7A39]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Wallet className={`w-5.5 h-5.5 transition-transform ${isActive("wallet") ? "scale-110 text-[#0F7A39]" : ""}`} />
            <span className="mt-1 leading-none">{t.wallet}</span>
          </button>
        )}

        {/* 6. Admin Panel (Only visible to admin) */}
        {user && user.role === UserRole.ADMIN && (
          <button
            id="nav_btn_admin"
            onClick={() => onNavigate("admin")}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition ${
              isActive("admin") ? "text-[#E7B416]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <ShieldCheck className={`w-5.5 h-5.5 transition-transform ${isActive("admin") ? "scale-110 text-[#E7B416]" : ""}`} />
            <span className="mt-1 leading-none">{t.admin}</span>
          </button>
        )}

      </div>
    </nav>
  );
}
