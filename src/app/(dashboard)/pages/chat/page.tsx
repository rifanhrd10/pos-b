"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Send, PenSquare, Search } from "lucide-react";

const CONTACTS = [
  { id: 1, name: "Budi Santoso", role: "Manager", lastMessage: "Oke siap, nanti saya follow up", time: "09.42", unread: 2, active: true },
  { id: 2, name: "Siti Rahma", role: "Kasir", lastMessage: "Stok kopi sudah diisi", time: "08.15", unread: 0, active: false },
  { id: 3, name: "Andi Wijaya", role: "Developer", lastMessage: "Bug sudah diperbaiki", time: "Kemarin", unread: 0, active: false },
  { id: 4, name: "Rina Kusuma", role: "Admin", lastMessage: "Laporan sudah dikirim ke email", time: "Kemarin", unread: 5, active: false },
  { id: 5, name: "Doni Prasetyo", role: "Kasir", lastMessage: "Shift malam siap mulai", time: "Senin", unread: 0, active: false },
  { id: 6, name: "Maya Putri", role: "Marketing", lastMessage: "Promo sudah diposting", time: "Minggu", unread: 0, active: false },
];

const MESSAGES = [
  { id: 1, text: "Halo, ada update soal laporan penjualan minggu ini?", sent: false, time: "09.30" },
  { id: 2, text: "Ada, omzet naik 12% dibanding minggu lalu", sent: true, time: "09.31" },
  { id: 3, text: "Wah bagus! Produk apa yang paling laris?", sent: false, time: "09.32" },
  { id: 4, text: "Kopi Susu Gula Aren masih jadi nomor 1, diikuti Matcha Latte", sent: true, time: "09.33" },
  { id: 5, text: "Mantap. Kita perlu tambah stok bahan baku dong", sent: false, time: "09.35" },
  { id: 6, text: "Sudah saya koordinasikan dengan supplier. Pengiriman besok pagi", sent: true, time: "09.36" },
  { id: 7, text: "Perfect. Untuk shift malam bagaimana?", sent: false, time: "09.38" },
  { id: 8, text: "Semua kasir sudah konfirmasi hadir. Tidak ada yang izin", sent: true, time: "09.39" },
  { id: 9, text: "Oke siap, nanti saya follow up soal target bulan depan ya", sent: false, time: "09.42" },
  { id: 10, text: "Siap, nanti kita schedule meeting untuk planning Q3", sent: true, time: "09.43" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function ChatPage() {
  const [activeContact, setActiveContact] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const contact = CONTACTS.find((c) => c.id === activeContact)!;
  const filtered = CONTACTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat"
        description="Percakapan tim dalam satu tampilan yang mudah digunakan."
        breadcrumb="Pages / Chat"
      />

      <div className="grid xl:grid-cols-[300px_1fr] gap-5 h-[600px]">
        {/* Contact List */}
        <div className="rounded-[28px] border border-slate-200 bg-white overflow-hidden shadow-soft flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Pesan</h2>
            <button className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition">
              <PenSquare size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kontak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-bayaro-blue focus:bg-white transition"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveContact(c.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-50 hover:bg-slate-50 transition text-left",
                  activeContact === c.id && "bg-bayaro-soft",
                )}
              >
                <div className="rounded-full bg-bayaro-navy text-white w-10 h-10 text-sm font-bold flex items-center justify-center shrink-0">
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-slate-400">{c.time}</span>
                  {c.unread > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-bayaro-navy text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="rounded-[28px] border border-slate-200 bg-white overflow-hidden shadow-soft flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="rounded-full bg-bayaro-navy text-white w-10 h-10 text-sm font-bold flex items-center justify-center shrink-0">
              {initials(contact.name)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{contact.name}</p>
                <Badge tone="success">Online</Badge>
              </div>
              <p className="text-xs text-slate-500">{contact.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {MESSAGES.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sent ? "justify-end" : "justify-start")}>
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "px-4 py-2.5 max-w-xs text-sm",
                      msg.sent
                        ? "bg-bayaro-navy text-white rounded-2xl rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm",
                    )}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] text-slate-400",
                      msg.sent ? "text-right" : "text-left",
                    )}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-4 flex gap-3">
            <Input
              placeholder="Ketik pesan..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setNewMessage("")}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={() => setNewMessage("")}
              className="shrink-0 px-4"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
