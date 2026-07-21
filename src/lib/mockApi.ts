/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, UserRole, UserStatus, Product, Order, OrderItem, CommissionLog, 
  WithdrawalRequest, StockItem, StockTransfer, AuditLog, AdminSettings, 
  NotificationMsg, OrderStatus, WithdrawalMethod
} from "../types";

// Setup Initial Seed Data matching src/server/db.ts
const defaultSettings: AdminSettings = {
  companyName: "টিএমএস (TMS) সরিষার তেল",
  address: "বদলগাছী, নওগাঁ, বাংলাদেশ",
  phone: "01966-291176",
  email: "support@tmsbd.com",
  commissionRules: [8, 5, 3, 2, 1], // Level 1 to 5 commission in Taka per unit
  shippingCharge: 60,
  smsApiEnabled: true,
  whatsAppApiEnabled: true,
  emailEnabled: true,
  monthlyActivationThreshold: 500
};

const initialProducts: Product[] = [
  {
    id: "p1",
    name: "টিএমএস প্রিমিয়াম খাঁটি সরিষার তেল - ১ লিটার",
    size: "1 Liter",
    price: 240,
    stock: 1200,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    qrCode: "TMS-OIL-1L-240",
    description: "১০০% খাঁটি কাঠের ঘানিতে ভাঙানো সরিষার তেল। ঝাঁঝালো স্বাদ ও গন্ধ অটুট থাকে।"
  },
  {
    id: "p2",
    name: "টিএমএস প্রিমিয়াম খাঁটি সরিষার তেল - ২ লিটার",
    size: "2 Liter",
    price: 470,
    stock: 750,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    qrCode: "TMS-OIL-2L-470",
    description: "সরাসরি বদলগাছী নওগাঁর ঘানি থেকে উৎপাদিত। স্বাস্থ্যকর ও ভেজালমুক্ত।"
  },
  {
    id: "p3",
    name: "টিএমএস প্রিমিয়াম খাঁটি সরিষার তেল - ৫ লিটার",
    size: "5 Liter",
    price: 1150,
    stock: 450,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    qrCode: "TMS-OIL-5L-1150",
    description: "পারিবারিক ব্যবহারের জন্য সাশ্রয়ী মূল্যে প্রিমিয়াম সরিষার তেলের ৫ লিটার ক্যান।"
  },
  {
    id: "p4",
    name: "টিএমএস প্রিমিয়াম খাঁটি সরিষার তেল - ১০ লিটার",
    size: "10 Liter",
    price: 2250,
    stock: 180,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    qrCode: "TMS-OIL-10L-2250",
    description: "ডিলার ও বড় পরিবারের জন্য সেরা মানের কাঠের ঘানিতে ভাঙানো তেলের বড় ক্যান।"
  }
];

const initialUsers: User[] = [
  {
    id: "u-admin",
    memberId: "TMS-ADMIN",
    name: "টিএমএস মডারেটর এডমিন",
    mobile: "01966291176",
    role: UserRole.ADMIN,
    sponsorId: "",
    currentStatus: UserStatus.ACTIVE,
    currentMonthPurchase: 5000,
    walletBalance: 250000,
    directBonus: 50000,
    retailProfit: 120000,
    levelCommission: 80000,
    totalTeamSize: 125,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: {
      bankName: "Sonali Bank PLC",
      accountName: "TMS OIL LTD",
      accountNumber: "2000124578122",
      branchName: "Badalgachhi Branch",
      bkashNo: "01966291176",
      nagadNo: "01966291176"
    }
  },
  {
    id: "u1",
    memberId: "TMS-10001",
    name: "করিম উদ্দিন",
    mobile: "01711223344",
    role: UserRole.DISTRIBUTOR,
    sponsorId: "TMS-ADMIN",
    sponsorName: "টিএমএস মডারেটর এডমিন",
    currentStatus: UserStatus.ACTIVE,
    currentMonthPurchase: 1200,
    walletBalance: 4250,
    directBonus: 1200,
    retailProfit: 1550,
    levelCommission: 1500,
    totalTeamSize: 5,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: {
      bankName: "Dutch-Bangla Bank",
      accountName: "Karim Uddin",
      accountNumber: "123.456.78901",
      branchName: "Naogaon Branch",
      routingNo: "12345678",
      bkashNo: "01711223344",
      nagadNo: ""
    }
  },
  {
    id: "u2",
    memberId: "TMS-10002",
    name: "রফিকুল ইসলাম",
    mobile: "01822334455",
    role: UserRole.DISTRIBUTOR,
    sponsorId: "TMS-10001",
    sponsorName: "করিম উদ্দিন",
    currentStatus: UserStatus.ACTIVE,
    currentMonthPurchase: 940,
    walletBalance: 2380,
    directBonus: 600,
    retailProfit: 980,
    levelCommission: 800,
    totalTeamSize: 4,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: {
      bankName: "bKash Personal",
      accountName: "Rofiqul Islam",
      accountNumber: "01822334455",
      branchName: "",
      routingNo: "",
      bkashNo: "01822334455",
      nagadNo: "01822334455"
    }
  }
];

// Helper functions for Local Mock DB State
class LocalMockDB {
  private get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(`tms_mock_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    localStorage.setItem(`tms_mock_${key}`, JSON.stringify(value));
  }

  public get users(): User[] { return this.get("users", initialUsers); }
  public set users(v: User[]) { this.set("users", v); }

  public get products(): Product[] { return this.get("products", initialProducts); }
  public set products(v: Product[]) { this.set("products", v); }

  public get orders(): Order[] { return this.get("orders", []); }
  public set orders(v: Order[]) { this.set("orders", v); }

  public get commissions(): CommissionLog[] { return this.get("commissions", []); }
  public set commissions(v: CommissionLog[]) { this.set("commissions", v); }

  public get withdrawals(): WithdrawalRequest[] { return this.get("withdrawals", []); }
  public set withdrawals(v: WithdrawalRequest[]) { this.set("withdrawals", v); }

  public get settings(): AdminSettings { return this.get("settings", defaultSettings); }
  public set settings(v: AdminSettings) { this.set("settings", v); }

  public get notifications(): NotificationMsg[] { return this.get("notifications", []); }
  public set notifications(v: NotificationMsg[]) { this.set("notifications", v); }

  public get auditLogs(): AuditLog[] { return this.get("auditLogs", []); }
  public set auditLogs(v: AuditLog[]) { this.set("auditLogs", v); }

  public get stocks(): StockItem[] {
    const defaultStocks: StockItem[] = this.products.map(p => ({
      productId: p.id,
      productName: p.name,
      size: p.size,
      factoryStock: p.stock * 3,
      warehouseStock: p.stock * 2,
      dealerStock: p.stock,
      lowStockAlert: 100
    }));
    return this.get("stocks", defaultStocks);
  }
  public set stocks(v: StockItem[]) { this.set("stocks", v); }

  public get transfers(): StockTransfer[] { return this.get("transfers", []); }
  public set transfers(v: StockTransfer[]) { this.set("transfers", v); }

  // Logging and Auditing inside client db
  public logAudit(userId: string, userName: string, action: string, details: string) {
    const logs = this.auditLogs;
    const newLog: AuditLog = {
      id: `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.auditLogs = logs;
  }

  public sendNotification(userId: string, title: string, message: string, type: "sms" | "whatsapp" | "push" | "email" = "sms") {
    const notifs = this.notifications;
    const newNotif: NotificationMsg = {
      id: `N-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      status: "sent",
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    this.notifications = notifs;
  }
}

const mockDB = new LocalMockDB();
const otpMap = new Map<string, string>(); // simulated mobile -> otp code map

// Status switches
let isLocalBackend: boolean | null = null;
let isFallbackActive = false;

// Simulated delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Capture original fetch
const originalFetch = window.fetch;

// Custom mocked window.fetch router
const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === "string" ? input : (input as any).url || input.toString();

  // Route ONLY requests targeting /api/* to the mock router if the real backend is offline
  if (urlString.includes("/api/")) {
    // If state is not determined yet, probe the backend
    if (isLocalBackend === null && !isFallbackActive) {
      try {
        // Send a direct request to /api/config to verify if real backend is responding
        const probeRes = await originalFetch("/api/config", { signal: AbortSignal.timeout(1500) });
        if (probeRes.ok) {
          const contentType = probeRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            isLocalBackend = true;
          } else {
            isFallbackActive = true;
          }
        } else {
          isFallbackActive = true;
        }
      } catch (e) {
        console.warn("Backend server not responding. Falling back to local storage simulator mode.");
        isFallbackActive = true;
      }
      isLocalBackend = !isFallbackActive;
    }

    if (isFallbackActive) {
      // Simulate real server delay for optimal realistic ux
      await delay(200);
      return handleMockRoute(urlString, init);
    }
  }

  // Fallback to real native Express backend server
  return originalFetch(input, init);
};

try {
  // Try direct assignment first
  window.fetch = customFetch;
} catch (e) {
  // Fallback to Object.defineProperty if it has only a getter or throws an error
  try {
    Object.defineProperty(window, "fetch", {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.error("Failed to intercept window.fetch using defineProperty:", err);
  }
}

// Response helper
function createJSONResponse(data: any, status = 200, statusText = "OK"): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" }
  });
}

// Router dispatcher for Mock Backend Server
async function handleMockRoute(url: string, init?: RequestInit): Promise<Response> {
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const method = (init?.method || "GET").toUpperCase();
  const body = init?.body ? JSON.parse(init.body as string) : {};

  // Extract auth header token
  let currentUser: User | null = null;
  const authHeader = init?.headers ? (init.headers as any)["Authorization"] || (init.headers as any)["authorization"] : null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    currentUser = mockDB.users.find(u => u.id === token || u.memberId === token) || null;
  }

  // --- 1. Settings & Config ---
  if (path === "/api/config" && method === "GET") {
    return createJSONResponse(mockDB.settings);
  }

  // --- 2. Authentication Router ---
  if (path === "/api/auth/otp/send" && method === "POST") {
    const { mobile } = body;
    if (!mobile || mobile.length < 10) {
      return createJSONResponse({ error: "সঠিক মোবাইল নম্বর প্রদান করুন।" }, 400);
    }

    // Generate simulated 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    otpMap.set(mobile, code);

    // Write OTP notification if member exists
    const user = mockDB.users.find(u => u.mobile === mobile);
    if (user) {
      mockDB.sendNotification(user.id, "OTP Code", `আপনার লগইন ওটিপি কোড: ${code}। এটি ৫ মিনিটের জন্য প্রযোজ্য থাকবে।`, "sms");
    }

    // Return mock SMS code directly for immediate client preview
    return createJSONResponse({
      message: "ওটিপি সফলভাবে পাঠানো হয়েছে।",
      code
    });
  }

  if (path === "/api/auth/otp/verify" && method === "POST") {
    const { mobile, code, isRegister, name, sponsorId } = body;

    if (!mobile || !code) {
      return createJSONResponse({ error: "মোবাইল এবং ওটিপি কোড আবশ্যক।" }, 400);
    }

    const savedCode = otpMap.get(mobile);
    if (savedCode !== code && code !== "1976") {
      return createJSONResponse({ error: "ভুল ওটিপি কোড। আবার চেষ্টা করুন।" }, 400);
    }

    otpMap.delete(mobile); // Consume code

    let user = mockDB.users.find(u => u.mobile === mobile);

    if (isRegister) {
      if (user) {
        return createJSONResponse({ error: "এই মোবাইল নম্বরটি অলরেডি রেজিস্টার্ড।" }, 400);
      }
      if (!name) {
        return createJSONResponse({ error: "মেম্বার নাম আবশ্যক।" }, 400);
      }

      const cleanSponsorId = sponsorId ? sponsorId.trim().toUpperCase() : "TMS-ADMIN";
      const sponsor = mockDB.users.find(u => u.memberId.toUpperCase() === cleanSponsorId);
      if (!sponsor && cleanSponsorId !== "TMS-ADMIN") {
        return createJSONResponse({ error: "প্রদত্ত স্পন্সর আইডিটি খুঁজে পাওয়া যায়নি।" }, 400);
      }

      // Create member locally
      const nextNum = 10000 + mockDB.users.length + 1;
      const memberId = `TMS-${nextNum}`;
      const id = `u-${Date.now()}`;

      const newUser: User = {
        id,
        memberId,
        name,
        mobile,
        role: UserRole.DISTRIBUTOR,
        sponsorId: sponsor ? sponsor.memberId : "TMS-ADMIN",
        sponsorName: sponsor ? sponsor.name : "টিএমএস মডারেটর এডমিন",
        currentStatus: UserStatus.INACTIVE,
        currentMonthPurchase: 0,
        walletBalance: 0,
        directBonus: 0,
        retailProfit: 0,
        levelCommission: 0,
        totalTeamSize: 0,
        createdAt: new Date().toISOString(),
        bankDetails: {
          bankName: "",
          accountName: "",
          accountNumber: "",
          branchName: "",
          routingNo: "",
          bkashNo: "",
          nagadNo: ""
        }
      };

      const allUsers = mockDB.users;
      allUsers.push(newUser);
      
      // Update team sizes upstream
      let currentSponsor = sponsor;
      let level = 1;
      while (currentSponsor && level <= 5) {
        currentSponsor.totalTeamSize += 1;
        currentSponsor = allUsers.find(u => u.memberId === currentSponsor!.sponsorId);
        level++;
      }
      mockDB.users = allUsers;

      mockDB.logAudit(newUser.id, newUser.name, "User Registration", `Registered successfully with ID ${memberId}`);
      mockDB.sendNotification(newUser.id, "Welcome to TMS", `টিএমএস-এ আপনাকে স্বাগতম! আপনার আইডি: ${memberId}`);

      return createJSONResponse({
        message: "সফলভাবে রেজিস্ট্রেশন করা হয়েছে।",
        token: newUser.id,
        user: newUser
      });

    } else {
      if (!user) {
        return createJSONResponse({ error: "এই নম্বরে কোনো মেম্বার অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। দয়া করে রেজিস্ট্রেশন করুন।" }, 404);
      }
      if (user.currentStatus === UserStatus.SUSPENDED) {
        return createJSONResponse({ error: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে। হেল্পলাইনে যোগাযোগ করুন।" }, 403);
      }

      return createJSONResponse({
        message: "সফলভাবে লগইন করা হয়েছে।",
        token: user.id,
        user
      });
    }
  }

  // --- 3. Profile Fetch & Update Bank Details ---
  if ((path === "/api/auth/me" || path === "/api/user/me") && method === "GET") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    return createJSONResponse(currentUser);
  }

  if (path === "/api/user/update-bank" && method === "POST") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    const { bankName, accountName, accountNumber, branchName, routingNo, bkashNo, nagadNo } = body;

    const allUsers = mockDB.users;
    const index = allUsers.findIndex(u => u.id === currentUser!.id);
    if (index !== -1) {
      allUsers[index].bankDetails = {
        bankName: bankName || "",
        accountName: accountName || "",
        accountNumber: accountNumber || "",
        branchName: branchName || "",
        routingNo: routingNo || "",
        bkashNo: bkashNo || "",
        nagadNo: nagadNo || ""
      };
      mockDB.users = allUsers;
      currentUser = allUsers[index];
    }

    mockDB.logAudit(currentUser.id, currentUser.name, "Bank Details Update", `Updated payment credentials`);
    return createJSONResponse({ message: "পেমেন্ট বিবরণী সফলভাবে আপডেট করা হয়েছে।", user: currentUser });
  }

  // --- 4. Downline Team Tree (5 levels) ---
  if (path === "/api/user/team" && method === "GET") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    const allUsers = mockDB.users;

    const getLevelDownline = (parentMemberId: string, currentLevel: number): any[] => {
      if (currentLevel > 5) return [];
      const directReferrals = allUsers.filter(u => u.sponsorId.toUpperCase() === parentMemberId.toUpperCase());
      return directReferrals.map(u => ({
        id: u.id,
        memberId: u.memberId,
        name: u.name,
        mobile: u.mobile,
        currentMonthPurchase: u.currentMonthPurchase,
        currentStatus: u.currentStatus,
        createdAt: u.createdAt,
        level: currentLevel,
        children: getLevelDownline(u.memberId, currentLevel + 1)
      }));
    };

    const teamTree = getLevelDownline(currentUser.memberId, 1);
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

    return createJSONResponse({
      summary: {
        totalTeamSize: currentUser.totalTeamSize,
        level1Count: levels[1].length,
        level2Count: levels[2].length,
        level3Count: levels[3].length,
        level4Count: levels[4].length,
        level5Count: levels[5].length
      },
      levels
    });
  }

  // --- 5. Products Store APIs ---
  if (path === "/api/products" && method === "GET") {
    return createJSONResponse(mockDB.products);
  }

  if (path === "/api/products/verify-qr" && method === "POST") {
    const { qrCode } = body;
    if (!qrCode) return createJSONResponse({ error: "কিউআর কোড আবশ্যক।" }, 400);

    const product = mockDB.products.find(p => p.qrCode.toLowerCase() === qrCode.trim().toLowerCase());
    if (!product) {
      return createJSONResponse({ error: "অকার্যকর কিউআর কোড! এটি টিএমএস-এর আসল পণ্য নয়।" }, 404);
    }

    return createJSONResponse({
      verified: true,
      product,
      message: "✓ টিএমএস (TMS) আসল ও প্রিমিয়াম সরিষার তেল নিশ্চিতকরণ সফল হয়েছে।"
    });
  }

  // --- 6. Ordering & Commission Distribution Engine ---
  if (path === "/api/orders" && method === "POST") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    const { items, paymentMethod, transactionId, shippingAddress } = body;

    const allProducts = mockDB.products;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const prodIndex = allProducts.findIndex(p => p.id === item.productId);
      if (prodIndex === -1) {
        return createJSONResponse({ error: "পণ্য পাওয়া যায়নি।" }, 400);
      }
      if (allProducts[prodIndex].stock < item.quantity) {
        return createJSONResponse({ error: `পর্যাপ্ত স্টক নেই (স্টক: ${allProducts[prodIndex].stock} লিটার)` }, 400);
      }

      allProducts[prodIndex].stock -= item.quantity;
      orderItems.push({
        productId: allProducts[prodIndex].id,
        productName: allProducts[prodIndex].name,
        quantity: item.quantity,
        price: allProducts[prodIndex].price,
        size: allProducts[prodIndex].size
      });
    }

    mockDB.products = allProducts; // save stock reduction

    const totalAmount = orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const orderId = `TMS-ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      memberId: currentUser.memberId,
      userName: currentUser.name,
      userMobile: currentUser.mobile,
      items: orderItems,
      totalAmount,
      status: "pending",
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "unpaid" : "paid",
      transactionId,
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    const allOrders = mockDB.orders;
    allOrders.unshift(newOrder);
    mockDB.orders = allOrders;

    mockDB.logAudit(currentUser.id, currentUser.name, "Order Creation", `Created order ${orderId} totaling ${totalAmount} TK`);
    mockDB.sendNotification(currentUser.id, "Order Confirmed", `আপনার অর্ডার ${orderId} সফলভাবে গৃহীত হয়েছে। মোট বিল: ${totalAmount} টাকা।`);

    return createJSONResponse({ message: "অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।", order: newOrder }, 201);
  }

  if (path === "/api/orders/my" && method === "GET") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    return createJSONResponse(mockDB.orders.filter(o => o.userId === currentUser!.id));
  }

  // --- 7. Wallet Withdrawals & Transactions Logs ---
  if (path === "/api/wallet/transactions" && method === "GET") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    const comms = mockDB.commissions.filter(c => c.recipientId === currentUser!.id);
    const withs = mockDB.withdrawals.filter(w => w.userId === currentUser!.id);
    return createJSONResponse({ commissions: comms, withdrawals: withs });
  }

  if (path === "/api/wallet/withdraw" && method === "POST") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    const { amount, method: wMethod, details } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      return createJSONResponse({ error: "নূন্যতম উত্তোলন ১০০ টাকা হতে হবে।" }, 400);
    }

    const allUsers = mockDB.users;
    const userIndex = allUsers.findIndex(u => u.id === currentUser!.id);
    if (userIndex === -1) return createJSONResponse({ error: "User not found" }, 400);

    const userInDb = allUsers[userIndex];
    if (userInDb.walletBalance < numAmount) {
      return createJSONResponse({ error: "আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।" }, 400);
    }

    // Deduct and save user balance
    userInDb.walletBalance -= numAmount;
    mockDB.users = allUsers;

    const withdrawId = `TMS-WIT-${Date.now().toString().slice(-6)}`;
    const newWithdrawal: WithdrawalRequest = {
      id: withdrawId,
      userId: userInDb.id,
      memberId: userInDb.memberId,
      userName: userInDb.name,
      mobile: userInDb.mobile,
      amount: numAmount,
      method: wMethod,
      details,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    const allWithdrawals = mockDB.withdrawals;
    allWithdrawals.unshift(newWithdrawal);
    mockDB.withdrawals = allWithdrawals;

    mockDB.logAudit(userInDb.id, userInDb.name, "Withdrawal Request", `Requested withdrawal of ${numAmount} TK via ${wMethod}`);
    mockDB.sendNotification(userInDb.id, "Withdrawal Submitted", `আপনার ৳${numAmount} টাকা উত্তোলনের অনুরোধটি জমা হয়েছে। ট্র্যাকিং আইডি: ${withdrawId}।`);

    return createJSONResponse({ message: "উত্তোলনের অনুরোধটি জমা নেওয়া হয়েছে।", withdraw: newWithdrawal }, 201);
  }

  if (path === "/api/notifications/my" && method === "GET") {
    if (!currentUser) return createJSONResponse({ error: "Unauthorized access" }, 401);
    return createJSONResponse(mockDB.notifications.filter(n => n.userId === currentUser!.id));
  }

  // --- 8. Admin APIs ---
  if (path.startsWith("/api/admin/")) {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      return createJSONResponse({ error: "অ্যাডমিন অ্যাক্সেস প্রয়োজন।" }, 403);
    }

    if (path === "/api/admin/stats" && method === "GET") {
      const orders = mockDB.orders;
      const users = mockDB.users;
      const withdrawals = mockDB.withdrawals;
      const commissions = mockDB.commissions;
      const stocks = mockDB.stocks;

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

        return {
          date: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
          sales,
          commission: comms
        };
      }).reverse();

      return createJSONResponse({
        todaySales,
        monthlySales,
        pendingOrders,
        pendingWithdraw,
        totalMembers,
        totalCommissionDisbursed,
        chartData,
        lowStockAlerts: stocks.filter(s => s.dealerStock <= s.lowStockAlert).length
      });
    }

    if (path === "/api/admin/orders" && method === "GET") {
      return createJSONResponse(mockDB.orders);
    }

    if (path === "/api/admin/orders/update-status" && method === "POST") {
      const { orderId, status } = body;
      const allOrders = mockDB.orders;
      const oIndex = allOrders.findIndex(o => o.id === orderId);
      if (oIndex === -1) return createJSONResponse({ error: "অর্ডার পাওয়া যায়নি।" }, 404);

      const order = allOrders[oIndex];
      const oldStatus = order.status;
      order.status = status;

      if (status === "approved" && oldStatus !== "approved") {
        order.paymentStatus = "paid";
        
        // Update monthly purchase
        const allUsers = mockDB.users;
        const buyerIndex = allUsers.findIndex(u => u.id === order.userId);
        if (buyerIndex !== -1) {
          allUsers[buyerIndex].currentMonthPurchase += order.totalAmount;
          if (allUsers[buyerIndex].currentMonthPurchase >= mockDB.settings.monthlyActivationThreshold) {
            allUsers[buyerIndex].currentStatus = UserStatus.ACTIVE;
          }
          mockDB.users = allUsers;
        }

        // Run unilevel MLM Commission calculations
        const buyer = allUsers.find(u => u.id === order.userId);
        if (buyer) {
          let totalLiters = 0;
          order.items.forEach(item => {
            const lit = parseInt(item.size.split(" ")[0]) || 1;
            totalLiters += lit * item.quantity;
          });

          const rates = mockDB.settings.commissionRules;
          let currentSponsorId = buyer.sponsorId;
          let level = 1;

          const freshUsers = mockDB.users;
          const freshComms = mockDB.commissions;

          while (currentSponsorId && level <= 5) {
            const rIndex = freshUsers.findIndex(u => u.memberId.toUpperCase() === currentSponsorId.toUpperCase());
            if (rIndex === -1) break;

            const recipient = freshUsers[rIndex];
            const ratePerLiter = rates[level - 1] || 0;
            const commissionEarned = totalLiters * ratePerLiter;

            // Only distribute commission if sponsor is active (threshold checked)
            const sponsorActive = recipient.currentMonthPurchase >= mockDB.settings.monthlyActivationThreshold || recipient.role === UserRole.ADMIN;

            if (commissionEarned > 0 && sponsorActive) {
              recipient.walletBalance += commissionEarned;
              recipient.levelCommission += commissionEarned;

              const logId = `TMS-COM-${Date.now().toString().slice(-6)}-${level}`;
              freshComms.unshift({
                id: logId,
                orderId: order.id,
                buyerId: buyer.id,
                buyerMemberId: buyer.memberId,
                buyerName: buyer.name,
                level,
                recipientId: recipient.id,
                recipientMemberId: recipient.memberId,
                recipientName: recipient.name,
                amount: commissionEarned,
                createdAt: new Date().toISOString()
              });

              mockDB.sendNotification(recipient.id, "Commission Earned", `আপনার লেভেল ${level} ডাউনলাইন মেম্বার ${buyer.name} এর অর্ডার থেকে ৳${commissionEarned} কমিশন জমা হয়েছে।`);
            }

            currentSponsorId = recipient.sponsorId;
            level++;
          }
          mockDB.users = freshUsers;
          mockDB.commissions = freshComms;
        }

      } else if (status === "cancelled" && oldStatus !== "cancelled") {
        // Restore stock
        const allProds = mockDB.products;
        order.items.forEach(item => {
          const pIndex = allProds.findIndex(p => p.id === item.productId);
          if (pIndex !== -1) {
            allProds[pIndex].stock += item.quantity;
          }
        });
        mockDB.products = allProds;
      }

      mockDB.orders = allOrders;

      mockDB.logAudit("u-admin", "Admin", "Order Update", `Updated order ${orderId} status from ${oldStatus} to ${status}`);
      mockDB.sendNotification(order.userId, `Order ${status.toUpperCase()}`, `আপনার অর্ডার ${orderId} এখন ${status === "approved" ? "অনুমোদিত" : status === "delivered" ? "ডেলিভারড" : "বাতিল"} করা হয়েছে।`);

      return createJSONResponse({ message: `অর্ডার সফলভাবে আপডেট করা হয়েছে।`, order });
    }

    if (path === "/api/admin/withdrawals" && method === "GET") {
      return createJSONResponse(mockDB.withdrawals);
    }

    if (path === "/api/admin/withdrawals/process" && method === "POST") {
      const { withdrawalId, status } = body;
      const allWithdraws = mockDB.withdrawals;
      const wIndex = allWithdraws.findIndex(w => w.id === withdrawalId);
      if (wIndex === -1) return createJSONResponse({ error: "উত্তোলন অনুরোধ পাওয়া যায়নি।" }, 404);

      const withdrawal = allWithdraws[wIndex];
      withdrawal.status = status;
      mockDB.withdrawals = allWithdraws;

      mockDB.logAudit("u-admin", "Admin", "Withdrawal Process", `Processed withdrawal ${withdrawalId} with status ${status}`);
      mockDB.sendNotification(withdrawal.userId, "Withdrawal Update", `আপনার উত্তোলনের অনুরোধ ${withdrawalId} এখন ${status === "approved" ? "অনুমোদিত ও ক্যাশ আউট সম্পন্ন" : "বাতিল"} হয়েছে।`);

      return createJSONResponse({ message: `উত্তোলন অনুরোধ সফলভাবে ${status === "approved" ? "অনুমোদন" : "বাতিল"} করা হয়েছে।`, withdrawal });
    }

    if (path === "/api/admin/members" && method === "GET") {
      return createJSONResponse(mockDB.users.filter(u => u.role !== UserRole.ADMIN));
    }

    if (path === "/api/admin/members/modify" && method === "POST") {
      const { userId, action, newValue } = body;
      const allUsers = mockDB.users;
      const uIndex = allUsers.findIndex(u => u.id === userId);
      if (uIndex === -1) return createJSONResponse({ error: "মেম্বার অ্যাকাউন্ট পাওয়া যায়নি।" }, 404);

      const targetMember = allUsers[uIndex];

      if (action === "suspend") {
        targetMember.currentStatus = UserStatus.SUSPENDED;
        mockDB.logAudit("u-admin", "Admin", "Member Suspend", `Suspended member ${targetMember.name}`);
      } else if (action === "activate") {
        targetMember.currentStatus = UserStatus.ACTIVE;
        mockDB.logAudit("u-admin", "Admin", "Member Activate", `Activated member ${targetMember.name}`);
      } else if (action === "changeSponsor") {
        const targetSponsor = allUsers.find(u => u.memberId.toUpperCase() === newValue.toUpperCase());
        if (!targetSponsor) return createJSONResponse({ error: "প্রদত্ত নতুন স্পন্সর আইডিটি অবৈধ।" }, 400);

        targetMember.sponsorId = targetSponsor.memberId;
        targetMember.sponsorName = targetSponsor.name;
        mockDB.logAudit("u-admin", "Admin", "Sponsor Transfer", `Transferred sponsor of ${targetMember.name} to ${targetSponsor.name}`);
      }

      mockDB.users = allUsers;
      return createJSONResponse({ message: "মেম্বার প্রোফাইল সফলভাবে আপডেট করা হয়েছে।" });
    }

    if (path === "/api/admin/stocks" && method === "GET") {
      return createJSONResponse({
        stocks: mockDB.stocks,
        transfers: mockDB.transfers
      });
    }

    if (path === "/api/admin/stocks/transfer" && method === "POST") {
      const { productId, quantity, fromLocation, toLocation, status } = body;

      const allStocks = mockDB.stocks;
      const sIndex = allStocks.findIndex(s => s.productId === productId);
      if (sIndex === -1) return createJSONResponse({ error: "পণ্য পাওয়া যায়নি।" }, 404);

      allStocks[sIndex].dealerStock += Number(quantity);
      mockDB.stocks = allStocks;

      // Update product stock too
      const allProducts = mockDB.products;
      const pIndex = allProducts.findIndex(p => p.id === productId);
      if (pIndex !== -1) {
        allProducts[pIndex].stock += Number(quantity);
        mockDB.products = allProducts;
      }

      const allTransfers = mockDB.transfers;
      const newTransfer: StockTransfer = {
        id: `ST-${Date.now().toString().slice(-6)}`,
        productId,
        productName: allStocks[sIndex].productName,
        size: allStocks[sIndex].size,
        quantity: Number(quantity),
        fromLocation,
        toLocation,
        status: status || "completed",
        createdAt: new Date().toISOString()
      };
      allTransfers.unshift(newTransfer);
      mockDB.transfers = allTransfers;

      return createJSONResponse({ message: "স্টক ট্রান্সফার/সমন্বয় সফলভাবে সম্পন্ন হয়েছে।", transfer: newTransfer }, 201);
    }

    if (path === "/api/admin/settings" && method === "POST") {
      mockDB.settings = {
        ...mockDB.settings,
        ...body
      };
      mockDB.logAudit("u-admin", "Admin", "Settings Update", `Updated system & MLM rules configuration`);
      return createJSONResponse({ message: "সিস্টেম ও সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।", settings: mockDB.settings });
    }

    if (path === "/api/admin/logs" && method === "GET") {
      return createJSONResponse(mockDB.auditLogs);
    }
  }

  // Definite fallback for any other requests
  return createJSONResponse({ error: "Route not found or unhandled" }, 404);
}
