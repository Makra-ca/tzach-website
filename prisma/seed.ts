import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as bcrypt from 'bcryptjs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Seed admin password
  const adminPassword = process.env.ADMIN_PASSWORD || 'lyo-admin-2024'
  const adminHash = await bcrypt.hash(adminPassword, 10)

  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: { adminHash },
    create: { id: 'main', adminHash }
  })
  console.log('Admin settings created')

  // Import Chabad Houses from Excel
  const workbook = XLSX.readFile(path.join(process.cwd(), 'public', 'Tzach Shluchimwebsite.xlsx'))
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]

  console.log(`Found ${data.length} Chabad House entries`)

  // Clear existing entries
  await prisma.chabadHouse.deleteMany()

  for (const row of data) {
    const lastName = row['Last Name'] as string
    const firstName = row['First Name'] as string
    const rebbetzinName = row['First Name.1'] as string
    const title = row['title'] as string || 'Rabbi'

    // Build the Chabad House name
    let name = ''
    if (row['Home City']) {
      name = `Chabad of ${row['Home City']}`
    } else if (lastName) {
      name = `Chabad - ${title} ${lastName}`
    } else {
      name = 'Chabad House'
    }

    // Extract website
    let website = row['Website'] as string | null
    if (website && !website.startsWith('http')) {
      website = `https://${website}`
    }

    // Parse county - it's stored as a number in the Excel
    let county: string | null = null
    const countyNum = row['County'] as number
    const countyMap: Record<number, string> = {
      1: 'Suffolk',
      2: 'Nassau',
      3: 'Queens',
      4: 'Manhattan',
      5: 'Brooklyn',
      6: 'Bronx',
      7: 'Westchester',
      8: 'Rockland',
      9: 'Staten Island',
    }
    if (countyNum && countyMap[countyNum]) {
      county = countyMap[countyNum]
    }

    try {
      await prisma.chabadHouse.create({
        data: {
          name,
          rabbiName: firstName && lastName ? `${title} ${firstName} ${lastName}` : null,
          rebbetzinName: rebbetzinName && lastName ? `${rebbetzinName} ${lastName}` : null,
          phone: (row['Husband Cell'] as string) || null,
          email: (row['h_email'] as string) || null,
          website,
          address: (row['Home Address Line 1'] as string) || null,
          city: (row['Home City'] as string) || null,
          state: (row['Home State'] as string) || null,
          zip: (row['Zip'] as string)?.toString() || null,
          county,
          country: (row['Home Country'] as string) || 'USA',
          yearEstablished: (row['year_shlichus'] as number) || null,
          type: 'community'
        }
      })
    } catch (error) {
      console.error(`Error creating entry for ${name}:`, error)
    }
  }

  console.log('Chabad Houses imported')

  // Import Colleges
  const collegesWorkbook = XLSX.readFile(path.join(process.cwd(), 'public', 'TzachNYC&LI&Westchestercolleges.xlsx'))
  const collegesSheet = collegesWorkbook.Sheets[collegesWorkbook.SheetNames[0]]
  const collegesData = XLSX.utils.sheet_to_json(collegesSheet) as Record<string, unknown>[]

  console.log(`Found ${collegesData.length} college entries`)

  await prisma.college.deleteMany()

  for (const row of collegesData) {
    const schoolName = row['School'] as string
    if (schoolName) {
      await prisma.college.create({
        data: {
          name: schoolName
        }
      })
    }
  }

  console.log('Colleges imported')

  // Seed Services based on the content provided
  await prisma.service.deleteMany()

  const services = [
    {
      name: 'Youth Groups',
      description: 'Tzivos Hashem groups for children, Hebrew Schools, and Cteens for teenagers - fostering a strong foundation in Jewish learning and practice through engaging activities.',
      icon: 'users',
      order: 1
    },
    {
      name: 'Education',
      description: 'Extensive formal and informal educational opportunities and JLI learning programs for Jews of all ages and backgrounds.',
      icon: 'book-open',
      order: 2
    },
    {
      name: 'Campus Outreach',
      description: 'Chabad Houses on over 50 college campuses around the NYC Metro area, providing a "home away from home" for Jewish students with social events, educational classes, and holiday programming.',
      icon: 'graduation-cap',
      order: 3
    },
    {
      name: 'Community Events',
      description: 'Major public events throughout the area, like the Menorah lighting every year at Columbus Circle in Manhattan, attracting tens of thousands of Jews of all backgrounds.',
      icon: 'calendar',
      order: 4
    },
    {
      name: 'Holiday Programs',
      description: 'Shabbat dinners, High Holiday services, Passover Seders, Chanukah celebrations, Purim parties, and more.',
      icon: 'star',
      order: 5
    },
    {
      name: 'Lifecycle Events',
      description: 'Support and guidance for Bar/Bat Mitzvahs, weddings, and other lifecycle celebrations.',
      icon: 'heart',
      order: 6
    },
    {
      name: 'Social Services',
      description: 'Friendship Circle provides programming for families with special needs children as well as high school volunteers. Hospital and prison chaplaincies touch the lives of all the Jews whom they visit throughout the year.',
      icon: 'users',
      order: 7
    }
  ]

  for (const service of services) {
    await prisma.service.create({ data: service })
  }

  console.log('Services seeded')

  // Seed Team Members
  await prisma.teamMember.deleteMany()

  const teamMembers = [
    { name: 'Rabbi Kasriel Kastel', role: 'Program Director', order: 1, isBoard: true },
    { name: 'Rabbi Shlomo Friedman', role: 'Administrator', order: 2, isBoard: true },
    { name: 'Rabbi Dovid Polter', role: 'Librarian', order: 3 },
    { name: 'Rabbi Mordy Hirsch', role: 'Mitzvah Tanks', order: 4 },
    { name: 'Rabbi Dovid Friedman', role: 'Assistant Administrator', order: 5 },
    { name: 'Rabbi Yossi Butman', role: 'Major Event Coordinator', order: 6 },
    { name: 'Nili Gurevitch', role: 'Executive Secretary', order: 7 },
    { name: 'Rabbi Leibel Baumgarten', role: 'Board Member', order: 8, isBoard: true },
    { name: 'Rabbi Tuvia Teldon', role: 'Board Member', order: 9, isBoard: true },
    { name: 'Rabbi Sholom Tenenbaum', role: 'Board Member', order: 10, isBoard: true }
  ]

  for (const member of teamMembers) {
    await prisma.teamMember.create({ data: member })
  }

  console.log('Team members seeded')

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
