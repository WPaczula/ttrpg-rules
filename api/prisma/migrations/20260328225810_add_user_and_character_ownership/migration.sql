-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GM', 'PC', 'DEMO');

-- CreateTable
CREATE TABLE "weapons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "damage_type" TEXT NOT NULL,
    "trait" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "damage" TEXT NOT NULL,
    "burden" TEXT NOT NULL,
    "feature" TEXT,

    CONSTRAINT "weapons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "base_score" INTEGER NOT NULL,
    "base_thresholds" TEXT NOT NULL,
    "evasion_modifier" INTEGER,
    "feature" TEXT,

    CONSTRAINT "armor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evasion" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "items" TEXT NOT NULL,
    "suggested_traits" INTEGER[],
    "hope_feature_name" TEXT NOT NULL,
    "hope_feature_text" TEXT NOT NULL,
    "suggested_primary_id" TEXT,
    "suggested_secondary_id" TEXT,
    "suggested_armor_id" TEXT,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_features" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "class_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subclasses" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "spellcast_trait" TEXT NOT NULL,

    CONSTRAINT "subclasses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subclass_features" (
    "id" TEXT NOT NULL,
    "subclass_id" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "subclass_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ancestries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ancestries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ancestry_features" (
    "id" TEXT NOT NULL,
    "ancestry_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ancestry_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_features" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "community_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_domains" (
    "class_id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,

    CONSTRAINT "class_domains_pkey" PRIMARY KEY ("class_id","domain_id")
);

-- CreateTable
CREATE TABLE "domain_cards" (
    "id" TEXT NOT NULL,
    "domain_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "recall_cost" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "domain_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PC',
    "token_limit" INTEGER,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "class_id" TEXT NOT NULL,
    "subclass_id" TEXT NOT NULL,
    "ancestry_id" TEXT NOT NULL,
    "secondary_ancestry_id" TEXT,
    "ancestry_feature_id" TEXT NOT NULL,
    "secondary_ancestry_feature_id" TEXT,
    "community_id" TEXT NOT NULL,
    "agility" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 0,
    "finesse" INTEGER NOT NULL DEFAULT 0,
    "instinct" INTEGER NOT NULL DEFAULT 0,
    "presence" INTEGER NOT NULL DEFAULT 0,
    "knowledge" INTEGER NOT NULL DEFAULT 0,
    "hp_total" INTEGER NOT NULL DEFAULT 6,
    "hp_marked" INTEGER NOT NULL DEFAULT 0,
    "stress_total" INTEGER NOT NULL DEFAULT 6,
    "stress_marked" INTEGER NOT NULL DEFAULT 0,
    "armor_id" TEXT,
    "armor_marked" INTEGER NOT NULL DEFAULT 0,
    "evasion" INTEGER NOT NULL DEFAULT 10,
    "proficiency" INTEGER NOT NULL DEFAULT 1,
    "hope" INTEGER NOT NULL DEFAULT 2,
    "gold_handfuls" INTEGER NOT NULL DEFAULT 0,
    "gold_bags" INTEGER NOT NULL DEFAULT 0,
    "gold_chests" INTEGER NOT NULL DEFAULT 0,
    "primary_weapon_id" TEXT,
    "secondary_weapon_id" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_experiences" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,

    CONSTRAINT "character_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_domain_cards" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "domain_card_id" TEXT NOT NULL,

    CONSTRAINT "character_domain_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_threshold_bonuses" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "major_bonus" INTEGER NOT NULL,
    "severe_bonus" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "character_threshold_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_marked_traits" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "trait" TEXT NOT NULL,

    CONSTRAINT "character_marked_traits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subclasses_name_key" ON "subclasses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ancestries_name_key" ON "ancestries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "communities_name_key" ON "communities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "domains_name_key" ON "domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_domain_cards_character_id_domain_card_id_key" ON "character_domain_cards"("character_id", "domain_card_id");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_suggested_primary_id_fkey" FOREIGN KEY ("suggested_primary_id") REFERENCES "weapons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_suggested_secondary_id_fkey" FOREIGN KEY ("suggested_secondary_id") REFERENCES "weapons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_suggested_armor_id_fkey" FOREIGN KEY ("suggested_armor_id") REFERENCES "armor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_features" ADD CONSTRAINT "class_features_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subclasses" ADD CONSTRAINT "subclasses_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subclass_features" ADD CONSTRAINT "subclass_features_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "subclasses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ancestry_features" ADD CONSTRAINT "ancestry_features_ancestry_id_fkey" FOREIGN KEY ("ancestry_id") REFERENCES "ancestries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_features" ADD CONSTRAINT "community_features_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_domains" ADD CONSTRAINT "class_domains_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_domains" ADD CONSTRAINT "class_domains_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_cards" ADD CONSTRAINT "domain_cards_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "subclasses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_ancestry_id_fkey" FOREIGN KEY ("ancestry_id") REFERENCES "ancestries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_secondary_ancestry_id_fkey" FOREIGN KEY ("secondary_ancestry_id") REFERENCES "ancestries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_ancestry_feature_id_fkey" FOREIGN KEY ("ancestry_feature_id") REFERENCES "ancestry_features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_secondary_ancestry_feature_id_fkey" FOREIGN KEY ("secondary_ancestry_feature_id") REFERENCES "ancestry_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_armor_id_fkey" FOREIGN KEY ("armor_id") REFERENCES "armor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_primary_weapon_id_fkey" FOREIGN KEY ("primary_weapon_id") REFERENCES "weapons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_secondary_weapon_id_fkey" FOREIGN KEY ("secondary_weapon_id") REFERENCES "weapons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_experiences" ADD CONSTRAINT "character_experiences_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_domain_cards" ADD CONSTRAINT "character_domain_cards_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_domain_cards" ADD CONSTRAINT "character_domain_cards_domain_card_id_fkey" FOREIGN KEY ("domain_card_id") REFERENCES "domain_cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_threshold_bonuses" ADD CONSTRAINT "character_threshold_bonuses_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_marked_traits" ADD CONSTRAINT "character_marked_traits_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
