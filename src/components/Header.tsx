/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Bell, Phone, HelpCircle, Wifi, WifiOff, X, Eye, Globe } from "lucide-react";
import { NotificationMsg } from "../types";

interface HeaderProps {
  language: "bn" | "en";
  setLanguage: (lang: "bn" | "en") => void;
  user: any;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export default function Header({ language, setLanguage, user, onLogout, onNavigate }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/notifications/my", {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.log("Error loading notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.length;

  const t = {
    bn: {
      phone: "হেল্পলাইন: ০১৯৬৬-২৯১১৭৬",
      address: "বদলগাছী, নওগাঁ",
      logout: "লগআউট",
      notifTitle: "নোটিফিকেশন সমূহ",
      noNotif: "কোনো নতুন নোটিফিকেশন নেই",
      online: "অনলাইন",
      offline: "অফলাইন মোড",
      memberId: "আইডি"
    },
    en: {
      phone: "Help: 01966-291176",
      address: "Badalgachhi, Naogaon",
      logout: "Logout",
      notifTitle: "Notifications",
      noNotif: "No new notifications",
      online: "Online",
      offline: "Offline Mode",
      memberId: "ID"
    }
  }[language];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F7A39] text-white shadow-md select-none">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          
          {/* Brand Logo & Info */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="w-10 h-10 bg-white text-[#0F7A39] rounded-full flex items-center justify-center font-extrabold text-xl shadow-inner border border-[#E7B416]">
              TMS
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-wide flex items-center">
                টিএমএস <span className="text-[#E7B416] ml-1">TMS</span>
              </h1>
              <p className="text-[10px] text-gray-100 font-medium">
                {language === "bn" ? "খাঁটি সরিষার তেল" : "Premium Mustard Oil"}
              </p>
            </div>
          </div>

          {/* Quick Actions / Header Info */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Online/Offline Status */}
            <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm ${isOnline ? "bg-[#0b5c2a] text-green-300" : "bg-red-700 text-red-200 animate-pulse"}`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isOnline ? t.online : t.offline}</span>
            </div>

            {/* Language Switcher */}
            <button 
              id="header_lang_toggle"
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 transition px-2 py-1 rounded text-xs font-semibold border border-white/20"
            >
              <Globe className="w-3.5 h-3.5 text-[#E7B416]" />
              <span>{language === "bn" ? "English" : "বাংলা"}</span>
            </button>

            {/* Helpline quick link */}
            <a href="tel:01966291176" className="hidden md:flex items-center space-x-1 text-xs text-white/95 hover:text-white font-medium bg-[#0b5c2a] px-2.5 py-1 rounded">
              <Phone className="w-3.5 h-3.5 text-[#E7B416]" />
              <span>{t.phone}</span>
            </a>

            {/* Notifications Icon (Authenticated users) */}
            {user && (
              <button 
                id="header_notif_btn"
                onClick={() => {
                  setShowNotifDrawer(true);
                  fetchNotifications();
                }}
                className="relative p-1.5 hover:bg-white/10 rounded-full transition"
              >
                <Bell className="w-5.5 h-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E7B416] text-[#1E293B] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#0F7A39] shadow">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Session Info & Log Out */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-white/20 pl-2 sm:pl-4">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-[#E7B416]">{user.name}</div>
                  <div className="text-[10px] text-gray-200">{t.memberId}: {user.memberId}</div>
                </div>
                <button 
                  id="header_logout_btn"
                  onClick={onLogout}
                  className="bg-red-600/90 hover:bg-red-700 hover:text-white px-2.5 py-1 rounded text-xs font-semibold border border-red-500 transition shadow"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button 
                id="header_login_nav"
                onClick={() => onNavigate("dashboard")}
                className="bg-[#E7B416] text-[#1E293B] hover:bg-yellow-500 font-bold px-3 py-1 rounded text-xs shadow transition border border-yellow-400"
              >
                {language === "bn" ? "লগইন / রেজি." : "Login / Signup"}
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Notifications Drawer Component */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-up sm:animate-none">
            <div className="bg-[#0F7A39] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <Bell className="w-5 h-5 text-[#E7B416]" />
                <span>{t.notifTitle}</span>
              </h3>
              <button 
                id="notif_drawer_close"
                onClick={() => setShowNotifDrawer(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>{t.noNotif}</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="bg-white border-l-4 border-[#0F7A39] p-3 rounded shadow-xs relative">
                    <span className="absolute top-2 right-3 text-[10px] text-gray-400 font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString(language === "bn" ? "bn-BD" : "en-US", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h4 className="font-bold text-sm text-gray-800 pr-12">{notif.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <div className="mt-2 flex items-center space-x-2 text-[10px] text-gray-400">
                      <span className="bg-[#0F7A39]/10 text-[#0F7A39] px-1.5 py-0.5 rounded uppercase font-semibold">
                        {notif.type}
                      </span>
                      <span>✓ {language === "bn" ? "পাঠানো হয়েছে" : "delivered"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 border-t text-center bg-white">
              <button 
                id="notif_clear_close"
                onClick={() => setShowNotifDrawer(false)}
                className="text-xs text-[#0F7A39] font-bold hover:underline"
              >
                {language === "bn" ? "বন্ধ করুন" : "Close Drawer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
