/*
  Warnings:

  - You are about to drop the column `orderId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `city` to the `ShippingDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `ShippingDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `banner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `banner` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "OrderProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "OrderProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "image" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("createdAt", "description", "id", "image", "name", "slug", "updatedAt") SELECT "createdAt", "description", "id", "image", "name", "slug", "updatedAt" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "discount" REAL,
    "isNew" BOOLEAN NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "stock" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "properties" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("brandId", "categoryId", "createdAt", "description", "discount", "id", "image", "isNew", "isPublished", "name", "price", "properties", "rating", "slug", "stock", "updatedAt") SELECT "brandId", "categoryId", "createdAt", "description", "discount", "id", "image", "isNew", "isPublished", "name", "price", "properties", "rating", "slug", "stock", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_id_slug_key" ON "Product"("id", "slug");
CREATE TABLE "new_ShippingDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Morocco',
    "email" TEXT NOT NULL,
    "orderId" TEXT
);
INSERT INTO "new_ShippingDetail" ("address", "fullName", "id", "orderId", "telephone") SELECT "address", "fullName", "id", "orderId", "telephone" FROM "ShippingDetail";
DROP TABLE "ShippingDetail";
ALTER TABLE "new_ShippingDetail" RENAME TO "ShippingDetail";
CREATE TABLE "new_banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "banner_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_banner" ("createdAt", "description", "id", "image", "title", "updatedAt") SELECT "createdAt", "description", "id", "image", "title", "updatedAt" FROM "banner";
DROP TABLE "banner";
ALTER TABLE "new_banner" RENAME TO "banner";
CREATE UNIQUE INDEX "banner_slug_key" ON "banner"("slug");
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_user" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
