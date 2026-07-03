# PRD: Sistem POS Admin Panel - Paket Starter

---

## 1. Executive Summary

Dokumen ini mendefinisikan spesifikasi lengkap untuk pengembangan **Sistem POS (Point of Sale) Admin Panel** yang dirancang untuk mendukung operasional bisnis ritel dan makanan/minuman (F&B). Sistem ini mencakup modul Dashboard & Laporan, Transaksi & Pesanan, Manajemen Produk & Inventori, Operasional & CRM, Pembayaran, serta Pengaturan Sistem.

**Target Rilis:** Q3 2026  
**Estimasi Durasi:** 16-20 minggu  
**Team Size:** 6-8 orang (Backend, Frontend, Mobile, QA, PM)

---

## 2. Background & Objectives

### 2.1 Problem Statement
Bisnis ritel dan F&B di Indonesia masih menghadapi tantangan dalam:
- Manajemen transaksi manual yang rawan kesalahan dan fraud
- Monitoring stok inventori secara real-time
- Pelaporan penjualan yang akurat dan tepat waktu
- Pengelolaan multi-outlet yang terpusat

### 2.2 Objectives (Tujuan Produk)

| # | Tujuan | Deskripsi |
|---|--------|-----------|
| 1 | **Efisiensi Operasional** | Otomatisasi proses kasir, stok, dan laporan |
| 2 | **Akurasi Data** | Real-time inventory tracking dan transaksi |
| 3 | **Visibility** | Dashboard terpusat untuk monitoring performa bisnis |
| 4 | **Scalability** | Arsitektur yang mendukung multi-outlet dan add-on |

### 2.3 Success Metrics

| Metric | Target | Metode Pengukuran |
|--------|--------|-------------------|
| Waktu proses transaksi | < 5 detik | Benchmark internal |
| Akurasi laporan | > 99% | Audit bulanan |
| Uptime sistem | > 99.5% | Monitoring server |
| User adoption rate | > 80% dalam 3 bulan | Login tracking |

---

## 3. User Personas

### 3.1 Persona List

| Persona | Peran | Demografis | Pain Points |
|---------|-------|------------|-------------|
| **Andi** (32) | Owner/Owner Toko | Usaha Mikro-FMCG, 1-3 Outlet | Sulit monitoringmulti-cabang, butuh laporan cepat |
| **Dewi** (28) | Head of Operations | Restoran Casual Dining, 2-5 Outlet | Inefisiensi stok, promo tidak ter-tracking |
| **Budi** (25) | Kasir | Kedai Kopi, 1 Outlet | Proses refund/void rumit, struk sering error |
| **Sari** (30) | Admin Gudang | Supermarket Mini, 1 Gudang | Stock opname manual, human error tinggi |

### 3.2 User Stories Summary

```
SEBAGAI owner, SAYA INGIN bisa melihat dashboard penjualan real-time 
AGAR saya dapat mengambil keputusan bisnis dengan cepat.

SEBAGAI kasir, SAYA INGIN dapat memproses transaksi dengan berbagai metode pembayaran 
AGAR saya dapat melayani pelanggan lebih efisien.

SEBAGAI admin gudang, SAYA INGIN mengelola stok otomatis 
AGAR saya dapat menghindari stockout atau overstock.
```

---

## 4. Functional Requirements

### 4.1 FR-01: Dashboard & Laporan

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-01.1 | Dashboard Penjualan | **P0** | Ringkasan penjualan harian, grafik omzet 7/30 hari, top 10 produk terlaris |
| FR-01.2 | Laporan Penjualan | **P0** | Filter by tanggal, outlet, kasir; ringkasan dan detail |
| FR-01.3 | Laporan Stok | **P1** | Stok tersedia, movement, low stock alert |
| FR-01.4 | Laporan Kasir/Shift | **P1** | Closing shift, remitansi kasir |
| FR-01.5 | Laporan Promo | **P1** | Efektivitas diskon, ROI promo |
| FR-01.6 | Export PDF/Excel | **P0** | Download laporan dalam format PDF dan Excel |

### 4.2 FR-02: Transaksi & Pesanan

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-02.1 | POS Kasir | **P0** | Input produk, kuantitas, diskon, pajak, service charge |
| FR-02.2 | Cetak Struk | **P0** | Print via ESC/POS ke thermal printer |
| FR-02.3 | Riwayat Transaksi | **P0** | Search, filter, detail transaksi |
| FR-02.4 | Reprint Struk | **P1** | Cetak ulang struk dari riwayat |
| FR-02.5 | Refund/Void/Cancel | **P0** | Otorisasi PIN untuk refund/void |
| FR-02.6 | Open Bill | **P0** | Simpan transaksi sementara (unpaid) |
| FR-02.7 | Order Type | **P0** | Dine-In, Takeaway, Delivery, Online Order |

### 4.3 FR-03: Produk & Inventori

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-03.1 | Manajemen Produk | **P0** | CRUD produk, kategori, harga, foto, status aktif/nonaktif |
| FR-03.2 | Varian Produk | **P1** | Size, warna, rasa, SKU per varian |
| FR-03.3 | Inventori Otomatis | **P0** | Auto-decrement stok dari transaksi |

### 4.4 FR-04: Operasional & CRM

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-04.1 | Manajemen Outlet | **P0** | Data outlet, alamat, jam operasional |
| FR-04.2 | Manajemen Karyawan | **P0** | Data karyawan, PIN kasir, role |
| FR-04.3 | Database Pelanggan | **P1** | Nama, kontak, histori transaksi |
| FR-04.4 | Manajemen Promo | **P1** | Diskon produk, diskon transaksi (subtotal/minimal) |

### 4.5 FR-05: Pembayaran & Perangkat

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-05.1 | Pembayaran Tunai | **P0** | Cash payment dengan kembalian |
| FR-05.2 | Pembayaran QRIS | **P0** | Scan QRIS, generate QR static/dynamic |
| FR-05.3 | Integrasi Printer | **P0** | Thermal printer via USB/Bluetooth |

### 4.6 FR-06: Pengaturan Sistem

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-06.1 | Profil Bisnis | **P0** | Nama, logo, alamat, contact |
| FR-06.2 | Pengaturan Pajak | **P0** | Konfigurasi tax rate |
| FR-06.3 | Service Charge | **P0** | Konfigurasi service charge |
| FR-06.4 | Template Struk | **P1** | Kustomisasi header, footer, nomor struk |
| FR-06.5 | Hak Akses Admin | **P0** | Role-based access control (RBAC) |

### 4.7 Fitur Add-on (Paket Starter)

| ID | Feature | Prioritas | Deskripsi |
|----|---------|-----------|-----------|
| FR-ADD-01 | Barcode/SKU | **P2** | Generate SKU, scan barcode, label printing |
| FR-ADD-02 | Kitchen Order Ticket | **P2** | Print order ke kitchen/bar station |
| FR-ADD-03 | Manajemen Meja | **P2** | Area meja, denah, status meja |
| FR-ADD-04 | E-Wallet Payment | **P2** | GoPay, OVO, Dana, LinkAja |
| FR-ADD-05 | Debit/Kredit/EDC | **P2** | Integrasi payment gateway |
| FR-ADD-06 | Kitchen Printer | **P2** | Printer dedicated untuk kitchen |
| FR-ADD-07 | Barcode Scanner | **P2** | Hardware scanner integration |
| FR-ADD-08 | Cash Drawer | **P2** | Laci kas otomatis trigger |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Parameter | Requirement |
|-----------|-------------|
| Page Load Time | < 2 detik |
| Transaction Processing | < 3 detik |
| Report Generation | < 10 detik |
| Concurrent Users | 100+ simultaneous |

### 5.2 Security

| Requirement | Implementasi |
|-------------|--------------|
| Authentication | JWT-based dengan refresh token |
| Authorization | RBAC dengan permission granular |
| Data Encryption | TLS 1.3, AES-256 untuk data at-rest |
| Audit Trail | Logging semua aktivitas sensitif |
| Session Timeout | 30 menit idle timeout |

### 5.3 Scalability & Availability

| Requirement | Target |
|-------------|--------|
| Uptime | 99.5% SLA |
| Scalability | Horizontal scaling via container |
| Backup | Daily auto-backup, 30-day retention |
| Disaster Recovery | RTO < 4 jam, RPO < 1 jam |

### 5.4 Compatibility

| Platform | Support |
|----------|---------|
| Web Browser | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Mobile (Admin) | Android 10+, iOS 14+ |
| Thermal Printer | Epson TM-T82X, TM-T82i, Star TSP100 |

---

## 6. Tech Stack Recommendations

### 6.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Admin Web  │  │  POS Web    │  │  Mobile Admin   │ │
│  │  (React.js) │  │  (React.js) │  │  (React Native) │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API GATEWAY                           │
│              (Kong / AWS API Gateway)                    │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  MICROSERVICES LAYER                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐  │
│  │  Auth Svc │ │  POS Svc  │ │ Inventory │ │ Report  │  │
│  │  (NestJS) │ │  (NestJS) │ │  (NestJS) │ │ (NestJS)│  │
│  └───────────┘ └───────────┘ └───────────┘ └─────────┘  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐  │
│  │  Product  │ │  Outlet   │ │  Payment  │ │  Promo  │  │
│  │  (NestJS) │ │  (NestJS) │ │  (NestJS) │ │ (NestJS)│  │
│  └───────────┘ └───────────┘ └───────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│  ┌─────────────────┐      ┌─────────────────────────┐   │
│  │   PostgreSQL    │      │      Redis Cache        │   │
│  │   (Primary DB)  │      │   (Session, Cache)      │   │
│  └─────────────────┘      └─────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐│
│  │              S3 / MinIO (File Storage)              ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend Web** | Next.js 14 + TypeScript + TailwindCSS | SSR, SEO-friendly, fast performance |
| **Mobile Admin** | React Native + Expo | Cross-platform, faster development |
| **Backend** | NestJS + TypeScript | Modular, scalable, enterprise-grade |
| **Database** | PostgreSQL 15 | ACID compliance, JSON support |
| **Cache** | Redis 7 | Session, cache, real-time features |
| **File Storage** | S3/MinIO | Scalable object storage |
| **Queue** | BullMQ + Redis | Async job processing |
| **Search** | Meilisearch | Fast product search |
| **Monitoring** | Prometheus + Grafana | Observability |
| **Logging** | ELK Stack | Centralized logging |
| **CI/CD** | GitHub Actions + Docker | Automation |
| **Cloud** | AWS / DigitalOcean | Reliable infrastructure |

### 6.3 API Design (REST)

```
Base URL: /api/v1

Authentication:
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

Products:
GET    /products
POST   /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id
GET    /products/:id/stock

Transactions:
POST   /transactions
GET    /transactions
GET    /transactions/:id
POST   /transactions/:id/refund
POST   /transactions/:id/void

Reports:
GET    /reports/sales
GET    /reports/inventory
GET    /reports/cashier-shift
GET    /reports/promo

Outlets:
GET    /outlets
POST   /outlets
GET    /outlets/:id
PUT    /outlets/:id

Employees:
GET    /employees
POST   /employees
GET    /employees/:id
PUT    /employees/:id

Customers:
GET    /customers
POST   /customers
GET    /customers/:id
PUT    /customers/:id

Promos:
GET    /promos
POST   /promos
PUT    /promos/:id
DELETE /promos/:id
```

---

## 7. Timeline & Milestones

### 7.1 Development Phases

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROJECT TIMELINE                             │
│                         (20 Weeks)                                   │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┤
│ Week 1-2│ Week 3-5│ Week 6-9│Week10-13│Week14-16│Week17-18│Week19-20│
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Foundation│ Core   │ Feature │ Feature │ Feature │ Testing │ Launch │
│ & Setup   │ Module │ Dev S1  │ Dev S2  │ Dev S3  │ & QA    │ & Roll │
│          │        │         │         │         │         │ out    │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┘
```

### 7.2 Detailed Milestones

| Phase | Durasi | Deliverables | Target |
|-------|--------|--------------|--------|
| **Phase 1: Foundation** | Week 1-2 | Project setup, CI/CD, database schema, auth module | 18 Jul 2026 |
| **Phase 2: Core Module** | Week 3-5 | Outlet, Employee, Product management, basic POS | 8 Agt 2026 |
| **Phase 3: Feature Dev S1** | Week 6-9 | POS Transaction, Payment (Cash/QRIS), Print Struk, Open Bill | 5 Sep 2026 |
| **Phase 4: Feature Dev S2** | Week 10-13 | Dashboard, Reports, Inventory, Refund/Void, CRM, Promo | 26 Sep 2026 |
| **Phase 5: Feature Dev S3** | Week 14-16 | Add-on modules, integrations, polish | 17 Okt 2026 |
| **Phase 6: Testing & QA** | Week 17-18 | Integration testing, UAT, bug fixing | 31 Okt 2026 |
| **Phase 7: Launch** | Week 19-20 | Production deployment, training, documentation | 14 Nov 2026 |

### 7.3 Sprint Breakdown

| Sprint | Timeline | Focus Areas |
|--------|----------|-------------|
| Sprint 1 | Week 1-2 | Infra setup, DB migration, auth API |
| Sprint 2 | Week 3-4 | Outlet & Employee CRUD |
| Sprint 3 | Week 5-6 | Product & Category management |
| Sprint 4 | Week 7-9 | POS interface, Cash payment, Print |
| Sprint 5 | Week 10-11 | QRIS integration, Open Bill |
| Sprint 6 | Week 12-13 | Dashboard, Sales Report |
| Sprint 7 | Week 14-15 | Inventory, Refund/Void, Customer |
| Sprint 8 | Week 16-17 | Promo, System Settings, Testing |
| Sprint 9 | Week 18-20 | Polish, UAT, Launch |

---

## 8. Success Metrics & KPIs

### 8.1 Product KPIs

| KPI | Definition | Baseline | Target (3 bulan) | Target (6 bulan) |
|-----|-----------|----------|------------------|------------------|
| **DAU** | Daily Active Users (Kasir) | - | 50 users | 200 users |
| **MAU** | Monthly Active Users | - | 150 users | 500 users |
| **GMV** | Gross Merchandise Value | - | Rp 500 juta/bulan | Rp 2 Milyar/bulan |
| **Transaction/Day** | Rata-rata transaksi/hari | - | 500 | 2000 |
| **Avg Transaction Time** | Waktu rata-rata 1 transaksi | 15 detik | < 8 detik | < 5 detik |

### 8.2 Technical KPIs

| KPI | Target |
|-----|--------|
| API Response Time (p95) | < 200ms |
| Error Rate | < 0.5% |
| System Uptime | > 99.5% |
| Deployment Frequency | 2x/minggu |
| Lead Time for Changes | < 2 hari |

### 8.3 Business KPIs

| KPI | Definition | Target |
|-----|-----------|--------|
| Customer Retention | % users aktif setelah 30 hari | > 70% |
| Feature Adoption | % users menggunakan promo module | > 40% |
| NPS Score | Net Promoter Score | > 40 |
| Support Ticket Resolution | Avg resolution time | < 4 jam |

---

## 9. Risks & Mitigations

### 9.1 Risk Register

| ID | Risk | Impact | Probability | Mitigation Strategy |
|----|------|--------|-------------|---------------------|
| **R-01** | Keterlambatan integrasi payment gateway QRIS | High | Medium | Backup: offline mode dengan sync later |
| **R-02** | Scope creep dari stakeholder | High | High | Formal change request process, MVP scope lock |
| **R-03** | Performance issue dengan report besar | Medium | Medium | Pagination, async report generation, caching |
| **R-04** | Turnover developer key person | High | Medium | Knowledge sharing, documentation, pair programming |
| **R-05** | Data migration error | High | Low | Staging environment, rollback plan, data validation |
| **R-06** | Printer compatibility issue | Medium | Medium | Testing dengan multiple printer models, fallback to generic driver |
| **R-07** | Security vulnerability | Critical | Low | Security audit, penetration testing, dependency scanning |
| **R-08** | User adoption rendah | Medium | Medium | Training program, UX improvement based on feedback |

### 9.2 Dependency List

| Dependency | Owner | Risk if Delayed |
|------------|-------|-----------------|
| Payment Gateway partnership (QRIS) | Business/DevOps | Lambat integrasi payment |
| UI/UX Design mockup | Design Team | Blocking frontend development |
| Test environment setup | DevOps | Delayed testing |
| Hardware procurement (printers) | Operations | Delayed UAT |

### 9.3 Contingency Plan

| Scenario | Trigger | Action |
|----------|---------|--------|
| Payment gateway down | > 5 menit downtime | Fallback ke cash-only mode |
| Database failure | DB unresponsive > 10 menit | Failover to read replica, alert on-call |
| Critical bug in production | Severity 1 bug | Hotfix deployment dalam 4 jam |

---

## Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| POS | Point of Sale - Sistem kasir |
| QRIS | Quick Response Code Indonesian Standard |
| SKU | Stock Keeping Unit |
| GMV | Gross Merchandise Value |
| RBAC | Role-Based Access Control |
| UAT | User Acceptance Testing |

### B. Reference Documents

- Wireframes: [Link to Figma]
- API Documentation: [Link to Swagger/OpenAPI]
- Database Schema: [Link to ERD]
- Security Policy: [Link to Security Doc]

### C. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Tech Lead | | | |
| QA Lead | | | |
| Stakeholder | | | |

---

**Document Version:** 1.0  
**Last Updated:** 1 Juli 2026  
**Status:** Draft for Review