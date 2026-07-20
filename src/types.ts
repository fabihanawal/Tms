/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = "admin",
  DISTRIBUTOR = "distributor",
  CUSTOMER = "customer",
  DEALER = "dealer",
  SALES_OFFICER = "sales_officer"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNo?: string;
  bkashNo?: string;
  nagadNo?: string;
}

export interface User {
  id: string;
  memberId: string;       // TMS-10001 format
  name: string;
  mobile: string;
  role: UserRole;
  sponsorId: string;       // Referral's memberId
  sponsorName?: string;
  currentStatus: UserStatus;
  currentMonthPurchase: number; // in Taka or Liters
  walletBalance: number;
  directBonus: number;
  retailProfit: number;
  levelCommission: number;
  totalTeamSize: number;
  createdAt: string;
  bankDetails?: BankDetails;
}

export interface Product {
  id: string;
  name: string;
  size: "1 Liter" | "2 Liter" | "5 Liter" | "10 Liter";
  price: number;
  stock: number;
  image: string;
  qrCode: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
}

export type OrderStatus = "pending" | "approved" | "delivered" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  memberId: string;
  userName: string;
  userMobile: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "Cash on Delivery" | "bKash" | "Nagad" | "Bank Transfer";
  paymentStatus: "unpaid" | "paid";
  transactionId?: string;
  shippingAddress: string;
  createdAt: string;
}

export interface CommissionLog {
  id: string;
  orderId: string;
  buyerId: string;
  buyerMemberId: string;
  buyerName: string;
  level: number; // 1 to 5
  recipientId: string;
  recipientMemberId: string;
  recipientName: string;
  amount: number;
  createdAt: string;
}

export type WithdrawalMethod = "bKash" | "Nagad" | "Bank";
export type WithdrawalStatus = "pending" | "approved" | "rejected";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  memberId: string;
  userName: string;
  mobile: string;
  amount: number;
  method: WithdrawalMethod;
  details: string; // Phone number or Bank details
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
}

export interface StockLocation {
  factory: number;
  warehouse: number;
  dealer: number;
}

export interface StockItem {
  productId: string;
  productName: string;
  size: string;
  factoryStock: number;
  warehouseStock: number;
  dealerStock: number;
  lowStockAlert: number;
}

export interface StockTransfer {
  id: string;
  productId: string;
  productName: string;
  size: string;
  fromLocation: "factory" | "warehouse" | "dealer";
  toLocation: "factory" | "warehouse" | "dealer";
  quantity: number;
  status: "completed" | "damaged" | "returned";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AdminSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  commissionRules: number[]; // Index 0: L1, Index 1: L2, ... Index 4: L5
  shippingCharge: number;
  smsApiEnabled: boolean;
  whatsAppApiEnabled: boolean;
  emailEnabled: boolean;
  monthlyActivationThreshold: number; // Amount needed for active status
}

export interface NotificationMsg {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "sms" | "whatsapp" | "push" | "email";
  status: "sent" | "failed";
  createdAt: string;
}
