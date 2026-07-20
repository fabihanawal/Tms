/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Users, ChevronDown, ChevronUp, Search, UserMinus, ShieldAlert, Award } from "lucide-react";
import { User } from "../types";

interface TeamViewProps {
  language: "bn" | "en";
  user: any;
}

export default function TeamView({ language, user }: TeamViewProps) {
  const [teamData, setTeamData] = useState<any>(null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1); // Expand Level 1 by default
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/team", {
        headers: { "Authorization": `Bearer ${user.id}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamData(data);
      }
    } catch (e) {
      console.log("Error loading team logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [user]);

  const toggleLevel = (lvl: number) => {
    setExpandedLevel(expandedLevel === lvl ? null : lvl);
  };

  const t = {
    bn: {
      title: "৫-স্তরের ডাউনলাইন মেম্বার তালিকা (Unilevel Team)",
      subtitle: "আপনার রেফারেল কোডের মাধ্যমে যুক্ত ৫-লেভেল ডিস্ট্রিবিউটর টিম ও তাদের কেনাকাটার খতিয়ান।",
      searchPlaceholder: "মেম্বার নাম বা মোবাইল দিয়ে সার্চ করুন...",
      levelsLabel: "লেভেল",
      totalLabel: "জন মেম্বার",
      nameCol: "মেম্বার নাম",
      mobileCol: "মোবাইল নম্বর",
      purchaseCol: "মাসিক ক্রয় পরিমাণ",
      statusCol: "স্ট্যাটাস",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      noTeam: "এই লেভেলে কোনো টিম মেম্বার এখনো যুক্ত হয়নি।",
      statsHeader: "টিম সামারি রিপোর্ট",
      totalTeam: "মোট নেটওয়ার্ক সাইজ",
      levelCount: "লেভেল-১ সরাসরি মেম্বার"
    },
    en: {
      title: "5-Level Downline Members (Unilevel Team)",
      subtitle: "Your downstream 5-level network of distributors and their sales volume records.",
      searchPlaceholder: "Search by member name or mobile...",
      levelsLabel: "Level",
      totalLabel: "Members",
      nameCol: "Member Name",
      mobileCol: "Mobile Number",
      purchaseCol: "Monthly Purchase",
      statusCol: "Status",
      active: "Active",
      inactive: "Inactive",
      noTeam: "No team members joined in this level yet.",
      statsHeader: "Team Network Summary",
      totalTeam: "Total Network Size",
      levelCount: "Level 1 Direct Referrals"
    }
  }[language];

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl border my-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-extrabold text-gray-800 text-lg">টিম দেখতে লগইন করুন</h3>
        <p className="text-xs text-gray-500 mt-1">৫-লেভেল ডাউনলাইন মেম্বার নেটওয়ার্ক ও ট্র্যাকিং প্যানেল দেখতে দয়া করে প্রথমে লগইন করুন।</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      
      {/* Title */}
      <section className="space-y-1">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
          <Users className="w-6 h-6 text-[#0F7A39] mr-2" />
          <span>{t.title}</span>
        </h2>
        <p className="text-xs text-gray-500">
          {t.subtitle}
        </p>
      </section>

      {/* Network Stats Card */}
      {teamData && (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="p-3 bg-[#0F7A39]/5 rounded-lg border border-[#0F7A39]/10 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">{t.totalTeam}</span>
            <span className="text-2xl font-black text-[#0F7A39] font-mono">{teamData.summary.totalTeamSize}</span>
          </div>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div key={lvl} className="p-3 bg-gray-50 rounded-lg text-center border">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">লেভেল-{lvl}</span>
              <span className="text-lg font-black text-gray-700 font-mono">
                {teamData.summary[`level${lvl}Count`] || 0}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Live Search and Filter */}
      <section className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
        <input 
          id="team_search_input"
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs shadow-xs focus:outline-none focus:border-[#0F7A39]"
        />
      </section>

      {/* Expandable Unilevel Accordions (Level 1 to 5) */}
      <section className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            {language === "bn" ? "অপেক্ষা করুন, মেম্বার নেটওয়ার্ক ট্র্যাকিং লোড হচ্ছে..." : "Loading unilevel team network..."}
          </div>
        ) : (
          [1, 2, 3, 4, 5].map((lvl) => {
            const list: User[] = teamData?.levels?.[lvl] || [];
            
            // Apply search query
            const filteredList = list.filter(u => 
              u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              u.mobile.includes(searchQuery) ||
              u.memberId.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const isExpanded = expandedLevel === lvl;

            return (
              <div key={lvl} className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
                
                {/* Accordion Trigger Header */}
                <button
                  id={`team_level_accordion_btn_${lvl}`}
                  onClick={() => toggleLevel(lvl)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50/50 transition border-b border-gray-50"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-[#0F7A39]/10 text-[#0F7A39] rounded-lg flex items-center justify-center font-bold text-sm">
                      {lvl}
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-sm text-gray-800">
                        {language === "bn" ? `লেভেল ${lvl} ডাউনলাইন` : `Level ${lvl} Members`}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {language === "bn" ? `মোট মেম্বার: ${list.length} জন` : `Total members: ${list.length}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {list.length > 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-2 py-0.5 rounded-full uppercase">
                        {language === "bn" ? `একটিভ: ${list.filter(u => u.currentStatus === "active").length} জন` : `Active: ${list.filter(u => u.currentStatus === "active").length}`}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </div>
                </button>

                {/* Accordion Expandable Content Panel */}
                {isExpanded && (
                  <div className="p-3 bg-gray-50/50 overflow-x-auto">
                    {filteredList.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-xs">
                        <UserMinus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p>{t.noTeam}</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3">ID</th>
                            <th className="py-2.5 px-3">{t.nameCol}</th>
                            <th className="py-2.5 px-3">{t.mobileCol}</th>
                            <th className="py-2.5 px-3 text-right">{t.purchaseCol}</th>
                            <th className="py-2.5 px-3 text-center">{t.statusCol}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredList.map((member) => (
                            <tr key={member.id} className="border-b border-gray-100 hover:bg-white/80 transition font-medium">
                              <td className="py-3 px-3 font-mono font-bold text-gray-700">{member.memberId}</td>
                              <td className="py-3 px-3">
                                <div>
                                  <p className="font-extrabold text-gray-800">{member.name}</p>
                                  <p className="text-[9px] text-gray-400 font-mono">Referred: {new Date(member.createdAt).toLocaleDateString()}</p>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-gray-600">{member.mobile}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-gray-700">৳{member.currentMonthPurchase}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  member.currentStatus === "active" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}>
                                  {member.currentStatus === "active" ? t.active : t.inactive}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </section>

      {/* MLM Commission Rules Banner */}
      <section className="bg-[#1E293B] text-white p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
        <div className="p-3 bg-[#E7B416] text-[#1E293B] rounded-xl font-black text-lg shadow shrink-0">
          MLM
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-[#E7B416] flex items-center">
            <Award className="w-4 h-4 mr-1 text-[#E7B416]" />
            <span>{language === "bn" ? "৫-স্তরের আকর্ষণীয় কমিশন চার্ট" : "TMS Unilevel 5-Level Commission Structure"}</span>
          </h4>
          <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
            {language === "bn" 
              ? "আপনার ডাউনলাইনের প্রতি ১ লিটার তেল ক্রয়ে আপনি পাবেন: লেভেল-১ (৮ টাকা), লেভেল-২ (৫ টাকা), লেভেল-৩ (৩ টাকা), লেভেল-৪ (২ টাকা) এবং লেভেল-৫ (১ টাকা)।" 
              : "Earn commission per unit: Level 1 (8 TK), Level 2 (5 TK), Level 3 (3 TK), Level 4 (2 TK), Level 5 (1 TK)."}
          </p>
        </div>
      </section>

    </div>
  );
}
