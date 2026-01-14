import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getZipCoordinates(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const cleanZip = zip.replace(/[^0-9]/g, "").slice(0, 5);
    if (cleanZip.length < 5) return null;

    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.places || data.places.length === 0) return null;

    return {
      lat: parseFloat(data.places[0].latitude),
      lng: parseFloat(data.places[0].longitude)
    };
  } catch {
    return null;
  }
}

async function seedCoordinates() {
  const houses = await prisma.chabadHouse.findMany({
    where: {
      zip: { not: null },
      lat: null
    }
  });

  console.log(`Found ${houses.length} houses needing coordinates`);

  let updated = 0;
  let failed = 0;

  for (const house of houses) {
    if (!house.zip) continue;

    const coords = await getZipCoordinates(house.zip);
    if (coords) {
      await prisma.chabadHouse.update({
        where: { id: house.id },
        data: { lat: coords.lat, lng: coords.lng }
      });
      updated++;
      process.stdout.write(`\rUpdated: ${updated}, Failed: ${failed}`);
    } else {
      failed++;
      console.log(`\nFailed to get coords for ${house.name} (${house.zip})`);
    }

    // Rate limit - be nice to the free API
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n\nDone! Updated: ${updated}, Failed: ${failed}`);
  await prisma.$disconnect();
}

seedCoordinates();
