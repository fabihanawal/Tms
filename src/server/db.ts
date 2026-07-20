/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { 
  User, UserRole, UserStatus, Product, Order, OrderItem, CommissionLog, 
  WithdrawalRequest, StockItem, StockTransfer, AuditLog, AdminSettings, 
  NotificationMsg, OrderStatus, WithdrawalMethod
} from "../types";

const DB_FILE = path.join(process.cwd(), "db_store.json");

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  commissions: CommissionLog[];
  withdrawals: WithdrawalRequest[];
  stocks: StockItem[];
  transfers: StockTransfer[];
  auditLogs: AuditLog[];
  settings: AdminSettings;
  notifications: NotificationMsg[];
}

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
  monthlyActivationThreshold: 500 // 500 Taka purchase required for active status
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
      bkashNo: "01711223344"
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
      bankName: "Islami Bank Bangladesh",
      accountName: "Rofiqul Islam",
      accountNumber: "321654987",
      branchName: "Badalgachhi Branch",
      nagadNo: "01822334455"
    }
  },
  {
    id: "u3",
    memberId: "TMS-10003",
    name: "আব্দুল কুদ্দুস",
    mobile: "01933445566",
    role: UserRole.DISTRIBUTOR,
    sponsorId: "TMS-10002",
    sponsorName: "রফিকুল ইসলাম",
    currentStatus: UserStatus.ACTIVE,
    currentMonthPurchase: 470,
    walletBalance: 1120,
    directBonus: 300,
    retailProfit: 420,
    levelCommission: 400,
    totalTeamSize: 3,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "u4",
    memberId: "TMS-10004",
    name: "মোস্তফা কামাল",
    mobile: "01544556677",
    role: UserRole.DISTRIBUTOR,
    sponsorId: "TMS-10003",
    sponsorName: "আব্দুল কুদ্দুস",
    currentStatus: UserStatus.ACTIVE,
    currentMonthPurchase: 240,
    walletBalance: 510,
    directBonus: 100,
    retailProfit: 210,
    levelCommission: 200,
    totalTeamSize: 2,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "u5",
    memberId: "TMS-10005",
    name: "সোহেল রানা",
    mobile: "01655667788",
    role: UserRole.DISTRIBUTOR,
    sponsorId: "TMS-10004",
    sponsorName: "মোস্তফা কামাল",
    currentStatus: UserStatus.ACTIVE,
    currentMonthPurchase: 0,
    walletBalance: 0,
    directBonus: 0,
    retailProfit: 0,
    levelCommission: 0,
    totalTeamSize: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "u6",
    memberId: "TMS-10006",
    name: "হাসান মাহমুদ",
    mobile: "01766778899",
    role: UserRole.DISTRIBUTOR,
    sponsorId: "TMS-10005",
    sponsorName: "সোহেল রানা",
    currentStatus: UserStatus.INACTIVE,
    currentMonthPurchase: 0,
    walletBalance: 0,
    directBonus: 0,
    retailProfit: 0,
    levelCommission: 0,
    totalTeamSize: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialStocks: StockItem[] = [
  { productId: "p1", productName: "টিএমএস সরিষার তেল - ১ লিটার", size: "1 Liter", factoryStock: 5000, warehouseStock: 2500, dealerStock: 1200, lowStockAlert: 500 },
  { productId: "p2", productName: "টিএমএস সরিষার তেল - ২ লিটার", size: "2 Liter", factoryStock: 3000, warehouseStock: 1500, dealerStock: 750, lowStockAlert: 300 },
  { productId: "p3", productName: "টিএমএস সরিষার তেল - ৫ লিটার", size: "5 Liter", factoryStock: 1500, warehouseStock: 800, dealerStock: 450, lowStockAlert: 150 },
  { productId: "p4", productName: "টিএমএস সরিষার তেল - ১০ লিটার", size: "10 Liter", factoryStock: 800, warehouseStock: 400, dealerStock: 180, lowStockAlert: 80 }
];

const initialOrders: Order[] = [
  {
    id: "o1",
    userId: "u1",
    memberId: "TMS-10001",
    userName: "করিম উদ্দিন",
    userMobile: "01711223344",
    items: [{ productId: "p1", productName: "টিএমএস সরিষার তেল - ১ লিটার", quantity: 5, price: 240, size: "1 Liter" }],
    totalAmount: 1200,
    status: "delivered",
    paymentMethod: "bKash",
    paymentStatus: "paid",
    transactionId: "BKASH123456",
    shippingAddress: "নওগাঁ সদর, নওগাঁ",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "o2",
    userId: "u2",
    memberId: "TMS-10002",
    userName: "রফিকুল ইসলাম",
    userMobile: "01822334455",
    items: [{ productId: "p2", productName: "টিএমএস সরিষার তেল - ২ লিটার", quantity: 2, price: 470, size: "2 Liter" }],
    totalAmount: 940,
    status: "delivered",
    paymentMethod: "Nagad",
    paymentStatus: "paid",
    transactionId: "NAGAD654321",
    shippingAddress: "বদলগাছী, নওগাঁ",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "o3",
    userId: "u3",
    memberId: "TMS-10003",
    userName: "আব্দুল কুদ্দুস",
    userMobile: "01933445566",
    items: [{ productId: "p1", productName: "টিএমএস সরিষার তেল - ১ লিটার", quantity: 2, price: 240, size: "1 Liter" }],
    totalAmount: 480,
    status: "pending",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "unpaid",
    shippingAddress: "মহাদেবপুর, নওগাঁ",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

class LocalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: [],
      commissions: [],
      withdrawals: [],
      stocks: [],
      transfers: [],
      auditLogs: [],
      settings: defaultSettings,
      notifications: []
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
        console.log("Database successfully loaded from JSON file.");
      } else {
        // First run: Seed default data
        this.data = {
          users: initialUsers,
          products: initialProducts,
          orders: initialOrders,
          commissions: [],
          withdrawals: [],
          stocks: initialStocks,
          transfers: [],
          auditLogs: [],
          settings: defaultSettings,
          notifications: []
        };
        // Generate initial level commissions based on the default orders so records have realistic histories
        this.seedInitialCommissions();
        this.save();
        console.log("New database file created with seed data.");
      }
    } catch (error) {
      console.error("Failed to load or initialize database:", error);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save database to JSON file:", error);
    }
  }

  private seedInitialCommissions() {
    // Generate realistic commissions for order 1 & 2
    // Order 1 is placed by u1 (Karim). He is sponsored by TMS-ADMIN. Admin gets L1 commission.
    this.data.commissions.push({
      id: "c-1",
      orderId: "o1",
      buyerId: "u1",
      buyerMemberId: "TMS-10001",
      buyerName: "করিম উদ্দিন",
      level: 1,
      recipientId: "u-admin",
      recipientMemberId: "TMS-ADMIN",
      recipientName: "টিএমএস মডারেটর এডমিন",
      amount: 5 * 8, // 5 units * L1 rate (8) = 40 TK
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Order 2 is placed by u2 (Rofiqul). He is sponsored by Karim. Karim gets L1 commission, Admin gets L2.
    this.data.commissions.push({
      id: "c-2",
      orderId: "o2",
      buyerId: "u2",
      buyerMemberId: "TMS-10002",
      buyerName: "রফিকুল ইসলাম",
      level: 1,
      recipientId: "u1",
      recipientMemberId: "TMS-10001",
      recipientName: "করিম উদ্দিন",
      amount: 2 * 8, // 2 units * L1 rate (8) = 16 TK
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    });

    this.data.commissions.push({
      id: "c-3",
      orderId: "o2",
      buyerId: "u2",
      buyerMemberId: "TMS-10002",
      buyerName: "রফিকুল ইসলাম",
      level: 2,
      recipientId: "u-admin",
      recipientMemberId: "TMS-ADMIN",
      recipientName: "টিএমএস মডারেটর এডমিন",
      amount: 2 * 5, // 2 units * L2 rate (5) = 10 TK
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // --- Auth & Users Module ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByMobile(mobile: string): User | undefined {
    // Normalise mobile matching (strip lead 88 or whitespace)
    const norm = mobile.replace(/[\s+]/g, "");
    const cleanMobile = norm.startsWith("88") ? norm.substring(2) : norm;
    return this.data.users.find(u => {
      const uNorm = u.mobile.replace(/[\s+]/g, "");
      const uClean = uNorm.startsWith("88") ? uNorm.substring(2) : uNorm;
      return uClean === cleanMobile;
    });
  }

  public getUserByMemberId(memberId: string): User | undefined {
    return this.data.users.find(u => u.memberId.toUpperCase() === memberId.toUpperCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: {
    name: string;
    mobile: string;
    sponsorId: string; // memberId
    role?: UserRole;
  }): User {
    const nextNum = 10000 + this.data.users.length + 1;
    const memberId = `TMS-${nextNum}`;
    const id = `u-${Date.now()}`;

    const sponsor = userData.sponsorId ? this.getUserByMemberId(userData.sponsorId) : undefined;

    const newUser: User = {
      id,
      memberId,
      name: userData.name,
      mobile: userData.mobile,
      role: userData.role || UserRole.DISTRIBUTOR,
      sponsorId: sponsor ? sponsor.memberId : "TMS-ADMIN",
      sponsorName: sponsor ? sponsor.name : "টিএমএস মডারেটর এডমিন",
      currentStatus: UserStatus.INACTIVE, // Default inactive until they purchase
      currentMonthPurchase: 0,
      walletBalance: 0,
      directBonus: 0,
      retailProfit: 0,
      levelCommission: 0,
      totalTeamSize: 0,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    
    // Update team sizes upstream
    this.updateSponsorTeamSize(newUser.sponsorId);
    
    this.logAudit(newUser.id, newUser.name, "User Registration", `Registered successfully with Member ID ${memberId}`);
    this.sendNotification(newUser.id, "Welcome to TMS", `টিএমএস-এ আপনাকে স্বাগতম! আপনার মেম্বার আইডি: ${memberId}। আপনার স্পন্সর: ${newUser.sponsorName}`, "sms");
    
    this.save();
    return newUser;
  }

  private updateSponsorTeamSize(sponsorId: string) {
    let currentSponsor = this.getUserByMemberId(sponsorId);
    let level = 1;
    while (currentSponsor && level <= 5) {
      currentSponsor.totalTeamSize += 1;
      currentSponsor = this.getUserByMemberId(currentSponsor.sponsorId);
      level++;
    }
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates
    };

    this.save();
    return this.data.users[userIndex];
  }

  // --- Products Module ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public updateProductStock(id: string, newStock: number) {
    const product = this.getProductById(id);
    if (product) {
      product.stock = newStock;
      // Update inventory list stock too
      const stockItem = this.data.stocks.find(s => s.productId === id);
      if (stockItem) {
        stockItem.dealerStock = newStock;
      }
      this.save();
    }
  }

  // --- Orders & MLM Unilevel Engine ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public createOrder(orderData: {
    userId: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: Order["paymentMethod"];
    transactionId?: string;
    shippingAddress: string;
  }): Order {
    const user = this.getUserById(orderData.userId);
    if (!user) throw new Error("User not found");

    const orderItems: OrderItem[] = orderData.items.map(item => {
      const prod = this.getProductById(item.productId);
      if (!prod) throw new Error(`Product ${item.productId} not found`);
      if (prod.stock < item.quantity) throw new Error(`সরিষার তেলের পর্যাপ্ত স্টক নেই (অনুরোধ: ${item.quantity} লিটার, স্টক: ${prod.stock} লিটার)`);
      
      return {
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        price: prod.price,
        size: prod.size
      };
    });

    const totalAmount = orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const orderId = `TMS-ORD-${Date.now().toString().slice(-6)}`;

    // Deduct stock instantly
    orderItems.forEach(item => {
      const prod = this.getProductById(item.productId)!;
      this.updateProductStock(prod.id, prod.stock - item.quantity);
    });

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      memberId: user.memberId,
      userName: user.name,
      userMobile: user.mobile,
      items: orderItems,
      totalAmount,
      status: "pending",
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === "Cash on Delivery" ? "unpaid" : "paid",
      transactionId: orderData.transactionId,
      shippingAddress: orderData.shippingAddress,
      createdAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);

    this.logAudit(user.id, user.name, "Order Creation", `Created order ${orderId} totaling ${totalAmount} TK`);
    this.sendNotification(user.id, "Order Confirmed", `আপনার অর্ডার ${orderId} সফলভাবে গৃহীত হয়েছে। মোট বিল: ${totalAmount} টাকা। খুব শীঘ্রই পণ্য সরবরাহ করা হবে।`, "sms");

    this.save();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order | undefined {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return undefined;

    const oldStatus = order.status;
    order.status = status;

    if (status === "approved" && oldStatus !== "approved") {
      // 1. Mark order paid
      order.paymentStatus = "paid";
      
      // 2. Update buyer's monthly purchase volume
      const buyer = this.getUserById(order.userId);
      if (buyer) {
        buyer.currentMonthPurchase += order.totalAmount;
        // Check if user is now active
        if (buyer.currentMonthPurchase >= this.data.settings.monthlyActivationThreshold) {
          buyer.currentStatus = UserStatus.ACTIVE;
        }
        this.updateUser(buyer.id, buyer);
      }

      // 3. RUN MLM UNILEVEL COMMISSION CALCULATION
      this.calculateMLMCommission(order);
    } else if (status === "cancelled" && oldStatus !== "cancelled") {
      // Restore stock
      order.items.forEach(item => {
        const prod = this.getProductById(item.productId);
        if (prod) {
          this.updateProductStock(prod.id, prod.stock + item.quantity);
        }
      });
    }

    this.logAudit("u-admin", "Admin", "Order Update", `Updated order ${orderId} status from ${oldStatus} to ${status}`);
    this.sendNotification(
      order.userId, 
      `Order ${status.toUpperCase()}`, 
      `আপনার অর্ডার ${orderId} এখন ${status === "approved" ? "অনুমোদিত" : status === "delivered" ? "ডেলিভারড" : status === "cancelled" ? "বাতিল" : "প্রক্রিয়াধীন"} হয়েছে।`, 
      "sms"
    );

    this.save();
    return order;
  }

  private calculateMLMCommission(order: Order) {
    const buyer = this.getUserById(order.userId);
    if (!buyer) return;

    // We calculate commission based on total liters of oil purchased.
    // Let's count total liters in order.
    let totalLiters = 0;
    order.items.forEach(item => {
      // Parse size (e.g. "1 Liter", "2 Liter")
      const lit = parseInt(item.size.split(" ")[0]) || 1;
      totalLiters += lit * item.quantity;
    });

    const rates = this.data.settings.commissionRules; // [L1, L2, L3, L4, L5] Taka per Liter

    let currentSponsorId = buyer.sponsorId;
    let level = 1;

    while (currentSponsorId && level <= 5) {
      const recipient = this.getUserByMemberId(currentSponsorId);
      if (!recipient) break;

      // Calculate commission for this level
      const ratePerLiter = rates[level - 1] || 0;
      const commissionEarned = totalLiters * ratePerLiter;

      if (commissionEarned > 0) {
        // Add to recipient's wallet balance and Level Commission accumulator
        recipient.walletBalance += commissionEarned;
        recipient.levelCommission += commissionEarned;
        
        // Save to logs
        const logId = `TMS-COM-${Date.now().toString().slice(-6)}-${level}`;
        const commissionLog: CommissionLog = {
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
        };

        this.data.commissions.push(commissionLog);

        this.sendNotification(
          recipient.id,
          "Commission Received",
          `অভিনন্দন! আপনার ডাউনলাইন মেম্বার ${buyer.name} (${buyer.memberId}) এর কেনাকাটা থেকে লেভেল-${level} কমিশন হিসেবে আপনি ${commissionEarned} টাকা অর্জন করেছেন।`,
          "push"
        );
      }

      currentSponsorId = recipient.sponsorId;
      level++;
    }
  }

  // --- Wallet & Withdrawals Module ---
  public getCommissions(): CommissionLog[] {
    return this.data.commissions;
  }

  public getWithdrawals(): WithdrawalRequest[] {
    return this.data.withdrawals;
  }

  public createWithdrawal(withdrawData: {
    userId: string;
    amount: number;
    method: WithdrawalMethod;
    details: string;
  }): WithdrawalRequest {
    const user = this.getUserById(withdrawData.userId);
    if (!user) throw new Error("User not found");
    if (user.walletBalance < withdrawData.amount) throw new Error("আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।");
    if (withdrawData.amount < 500) throw new Error("সর্বনিম্ন উত্তোলনের পরিমাণ ৫০০ টাকা।");

    // Deduct wallet instantly
    user.walletBalance -= withdrawData.amount;

    const request: WithdrawalRequest = {
      id: `TMS-WTH-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      memberId: user.memberId,
      userName: user.name,
      mobile: user.mobile,
      amount: withdrawData.amount,
      method: withdrawData.method,
      details: withdrawData.details,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    this.data.withdrawals.unshift(request);
    
    this.logAudit(user.id, user.name, "Withdrawal Request", `Requested ${withdrawData.amount} TK withdrawal via ${withdrawData.method}`);
    this.sendNotification(user.id, "Withdrawal Pending", `আপনার ${withdrawData.amount} টাকার উত্তোলন অনুরোধ সফলভাবে জমা হয়েছে। ৪৭ ঘণ্টার মধ্যে ভেরিফাই করে পেমেন্ট করা হবে।`, "push");

    this.save();
    return request;
  }

  public processWithdrawal(withdrawId: string, status: "approved" | "rejected"): WithdrawalRequest | undefined {
    const req = this.data.withdrawals.find(w => w.id === withdrawId);
    if (!req) return undefined;

    req.status = status;
    req.processedAt = new Date().toISOString();

    const user = this.getUserById(req.userId);

    if (status === "rejected" && user) {
      // Return funds to wallet
      user.walletBalance += req.amount;
    }

    if (user) {
      this.sendNotification(
        user.id,
        `Withdrawal ${status.toUpperCase()}`,
        status === "approved" 
          ? `অভিনন্দন! আপনার ${req.amount} টাকা উত্তোলন অনুরোধ অনুমোদিত হয়েছে। আপনার ${req.method} নম্বরে টাকা পাঠিয়ে দেওয়া হয়েছে।`
          : `দুঃখিত, আপনার ${req.amount} টাকার উত্তোলন অনুরোধ বাতিল করা হয়েছে। টাকা ওয়ালেটে ফেরত দেওয়া হয়েছে। বিশদ জানতে আমাদের হেল্পলাইনে যোগাযোগ করুন।`,
        "sms"
      );
    }

    this.logAudit("u-admin", "Admin", `Withdrawal ${status}`, `Processed withdraw ${withdrawId} - Status: ${status}`);
    this.save();
    return req;
  }

  // --- Inventory Module ---
  public getStocks(): StockItem[] {
    return this.data.stocks;
  }

  public getTransfers(): StockTransfer[] {
    return this.data.transfers;
  }

  public createStockTransfer(transferData: {
    productId: string;
    quantity: number;
    fromLocation: StockTransfer["fromLocation"];
    toLocation: StockTransfer["toLocation"];
    status: StockTransfer["status"];
  }): StockTransfer {
    const product = this.getProductById(transferData.productId);
    if (!product) throw new Error("Product not found");

    const stockItem = this.data.stocks.find(s => s.productId === transferData.productId)!;

    // Adjust stocks based on direction and status
    if (transferData.status === "completed") {
      // Deduct from source
      if (transferData.fromLocation === "factory") stockItem.factoryStock -= transferData.quantity;
      else if (transferData.fromLocation === "warehouse") stockItem.warehouseStock -= transferData.quantity;
      else stockItem.dealerStock -= transferData.quantity;

      // Add to destination
      if (transferData.toLocation === "factory") stockItem.factoryStock += transferData.quantity;
      else if (transferData.toLocation === "warehouse") stockItem.warehouseStock += transferData.quantity;
      else {
        stockItem.dealerStock += transferData.quantity;
        // Also update primary product stock which acts as available dealer stock
        product.stock = stockItem.dealerStock;
      }
    } else if (transferData.status === "damaged") {
      // Deduct from source, do not add anywhere
      if (transferData.fromLocation === "factory") stockItem.factoryStock -= transferData.quantity;
      else if (transferData.fromLocation === "warehouse") stockItem.warehouseStock -= transferData.quantity;
      else {
        stockItem.dealerStock -= transferData.quantity;
        product.stock = stockItem.dealerStock;
      }
    }

    const transfer: StockTransfer = {
      id: `TMS-ST-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productName: product.name,
      size: product.size,
      fromLocation: transferData.fromLocation,
      toLocation: transferData.toLocation,
      quantity: transferData.quantity,
      status: transferData.status,
      createdAt: new Date().toISOString()
    };

    this.data.transfers.unshift(transfer);
    this.logAudit("u-admin", "Admin", "Stock Transfer", `Transferred ${transferData.quantity} units of ${product.name} (${transferData.fromLocation} -> ${transferData.toLocation})`);
    
    this.save();
    return transfer;
  }

  // --- Admin Settings Module ---
  public getSettings(): AdminSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<AdminSettings>): AdminSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.save();
    return this.data.settings;
  }

  // --- Audit Logs & System Notifications ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public logAudit(userId: string, userName: string, action: string, details: string) {
    const log: AuditLog = {
      id: `L-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
      userId,
      userName,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    // Keep logs size reasonable
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
  }

  public getNotifications(userId?: string): NotificationMsg[] {
    if (userId) {
      return this.data.notifications.filter(n => n.userId === userId);
    }
    return this.data.notifications;
  }

  public sendNotification(
    userId: string, 
    title: string, 
    message: string, 
    type: "sms" | "whatsapp" | "push" | "email" = "push"
  ): NotificationMsg {
    const newNotif: NotificationMsg = {
      id: `N-${Date.now()}-${Math.random().toString(36).slice(-4)}`,
      userId,
      title,
      message,
      type,
      status: "sent",
      createdAt: new Date().toISOString()
    };

    this.data.notifications.unshift(newNotif);
    
    // Console log for SMS and WhatsApp simulation so it's fully traceable in logs!
    if (type === "sms" || type === "whatsapp") {
      console.log(`\n--- SIMULATING ${type.toUpperCase()} DISPATCH ---`);
      console.log(`To User ID: ${userId}`);
      console.log(`Title: ${title}`);
      console.log(`Message: ${message}`);
      console.log(`-------------------------------------\n`);
    }

    this.save();
    return newNotif;
  }
}

export const db = new LocalDatabase();
