import { PrismaClient, UserRoleType, GenderTarget, FragranceConcentration, InventoryAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Tabassum Attar Database...');

  // 1. Create Super Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@Tabassum2026', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@tabassumattar.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@tabassumattar.com',
      passwordHash: adminPasswordHash,
      roleType: UserRoleType.SUPER_ADMIN,
      phoneNumber: '+919876543210',
    },
  });
  console.log('Super Admin Created:', superAdmin.email);

  // 2. Create Fragrance Categories
  const categoriesData = [
    { name: 'Pure Dehn Al Oudh', slug: 'pure-dehn-al-oudh', description: 'Rare, aged, pure artisanal Oudh distillations from Assam, Cambodia, and Hindi origins.' },
    { name: 'Royal Mukhallat', slug: 'royal-mukhallat', description: 'Masterfully blended compositions of Rose, Saffron, Amber, and Musk.' },
    { name: 'Pure Floral Attars', slug: 'pure-floral-attars', description: 'Hydro-distilled Indian florals including Ruh Gulab, Motia Jasmine, and Shamama.' },
    { name: 'Musk & Amber', slug: 'musk-and-amber', description: 'Deep, warm, grounding white musk, black musk, and fossil amber elixirs.' },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }
  console.log(`Created ${createdCategories.length} Categories.`);

  // 3. Create Sample Luxury Attar Products
  const sampleProducts = [
    {
      name: 'Dehn Al Oudh Cambodi Qadeem',
      slug: 'dehn-al-oudh-cambodi-qadeem',
      sku: 'TAB-OUD-001',
      categoryId: createdCategories[0].id,
      gender: GenderTarget.UNISEX,
      concentration: FragranceConcentration.DEHN_AL_OUD,
      fragranceFamily: 'Woody Oriental / Balsamic',
      shortDescription: 'Vintage 15-year aged wild Cambodian Oud with sweet fruity undertones and deep balsamic woods.',
      description: 'Handcrafted from ethically harvested Cambodian Agarwood. Distilled in traditional copper stills and aged over 15 years in leather flacons.',
      ingredients: '100% Pure Aquilaria Crassna (Cambodian Oud) Oil. Free from alcohol and synthetic carriers.',
      usageInstructions: 'Apply one micro-swipe using the glass dipstick to pulse points (inner wrists, behind earlobes).',
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { sku: 'TAB-OUD-001-3ML', sizeInMl: 3.0, labelSize: '1/4 Tola (3ml)', price: 4500.0, discountPrice: 3999.0, stock: 30 },
        { sku: 'TAB-OUD-001-6ML', sizeInMl: 6.0, labelSize: '1/2 Tola (6ml)', price: 8500.0, discountPrice: 7499.0, stock: 20 },
        { sku: 'TAB-OUD-001-12ML', sizeInMl: 12.0, labelSize: '1 Tola (12ml)', price: 16000.0, discountPrice: 14500.0, stock: 10 },
      ],
      notes: [
        { type: 'TOP', noteName: 'Wild Berry, Caramelized Fig' },
        { type: 'HEART', noteName: 'Smoky Balsam, Aged Leather' },
        { type: 'BASE', noteName: 'Deep Cambodian Agarwood Resin' },
      ],
    },
    {
      name: 'Mukhallat Al Tabassum Royal',
      slug: 'mukhallat-al-tabassum-royal',
      sku: 'TAB-MUK-001',
      categoryId: createdCategories[1].id,
      gender: GenderTarget.UNISEX,
      concentration: FragranceConcentration.MUKHALLAT,
      fragranceFamily: 'Floral Amber Woody',
      shortDescription: 'Signature royal blend of Kashmiri Saffron, Taif Rose, and sweet Golden Amber.',
      description: 'Our crowned masterpiece blend. An opulent balance of precious Kashmiri Saffron filaments steeped in organic Taif Rose hydrosol and finished over creamy sandalwood.',
      ingredients: 'Pure Damascena Rose Otto, Crocus Sativus Extract, Santalum Album Oil, White Amber Resin.',
      usageInstructions: 'Swipe gently on the collar, cuffs, and beard or pulse points.',
      isFeatured: true,
      isBestSeller: true,
      variants: [
        { sku: 'TAB-MUK-001-3ML', sizeInMl: 3.0, labelSize: '1/4 Tola (3ml)', price: 1800.0, discountPrice: 1499.0, stock: 50 },
        { sku: 'TAB-MUK-001-6ML', sizeInMl: 6.0, labelSize: '1/2 Tola (6ml)', price: 3400.0, discountPrice: 2899.0, stock: 40 },
        { sku: 'TAB-MUK-001-12ML', sizeInMl: 12.0, labelSize: '1 Tola (12ml)', price: 6200.0, discountPrice: 5499.0, stock: 25 },
      ],
      notes: [
        { type: 'TOP', noteName: 'Kashmiri Saffron, Bergamot' },
        { type: 'HEART', noteName: 'Taif Rose, Jasmine Sambac' },
        { type: 'BASE', noteName: 'Mysore Sandalwood, Golden Amber, Velvet Musk' },
      ],
    },
  ];

  for (const prod of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      const product = await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          sku: prod.sku,
          categoryId: prod.categoryId,
          gender: prod.gender,
          concentration: prod.concentration,
          fragranceFamily: prod.fragranceFamily,
          shortDescription: prod.shortDescription,
          description: prod.description,
          ingredients: prod.ingredients,
          usageInstructions: prod.usageInstructions,
          isFeatured: prod.isFeatured,
          isBestSeller: prod.isBestSeller,
          notes: {
            create: prod.notes.map((n, idx) => ({
              type: n.type,
              noteName: n.noteName,
              orderIndex: idx,
            })),
          },
          variants: {
            create: prod.variants.map((v) => ({
              sku: v.sku,
              sizeInMl: v.sizeInMl,
              labelSize: v.labelSize,
              price: v.price,
              discountPrice: v.discountPrice,
              inventory: {
                create: {
                  stockQuantity: v.stock,
                  lowStockThreshold: 5,
                  transactions: {
                    create: {
                      action: InventoryAction.OPENING_STOCK,
                      quantityDelta: v.stock,
                      balanceAfter: v.stock,
                      reason: 'Initial Opening Stock Seed',
                    },
                  },
                },
              },
            })),
          },
        },
      });
      console.log('Created Product:', product.name);
    }
  }

  // 4. Create Initial Discount Coupon
  await prisma.coupon.upsert({
    where: { code: 'ROYAL10' },
    update: {},
    create: {
      code: 'ROYAL10',
      type: 'PERCENTAGE',
      discountValue: 10.0,
      minOrderAmount: 999.0,
      maxDiscountAmount: 500.0,
      usageLimit: 500,
      startDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true,
    },
  });
  console.log('Created Coupon: ROYAL10');

  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });