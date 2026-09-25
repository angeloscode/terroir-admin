-- CreateEnum
CREATE TYPE "Terroir" AS ENUM ('MEZYB', 'ROCKY_SHORE');

-- CreateEnum
CREATE TYPE "WineColor" AS ENUM ('RED', 'WHITE', 'ROSE', 'ORANGE', 'SPARKLING');

-- CreateEnum
CREATE TYPE "WineSweetness" AS ENUM ('DRY', 'SEMI_DRY', 'SEMI_SWEET', 'SWEET');

-- CreateEnum
CREATE TYPE "ImagePosition" AS ENUM ('LEFT', 'CENTER', 'RIGHT');

-- CreateTable
CREATE TABLE "wines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "terroir" "Terroir" NOT NULL,
    "color" "WineColor" NOT NULL,
    "sweetness" "WineSweetness" NOT NULL,
    "image_position" "ImagePosition" NOT NULL DEFAULT 'CENTER',
    "image" BYTEA,
    "image_type" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wines_published_sort_order_idx" ON "wines"("published", "sort_order");


-- Стартовые данные: 4 вина, которые были зашиты в WineCollection.astro
INSERT INTO "wines" ("id", "name", "price", "terroir", "color", "sweetness", "image_position", "sort_order", "updated_at") VALUES
  ('wine_severny_sklon',   'Северный склон',  3200, 'MEZYB',       'RED',   'DRY', 'LEFT',   10, CURRENT_TIMESTAMP),
  ('wine_bely_kamen',      'Белый камень',    2800, 'MEZYB',       'WHITE', 'DRY', 'CENTER', 20, CURRENT_TIMESTAMP),
  ('wine_beregovoy_veter', 'Береговой ветер', 3900, 'ROCKY_SHORE', 'RED',   'DRY', 'RIGHT',  30, CURRENT_TIMESTAMP),
  ('wine_izvestnyak',      'Известняк',       4600, 'ROCKY_SHORE', 'WHITE', 'DRY', 'CENTER', 40, CURRENT_TIMESTAMP);
