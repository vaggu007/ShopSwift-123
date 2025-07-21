require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// Import database connection
const { connectDB } = require('../config/database');

console.log('🌱 Starting database seeder...');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🗑️ Clearing existing data...');
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});
    
    console.log('✅ Existing data cleared');
    
    // Create admin user
    console.log('👤 Creating admin user...');
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@shopswift.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      role: 'admin',
      isEmailVerified: true,
      phone: '+1234567890'
    });
    
    console.log('✅ Admin user created:', adminUser.email);
    
    // Create sample users
    console.log('👥 Creating sample users...');
    
    const users = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        isEmailVerified: true,
        phone: '+1234567891',
        addresses: [{
          type: 'home',
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          isDefault: true
        }]
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'Password123!',
        isEmailVerified: true,
        phone: '+1234567892'
      }
    ]);
    
    console.log('✅ Sample users created:', users.length);
    
    // Create categories
    console.log('📂 Creating categories...');
    
    const electronicsCategory = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      createdBy: adminUser._id,
      featured: true,
      displayOrder: 1
    });
    
    const clothingCategory = await Category.create({
      name: 'Clothing',
      description: 'Fashion and apparel',
      createdBy: adminUser._id,
      featured: true,
      displayOrder: 2
    });
    
    const homeCategory = await Category.create({
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      createdBy: adminUser._id,
      displayOrder: 3
    });
    
    // Create subcategories
    const smartphonesCategory = await Category.create({
      name: 'Smartphones',
      description: 'Mobile phones and accessories',
      parent: electronicsCategory._id,
      createdBy: adminUser._id,
      displayOrder: 1
    });
    
    const laptopsCategory = await Category.create({
      name: 'Laptops',
      description: 'Portable computers and accessories',
      parent: electronicsCategory._id,
      createdBy: adminUser._id,
      displayOrder: 2
    });
    
    const mensClothingCategory = await Category.create({
      name: 'Men\'s Clothing',
      description: 'Clothing for men',
      parent: clothingCategory._id,
      createdBy: adminUser._id,
      displayOrder: 1
    });
    
    console.log('✅ Categories created: 6');
    
    // Create products
    console.log('📦 Creating products...');
    
    const products = await Product.create([
      {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced features and stunning design.',
        shortDescription: 'Latest iPhone with pro features',
        price: 999.99,
        originalPrice: 1099.99,
        category: smartphonesCategory._id,
        brand: 'Apple',
        sku: 'IPHONE15PRO-001',
        stock: 50,
        images: [{
          public_id: 'iphone15pro_001',
          url: 'http://localhost:5050/assets/iphone15pro.jpg',
          alt: 'iPhone 15 Pro',
          isPrimary: true
        }],
        specifications: [
          { name: 'Display', value: '6.1-inch Super Retina XDR' },
          { name: 'Chip', value: 'A17 Pro' },
          { name: 'Camera', value: '48MP Main camera' },
          { name: 'Storage', value: '128GB' }
        ],
        featured: true,
        trending: true,
        newArrival: true,
        createdBy: adminUser._id
      },
      {
        name: 'MacBook Pro 14"',
        slug: 'macbook-pro-14',
        description: 'Powerful laptop for professionals with M3 chip.',
        shortDescription: 'Professional laptop with M3 chip',
        price: 1999.99,
        originalPrice: 2199.99,
        category: laptopsCategory._id,
        brand: 'Apple',
        sku: 'MBP14-M3-001',
        stock: 25,
        images: [{
          public_id: 'macbookpro14_001',
          url: 'http://localhost:5050/assets/macbookpro14.jpg',
          alt: 'MacBook Pro 14 inch',
          isPrimary: true
        }],
        specifications: [
          { name: 'Display', value: '14.2-inch Liquid Retina XDR' },
          { name: 'Chip', value: 'Apple M3' },
          { name: 'Memory', value: '8GB unified memory' },
          { name: 'Storage', value: '512GB SSD' }
        ],
        featured: true,
        bestSeller: true,
        createdBy: adminUser._id
      },
      {
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Latest Samsung flagship with AI features.',
        shortDescription: 'Samsung flagship with AI',
        price: 799.99,
        category: smartphonesCategory._id,
        brand: 'Samsung',
        sku: 'GALAXY-S24-001',
        stock: 75,
        images: [{
          public_id: 'galaxys24_001',
          url: 'http://localhost:5050/assets/galaxys24.jpg',
          alt: 'Samsung Galaxy S24',
          isPrimary: true
        }],
        specifications: [
          { name: 'Display', value: '6.2-inch Dynamic AMOLED 2X' },
          { name: 'Processor', value: 'Snapdragon 8 Gen 3' },
          { name: 'Camera', value: '50MP Triple camera' },
          { name: 'Storage', value: '256GB' }
        ],
        trending: true,
        newArrival: true,
        createdBy: adminUser._id
      },
      {
        name: 'Men\'s Classic T-Shirt',
        slug: 'mens-classic-t-shirt',
        description: 'Comfortable cotton t-shirt for everyday wear.',
        shortDescription: 'Comfortable cotton t-shirt',
        price: 24.99,
        originalPrice: 29.99,
        category: mensClothingCategory._id,
        brand: 'BasicWear',
        sku: 'TSHIRT-001',
        stock: 200,
        images: [{
          public_id: 'tshirt_001',
          url: 'http://localhost:5050/assets/tshirt.jpg',
          alt: 'Men\'s Classic T-Shirt',
          isPrimary: true
        }],
        specifications: [
          { name: 'Material', value: '100% Cotton' },
          { name: 'Fit', value: 'Regular' },
          { name: 'Care', value: 'Machine wash cold' }
        ],
        variants: [
          { name: 'Size', type: 'size', value: 'S', stock: 50 },
          { name: 'Size', type: 'size', value: 'M', stock: 75 },
          { name: 'Size', type: 'size', value: 'L', stock: 50 },
          { name: 'Size', type: 'size', value: 'XL', stock: 25 }
        ],
        bestSeller: true,
        createdBy: adminUser._id
      },
      {
        name: 'Wireless Bluetooth Headphones',
        slug: 'wireless-bluetooth-headphones',
        description: 'High-quality wireless headphones with noise cancellation.',
        shortDescription: 'Wireless headphones with noise cancellation',
        price: 149.99,
        originalPrice: 199.99,
        category: electronicsCategory._id,
        brand: 'SoundTech',
        sku: 'HEADPHONES-001',
        stock: 100,
        images: [{
          public_id: 'headphones_001',
          url: 'http://localhost:5050/assets/headphones.jpg',
          alt: 'Wireless Bluetooth Headphones',
          isPrimary: true
        }],
        specifications: [
          { name: 'Battery Life', value: '30 hours' },
          { name: 'Connectivity', value: 'Bluetooth 5.0' },
          { name: 'Noise Cancellation', value: 'Active' },
          { name: 'Weight', value: '250g' }
        ],
        featured: true,
        createdBy: adminUser._id
      }
    ]);
    
    console.log('✅ Products created:', products.length);
    
    // Add reviews to products
    console.log('⭐ Adding product reviews...');
    
    const reviewsData = [
      {
        user: users[0]._id,
        name: `${users[0].firstName} ${users[0].lastName}`,
        rating: 5,
        comment: 'Excellent product! Highly recommended.',
        isVerifiedPurchase: true
      },
      {
        user: users[1]._id,
        name: `${users[1].firstName} ${users[1].lastName}`,
        rating: 4,
        comment: 'Good quality, fast delivery.',
        isVerifiedPurchase: true
      }
    ];
    
    // Add reviews to first few products
    for (let i = 0; i < Math.min(products.length, 3); i++) {
      await products[i].addReview(reviewsData[0]);
      await products[i].addReview(reviewsData[1]);
    }
    
    console.log('✅ Reviews added to products');
    
    // Create sample orders
    console.log('📋 Creating sample orders...');
    
    const sampleOrder = await Order.create({
      customer: users[0]._id,
      customerEmail: users[0].email,
      customerPhone: users[0].phone,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          image: products[0].images[0],
          price: products[0].price,
          quantity: 1,
          sku: products[0].sku,
          total: products[0].price
        }
      ],
      subtotal: products[0].price,
      tax: Math.round(products[0].price * 0.08 * 100) / 100,
      taxRate: 0.08,
      shippingCost: 0,
      total: products[0].price + Math.round(products[0].price * 0.08 * 100) / 100,
      shippingAddress: users[0].addresses[0],
      billingAddress: users[0].addresses[0],
      payment: {
        method: 'card',
        status: 'completed',
        amount: products[0].price + Math.round(products[0].price * 0.08 * 100) / 100,
        paidAt: new Date()
      },
      shipping: {
        method: 'standard',
        cost: 0
      },
      status: 'delivered',
      confirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)   // 2 days ago
    });
    
    console.log('✅ Sample order created:', sampleOrder.orderNumber);
    
    // Update category product counts
    console.log('🔄 Updating category product counts...');
    
    const allCategories = await Category.find({});
    for (const category of allCategories) {
      await category.updateProductCount();
    }
    
    console.log('✅ Category product counts updated');
    
    // Update user's order and spending
    users[0].orders.push(sampleOrder._id);
    users[0].totalSpent = sampleOrder.total;
    await users[0].save();
    
    console.log('✅ User order history updated');
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👤 Users: ${(await User.countDocuments())} (1 admin, ${users.length} regular)`);
    console.log(`   📂 Categories: ${await Category.countDocuments()}`);
    console.log(`   📦 Products: ${await Product.countDocuments()}`);
    console.log(`   📋 Orders: ${await Order.countDocuments()}`);
    
    console.log('\n🔐 Admin Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'AdminPassword123!'}`);
    
    console.log('\n👥 Sample User Credentials:');
    console.log(`   Email: ${users[0].email}`);
    console.log(`   Password: Password123!`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Seeding interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Seeding terminated');
  process.exit(0);
});

// Run the seeder
if (require.main === module) {
  seedData();
}

module.exports = { seedData };