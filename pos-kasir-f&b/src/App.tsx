/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cashier, Shift, Table, OrderItem, Transaction } from './types';
import { INITIAL_TABLES } from './data';
import { motion, AnimatePresence } from 'motion/react';
import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import ShiftModal from './components/ShiftModal';
import TableSelection from './components/TableSelection';
import ProductCatalog from './components/ProductCatalog';
import CartPanel from './components/CartPanel';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import HistoryPanel from './components/HistoryPanel';
import { ShieldCheck, Calendar, ArrowRight, TableOfContents } from 'lucide-react';

export default function App() {
  // Authentication & Session state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<Cashier | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  // Layout View Tabs
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  // Core Data States
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [orders, setOrders] = useState<Record<string, OrderItem[]>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

  // Modals visibility toggles
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [shiftModalType, setShiftModalType] = useState<'open' | 'close'>('open');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Completed Payment Info for Receipts
  const [receiptData, setReceiptData] = useState<{
    orderId: string;
    paymentMethod: 'Cash' | 'QRIS';
    cashEntered?: number;
    changeAmount?: number;
    items: OrderItem[];
    table: Table;
    customerName?: string;
  } | null>(null);

  // 1. Initial State Loading from LocalStorage on mount
  useEffect(() => {
    const storedCashier = localStorage.getItem('resto_cashier');
    const storedShift = localStorage.getItem('resto_shift');
    const storedTables = localStorage.getItem('resto_tables');
    const storedOrders = localStorage.getItem('resto_orders');
    const storedTransactions = localStorage.getItem('resto_transactions');
    const storedCustomerNames = localStorage.getItem('resto_customer_names');

    if (storedCashier) {
      setCurrentUser(JSON.parse(storedCashier));
      setIsLoggedIn(true);
    }
    if (storedShift) {
      setCurrentShift(JSON.parse(storedShift));
    }
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    }
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    if (storedCustomerNames) {
      setCustomerNames(JSON.parse(storedCustomerNames));
    }
  }, []);

  // 2. Persistent State Syncs
  const saveTablesState = (updatedTables: Table[]) => {
    setTables(updatedTables);
    localStorage.setItem('resto_tables', JSON.stringify(updatedTables));
  };

  const saveOrdersState = (updatedOrders: Record<string, OrderItem[]>) => {
    setOrders(updatedOrders);
    localStorage.setItem('resto_orders', JSON.stringify(updatedOrders));
  };

  const saveTransactionsState = (updatedTx: Transaction[]) => {
    setTransactions(updatedTx);
    localStorage.setItem('resto_transactions', JSON.stringify(updatedTx));
  };

  const saveCustomerNamesState = (updatedNames: Record<string, string>) => {
    setCustomerNames(updatedNames);
    localStorage.setItem('resto_customer_names', JSON.stringify(updatedNames));
  };

  // 3. Authentication Handlers
  const handleLoginSuccess = (cashier: Cashier) => {
    setCurrentUser(cashier);
    setIsLoggedIn(true);
    localStorage.setItem('resto_cashier', JSON.stringify(cashier));

    // Check if there is an existing open shift for this cashier
    const storedShift = localStorage.getItem('resto_shift');
    if (storedShift) {
      const parsedShift = JSON.parse(storedShift) as Shift;
      if (parsedShift.isOpen && parsedShift.cashierId === cashier.id) {
        setCurrentShift(parsedShift);
        return;
      }
    }

    // Otherwise force trigger open shift modal
    setShiftModalType('open');
    setIsShiftModalOpen(true);
  };

  const handleLogoutClick = () => {
    // Open Close Shift modal instead of direct logout to reconcile cash
    setShiftModalType('close');
    setIsShiftModalOpen(true);
  };

  // 4. Shift Management Actions
  const handleOpenShift = (initialCash: number) => {
    if (!currentUser) return;

    const newShift: Shift = {
      id: `S-${Date.now().toString().slice(-6)}`,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      startTime: new Date().toISOString(),
      initialCash,
      totalTransactionsAmount: 0,
      transactionsCount: 0,
      isOpen: true,
    };

    setCurrentShift(newShift);
    localStorage.setItem('resto_shift', JSON.stringify(newShift));
    setIsShiftModalOpen(false);
  };

  const handleCloseShift = (closingCash: number) => {
    if (!currentShift) return;

    const endedShift: Shift = {
      ...currentShift,
      endTime: new Date().toISOString(),
      closingCash,
      expectedCash: currentShift.initialCash + currentShift.totalTransactionsAmount,
      isOpen: false,
    };

    // Reset Session state and local storages
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentShift(null);
    setActiveTable(null);
    setOrders({});
    setCustomerNames({});

    localStorage.removeItem('resto_cashier');
    localStorage.removeItem('resto_shift');
    localStorage.removeItem('resto_orders');
    localStorage.removeItem('resto_customer_names');
    // Keep tables layout reset to default
    localStorage.removeItem('resto_tables');
    setTables(INITIAL_TABLES);

    setIsShiftModalOpen(false);
  };

  const handleCancelCloseShift = () => {
    setIsShiftModalOpen(false);
  };

  // 5. Cloud Sync Simulation (Indonesian translation indicator)
  const handleCloudSync = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500); // realistic network delay
    });
  };

  // 6. POS Order Cart Management Handlers
  const handleSelectTable = (table: Table) => {
    setActiveTable(table);
  };

  const handleBackToTables = () => {
    setActiveTable(null);
  };

  const handleAddToCart = (item: any) => {
    if (!activeTable) return;

    const tableId = activeTable.id;
    const currentTableOrder = orders[tableId] || [];

    const existingIndex = currentTableOrder.findIndex((it) => it.menuItemId === item.id);
    let updatedOrder: OrderItem[] = [];

    if (existingIndex >= 0) {
      updatedOrder = [...currentTableOrder];
      updatedOrder[existingIndex] = {
        ...updatedOrder[existingIndex],
        quantity: updatedOrder[existingIndex].quantity + 1,
      };
    } else {
      updatedOrder = [
        ...currentTableOrder,
        {
          id: `OI-${Date.now().toString().slice(-5)}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    }

    // Automatically update Table status to "Terisi" if it was "Tersedia"
    if (activeTable.status === 'Tersedia') {
      const updatedTables = tables.map((t) =>
        t.id === tableId ? { ...t, status: 'Terisi' as const } : t
      );
      saveTablesState(updatedTables);
      setActiveTable({ ...activeTable, status: 'Terisi' as const });
    }

    const updatedOrders = { ...orders, [tableId]: updatedOrder };
    saveOrdersState(updatedOrders);
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    if (!activeTable) return;

    const tableId = activeTable.id;
    const currentTableOrder = orders[tableId] || [];

    const updatedOrder = currentTableOrder
      .map((item) => {
        if (item.menuItemId === menuItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is OrderItem => item !== null);

    const updatedOrders = { ...orders, [tableId]: updatedOrder };
    saveOrdersState(updatedOrders);

    // If order empty, check if we should revert table status
    if (updatedOrder.length === 0) {
      const updatedNames = { ...customerNames };
      delete updatedNames[tableId];
      saveCustomerNamesState(updatedNames);

      const updatedTables = tables.map((t) =>
        t.id === tableId ? { ...t, status: 'Tersedia' as const } : t
      );
      saveTablesState(updatedTables);
      setActiveTable({ ...activeTable, status: 'Tersedia' as const });
    }
  };

  const handleRemoveItem = (menuItemId: string) => {
    if (!activeTable) return;

    const tableId = activeTable.id;
    const currentTableOrder = orders[tableId] || [];

    const updatedOrder = currentTableOrder.filter((it) => it.menuItemId !== menuItemId);

    const updatedOrders = { ...orders, [tableId]: updatedOrder };
    saveOrdersState(updatedOrders);

    if (updatedOrder.length === 0) {
      const updatedNames = { ...customerNames };
      delete updatedNames[tableId];
      saveCustomerNamesState(updatedNames);

      const updatedTables = tables.map((t) =>
        t.id === tableId ? { ...t, status: 'Tersedia' as const } : t
      );
      saveTablesState(updatedTables);
      setActiveTable({ ...activeTable, status: 'Tersedia' as const });
    }
  };

  const handleUpdateNotes = (menuItemId: string, notes: string) => {
    if (!activeTable) return;

    const tableId = activeTable.id;
    const currentTableOrder = orders[tableId] || [];

    const updatedOrder = currentTableOrder.map((item) => {
      if (item.menuItemId === menuItemId) {
        return { ...item, notes };
      }
      return item;
    });

    const updatedOrders = { ...orders, [tableId]: updatedOrder };
    saveOrdersState(updatedOrders);
  };

  const handleClearCart = () => {
    if (!activeTable) return;

    const tableId = activeTable.id;
    const updatedOrders = { ...orders, [tableId]: [] };
    saveOrdersState(updatedOrders);

    // Clear customer name
    const updatedNames = { ...customerNames };
    delete updatedNames[tableId];
    saveCustomerNamesState(updatedNames);

    const updatedTables = tables.map((t) =>
      t.id === tableId ? { ...t, status: 'Tersedia' as const } : t
    );
    saveTablesState(updatedTables);
    setActiveTable({ ...activeTable, status: 'Tersedia' as const });
  };

  const handleSaveAsDraft = () => {
    if (!activeTable) return;

    // Trigger visual notification of saving, mark as "Terisi", return to layout
    const updatedTables = tables.map((t) =>
      t.id === activeTable.id ? { ...t, status: 'Terisi' as const } : t
    );
    saveTablesState(updatedTables);
    setActiveTable(null); // Return back to main layout grid
  };

  // 7. Checkout & Pay Process
  const handleLaunchCheckout = () => {
    if (!activeTable) return;

    // Temporarily mark table as "Menunggu Pembayaran" to lock details
    const updatedTables = tables.map((t) =>
      t.id === activeTable.id ? { ...t, status: 'Menunggu Pembayaran' as const } : t
    );
    saveTablesState(updatedTables);
    setActiveTable({ ...activeTable, status: 'Menunggu Pembayaran' as const });

    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (
    method: 'Cash' | 'QRIS',
    enteredAmount?: number,
    changeAmount?: number
  ) => {
    if (!activeTable || !currentUser) return;

    const tableId = activeTable.id;
    const cartItems = orders[tableId] || [];
    const customerName = customerNames[tableId];

    // Calculate final receipt numbers
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.11);
    const serviceCharge = Math.round(subtotal * 0.05);
    const total = subtotal + tax + serviceCharge;

    const orderId = `TX-${Date.now().toString().slice(-6)}`;

    // Create a new Transaction object
    const newTransaction: Transaction = {
      id: orderId,
      orderId,
      tableId,
      tableName: activeTable.id === 'TAKEAWAY' ? 'Takeaway (Tanpa Meja)' : activeTable.name,
      items: cartItems,
      subtotal,
      tax,
      serviceCharge,
      total,
      paymentMethod: method,
      cashAmountEntered: enteredAmount,
      changeAmount,
      cashierName: currentUser.name,
      timestamp: new Date().toISOString(),
      customerName,
    };

    // Append to transactions database
    const updatedTransactions = [newTransaction, ...transactions];
    saveTransactionsState(updatedTransactions);

    // Update active Shift totals
    if (currentShift) {
      const updatedShift: Shift = {
        ...currentShift,
        transactionsCount: currentShift.transactionsCount + 1,
        totalTransactionsAmount: currentShift.totalTransactionsAmount + total,
      };
      setCurrentShift(updatedShift);
      localStorage.setItem('resto_shift', JSON.stringify(updatedShift));
    }

    // Save receipt payload
    setReceiptData({
      orderId,
      paymentMethod: method,
      cashEntered: enteredAmount,
      changeAmount,
      items: cartItems,
      table: activeTable,
      customerName,
    });

    // Reset Table back to "Tersedia" and remove its active cart
    const updatedTables = tables.map((t) =>
      t.id === tableId ? { ...t, status: 'Tersedia' as const } : t
    );
    saveTablesState(updatedTables);

    const updatedOrders = { ...orders };
    delete updatedOrders[tableId];
    saveOrdersState(updatedOrders);

    // Delete customer name
    const updatedNames = { ...customerNames };
    delete updatedNames[tableId];
    saveCustomerNamesState(updatedNames);

    // Swap Modals
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleNewOrderReset = () => {
    setIsReceiptModalOpen(false);
    setReceiptData(null);
    setActiveTable(null); // return to Table denah view
  };

  // 8. Retrieve table stats
  const ordersCountByTable: Record<string, number> = {};
  Object.keys(orders).forEach((tableId) => {
    const items = orders[tableId] || [];
    ordersCountByTable[tableId] = items.reduce((acc, it) => acc + it.quantity, 0);
  });

  // Screen routing rendering based on authentication and active states
  if (!isLoggedIn || !currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Navigation Header */}
      <Navbar
        cashier={currentUser}
        currentShift={currentShift}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveTable(null); // reset selected table on screen navigation
        }}
        onLogoutClick={handleLogoutClick}
        onSync={handleCloudSync}
      />

      {/* Main Container Dashboard */}
      <main className="flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {!currentShift ? (
          // System Lock: Shift hasn't opened yet
          <div className="h-full flex items-center justify-center p-6 bg-slate-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center max-w-md w-full space-y-5"
            >
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-slate-800">Sesi Kasir Terkunci</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Silakan buka sesi kasir shift baru terlebih dahulu untuk memasukkan modal saldo awal kasir dan mulai melayani pesanan meja pelanggan.
                </p>
              </div>
              <button
                onClick={() => {
                  setShiftModalType('open');
                  setIsShiftModalOpen(true);
                }}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                id="lock-screen-open-shift-btn"
                type="button"
              >
                Buka Shift Sekarang <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        ) : activeTab === 'pos' ? (
          // VIEW 1: Core POS (Main Dashboard - Split Screen 65% / 35%)
          <div className="h-full grid grid-cols-12 overflow-hidden">
            {/* Left 65% Main Area (Tables Grid OR Product Menu Cards) */}
            <div className="col-span-8 p-5 overflow-hidden flex flex-col h-full border-r border-slate-200">
              {activeTable ? (
                // Selected Table View -> Show product catalog to add menu items
                <ProductCatalog
                  activeTable={activeTable}
                  onAddToCart={handleAddToCart}
                  onBackToTables={handleBackToTables}
                />
              ) : (
                // Idle POS View -> Show table denah map
                <TableSelection
                  tables={tables}
                  activeTableId={activeTable ? activeTable.id : null}
                  onSelectTable={handleSelectTable}
                  ordersCountByTable={ordersCountByTable}
                />
              )}
            </div>

            {/* Right 35% Fixed Sidebar Panel (Cart list and summary) */}
            <div className="col-span-4 h-full overflow-hidden">
              <CartPanel
                activeTable={activeTable}
                cartItems={activeTable ? (orders[activeTable.id] || []) : []}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateNotes={handleUpdateNotes}
                onSaveAsDraft={handleSaveAsDraft}
                onCheckout={handleLaunchCheckout}
                onClearCart={handleClearCart}
                customerName={activeTable ? (customerNames[activeTable.id] || '') : ''}
                onUpdateCustomerName={(name) => {
                  if (activeTable) {
                    const updatedNames = { ...customerNames, [activeTable.id]: name };
                    saveCustomerNamesState(updatedNames);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          // VIEW 2: History Menu (Today's Transactions table log with analytics)
          <div className="h-full p-5 overflow-hidden">
            <HistoryPanel transactions={transactions} />
          </div>
        )}
      </main>

      {/* MODAL 1: Shift Modal (Open/Close shift) */}
      {isShiftModalOpen && (
        <ShiftModal
          isOpen={isShiftModalOpen}
          type={shiftModalType}
          cashier={currentUser}
          currentShift={currentShift}
          onOpenShift={handleOpenShift}
          onCloseShift={handleCloseShift}
          onCancelClose={handleCancelCloseShift}
        />
      )}

      {/* MODAL 2: Interactive Cash & QRIS payment modal */}
      {isPaymentModalOpen && activeTable && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          activeTable={activeTable}
          cartItems={orders[activeTable.id] || []}
          onCancel={() => {
            setIsPaymentModalOpen(false);
            // Revert table status to "Terisi" upon payment cancel
            const updatedTables = tables.map((t) =>
              t.id === activeTable.id ? { ...t, status: 'Terisi' as const } : t
            );
            saveTablesState(updatedTables);
            setActiveTable({ ...activeTable, status: 'Terisi' as const });
          }}
          onPaymentSuccess={handlePaymentSuccess}
          customerName={customerNames[activeTable.id]}
        />
      )}

      {/* MODAL 3: Success payment Receipt Modal */}
      {isReceiptModalOpen && receiptData && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          activeTable={receiptData.table}
          cartItems={receiptData.items}
          orderId={receiptData.orderId}
          paymentMethod={receiptData.paymentMethod}
          cashEntered={receiptData.cashEntered}
          changeAmount={receiptData.changeAmount}
          cashierName={currentUser.name}
          onNewOrder={handleNewOrderReset}
          customerName={receiptData.customerName}
        />
      )}
    </div>
  );
}
