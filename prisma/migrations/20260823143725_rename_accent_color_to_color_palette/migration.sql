-- The old AccentColor values (PURPLE/BLUE/GREEN/ORANGE/PINK) don't map onto
-- the new themed palettes (HELLO_KITTY/SPIDER_MAN/GALAXY/OCEAN/FOREST), so
-- this replaces the enum outright rather than renaming values in place.
-- Existing preferences reset to the GRAPHITE default, which is fine — the
-- feature only shipped one commit ago.
ALTER TABLE "User" DROP COLUMN "accentColor";
DROP TYPE "AccentColor";

-- CreateEnum
CREATE TYPE "ColorPalette" AS ENUM ('GRAPHITE', 'HELLO_KITTY', 'SPIDER_MAN', 'GALAXY', 'OCEAN', 'FOREST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "colorPalette" "ColorPalette" NOT NULL DEFAULT 'GRAPHITE';
