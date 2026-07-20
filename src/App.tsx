/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import EcommerceView from "./components/EcommerceView";
import MemberDashboard from "./components/MemberDashboard";
import TeamView from "./components/TeamView";
import WalletView from "./components/WalletView";
import OrderView from "./components/OrderView";
import DownloadCenter from "./components/DownloadCenter";
import AdminDashboard from "./components/AdminDashboard";
import { User } from "./types";

export default function App() {
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>("home");

  // Load user session on initial render
  useEffect(() => {
    const cachedUserId = localStorage.getItem("tms_user_session_id");
    if (cachedUserId) {
      fetchUserInfo(cachedUserId);
    }

    // Capture sponsor referral parameter from query parameters and cache it
    const urlParams = new URLSearchParams(window.location.search);
    const sponsor = urlParams.get("sponsor");
    if (sponsor) {
      localStorage.setItem("tms_referred_sponsor", sponsor);
    }
  }, []);

  const fetchUserInfo = async (userId: string) => {
    try {
      const res = await fetch("/api/user/me", {
        headers: {
          "Authorization": `Bearer ${userId}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // stale session
        localStorage.removeItem("tms_user_session_id");
        setUser(null);
      }
    } catch (e) {
      console.log("Error verifying session info:", e);
    }
  };

  const refreshUser = () => {
    if (user) {
      fetchUserInfo(user.id);
    }
  };

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    localStorage.setItem("tms_user_session_id", token);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("tms_user_session_id");
    setCurrentView("home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans selection:bg-[#0F7A39]/30 selection:text-[#0F7A39]">
      
      {/* Dynamic Header Component */}
      <Header
        language={language}
        setLanguage={setLanguage}
        user={user}
        onLogout={handleLogout}
        onNavigate={setCurrentView}
      />

      {/* Main View Segment */}
      <main className="flex-1 w-full">
        {currentView === "home" && (
          <EcommerceView
            language={language}
            user={user}
            onNavigate={setCurrentView}
            onRefreshUser={refreshUser}
          />
        )}

        {currentView === "dashboard" && (
          <MemberDashboard
            language={language}
            user={user}
            onLoginSuccess={handleLoginSuccess}
            onRefreshUser={refreshUser}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === "team" && (
          <TeamView
            language={language}
            user={user}
          />
        )}

        {currentView === "wallet" && (
          <WalletView
            language={language}
            user={user}
            onRefreshUser={refreshUser}
          />
        )}

        {currentView === "orders" && (
          <OrderView
            language={language}
            user={user}
            onRefreshUser={refreshUser}
          />
        )}

        {currentView === "downloads" && (
          <DownloadCenter
            language={language}
          />
        )}

        {currentView === "admin" && (
          <AdminDashboard
            language={language}
            user={user}
            onRefreshUser={refreshUser}
          />
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation Component */}
      <BottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        user={user}
      />

    </div>
  );
}
