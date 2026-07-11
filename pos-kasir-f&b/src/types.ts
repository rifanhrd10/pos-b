/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'Makanan' | 'Minuman' | 'Cemilan' | 'Dessert';
  image: string;
  available: boolean;
}

export interface Table {
  id: string;
  name: string;
  status: 'Tersedia' | 'Terisi' | 'Menunggu Pembayaran';
  activeOrderId?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number; // 11% PPN
  serviceCharge: number; // 5% Service charge
  total: number;
  status: 'Draft' | 'Sent' | 'Paid';
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod: 'Cash' | 'QRIS';
  cashAmountEntered?: number;
  changeAmount?: number;
  cashierName: string;
  timestamp: string;
  customerName?: string;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;
  closingCash?: number;
  expectedCash?: number;
  totalTransactionsAmount: number;
  transactionsCount: number;
  isOpen: boolean;
}

export interface Cashier {
  id: string;
  name: string;
  pin: string;
  role: 'Kasir Utama' | 'Supervisor';
  avatar: string;
}
