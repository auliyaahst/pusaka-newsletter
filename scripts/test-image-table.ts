import { prisma } from '../src/lib/prisma'

async function testImageTable() {
  try {
    console.log('🔍 Testing Image table...')
    
    // Check if Image table exists and is accessible
    const imageCount = await prisma.image.count()
    console.log('✅ Image table accessible, current count:', imageCount)
    
    // Check if we can create a test image
    const testImage = await prisma.image.create({
      data: {
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 12345,
        data: 'dGVzdCBpbWFnZSBkYXRh', // base64 encoded "test image data"
        alt: 'Test image',
      }
    })
    console.log('✅ Test image created:', testImage.id)
    
    // Clean up test image
    await prisma.image.delete({
      where: { id: testImage.id }
    })
    console.log('✅ Test image cleaned up')
    
    console.log('🎉 All tests passed! Image table is ready.')
    
  } catch (error) {
    console.error('❌ Error testing Image table:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImageTable()
