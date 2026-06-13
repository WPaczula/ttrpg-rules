-- CreateTable
CREATE TABLE "user_adversaries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "stress" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "thresholds" TEXT NOT NULL,
    "atk" TEXT NOT NULL,
    "attack" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "damage" TEXT NOT NULL,
    "description" TEXT,
    "motives_and_tactics" TEXT,
    "experience" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "user_adversaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pc_count" INTEGER NOT NULL DEFAULT 4,
    "music_url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_adversaries" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "adversary_name" TEXT NOT NULL,
    "hp_marked" INTEGER NOT NULL DEFAULT 0,
    "stress_marked" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "encounter_adversaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_adversaries_user_id_name_key" ON "user_adversaries"("user_id", "name");

-- AddForeignKey
ALTER TABLE "user_adversaries" ADD CONSTRAINT "user_adversaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_adversaries" ADD CONSTRAINT "encounter_adversaries_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
