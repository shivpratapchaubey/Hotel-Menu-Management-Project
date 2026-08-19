require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');
const MenuItem = require('./models/MenuItem');
const Category = require('./models/Category');
const User = require('./models/User');

const seed = async () => {
  console.log("🌱 Starting seed database process...");
  await connectDB();

  try {
    // 1. Clear database
    console.log("🧹 Clearing old database records...");
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    // 2. Seed Admin User
    console.log("🔐 Seeding admin user account...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    console.log("   - Admin account created successfully! (User: admin / Pass: admin123)");

    // 3. Seed Categories
    console.log("📁 Seeding categories...");
    const categoriesData = [
      { name: 'Starters', description: 'Light appetisers to kickstart your meal', icon: 'Utensils' },
      { name: 'Mains', description: 'Hearty and filling chef signature dishes', icon: 'Soup' },
      { name: 'Desserts', description: 'Sweet indulgences to end your dining experience', icon: 'Cake' },
      { name: 'Beverages', description: 'Refreshing hot and cold drinks', icon: 'GlassWater' },
      { name: 'Chef Specials', description: 'Unique culinary creations by our executive chef', icon: 'Sparkles' }
    ];

    for (const cat of categoriesData) {
      await Category.create(cat);
    }
    console.log(`   - Seeded ${categoriesData.length} categories.`);

    // 4. Seed Menu Items
    console.log("🍽️ Seeding gourmet menu items...");
    const itemsData = [
      // Starters
      {
        name: 'Crispy Vegetable Samosa Chaat',
        description: 'Deconstructed spiced potato samosas layered with warm chickpeas curry, sweetened yoghurt, tangy tamarind chutney, mint-coriander chutney, and topped with crispy sev.',
        price: 90.00,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop',
        tags: ['Popular', 'Vegetarian', 'Street Food'],
        dietaryType: 'veg',
        allergens: ['Dairy', 'Gluten'],
        ingredients: ['Potatoes', 'Chickpeas', 'Flour', 'Yoghurt', 'Tamarind', 'Mint', 'Spices'],
        calories: 320,
        prepTime: 8,
        isAvailable: true,
        reviews: [
          { customerName: 'Rohan Sharma', rating: 5, comment: 'Authentic taste! The blend of sweet and sour chutney is incredible.' },
          { customerName: 'Priya K.', rating: 4, comment: 'Very tasty, though a bit too spicy for my kid. Overall excellent!' }
        ],
        averageRating: 4.5
      },
      {
        name: 'Tandoori Paneer Tikka',
        description: 'Premium cottage cheese cubes marinated in heavy spiced hung curd with mustard oil and cooked in tandoor. Served with mint chutney.',
        price: 240.00,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop',
        tags: ['Best Seller', 'Vegetarian', 'Spicy'],
        dietaryType: 'veg',
        allergens: ['Dairy'],
        ingredients: ['Paneer', 'Yoghurt', 'Mustard oil', 'Kashmiri chilli', 'Bell peppers', 'Lemon juice'],
        calories: 310,
        prepTime: 12,
        isAvailable: true,
        reviews: [
          { customerName: 'Aarav Patel', rating: 5, comment: 'Soft paneer and perfect smoky tandoori flavor.' }
        ],
        averageRating: 5.0
      },
      {
        name: 'Veg Hakka Noodles',
        description: 'Stir-fried noodles with crisp julienned vegetables like bell peppers, cabbage, carrots, and spring onions, tossed in a balanced soy-chilli seasoning.',
        price: 160.00,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop',
        tags: ['Kids Special', 'Chinese'],
        dietaryType: 'vegan',
        allergens: ['Gluten', 'Soy'],
        ingredients: ['Noodles', 'Cabbage', 'Carrots', 'Capsicum', 'Soy sauce', 'Spring onion'],
        calories: 290,
        prepTime: 10,
        isAvailable: true,
        reviews: [],
        averageRating: 0
      },
      {
        name: 'Crispy Veggie Burger',
        description: 'Gourmet Indian style burger containing a potato-peas patty, melted cheddar cheese, fresh onion ring layers, tomato slices, and secret tandoori mayonnaise.',
        price: 120.00,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop',
        tags: ['Gourmet', 'Vegetarian'],
        dietaryType: 'veg',
        allergens: ['Dairy', 'Gluten'],
        ingredients: ['Potato patty', 'Burger bun', 'Cheddar cheese', 'Tomato', 'Tandoori mayo'],
        calories: 450,
        prepTime: 10,
        isAvailable: true,
        reviews: [],
        averageRating: 0
      },

      // Mains
      {
        name: 'Deluxe Butter Chicken',
        description: 'Boneless tandoori chicken tikka cooked in a luxurious creamy gravy made of rich tomatoes, butter, and cashew paste, flavored with dried fenugreek leaves.',
        price: 340.00,
        category: 'Mains',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop',
        tags: ['Best Seller', 'Rich', 'Signature'],
        dietaryType: 'non-veg',
        allergens: ['Dairy', 'Nuts'],
        ingredients: ['Chicken', 'Tomatoes', 'Butter', 'Cashew nuts', 'Heavy cream', 'Fenugreek leaves'],
        calories: 680,
        prepTime: 18,
        isAvailable: true,
        reviews: [
          { customerName: 'Rajesh K.', rating: 5, comment: 'Absolutely melt-in-mouth chicken! The gravy is rich and perfect.' }
        ],
        averageRating: 5.0
      },
      {
        name: 'Shahi Paneer Butter Masala',
        description: 'Tender cottage cheese cubes simmered in a mildly sweet, aromatic onion-tomato-cashew gravy with a dash of cream and butter.',
        price: 280.00,
        category: 'Mains',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop',
        tags: ['Popular', 'Vegetarian'],
        dietaryType: 'veg',
        allergens: ['Dairy', 'Nuts'],
        ingredients: ['Paneer', 'Butter', 'Cashew nuts', 'Tomato', 'Cream', 'Spices'],
        calories: 520,
        prepTime: 15,
        isAvailable: true,
        reviews: [],
        averageRating: 0
      },
      {
        name: 'Slow Cooked Dal Makhani',
        description: 'Whole black lentils and red kidney beans slow-simmered for 12 hours on low coal flame, finished with churned white butter and organic fresh cream.',
        price: 220.00,
        category: 'Mains',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
        tags: ['Traditional', 'Vegetarian'],
        dietaryType: 'veg',
        allergens: ['Dairy'],
        ingredients: ['Black lentils', 'Kidney beans', 'Butter', 'Tomato puree', 'Garlic', 'Cream'],
        calories: 380,
        prepTime: 15,
        isAvailable: true,
        reviews: [
          { customerName: 'Kunal G.', rating: 5, comment: 'So creamy and authentic. Reminds me of roadside dhabas in Punjab.' }
        ],
        averageRating: 5.0
      },
      {
        name: 'Hyderabadi Dum Biryani',
        description: 'Long grain aromatic Basmati rice layered with spiced marinated vegetables, mint, and fried onions, cooked on "Dum" in a sealed clay pot. Served with raita.',
        price: 320.00,
        category: 'Mains',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
        tags: ['Spicy', 'Chef Special'],
        dietaryType: 'veg',
        allergens: ['Dairy'],
        ingredients: ['Basmati rice', 'Beans', 'Carrot', 'Mint', 'Saffron', 'Spices', 'Yoghurt (raita)'],
        calories: 610,
        prepTime: 20,
        isAvailable: true,
        reviews: [
          { customerName: 'Vikram S.', rating: 5, comment: 'Incredible saffron aroma! The rice was perfectly cooked and separated.' }
        ],
        averageRating: 5.0
      },

      // Desserts
      {
        name: 'Gulab Jamun with Vanilla Ice Cream',
        description: 'Two warm, soft dumpling balls made of milk solids, deep-fried and soaked in a sweet green cardamom sugar syrup, paired with a scoop of vanilla ice cream.',
        price: 120.00,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1589135304905-eb15bd9b3aa9?w=600&auto=format&fit=crop',
        tags: ['Sweet', 'Best Seller'],
        dietaryType: 'veg',
        allergens: ['Dairy', 'Gluten'],
        ingredients: ['Milk solids (khoya)', 'Flour', 'Sugar syrup', 'Cardamom', 'Vanilla ice cream'],
        calories: 420,
        prepTime: 5,
        isAvailable: true,
        reviews: [],
        averageRating: 0
      },
      {
        name: 'Kesar Rasmalai',
        description: 'Delicate, flattened cottage cheese discs soaked in sweetened, thickened milk flavored with Kashmiri saffron (kesar), cardamom, and topped with pistachios.',
        price: 140.00,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=600&auto=format&fit=crop',
        tags: ['Sweet', 'Traditional'],
        dietaryType: 'veg',
        allergens: ['Dairy', 'Nuts'],
        ingredients: ['Cottage cheese', 'Milk', 'Saffron', 'Sugar', 'Pistachios', 'Almonds'],
        calories: 310,
        prepTime: 4,
        isAvailable: true,
        reviews: [
          { customerName: 'Aanchal T.', rating: 5, comment: 'Not too sweet, perfectly soft, and full of saffron flavor!' }
        ],
        averageRating: 5.0
      },

      // Beverages
      {
        name: 'Mango Lassi',
        description: 'A rich, creamy Punjabi summer drink blended with thick curd, sweet Alphonso mango pulp, flavored with cardamom, and garnished with almond flakes.',
        price: 90.00,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop',
        tags: ['Refreshing', 'Cold'],
        dietaryType: 'veg',
        allergens: ['Dairy', 'Nuts'],
        ingredients: ['Mango pulp', 'Curd', 'Sugar', 'Cardamom', 'Almonds'],
        calories: 240,
        prepTime: 4,
        isAvailable: true,
        reviews: [],
        averageRating: 0
      },
      {
        name: 'Adrak Elaichi Masala Chai',
        description: 'Freshly brewed strong Indian black tea leaves boiled with milk, crushed fresh ginger (adrak), and aromatic cardamom pods (elaichi). Serves hot.',
        price: 50.00,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop',
        tags: ['Hot', 'Traditional'],
        dietaryType: 'veg',
        allergens: ['Dairy'],
        ingredients: ['Tea leaves', 'Milk', 'Ginger', 'Cardamom', 'Sugar'],
        calories: 90,
        prepTime: 5,
        isAvailable: true,
        reviews: [],
        averageRating: 0
      },

      // Chef Specials
      {
        name: 'Chilli Paneer Fried Rice Combo',
        description: 'A grand Indo-Chinese chef special combo featuring spicy stir-fried chilli paneer cubes in thick soy-garlic sauce, served alongside aromatic vegetable fried rice.',
        price: 290.00,
        category: 'Chef Specials',
        image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=600&auto=format&fit=crop',
        tags: ['Indo-Chinese', 'Spicy', 'Meal Combo'],
        dietaryType: 'veg',
        allergens: ['Soy', 'Gluten'],
        ingredients: ['Paneer', 'Rice', 'Soy sauce', 'Chilli paste', 'Capsicum', 'Spring onions'],
        calories: 720,
        prepTime: 15,
        isAvailable: true,
        reviews: [
          { customerName: 'Siddharth M.', rating: 5, comment: 'Perfect portions! The Chilli Paneer was crisp on the outside and soft inside.' }
        ],
        averageRating: 5.0
      }
    ];

    for (const item of itemsData) {
      await MenuItem.create(item);
    }
    console.log(`   - Seeded ${itemsData.length} gourmet menu items.`);
    console.log("🎉 Seeding database completed successfully!");
  } catch (error) {
    console.error("❌ Seeding database failed:", error);
  } finally {
    // We don't call mongoose.disconnect() directly because in JSON mode there's no connection to close
    try {
      const { getDbMode } = require('./config/db');
      if (getDbMode() === 'mongodb') {
        const mongoose = require('mongoose');
        await mongoose.disconnect();
        console.log("🔌 Closed MongoDB connection.");
      }
    } catch (e) {}
    process.exit(0);
  }
};

seed();
