/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, Table, Cashier } from './types';

export const INITIAL_MENU: MenuItem[] = [
  // Makanan
  {
    id: 'm1',
    name: 'Nasi Goreng Spesial',
    price: 35000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1603133872878-6966b46880a0?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'm2',
    name: 'Sate Ayam Madura (10 Tusuk)',
    price: 32000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'm3',
    name: 'Mie Goreng Seafood Jawa',
    price: 38000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'm4',
    name: 'Ayam Bakar Taliwang',
    price: 45000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3e73ae83b?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'm5',
    name: 'Soto Betawi Daging Sapi',
    price: 42000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'm6',
    name: 'Ramen Shoyu Katsu',
    price: 48000,
    category: 'Makanan',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop&q=80',
    available: true,
  },

  // Minuman
  {
    id: 'd1',
    name: 'Es Teh Manis Selasih',
    price: 8000,
    category: 'Minuman',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'd2',
    name: 'Es Kopi Susu Aren Gula Jawa',
    price: 18000,
    category: 'Minuman',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'd3',
    name: 'Avocado Juice Melimpah',
    price: 22000,
    category: 'Minuman',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'd4',
    name: 'Matcha Latte Oatmilk',
    price: 25000,
    category: 'Minuman',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'd5',
    name: 'Es Jeruk Nipis Madu',
    price: 15000,
    category: 'Minuman',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80',
    available: true,
  },

  // Cemilan
  {
    id: 's1',
    name: 'Kentang Goreng Truffle',
    price: 24000,
    category: 'Cemilan',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 's2',
    name: 'Cireng Rujak Pedas Manis',
    price: 16000,
    category: 'Cemilan',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 's3',
    name: 'Tahu Cabe Garam',
    price: 18000,
    category: 'Cemilan',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 's4',
    name: 'Croissant Butter Warm',
    price: 22000,
    category: 'Cemilan',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&auto=format&fit=crop&q=80',
    available: true,
  },

  // Dessert
  {
    id: 'de1',
    name: 'Red Velvet Cake Slice',
    price: 32000,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'de2',
    name: 'Es Pisang Ijo Makassar',
    price: 20000,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
  {
    id: 'de3',
    name: 'Waffle Belgian Ice Cream',
    price: 28000,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=300&auto=format&fit=crop&q=80',
    available: true,
  },
];

export const INITIAL_TABLES: Table[] = [
  { id: 'T1', name: 'Meja 01', status: 'Tersedia' },
  { id: 'T2', name: 'Meja 02', status: 'Terisi' },
  { id: 'T3', name: 'Meja 03', status: 'Tersedia' },
  { id: 'T4', name: 'Meja 04', status: 'Menunggu Pembayaran' },
  { id: 'T5', name: 'Meja 05', status: 'Tersedia' },
  { id: 'T6', name: 'Meja 06', status: 'Terisi' },
  { id: 'T7', name: 'Meja 07', status: 'Tersedia' },
  { id: 'T8', name: 'Meja 08', status: 'Tersedia' },
  { id: 'T9', name: 'Meja 09', status: 'Menunggu Pembayaran' },
  { id: 'T10', name: 'Meja 10', status: 'Tersedia' },
  { id: 'T11', name: 'Meja 11', status: 'Terisi' },
  { id: 'T12', name: 'Meja 12', status: 'Tersedia' },
];

export const CASHIERS: Cashier[] = [
  {
    id: 'c1',
    name: 'Siti Rahma',
    pin: '1234',
    role: 'Kasir Utama',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=facearea&facepad=2&q=80',
  },
  {
    id: 'c2',
    name: 'Andi Wijaya',
    pin: '4321',
    role: 'Supervisor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=facearea&facepad=2&q=80',
  },
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}
