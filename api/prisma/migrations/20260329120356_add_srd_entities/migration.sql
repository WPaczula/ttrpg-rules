-- CreateTable
CREATE TABLE "adversaries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "stress" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "thresholds" TEXT NOT NULL,
    "atk" TEXT NOT NULL,
    "attack" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "damage" TEXT NOT NULL,
    "description" TEXT,
    "motives_and_tactics" TEXT,
    "experience" TEXT,

    CONSTRAINT "adversaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adversary_features" (
    "id" TEXT NOT NULL,
    "adversary_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "adversary_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beastforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "examples" TEXT NOT NULL,
    "trait_bonus" TEXT NOT NULL,
    "evasion_bonus" TEXT NOT NULL,
    "attack" TEXT NOT NULL,
    "advantages" TEXT NOT NULL,

    CONSTRAINT "beastforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beastform_features" (
    "id" TEXT NOT NULL,
    "beastform_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "beastform_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roll" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "consumables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "impulses" TEXT NOT NULL,
    "potential_adversaries" TEXT,

    CONSTRAINT "environments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environment_features" (
    "id" TEXT NOT NULL,
    "environment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "question" TEXT,

    CONSTRAINT "environment_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roll" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adversaries_name_key" ON "adversaries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "beastforms_name_key" ON "beastforms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "consumables_name_key" ON "consumables"("name");

-- CreateIndex
CREATE UNIQUE INDEX "environments_name_key" ON "environments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "items_name_key" ON "items"("name");

-- AddForeignKey
ALTER TABLE "adversary_features" ADD CONSTRAINT "adversary_features_adversary_id_fkey" FOREIGN KEY ("adversary_id") REFERENCES "adversaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beastform_features" ADD CONSTRAINT "beastform_features_beastform_id_fkey" FOREIGN KEY ("beastform_id") REFERENCES "beastforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environment_features" ADD CONSTRAINT "environment_features_environment_id_fkey" FOREIGN KEY ("environment_id") REFERENCES "environments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
