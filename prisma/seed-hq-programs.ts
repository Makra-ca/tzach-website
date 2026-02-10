import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const programs = [
  // MIVTZOYIM
  { name: 'Mivtzoyin Resource Center', category: 'MIVTZOYIM', order: 1 },
  { name: 'Friday Supplies for Bochurim', category: 'MIVTZOYIM', order: 2 },
  { name: 'Project Uforatzta for Girls', category: 'MIVTZOYIM', order: 3 },
  { name: 'Shofar and Daled Minim', category: 'MIVTZOYIM', order: 4 },
  { name: 'Mezuzah Campaign', category: 'MIVTZOYIM', order: 5 },
  { name: 'Mitzvah Tanks Year Round', category: 'MIVTZOYIM', order: 6 },
  { name: 'Sukkah Mobiles', category: 'MIVTZOYIM', order: 7 },
  { name: 'Sukkahs in Manhattan', category: 'MIVTZOYIM', order: 8 },
  { name: 'Speakers for Simchas Beis Hashoavah', category: 'MIVTZOYIM', order: 9 },
  { name: 'Menorahs Around the Boroughs', category: 'MIVTZOYIM', order: 10 },
  { name: 'Purim Parties Throughout NYC', category: 'MIVTZOYIM', order: 11 },
  { name: 'Matzah Distribution', category: 'MIVTZOYIM', order: 12 },
  { name: 'Tahalucha Every Shabbos', category: 'MIVTZOYIM', order: 13 },

  // GRAND EVENTS
  { name: 'Annual Russian Shabaton', category: 'GRAND_EVENTS', order: 1 },
  { name: 'Bais Iyar Gathering for Shluchim', category: 'GRAND_EVENTS', order: 2 },
  { name: 'Gimmel Tammuz at the Ohel', category: 'GRAND_EVENTS', order: 3 },
  { name: 'Tahalucha Yomtov March', category: 'GRAND_EVENTS', order: 4 },
  { name: "Lighting of the 28' Midtown Chanukah Menorah", category: 'GRAND_EVENTS', order: 5 },

  // LEARNING PROGRAMS
  { name: 'Levi Yitzchok Lending Library', category: 'LEARNING_PROGRAMS', order: 1 },
  { name: 'Shiurei Chasidus in Yeshivos', category: 'LEARNING_PROGRAMS', order: 2 },
  { name: 'Living Chasidus for Single Women', category: 'LEARNING_PROGRAMS', order: 3 },
  { name: 'Shiurei Torah in Manhattan', category: 'LEARNING_PROGRAMS', order: 4 },
  { name: "Hilchas Bais HaB'chira in Summer Camps", category: 'LEARNING_PROGRAMS', order: 5 },
  { name: 'Crown Heights Mashpias', category: 'LEARNING_PROGRAMS', order: 6 },

  // VISITS
  { name: 'Daily Tours of Crown Heights', category: 'VISITS', order: 1 },
  { name: 'NYC and NYS Government Officials', category: 'VISITS', order: 2 },

  // PUBLICATIONS
  { name: "Weekly L'CHAIM Publication", category: 'PUBLICATIONS', order: 1 },
  { name: 'Yomtov Literature', category: 'PUBLICATIONS', order: 2 },

  // ADDITIONAL PROGRAMS
  { name: 'Chaplaincy', category: 'ADDITIONAL_PROGRAMS', order: 1 },
  { name: 'Tiferes Zekeinim for Seniors', category: 'ADDITIONAL_PROGRAMS', order: 2 },
  { name: 'Rikers Island Programs', category: 'ADDITIONAL_PROGRAMS', order: 3 },
  { name: 'Adopt a Public School Student', category: 'ADDITIONAL_PROGRAMS', order: 4 },
  { name: 'Kaddish Arrangements', category: 'ADDITIONAL_PROGRAMS', order: 5 },
]

async function main() {
  console.log('Seeding HQ programs...')

  // Delete existing programs
  await prisma.headquartersProgram.deleteMany()
  console.log('Cleared existing programs')

  // Create new programs
  for (const program of programs) {
    await prisma.headquartersProgram.create({
      data: program
    })
    console.log(`Created: ${program.name}`)
  }

  console.log(`\nDone! Created ${programs.length} programs.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
