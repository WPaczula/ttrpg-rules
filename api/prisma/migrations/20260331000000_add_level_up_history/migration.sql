-- CreateEnum
CREATE TYPE "AdvancementType" AS ENUM ('INCREASE_TRAITS', 'ADD_HP', 'ADD_STRESS', 'BOOST_EXPERIENCES', 'EXTRA_DOMAIN_CARD', 'INCREASE_EVASION');

-- CreateTable
CREATE TABLE "level_up_records" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "from_level" INTEGER NOT NULL,
    "to_level" INTEGER NOT NULL,
    "from_tier" INTEGER NOT NULL,
    "to_tier" INTEGER NOT NULL,
    "new_experience_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "level_up_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_up_advancements" (
    "id" TEXT NOT NULL,
    "level_up_record_id" TEXT NOT NULL,
    "type" "AdvancementType" NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "level_up_advancements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "level_up_records" ADD CONSTRAINT "level_up_records_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_up_advancements" ADD CONSTRAINT "level_up_advancements_level_up_record_id_fkey" FOREIGN KEY ("level_up_record_id") REFERENCES "level_up_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
