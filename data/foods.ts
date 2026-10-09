export type FoodType = 'Veg' | 'Non-Veg' | 'Egg';
export type FoodCategory =
  | 'Cooked meal'
  | 'Tiffin'
  | 'Snack'
  | 'Sweet'
  | 'Traditional'
  | 'Bakery'
  | 'Packaged'
  | 'Produce';

export type FoodUnit = 'portions' | 'kg';

export interface FoodItem {
  id: string;
  nameEn: string;
  nameTa: string;
  foodType: FoodType;
  category: FoodCategory;
  defaultUnit: FoodUnit;
  defaultShelfLifeHours: number;
}

export const FOOD_CATALOGUE: FoodItem[] = [
  // --- Tiffin ---
  { id: 'idli', nameEn: 'Idli', nameTa: 'இட்லி', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'dosai', nameEn: 'Dosai', nameTa: 'தோசை', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'pongal', nameEn: 'Ven Pongal', nameTa: 'வெண் பொங்கல்', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'medu-vadai', nameEn: 'Medu Vadai', nameTa: 'மெது வடை', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 6 },
  { id: 'idiyappam', nameEn: 'Idiyappam', nameTa: 'இடியாப்பம்', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'appam', nameEn: 'Appam', nameTa: 'ஆப்பம்', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'kuzhi-paniyaram', nameEn: 'Kuzhi Paniyaram', nameTa: 'குழி பணியாரம்', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'uttapam', nameEn: 'Uttapam', nameTa: 'ஊத்தப்பம்', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'parotta-salna', nameEn: 'Parotta with Salna', nameTa: 'பரோட்டா மற்றும் சால்னா', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'kothu-parotta', nameEn: 'Kothu Parotta', nameTa: 'கொத்து பரோட்டா', foodType: 'Veg', category: 'Tiffin', defaultUnit: 'portions', defaultShelfLifeHours: 4 },

  // --- Rice Meals ---
  { id: 'sambar-rice', nameEn: 'Sambar Rice', nameTa: 'சாம்பார் சாதம்', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 4.5 },
  { id: 'curd-rice', nameEn: 'Curd Rice', nameTa: 'தயிர் சாதம்', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 6 },
  { id: 'lemon-rice', nameEn: 'Lemon Rice', nameTa: 'எலுமிச்சை சாதம்', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 6 },
  { id: 'tamarind-rice', nameEn: 'Tamarind Rice (Puliyodharai)', nameTa: 'புளியோதரை', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 8 },
  { id: 'tomato-rice', nameEn: 'Tomato Rice', nameTa: 'தக்காளி சாதம்', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'coconut-rice', nameEn: 'Coconut Rice', nameTa: 'தேங்காய் சாதம்', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'banana-leaf-meals', nameEn: 'Banana Leaf Meals (Veg)', nameTa: 'வாழை இலை சாப்பாடு (சைவம்)', foodType: 'Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 4 },

  // --- Non-Veg ---
  { id: 'chicken-biryani', nameEn: 'Chicken Biryani', nameTa: 'சிக்கன் பிரியாணி', foodType: 'Non-Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'mutton-biryani', nameEn: 'Mutton Biryani (Dindigul Style)', nameTa: 'மட்டன் பிரியாணி (திண்டுக்கல்)', foodType: 'Non-Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'chettinad-chicken', nameEn: 'Chettinad Chicken Gravy', nameTa: 'செட்டிநாடு சிக்கன் குழம்பு', foodType: 'Non-Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'fish-curry-meals', nameEn: 'Fish Curry Meals', nameTa: 'மீன் குழம்பு சாப்பாடு', foodType: 'Non-Veg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 3.5 },
  { id: 'egg-biryani', nameEn: 'Egg Biryani', nameTa: 'முட்டை பிரியாணி', foodType: 'Egg', category: 'Cooked meal', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'chicken-65', nameEn: 'Chicken 65', nameTa: 'சிக்கன் 65', foodType: 'Non-Veg', category: 'Snack', defaultUnit: 'kg', defaultShelfLifeHours: 4 },

  // --- Traditional ---
  { id: 'kambu-koozh', nameEn: 'Kambu Koozh', nameTa: 'கம்பங்கூழ்', foodType: 'Veg', category: 'Traditional', defaultUnit: 'portions', defaultShelfLifeHours: 6 },
  { id: 'ragi-kali', nameEn: 'Ragi Kali with Keerai', nameTa: 'ராகி களி மற்றும் கீரை', foodType: 'Veg', category: 'Traditional', defaultUnit: 'portions', defaultShelfLifeHours: 5 },
  { id: 'ragi-koozh', nameEn: 'Ragi Koozh', nameTa: 'கேழ்வரகு கூழ்', foodType: 'Veg', category: 'Traditional', defaultUnit: 'portions', defaultShelfLifeHours: 6 },

  // --- Snacks and Sweets ---
  { id: 'sundal', nameEn: 'Konda Kadalai Sundal', nameTa: 'சுண்டல்', foodType: 'Veg', category: 'Snack', defaultUnit: 'kg', defaultShelfLifeHours: 6 },
  { id: 'murukku', nameEn: 'Kai Murukku', nameTa: 'கை முறுக்கு', foodType: 'Veg', category: 'Snack', defaultUnit: 'kg', defaultShelfLifeHours: 48 },
  { id: 'adhirasam', nameEn: 'Adhirasam', nameTa: 'அதிரசம்', foodType: 'Veg', category: 'Sweet', defaultUnit: 'kg', defaultShelfLifeHours: 72 },
  { id: 'paal-payasam', nameEn: 'Paal Payasam', nameTa: 'பால் பாயாசம்', foodType: 'Veg', category: 'Sweet', defaultUnit: 'portions', defaultShelfLifeHours: 4 },
  { id: 'tirunelveli-halwa', nameEn: 'Tirunelveli Halwa', nameTa: 'திருநெல்வேலி அல்வா', foodType: 'Veg', category: 'Sweet', defaultUnit: 'kg', defaultShelfLifeHours: 72 },
  { id: 'mysore-pak', nameEn: 'Ghee Mysore Pak', nameTa: 'நெய் மைசூர் பாக்', foodType: 'Veg', category: 'Sweet', defaultUnit: 'kg', defaultShelfLifeHours: 48 },
  { id: 'kadalai-mittai', nameEn: 'Kovilpatti Kadalai Mittai', nameTa: 'கடலை மிட்டாய்', foodType: 'Veg', category: 'Sweet', defaultUnit: 'kg', defaultShelfLifeHours: 120 },

  // --- Packaged & Produce ---
  { id: 'bread', nameEn: 'Fresh Bread Loaves', nameTa: 'ரொட்டி (பிரெட்)', foodType: 'Veg', category: 'Bakery', defaultUnit: 'portions', defaultShelfLifeHours: 24 },
  { id: 'milk', nameEn: 'Pasteurised Milk', nameTa: 'பால்', foodType: 'Veg', category: 'Packaged', defaultUnit: 'portions', defaultShelfLifeHours: 12 },
  { id: 'bananas', nameEn: 'Fresh Bananas (Vazhaipazham)', nameTa: 'வாழைப்பழம்', foodType: 'Veg', category: 'Produce', defaultUnit: 'kg', defaultShelfLifeHours: 36 },
  { id: 'vegetables-mixed', nameEn: 'Mixed Farm Vegetables', nameTa: 'காய்கறிகள் (கலவை)', foodType: 'Veg', category: 'Produce', defaultUnit: 'kg', defaultShelfLifeHours: 24 },
];

/**
 * Searches food items by name in English or Tamil
 */
export function searchFoods(query: string, lang: 'en' | 'ta' = 'en'): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_CATALOGUE;
  return FOOD_CATALOGUE.filter(
    (f) =>
      f.nameEn.toLowerCase().includes(q) ||
      f.nameTa.includes(q) ||
      f.category.toLowerCase().includes(q)
  );
}
