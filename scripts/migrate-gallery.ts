import { put } from '@vercel/blob'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Images to migrate (in order)
const imagesToMigrate = [
  { file: 'Chanukah1.jpeg', alt: 'Chanukah celebration' },
  { file: 'IMG_5685.jpg', alt: 'Youth reading' },
  { file: 'IMG_4640.JPG', alt: 'Sukkah gathering' },
  { file: 'DSC09685.jpg', alt: 'Group photo' },
  { file: 'IMG_8357.jpeg', alt: 'Community lecture' },
]

async function migrateGalleryImages() {
  console.log('Starting gallery migration...\n')

  const imagesDir = path.join(process.cwd(), 'public', 'chabad-images')

  for (let i = 0; i < imagesToMigrate.length; i++) {
    const { file, alt } = imagesToMigrate[i]
    const filePath = path.join(imagesDir, file)

    console.log(`[${i + 1}/${imagesToMigrate.length}] Uploading ${file}...`)

    try {
      // Read the file
      const fileBuffer = fs.readFileSync(filePath)
      const blob = new Blob([fileBuffer])

      // Upload to Vercel Blob
      const result = await put(`gallery/${file}`, blob, {
        access: 'public',
      })

      console.log(`  ✓ Uploaded to: ${result.url}`)

      // Save to database
      await prisma.galleryImage.create({
        data: {
          url: result.url,
          alt,
          order: i,
        },
      })

      console.log(`  ✓ Saved to database\n`)
    } catch (error) {
      console.error(`  ✗ Failed: ${error}\n`)
    }
  }

  console.log('Migration complete!')

  const count = await prisma.galleryImage.count()
  console.log(`Total gallery images in database: ${count}`)
}

migrateGalleryImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
