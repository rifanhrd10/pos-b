# Phase 3: Product & Category Management

**Goal:** CRUD produk dan kategori, varian, topping, gambar produk.  
**Estimasi:** 4-5 hari  
**Dependencies:** Phase 2  
**Priority:** P0

---

## 1. Database Schema

```prisma
model Category {
  id          String   @id @default(cuid())
  businessId  String
  name        String
  description String?
  icon        String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business    Business  @relation(fields: [businessId], references: [id], onDelete: Cascade)
  products    Product[]

  @@unique([businessId, name])
}

model Product {
  id          String   @id @default(cuid())
  businessId  String
  categoryId  String?
  sku         String?
  barcode     String?
  name        String
  description String?
  image       String?
  basePrice   Float
  costPrice   Float?
  isActive    Boolean  @default(true)
  trackStock  Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  business    Business       @relation(fields: [businessId], references: [id], onDelete: Cascade)
  category    Category?      @relation(fields: [categoryId], references: [id])
  variants    ProductVariant[]
  stocks      Stock[]
  toppings    ProductTopping[]
  transactionItems TransactionItem[]
}

model ProductVariant {
  id              String   @id @default(cuid())
  productId       String
  name            String          // "Size S", "Size M", "Reguler"
  sku             String?
  priceAdjustment Float    @default(0)
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  stocks      Stock[]
  transactionItems TransactionItem[]
}

model ProductTopping {
  id          String   @id @default(cuid())
  productId   String
  name        String          // "Extra Shot", "Boba", "Cheese"
  price       Float
  isActive    Boolean  @default(true)

  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  transactionItems TransactionItemTopping[]
}
```

---

## 2. Pages & Routes

```
src/app/(dashboard)/
  products/
    page.tsx              — Product list (grid/table view toggle)
    [id]/page.tsx         — Product detail + variants + stock info
    new/page.tsx          — Tambah produk baru
    [id]/edit/page.tsx    — Edit produk
  categories/
    page.tsx              — Category list (drag-sortable)
    new/page.tsx          — Tambah kategori
```

---

## 3. Features

- CRUD produk (nama, harga, kategori, gambar, SKU, barcode)
- Product variants (size, rasa, dll) — tiap varian bisa punya harga berbeda
- Topping/add-on per produk (cocok untuk F&B)
- Category management (reorder, icon)
- Product grid view (card layout) + table view toggle
- Search + filter by category, status, price range
- Bulk actions: activate/deactivate, delete
- Image upload (local storage dulu, S3 later)
- Import/export produk via CSV (opsional)

---

## 4. Server Actions

```typescript
// src/actions/products.ts
getProducts(filters)           — List + pagination + search + category filter
getProduct(id)                 — Detail + variants + toppings
createProduct(data)            — Create product
updateProduct(id, data)        — Update
deleteProduct(id)              — Soft delete (isActive = false)
bulkUpdateProducts(ids, data)  — Bulk status update

// src/actions/categories.ts
getCategories()                — List with product count
createCategory(data)           — Create
updateCategory(id, data)       — Update
reorderCategories(ids)         — Update sort order
deleteCategory(id)             — Delete (move products to uncategorized)

// src/actions/variants.ts
addVariant(productId, data)    — Add variant
updateVariant(id, data)        — Update
deleteVariant(id)              — Delete

// src/actions/toppings.ts
addTopping(productId, data)    — Add topping
updateTopping(id, data)        — Update
deleteTopping(id)              — Delete
```

---

## 5. Deliverables Checklist

```
- [ ] Add Category, Product, ProductVariant, ProductTopping to schema
- [ ] Create migration
- [ ] Build category list page (with sort)
- [ ] Build category create/edit form
- [ ] Build product list page (grid + table view)
- [ ] Build product create form (with variant + topping sections)
- [ ] Build product edit page
- [ ] Build product detail view
- [ ] Image upload functionality (local storage)
- [ ] Search + filter + pagination
- [ ] Bulk actions (activate/deactivate)
- [ ] Update nav sidebar
- [ ] Test full CRUD flow
- [ ] Commit
```
