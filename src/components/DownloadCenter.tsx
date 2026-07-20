/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Download, Film, Image, FileText, CheckCircle, ExternalLink, Shield } from "lucide-react";

interface DownloadCenterProps {
  language: "bn" | "en";
}

export default function DownloadCenter({ language }: DownloadCenterProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const handleDownloadSimulate = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadedIds(prev => [...prev, id]);
      alert(language === "bn" ? "ফাইলটি আপনার ডিভাইসে সফলভাবে ডাউনলোড করা হয়েছে!" : "File downloaded successfully to your device!");
    }, 1500);
  };

  const assets = [
    {
      id: "cat-1",
      title_bn: "টিএমএস অফিশিয়াল প্রোডাক্ট ক্যাটালগ (PDF)",
      title_en: "TMS Official Product Catalogue (PDF)",
      size: "4.2 MB",
      type: "pdf",
      desc_bn: "সব আকারের তেলের বোতল, গুণাগুণ, মূল্য এবং পাইকারি ডিলার রেটের বিস্তারিত বিবরণী সহ ক্যাটালগ।",
      desc_en: "Comprehensive guide to mustard oil products, health values, size listings, and dealer pricing."
    },
    {
      id: "leaf-1",
      title_bn: "ব্যবসায়িক প্রচার লিফলেট / Leaflet (PDF)",
      title_en: "Promotional Leaflet PDF",
      size: "2.8 MB",
      type: "pdf",
      desc_bn: "বদলগাছী নওগাঁ ঘানির তেল প্রচারের জন্য হাট-বাজারে বিলি করার উপযুক্ত লিফলেট।",
      desc_en: "Print-ready leaflet layout for local area promotion and distribution."
    },
    {
      id: "banner-1",
      title_bn: "ডিজিটাল ফেসবুক ব্যানার ও পোস্টার (PNG)",
      title_en: "Digital Facebook Banners & Posters",
      size: "1.5 MB",
      type: "image",
      desc_bn: "আপনার ফেসবুক পেজে শেয়ার করে প্রচার করার জন্য হাই-কোয়ালিটি গোল্ডেন এবং গ্রিন ব্যানার ডিজাইন।",
      desc_en: "Social media marketing banner templates with TMS Green and Gold branding."
    },
    {
      id: "video-1",
      title_bn: "সরিষা তেল কাঠের ঘানি উৎপাদন প্রসেস (MP4)",
      title_en: "Factory Wood-Pressed Process Video (MP4)",
      size: "18.5 MB",
      type: "video",
      desc_bn: "বদলগাছী ফ্যাক্টরিতে সম্পূর্ণ অর্গানিক কাঠের ঘানিতে ভাঙানো তেল তৈরির অফিশিয়াল ২ মিনিটের ভিডিও ক্লিপ।",
      desc_en: "A 2-minute promotional clip illustrating our authentic wood-pressing method in Naogaon."
    }
  ];

  const t = {
    bn: {
      title: "টিএমএস প্রচার ও প্রশিক্ষণ মেটেরিয়ালস ডাউনলোড সেন্টার",
      subtitle: "আপনার লোকাল এলাকায় সরিষার তেল বিক্রয় বৃদ্ধির জন্য ক্যাটালগ, পোস্টার এবং লিফলেট ডাউনলোড করুন।",
      size: "ফাইলের সাইজ",
      type: "ফরম্যাট",
      downloadBtn: "ডাউনলোড করুন",
      downloading: "ডাউনলোড হচ্ছে...",
      completed: "ডাউনলোড সম্পূর্ণ",
      guideTitle: "প্রচার সংক্রান্ত নিয়মাবলী:",
      guideText: "টিএমএস লোগো, বোতলের ছবি ও নাম ব্যবহার করে যেকোনো পোস্টার প্রিন্ট করার পূর্বে অবশ্যই নওগাঁ এডমিন অফিসের অনুমোদন নিন। কোনো বিভ্রান্তিকর অফার প্রচার করা সম্পূর্ণ নিষিদ্ধ।"
    },
    en: {
      title: "Marketing Materials & Downloads Center",
      subtitle: "Download official catalogs, leaflets, social banners, and training videos to grow your local network sales.",
      size: "Size",
      type: "Type",
      downloadBtn: "Download File",
      downloading: "Downloading...",
      completed: "Completed",
      guideTitle: "Marketing Guidelines:",
      guideText: "Before printing posters using TMS branding, ensure you get approval from Naogaon head office. False promotional claims are strictly prohibited."
    }
  }[language];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
      
      {/* Title */}
      <section className="space-y-1">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center">
          <Download className="w-6 h-6 text-[#0F7A39] mr-2" />
          <span>{t.title}</span>
        </h2>
        <p className="text-xs text-gray-500">
          {t.subtitle}
        </p>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assets.map((asset) => {
          const isDownloading = downloadingId === asset.id;
          const isDownloaded = downloadedIds.includes(asset.id);

          return (
            <div key={asset.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-start space-x-4">
                
                {/* Format icon */}
                <div className={`p-3 rounded-xl shrink-0 ${
                  asset.type === "pdf" ? "bg-red-50 text-red-600" : asset.type === "video" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                }`}>
                  {asset.type === "pdf" ? (
                    <FileText className="w-6 h-6" />
                  ) : asset.type === "video" ? (
                    <Film className="w-6 h-6" />
                  ) : (
                    <Image className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <h3 className="font-extrabold text-sm text-gray-800 leading-snug">
                    {language === "bn" ? asset.title_bn : asset.title_en}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {language === "bn" ? asset.desc_bn : asset.desc_en}
                  </p>
                  
                  <div className="flex items-center space-x-3 text-[10px] text-gray-400 font-mono font-bold pt-1.5">
                    <span>{t.type}: {asset.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{t.size}: {asset.size}</span>
                  </div>
                </div>

              </div>

              {/* Action */}
              <button
                id={`download_simulate_btn_${asset.id}`}
                onClick={() => handleDownloadSimulate(asset.id)}
                disabled={isDownloading}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  isDownloading 
                    ? "bg-gray-100 text-[#0F7A39] cursor-not-allowed" 
                    : isDownloaded 
                    ? "bg-green-50 text-green-700 border border-green-200" 
                    : "bg-[#0F7A39] text-white hover:bg-[#0b5c2a] shadow-sm border border-green-600"
                }`}
              >
                {isDownloading ? (
                  <span className="animate-spin mr-1">⌛</span>
                ) : isDownloaded ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Download className="w-4 h-4 text-[#E7B416]" />
                )}
                <span>{isDownloading ? t.downloading : isDownloaded ? t.completed : t.downloadBtn}</span>
              </button>

            </div>
          );
        })}
      </section>

      {/* Promo guidelines card */}
      <section className="bg-slate-50 border p-5 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed text-gray-600">
        <Shield className="w-5 h-5 text-[#0F7A39] shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-gray-800">{t.guideTitle}</p>
          <p className="mt-0.5">{t.guideText}</p>
        </div>
      </section>

    </div>
  );
}
