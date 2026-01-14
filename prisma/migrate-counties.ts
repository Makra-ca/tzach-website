import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// City to county mapping for Long Island
// Nassau County = western Long Island (closer to NYC)
// Suffolk County = eastern Long Island

const nassauCities = [
  'valley stream',
  'garden city',
  'great neck',
  'oceanside',
  'jericho',
  'massapequa',
  'cedarhurst',
  'long beach',
  'woodmere',
  'rockville centre',
  'east meadow',
  'glen head',
  'glen cove',
  'old westbury',
  'merrick',
  'hempstead',
  'west hempstead',
  'port washington',
  'mineola',
  'roslyn heights',
  'oyster bay',
  'hewlett',
  'new hyde park',
  'freeport',
  'levittown',
  'plainview',
  'syosset',
  'manhasset',
  'westbury',
  'carle place',
  'floral park',
  'lawrence',
  'lynbrook',
  'malverne',
  'franklin square',
  'elmont',
  'baldwin',
  'bellmore',
  'wantagh',
  'seaford',
  'bethpage',
  'farmingdale', // Note: Farmingdale spans Nassau/Suffolk border, but main area is Nassau
]

const suffolkCities = [
  'stony brook',
  'setauket',
  'east setauket',
  'east hampton',
  'water mill',
  'watermill',
  'coram',
  'huntington',
  'greenlawn',
  'mattituck',
  'southampton',
  'dix hills',
  'patchogue',
  'islip',
  'smithtown',
  'commack',
  'melville',
  'woodbury', // Woodbury is in Nassau but sometimes listed as Suffolk border area - check specific addresses
  'bay shore',
  'brentwood',
  'central islip',
  'deer park',
  'east northport',
  'hauppauge',
  'holbrook',
  'kings park',
  'lake grove',
  'lindenhurst',
  'medford',
  'miller place',
  'mount sinai',
  'nesconset',
  'north babylon',
  'northport',
  'port jefferson',
  'port jefferson station',
  'riverhead',
  'rocky point',
  'ronkonkoma',
  'selden',
  'shirley',
  'st james',
  'west babylon',
  'west islip',
  'wyandanch',
  'amityville',
  'babylon',
  'bohemia',
  'centereach',
  'cold spring harbor',
  'east islip',
  'east patchogue',
  'farmingville',
  'great river',
  'holtsville',
  'lake ronkonkoma',
  'mastic',
  'mastic beach',
  'montauk',
  'oakdale',
  'sayville',
  'shelter island',
  'shoreham',
  'sound beach',
  'wading river',
  'westhampton',
  'westhampton beach',
  'yaphank',
]

function getCityCounty(city: string): 'Nassau' | 'Suffolk' | null {
  const normalizedCity = city.toLowerCase().trim()

  if (nassauCities.includes(normalizedCity)) {
    return 'Nassau'
  }

  if (suffolkCities.includes(normalizedCity)) {
    return 'Suffolk'
  }

  return null
}

async function main() {
  console.log('Starting county migration...\n')

  // Get all entries with 'Long Island' as county
  const longIslandEntries = await prisma.chabadHouse.findMany({
    where: { county: 'Long Island' },
    select: { id: true, name: true, city: true, county: true }
  })

  console.log(`Found ${longIslandEntries.length} entries with "Long Island" county\n`)

  let nassauCount = 0
  let suffolkCount = 0
  const unmapped: { name: string; city: string | null }[] = []

  for (const entry of longIslandEntries) {
    if (!entry.city) {
      unmapped.push({ name: entry.name, city: entry.city })
      continue
    }

    const newCounty = getCityCounty(entry.city)

    if (newCounty) {
      await prisma.chabadHouse.update({
        where: { id: entry.id },
        data: { county: newCounty }
      })

      if (newCounty === 'Nassau') {
        nassauCount++
        console.log(`✓ ${entry.name} (${entry.city}) → Nassau`)
      } else {
        suffolkCount++
        console.log(`✓ ${entry.name} (${entry.city}) → Suffolk`)
      }
    } else {
      unmapped.push({ name: entry.name, city: entry.city })
    }
  }

  console.log('\n--- Summary ---')
  console.log(`Updated to Nassau: ${nassauCount}`)
  console.log(`Updated to Suffolk: ${suffolkCount}`)

  if (unmapped.length > 0) {
    console.log(`\nCould not map (${unmapped.length} entries):`)
    unmapped.forEach(e => console.log(`  - ${e.name} (city: ${e.city || 'null'})`))
  }

  console.log('\nMigration complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
