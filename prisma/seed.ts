import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash passwords
  const hashedPassword = await bcrypt.hash('TestPassword123!', 10)

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.whatsAppSession.deleteMany()
  await prisma.message.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.creditLine.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplierListing.deleteMany()
  await prisma.user.deleteMany()

  console.log('✓ Cleared existing data')

  // Create test users
  const supplierUser = await prisma.user.create({
    data: {
      email: 'supplier@malilink.test',
      phone: '+255712345678',
      passwordHash: hashedPassword,
      name: 'Ahmed Hassan',
      businessName: 'Hassan Electronics Wholesale',
      role: 'SUPPLIER',
      kycStatus: 'VERIFIED',
      tinNumber: 'TZ123456789',
      businessLicense: 'LIC-2024-001',
      location: 'Kariakoo, Dar es Salaam',
      whatsappId: '+255712345678',
    },
  })

  const importerUser = await prisma.user.create({
    data: {
      email: 'importer@malilink.test',
      phone: '+255787654321',
      passwordHash: hashedPassword,
      name: 'Fatima Mwangi',
      businessName: 'Mwangi Trading Company',
      role: 'IMPORTER',
      kycStatus: 'VERIFIED',
      tinNumber: 'TZ987654321',
      businessLicense: 'LIC-2024-002',
      location: 'Ilala, Dar es Salaam',
      whatsappId: '+255787654321',
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@malilink.test',
      phone: '+255711111111',
      passwordHash: hashedPassword,
      name: 'Admin User',
      businessName: 'MaliLink Admin',
      role: 'ADMIN',
      kycStatus: 'VERIFIED',
      tinNumber: 'TZ111111111',
      businessLicense: 'ADMIN-001',
      location: 'Dar es Salaam',
    },
  })

  console.log('✓ Created test users')

  // Create supplier listing
  const supplierListing = await prisma.supplierListing.create({
    data: {
      supplierId: supplierUser.id,
      tier: 'PREMIUM',
      description: 'High-quality electronics and mobile phones from China',
      categories: ['electronics', 'mobile_phones', 'accessories'],
      origin: 'Guangzhou, China',
      minOrder: 500,
      leadTimeDays: 14,
      rating: 4.8,
      reviewCount: 45,
      monthlyFee: 50,
      isActive: true,
    },
  })

  console.log('✓ Created supplier listing')

  // Create products
  const product1 = await prisma.product.create({
    data: {
      supplierId: supplierUser.id,
      name: 'Samsung Galaxy A13',
      nameSwahili: 'Simu ya Samsung',
      description: 'Latest Samsung smartphone with great features',
      category: 'mobile_phones',
      unit: 'piece',
      priceUsd: 150,
      priceTzs: 375000,
      moq: 10,
      imageUrls: ['https://via.placeholder.com/300x300?text=Samsung+A13'],
      inStock: true,
    },
  })

  const product2 = await prisma.product.create({
    data: {
      supplierId: supplierUser.id,
      name: 'USB-C Fast Charger',
      nameSwahili: 'Chaji ya Haraka',
      description: '65W USB-C fast charger compatible with most devices',
      category: 'accessories',
      unit: 'carton',
      priceUsd: 8,
      priceTzs: 20000,
      moq: 50,
      imageUrls: ['https://via.placeholder.com/300x300?text=USB-C+Charger'],
      inStock: true,
    },
  })

  const product3 = await prisma.product.create({
    data: {
      supplierId: supplierUser.id,
      name: 'Screen Protector Pack',
      nameSwahili: 'Kinga ya Skrini',
      description: 'Pack of 10 tempered glass screen protectors',
      category: 'accessories',
      unit: 'pack',
      priceUsd: 2.5,
      priceTzs: 6250,
      moq: 100,
      imageUrls: ['https://via.placeholder.com/300x300?text=Screen+Protector'],
      inStock: true,
    },
  })

  console.log('✓ Created products')

  // Create an order
  const order = await prisma.order.create({
    data: {
      importerId: importerUser.id,
      supplierId: supplierUser.id,
      status: 'CONFIRMED',
      source: 'WEB',
      subtotalUsd: 1750,
      shippingUsd: 200,
      dutyUsd: 300,
      totalUsd: 2250,
      totalTzs: 5625000,
      exchangeRate: 2500,
      notes: 'Urgent delivery needed for retail stock',
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 10,
            unitPrice: 150,
            totalPrice: 1500,
          },
          {
            productId: product2.id,
            quantity: 50,
            unitPrice: 5,
            totalPrice: 250,
          },
        ],
      },
    },
  })

  console.log('✓ Created sample order')

  // Create a credit line
  const creditLine = await prisma.creditLine.create({
    data: {
      orderId: order.id,
      lenderId: supplierUser.id,
      borrowerId: importerUser.id,
      amountUsd: 2250,
      amountTzs: 5625000,
      interestRate: 2.5,
      status: 'ACTIVE',
      termDays: 30,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('✓ Created credit line')

  // Create a payment
  await prisma.payment.create({
    data: {
      userId: importerUser.id,
      orderId: order.id,
      amountUsd: 1125,
      amountTzs: 2812500,
      method: 'MPESA',
      status: 'COMPLETED',
      transactionRef: 'TXN-2024-001',
      mpesaReceiptNo: 'QEF61A8J5K',
      platformFeeUsd: 16.88,
      paidAt: new Date(),
    },
  })

  console.log('✓ Created payment')

  // Create messages
  await prisma.message.create({
    data: {
      senderId: supplierUser.id,
      receiverId: importerUser.id,
      orderId: order.id,
      content: 'Your order has been confirmed. We will ship within 2 days.',
      source: 'web',
    },
  })

  await prisma.message.create({
    data: {
      senderId: importerUser.id,
      receiverId: supplierUser.id,
      orderId: order.id,
      content: 'Great! Please expedite the shipping if possible.',
      source: 'web',
      isRead: true,
    },
  })

  console.log('✓ Created messages')

  // Create notifications
  await prisma.notification.create({
    data: {
      userId: importerUser.id,
      title: 'Order Confirmed',
      body: 'Your order #' + order.orderNumber.slice(0, 8) + ' has been confirmed',
      type: 'order_update',
    },
  })

  await prisma.notification.create({
    data: {
      userId: supplierUser.id,
      title: 'New Order Received',
      body: 'You have received a new order from Mwangi Trading Company',
      type: 'order_update',
    },
  })

  console.log('✓ Created notifications')

  console.log('\n✅ Database seed completed successfully!\n')
  console.log('📝 TEST ACCOUNTS:\n')
  console.log('SUPPLIER ACCOUNT:')
  console.log('  Email: supplier@malilink.test')
  console.log('  Password: TestPassword123!')
  console.log('  Role: Supplier\n')
  console.log('IMPORTER ACCOUNT:')
  console.log('  Email: importer@malilink.test')
  console.log('  Password: TestPassword123!')
  console.log('  Role: Importer\n')
  console.log('ADMIN ACCOUNT:')
  console.log('  Email: admin@malilink.test')
  console.log('  Password: TestPassword123!')
  console.log('  Role: Admin\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
