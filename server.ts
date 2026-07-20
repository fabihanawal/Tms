/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/server/db";
import { UserRole, UserStatus } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to verify authorization (Simple Token authentication based on memberId or userId)
  const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }
    const token = authHeader.substring(7); // "u-1" or "TMS-10001"
    let user = db.getUserById(token);
    if (!user) {
      user = db.getUserByMemberId(token);
    }
    if (!user) {
      res.status(401).json({ error: "User session expired" });
      return;
    }
    (req as any).user = user;
    next();
  };

  // --- API Routes ---

  // 1. Config & Settings
  app.get("/api/config", (req, res) => {
    res.json(db.getSettings());
  });

  // 2. Auth Endpoints
  const otpStorage = new Map<string, string>(); // mobile -> otp code

  app.post("/api/auth/otp/send", (req, res) => {
    const { mobile } = req.body;
    if (!mobile || mobile.length < 10) {
      res.status(400).json({ error: "সঠিক মোবাইল নম্বর প্রদান করুন।" });
      return;
    }

    // Generate a 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    otpStorage.set(mobile, code);

    // Simulated SMS dispatch
    console.log(`\n[SMS GATEWAY] OTP Sent to ${mobile}: ${code}\n`);

    // Add simulated system log or pending notification
    const existingUser = db.getUserByMobile(mobile);
    if (existingUser) {
      db.sendNotification(existingUser.id, "OTP Code", `আপনার লগইন ওটিপি কোড: ${code}। এটি ৫ মিনিটের জন্য প্রযোজ্য থাকবে।`, "sms");
    }

    res.json({ message: "ওটিপি সফলভাবে পাঠানো হয়েছে।", code }); // send code back for easy testing
  });

  app.post("/api/auth/otp/verify", (req, res) => {
    const { mobile, code, isRegister, name, sponsorId } = req.body;

    if (!mobile || !code) {
      res.status(400).json({ error: "মোবাইল এবং ওটিপি কোড আবশ্যক।" });
      return;
    }

    const savedCode = otpStorage.get(mobile);
    if (savedCode !== code && code !== "1976") { // 1976 is a master override code for developer ease
      res.status(400).json({ error: "ভুল ওটিপি কোড। আবার চেষ্টা করুন।" });
      return;
    }

    otpStorage.delete(mobile); // consume OTP

    let user = db.getUserByMobile(mobile);

    if (isRegister) {
      if (user) {
        res.status(400).json({ error: "এই মোবাইল নম্বরটি অলরেডি রেজিস্টার্ড।" });
        return;
      }
      if (!name) {
        res.status(400).json({ error: "মেম্বার নাম আবশ্যক।" });
        return;
      }

      // Check if sponsor exists
      const cleanSponsorId = sponsorId ? sponsorId.trim().toUpperCase() : "TMS-ADMIN";
      const sponsor = db.getUserByMemberId(cleanSponsorId);
      if (!sponsor && cleanSponsorId !== "TMS-ADMIN") {
        res.status(400).json({ error: "প্রদত্ত স্পন্সর আইডিটি খুঁজে পাওয়া যায়নি।" });
        return;
      }

      user = db.createUser({
        name,
        mobile,
        sponsorId: cleanSponsorId,
        role: UserRole.DISTRIBUTOR
      });
    } else {
      if (!user) {
        res.status(404).json({ error: "এই নম্বরে কোনো মেম্বার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। দয়া করে রেজিস্ট্রেশন করুন।" });
        return;
      }
      if (user.currentStatus === UserStatus.SUSPENDED) {
        res.status(403).json({ error: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। হেল্পলাইনে যোগাযোগ করুন।" });
        return;
      }
    }

    res.json({
      message: "সফলভাবে লগইন করা হয়েছে।",
      token: user.id,
      user
    });
  });

  // Fetch logged in profile
  app.get("/api/auth/me", authenticateUser, (req, res) => {
    res.json((req as any).user);
  });

  // 3. User & Member dashboard endpoints
  app.post("/api/user/update-bank", authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { bankName, accountName, accountNumber, branchName, routingNo, bkashNo, nagadNo } = req.body;

    const updated = db.updateUser(user.id, {
      bankDetails: {
        bankName: bankName || "",
        accountName: accountName || "",
        accountNumber: accountNumber || "",
        branchName: branchName || "",
        routingNo: routingNo || "",
        bkashNo: bkashNo || "",
        nagadNo: nagadNo || ""
      }
    });

    db.logAudit(user.id, user.name, "Bank Details Update", `Updated payment credentials`);
    res.json({ message: "পেমেন্ট বিবরণী সফলভাবে আপডেট করা হয়েছে।", user: updated });
  });

  // MLM Downline Compiler (5 levels deep)
  app.get("/api/user/team", authenticateUser, (req, res) => {
    const user = (req as any).user;
    const users = db.getUsers();

    // Helper to recursively get downline
    const getLevelDownline = (parentMemberId: string, currentLevel: number): any[] => {
      if (currentLevel > 5) return [];

      const directReferrals = users.filter(u => u.sponsorId.toUpperCase() === parentMemberId.toUpperCase());
      let result = directReferrals.map(u => ({
        id: u.id,
        memberId: u.memberId,
        name: u.name,
        mobile: u.mobile,
        currentMonthPurchase: u.currentMonthPurchase,
        currentStatus: u.currentStatus,
        createdAt: u.createdAt,
        level: currentLevel,
        // Child levels
        children: getLevelDownline(u.memberId, currentLevel + 1)
      }));

      return result;
    };

    // We can compile level-by-level lists for flat rendering in Accordion View
    const teamTree = getLevelDownline(user.memberId, 1);
    
    // Flatten lists of Level 1, 2, 3, 4, 5 for easy accordion layout
    const levels: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    
    const flatten = (nodes: any[]) => {
      nodes.forEach(node => {
        const { children, ...data } = node;
        levels[node.level].push(data);
        if (children && children.length > 0) {
          flatten(children);
        }
      });
    };

    flatten(teamTree);

    res.json({
      summary: {
        totalTeamSize: user.totalTeamSize,
        level1Count: levels[1].length,
        level2Count: levels[2].length,
        level3Count: levels[3].length,
        level4Count: levels[4].length,
        level5Count: levels[5].length
      },
      levels
    });
  });

  // 4. Products & Store
  app.get("/api/products", (req, res) => {
    res.json(db.getProducts());
  });

  app.post("/api/products/verify-qr", (req, res) => {
    const { qrCode } = req.body;
    if (!qrCode) {
      res.status(400).json({ error: "কিউআর কোড আবশ্যক।" });
      return;
    }

    const products = db.getProducts();
    const product = products.find(p => p.qrCode.toLowerCase() === qrCode.trim().toLowerCase());

    if (!product) {
      res.status(404).json({ error: "অকার্যকর কিউআর কোড! এটি টিএমএস-এর আসল পণ্য নয়।" });
      return;
    }

    res.json({
      verified: true,
      product,
      message: "✓ টিএমএস (TMS) আসল ও প্রিমিয়াম সরিষার তেল নিশ্চিতকরণ সফল হয়েছে।"
    });
  });

  // 5. Orders API
  app.post("/api/orders", authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { items, paymentMethod, transactionId, shippingAddress } = req.body;

    try {
      const order = db.createOrder({
        userId: user.id,
        items,
        paymentMethod,
        transactionId,
        shippingAddress
      });
      res.status(201).json({ message: "অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।", order });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/orders/my", authenticateUser, (req, res) => {
    const user = (req as any).user;
    const orders = db.getOrders().filter(o => o.userId === user.id);
    res.json(orders);
  });

  // 6. Wallet, Commission & Withdrawal Logs
  app.get("/api/wallet/transactions", authenticateUser, (req, res) => {
    const user = (req as any).user;
    const commissions = db.getCommissions().filter(c => c.recipientId === user.id);
    const withdrawals = db.getWithdrawals().filter(w => w.userId === user.id);
    res.json({ commissions, withdrawals });
  });

  app.post("/api/wallet/withdraw", authenticateUser, (req, res) => {
    const user = (req as any).user;
    const { amount, method, details } = req.body;

    try {
      const withdraw = db.createWithdrawal({
        userId: user.id,
        amount: Number(amount),
        method,
        details
      });
      res.status(201).json({ message: "উত্তোলনের অনুরোধটি জমা নেওয়া হয়েছে।", withdraw });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/notifications/my", authenticateUser, (req, res) => {
    const user = (req as any).user;
    res.json(db.getNotifications(user.id));
  });

  // --- Admin Dashboard API Endpoints (Requires Admin Privilege) ---

  const authorizeAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: "অ্যাডমিন অ্যাক্সেস প্রয়োজন।" });
      return;
    }
    next();
  };

  app.get("/api/admin/stats", authenticateUser, authorizeAdmin, (req, res) => {
    const orders = db.getOrders();
    const users = db.getUsers();
    const withdrawals = db.getWithdrawals();
    const commissions = db.getCommissions();
    const stocks = db.getStocks();

    const todayDate = new Date().toISOString().split("T")[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todaySales = orders
      .filter(o => o.createdAt.startsWith(todayDate) && o.status !== "cancelled")
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const monthlySales = orders
      .filter(o => o.createdAt.startsWith(thisMonth) && o.status !== "cancelled")
      .reduce((acc, o) => acc + o.totalAmount, 0);

    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const pendingWithdraw = withdrawals.filter(w => w.status === "pending").length;
    const totalMembers = users.filter(u => u.role !== UserRole.ADMIN).length;
    const totalCommissionDisbursed = commissions.reduce((acc, c) => acc + c.amount, 0);

    // Dynamic Chart Data points (last 6 days)
    const chartData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const sales = orders
        .filter(o => o.createdAt.startsWith(dateStr) && o.status !== "cancelled")
        .reduce((acc, o) => acc + o.totalAmount, 0);
      
      const comms = commissions
        .filter(c => c.createdAt.startsWith(dateStr))
        .reduce((acc, c) => acc + c.amount, 0);

      const formattedDate = d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" });

      return {
        date: formattedDate,
        sales,
        commission: comms
      };
    }).reverse();

    res.json({
      todaySales,
      monthlySales,
      pendingOrders,
      pendingWithdraw,
      totalMembers,
      totalCommissionDisbursed,
      chartData,
      lowStockAlerts: stocks.filter(s => s.dealerStock <= s.lowStockAlert).length
    });
  });

  // Orders Admin list
  app.get("/api/admin/orders", authenticateUser, authorizeAdmin, (req, res) => {
    res.json(db.getOrders());
  });

  app.post("/api/admin/orders/update-status", authenticateUser, authorizeAdmin, (req, res) => {
    const { orderId, status } = req.body;
    const updated = db.updateOrderStatus(orderId, status);
    if (!updated) {
      res.status(404).json({ error: "অর্ডার পাওয়া যায়নি।" });
      return;
    }
    res.json({ message: `অর্ডার সফলভাবে ${status === "approved" ? "অনুমোদন" : status === "delivered" ? "ডেলিভারড" : status === "cancelled" ? "বাতিল" : "আপডেট"} করা হয়েছে।`, order: updated });
  });

  // Withdrawals Admin list
  app.get("/api/admin/withdrawals", authenticateUser, authorizeAdmin, (req, res) => {
    res.json(db.getWithdrawals());
  });

  app.post("/api/admin/withdrawals/process", authenticateUser, authorizeAdmin, (req, res) => {
    const { withdrawalId, status } = req.body; // approved / rejected
    const processed = db.processWithdrawal(withdrawalId, status);
    if (!processed) {
      res.status(404).json({ error: "উত্তোলন অনুরোধ পাওয়া যায়নি।" });
      return;
    }
    res.json({ message: `উত্তোলন অনুরোধ সফলভাবে ${status === "approved" ? "অনুমোদন" : "বাতিল"} করা হয়েছে।`, withdrawal: processed });
  });

  // Members Admin list & modification
  app.get("/api/admin/members", authenticateUser, authorizeAdmin, (req, res) => {
    const users = db.getUsers().filter(u => u.role !== UserRole.ADMIN);
    res.json(users);
  });

  app.post("/api/admin/members/modify", authenticateUser, authorizeAdmin, (req, res) => {
    const { userId, action, newValue } = req.body; // action: suspend, changeSponsor, updateRole
    const user = db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: "মেম্বার অ্যাকাউন্ট পাওয়া যায়নি।" });
      return;
    }

    if (action === "suspend") {
      db.updateUser(userId, { currentStatus: UserStatus.SUSPENDED });
      db.logAudit("u-admin", "Admin", "Member Suspend", `Suspended member ${user.name} (${user.memberId})`);
    } else if (action === "activate") {
      db.updateUser(userId, { currentStatus: UserStatus.ACTIVE });
      db.logAudit("u-admin", "Admin", "Member Activate", `Activated member ${user.name} (${user.memberId})`);
    } else if (action === "changeSponsor") {
      const targetSponsor = db.getUserByMemberId(newValue);
      if (!targetSponsor) {
        res.status(400).json({ error: "প্রদত্ত নতুন স্পন্সর আইডিটি অবৈধ।" });
        return;
      }
      db.updateUser(userId, { 
        sponsorId: targetSponsor.memberId,
        sponsorName: targetSponsor.name
      });
      db.logAudit("u-admin", "Admin", "Sponsor Transfer", `Transferred sponsor of ${user.name} to ${targetSponsor.name} (${targetSponsor.memberId})`);
    }

    res.json({ message: "মেম্বার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।" });
  });

  // Inventory Stocks & Transfer
  app.get("/api/admin/stocks", authenticateUser, authorizeAdmin, (req, res) => {
    res.json({
      stocks: db.getStocks(),
      transfers: db.getTransfers()
    });
  });

  app.post("/api/admin/stocks/transfer", authenticateUser, authorizeAdmin, (req, res) => {
    const { productId, quantity, fromLocation, toLocation, status } = req.body;

    try {
      const transfer = db.createStockTransfer({
        productId,
        quantity: Number(quantity),
        fromLocation,
        toLocation,
        status
      });
      res.status(201).json({ message: "স্টক ট্রান্সফার/সমন্বয় সফলভাবে সম্পন্ন হয়েছে।", transfer });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Settings modification
  app.post("/api/admin/settings", authenticateUser, authorizeAdmin, (req, res) => {
    const updated = db.updateSettings(req.body);
    db.logAudit("u-admin", "Admin", "Settings Update", `Updated system & MLM rules configuration`);
    res.json({ message: "সিস্টেম ও কমিশন সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।", settings: updated });
  });

  // System Audit Logs
  app.get("/api/admin/logs", authenticateUser, authorizeAdmin, (req, res) => {
    res.json(db.getAuditLogs());
  });


  // --- Vite & Production Server Setup ---

  if (process.env.NODE_ENV !== "production") {
    // Development server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server mounted successfully.");
  } else {
    // Production server
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server boot error:", err);
});
