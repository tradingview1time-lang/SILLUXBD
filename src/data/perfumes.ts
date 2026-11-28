export type PerfumeSizeId = '3ML' | '5ML' | '10ML' | '15ML' | '30ML' | 'FULL';

export interface PerfumeSizeOption {
  id: PerfumeSizeId;
  label: string;
  shortLabel: string;
  ml: number;
  vesselName: string;
  spraysEstimate: string;
  description: string;
  priceMultiplier: number;
  heightScale: number;
  image?: string;
}

function createMlVesselSlotImage(
  sizeLabel: string,
  vesselName: string,
  sprays: string,
  bottleWidth: number,
  bottleHeight: number
): string {
  const cx = 300;
  const bottomY = 420;
  const bodyX = Math.round(cx - bottleWidth / 2);
  const bodyY = bottomY - bottleHeight;
  const neckW = Math.max(26, Math.round(bottleWidth * 0.36));
  const neckX = Math.round(cx - neckW / 2);
  const neckY = bodyY - 22;
  const capW = Math.max(38, Math.round(bottleWidth * 0.52));
  const capX = Math.round(cx - capW / 2);
  const capY = neckY - 34;
  const labelW = Math.max(54, Math.round(bottleWidth * 0.72));
  const labelX = Math.round(cx - labelW / 2);
  const labelH = Math.min(92, Math.round(bottleHeight * 0.44));
  const labelY = Math.round(bodyY + (bottleHeight - labelH) / 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bg-${sizeLabel}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E1812"/>
      <stop offset="100%" stop-color="#0F0C09"/>
    </linearGradient>
    <linearGradient id="gold-${sizeLabel}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8C641E"/>
      <stop offset="50%" stop-color="#E7C983"/>
      <stop offset="100%" stop-color="#9A7228"/>
    </linearGradient>
    <linearGradient id="juice-${sizeLabel}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D6B265" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#7A5218" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg-${sizeLabel})"/>
  <rect x="20" y="20" width="560" height="560" fill="none" stroke="#5E4927" stroke-width="1.5"/>
  <text x="300" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="18" letter-spacing="5" fill="#D6B265">SILLUX VESSEL</text>
  <text x="300" y="96" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" letter-spacing="2" fill="#9F8E74">${sizeLabel} BOTTLE PHOTO SLOT</text>
  <rect x="${capX}" y="${capY}" width="${capW}" height="34" rx="4" fill="url(#gold-${sizeLabel})"/>
  <rect x="${neckX}" y="${neckY}" width="${neckW}" height="22" fill="#3B3124" stroke="#B58938" stroke-width="1.5"/>
  <rect x="${bodyX}" y="${bodyY}" width="${bottleWidth}" height="${bottleHeight}" rx="12" fill="#17130E" stroke="#C59B4A" stroke-width="2.5"/>
  <rect x="${bodyX + 8}" y="${bodyY + 26}" width="${bottleWidth - 16}" height="${bottleHeight - 36}" rx="7" fill="url(#juice-${sizeLabel})"/>
  <rect x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" rx="4" fill="#FAF6ED" stroke="#B58938" stroke-width="1.5"/>
  <text x="300" y="${Math.round(labelY + labelH * 0.48)}" text-anchor="middle" font-family="monospace" font-size="22" font-weight="700" fill="#1A1612">${sizeLabel}</text>
  <text x="300" y="${Math.round(labelY + labelH * 0.78)}" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="2" fill="#8C641E">SILLUX</text>
  <text x="300" y="480" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#FCFBF8">${vesselName}</text>
  <text x="300" y="512" text-anchor="middle" font-family="monospace" font-size="14" fill="#D6B265">${sprays} · Separate ${sizeLabel} Image</text>
  <text x="300" y="544" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#8F826F">Add or replace photo specifically for ${sizeLabel}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PERFUME_SIZES: PerfumeSizeOption[] = [
  {
    id: '3ML',
    label: '3ML Atelier Vial',
    shortLabel: '3ML',
    ml: 3,
    vesselName: 'Borosilicate Micro-Atomizer',
    spraysEstimate: '~45 sprays',
    description: 'Slender pocket glass atomizer with fine-mist brass sprayer for first wearings.',
    priceMultiplier: 0.09,
    heightScale: 0.56,
    image: './src/assets/images/regenerated_image_1795802120882.jpg',
  },
  {
    id: '5ML',
    label: '5ML Discovery Vial',
    shortLabel: '5ML',
    ml: 5,
    vesselName: 'Weighted Glass Travel Spray',
    spraysEstimate: '~75 sprays',
    description: 'Thick-walled crystal travel decant with brushed champagne collar.',
    priceMultiplier: 0.13,
    heightScale: 0.66,
    image: './src/assets/images/regenerated_image_1795802336196.jpg',
  },
  {
    id: '10ML',
    label: '10ML Signature Decant',
    shortLabel: '10ML',
    ml: 10,
    vesselName: 'Fluted Pocket Flacon',
    spraysEstimate: '~150 sprays',
    description: 'Our signature heavy cylindrical glass flacon with magnetic gold cap.',
    priceMultiplier: 0.22,
    heightScale: 0.78,
    image: './src/assets/images/regenerated_image_1795801270840.jpg',
  },
  {
    id: '15ML',
    label: '15ML Voyage Flacon',
    shortLabel: '15ML',
    ml: 15,
    vesselName: 'Atelier Column Atomizer',
    spraysEstimate: '~225 sprays',
    description: 'Extended travel edition crafted for multi-week rotation without bulk.',
    priceMultiplier: 0.31,
    heightScale: 0.88,
    image: './src/assets/images/regenerated_image_1795802538692.jpg',
  },
  {
    id: '30ML',
    label: '30ML Collector Decant',
    shortLabel: '30ML',
    ml: 30,
    vesselName: 'Faceted Apothecary Flacon',
    spraysEstimate: '~450 sprays',
    description: 'Generous dresser-ready crystal decant with engraved brass plaque.',
    priceMultiplier: 0.54,
    heightScale: 1.0,
    image: './src/assets/images/regenerated_image_1795802793930.jpg',
  },
  {
    id: 'FULL',
    label: 'Full Bottle with Presentation',
    shortLabel: 'Full Bottle',
    ml: 100,
    vesselName: '100ML Master Flacon & Coffret',
    spraysEstimate: '~1,500 sprays',
    description: 'Factory-sealed original house bottle nested inside its velvet-lined presentation box.',
    priceMultiplier: 1.0,
    heightScale: 1.18,
  },
];

export type ScentFamily = 'Oud & Wood' | 'Amber & Spice' | 'Fresh & Citrus' | 'Floral & Leather';

export interface OlfactoryAccord {
  name: string;
  strength: number; // 0-100
  toneHex: string;
}

export interface Perfume {
  id: string;
  name: string;
  house: string;
  concentration: string;
  family: ScentFamily;
  displayFamily?: string;
  fullBottleMl: number;
  fullPriceBdt: number;
  sizePricesBdt?: Partial<Record<PerfumeSizeId, number>>;
  liquidHex: string;
  accentHex: string;
  image: string;
  gallery?: string[];
  mlBannerImage?: string;
  mlSizeImages?: Partial<Record<PerfumeSizeId, string>>;
  trending: boolean;
  isBestSeller: boolean;
  bestSellerOnly?: boolean;
  hiddenFromHome?: boolean;
  bestsellerRank?: number;
  outOfStock?: boolean;
  outOfStockSizes?: PerfumeSizeId[];
  hiddenSizes?: PerfumeSizeId[];
  stockLabel?: string;
  longevity: string;
  sillage: string;
  tagline: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  accords: OlfactoryAccord[];
}

export const PERFUMES: Perfume[] = [
  {
    id: 'aurum-eclipse',
    name: 'LV IMAGINATION',
    house: 'LOUIS VUITTON',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Tea & Soapy',
    fullBottleMl: 100,
    fullPriceBdt: 64500,
    sizePricesBdt: {
      '3ML': 1982,
      '5ML': 3270,
      '10ML': 6525,
      '15ML': 8995,
      '30ML': 17325,
      FULL: 64500,
    },
    liquidHex: '#7CC0D8',
    accentHex: '#B6DFEC',
    image: './src/assets/images/perfume_oud_velvet_1795009103534.jpg',
    gallery: [
      './src/assets/images/perfume_oud_velvet_1795009103534.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 1,
    outOfStock: true,
    stockLabel: 'Sold Out',
    longevity: '10–12 Hours',
    sillage: 'Crisp & Radiant',
    tagline: 'Luminous Calabrian citron and soapy Tunisian neroli steeped in Chinese black tea and ambroxan.',
    notes: {
      top: ['Calabrian Bergamot', 'Citron', 'Sicilian Orange'],
      heart: ['Tunisian Neroli', 'Nigerian Ginger', 'Ceylon Cinnamon'],
      base: ['Chinese Black Tea', 'Ambroxan', 'Olibanum'],
    },
    accords: [
      { name: 'Fresh Citrus', strength: 95, toneHex: '#8EC5D6' },
      { name: 'Black Tea', strength: 88, toneHex: '#B0895A' },
      { name: 'Soapy Neroli', strength: 82, toneHex: '#D8CFAF' },
      { name: 'Warm Ginger', strength: 64, toneHex: '#C9955A' },
      { name: 'Clean Ambroxan', strength: 58, toneHex: '#8FA3AE' },
    ],
  },
  {
    id: 'supremacy-collectors-edition',
    name: "SUPREMACY COLLECTOR'S EDITION",
    house: 'AFNAN',
    concentration: 'Extrait de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Fruity & Ambergris',
    fullBottleMl: 100,
    fullPriceBdt: 7400,
    sizePricesBdt: {
      '3ML': 421,
      '5ML': 638,
      '10ML': 1192,
      '15ML': 1669,
      '30ML': 3368,
      FULL: 7400,
    },
    liquidHex: '#9E9B93',
    accentHex: '#D6D0C4',
    image: './src/assets/images/regenerated_image_1795520126959.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795520126959.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 2,
    longevity: '10–12 Hours',
    sillage: 'Radiant & Crisp',
    tagline: 'Bright pineapple and Calabrian bergamot layered with orange blossom, oakmoss, and smoky amber.',
    notes: {
      top: ['Pineapple', 'Bergamot', 'White Floral', 'Apple'],
      heart: ['Orange Blossom', 'Birch', 'Amber'],
      base: ['Oakmoss', 'Musk', 'Ambergris'],
    },
    accords: [
      { name: 'Fruity Citrus', strength: 94, toneHex: '#D8B34A' },
      { name: 'Smoky Birch', strength: 82, toneHex: '#6F6458' },
      { name: 'White Floral', strength: 74, toneHex: '#D8CFAF' },
      { name: 'Woody Oakmoss', strength: 68, toneHex: '#7A7D56' },
      { name: 'Clean Ambergris', strength: 60, toneHex: '#8C8476' },
    ],
  },
  {
    id: 'aethelred-blanc',
    name: 'CREED AVENTUS',
    house: 'CREED',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Fruity & Fresh & Smoky',
    fullBottleMl: 100,
    fullPriceBdt: 34200,
    sizePricesBdt: {
      '3ML': 1749,
      '5ML': 2899,
      '10ML': 5749,
      '15ML': 8648,
      '30ML': 17299,
      FULL: 34200,
    },
    liquidHex: '#D4A857',
    accentHex: '#E8D5B5',
    image: './src/assets/images/perfume_neroli_blanc_1795009104852.jpg',
    gallery: [
      './src/assets/images/perfume_neroli_blanc_1795009104852.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 3,
    outOfStock: true,
    stockLabel: 'Sold Out',
    longevity: '8–10 Hours',
    sillage: 'Commanding & Crisp',
    tagline: 'Sun-ripened pineapple and Calabrian bergamot layered over smoked birch, oakmoss, and ambergris.',
    notes: {
      top: ['Pineapple', 'Calabrian Bergamot', 'Blackcurrant'],
      heart: ['Smoked Birch', 'Moroccan Jasmine', 'Patchouli'],
      base: ['Oakmoss', 'Ambergris', 'Musk'],
    },
    accords: [
      { name: 'Fruity Pineapple', strength: 95, toneHex: '#D8B34A' },
      { name: 'Fresh Citrus', strength: 88, toneHex: '#C9A467' },
      { name: 'Smoky Birch', strength: 80, toneHex: '#6F6458' },
      { name: 'Woody Oakmoss', strength: 66, toneHex: '#7A7D56' },
      { name: 'Ambergris Musk', strength: 58, toneHex: '#8C8476' },
    ],
  },
  {
    id: 'solstice-vetiver',
    name: 'MARWA EXTRAIT',
    house: 'ARABIYAT PRESTIGE',
    concentration: 'Extrait de Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Floral & Tea & Soapy',
    fullBottleMl: 100,
    fullPriceBdt: 4800,
    hiddenSizes: ['30ML'],
    sizePricesBdt: {
      '3ML': 585,
      '5ML': 858,
      '10ML': 1498,
      '15ML': 2114,
      FULL: 4800,
    },
    liquidHex: '#6E6833',
    accentHex: '#C2A86E',
    image: './src/assets/images/perfume_vetiver_fume_1795009105391.jpg',
    gallery: [
      './src/assets/images/perfume_vetiver_fume_1795009105391.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 4,
    longevity: '10–12 Hours',
    sillage: 'Radiant & Clean',
    tagline: 'Luminous white floral petals infused with spiced black tea, soapy neroli, and clean musk.',
    notes: {
      top: ['Bergamot', 'Fresh Ginger', 'Neroli Blossom'],
      heart: ['Black Tea', 'White Jasmine', 'Geranium'],
      base: ['Ambroxan', 'Guaiac Wood', 'Clean White Musk'],
    },
    accords: [
      { name: 'White Floral', strength: 92, toneHex: '#D8CFAF' },
      { name: 'Black Tea', strength: 88, toneHex: '#9C7B52' },
      { name: 'Soapy Neroli', strength: 82, toneHex: '#C9B88B' },
      { name: 'Fresh Ginger', strength: 64, toneHex: '#B68A52' },
      { name: 'Clean Musk', strength: 58, toneHex: '#8C8476' },
    ],
  },
  {
    id: 'hawas-ice-home',
    name: 'HAWAS ICE',
    house: 'RASASI',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Icy Citrus & Amber',
    fullBottleMl: 100,
    fullPriceBdt: 3900,
    sizePricesBdt: {
      '3ML': 245,
      '5ML': 358,
      '10ML': 588,
      '15ML': 818,
      '30ML': 1448,
      FULL: 3900,
    },
    liquidHex: '#4C8CC4',
    accentHex: '#A7D1EC',
    image: './src/assets/images/perfume_saffron_amber_1795009104645.jpg',
    gallery: [
      './src/assets/images/perfume_saffron_amber_1795009104645.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    longevity: '9–11 Hours',
    sillage: 'Crisp & Projecting',
    tagline: 'Frozen Italian lemon and crisp Granny Smith apple over orange blossom, cardamom, and ambergris.',
    notes: {
      top: ['Frozen Apple', 'Italian Lemon', 'Sicilian Bergamot', 'Star Anise'],
      heart: ['Plum', 'Orange Blossom', 'Cardamom'],
      base: ['Musk', 'Amber', 'Moss', 'Driftwood'],
    },
    accords: [
      { name: 'Icy Citrus', strength: 96, toneHex: '#5CA4D8' },
      { name: 'Crisp Apple', strength: 88, toneHex: '#84BE78' },
      { name: 'Aquatic Musk', strength: 82, toneHex: '#7B9BB8' },
      { name: 'Warm Plum', strength: 72, toneHex: '#8F5B78' },
      { name: 'Golden Amber', strength: 64, toneHex: '#C99652' },
    ],
  },
  {
    id: 'santal-velours',
    name: 'Santal de Velours',
    house: 'Atelier Sillux',
    concentration: 'Eau de Parfum',
    family: 'Oud & Wood',
    fullBottleMl: 100,
    fullPriceBdt: 32400,
    liquidHex: '#B88446',
    accentHex: '#D9BC8C',
    image: './src/assets/images/perfume_oud_velvet_1795009103534.jpg',
    gallery: [
      './src/assets/images/perfume_oud_velvet_1795009103534.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    outOfStock: true,
    longevity: '9 Hours',
    sillage: 'Intimate Aura',
    tagline: 'Creamy Mysore sandalwood folded with toasted fig milk and dry papyrus.',
    notes: {
      top: ['Green Fig', 'Nutmeg', 'Bergamot'],
      heart: ['Mysore Sandalwood', 'Papyrus', 'Cashmere Wood'],
      base: ['Cedarwood', 'Vetiver', 'Warm Skin Musk'],
    },
    accords: [
      { name: 'Creamy Santal', strength: 93, toneHex: '#D4B07A' },
      { name: 'Dry Papyrus', strength: 76, toneHex: '#A8895C' },
      { name: 'Milky Fig', strength: 64, toneHex: '#938C64' },
      { name: 'Warm Musk', strength: 56, toneHex: '#8C7A63' },
      { name: 'Subtle Spice', strength: 38, toneHex: '#755D44' },
    ],
  },
  {
    id: 'le-male-le-parfum-jpg',
    name: 'LE MALE LE PARFUM',
    house: 'JEAN PAUL GAULTIER',
    concentration: 'Eau de Parfum Intense',
    family: 'Amber & Spice',
    displayFamily: 'Cardamom & Vanilla',
    fullBottleMl: 125,
    fullPriceBdt: 15800,
    sizePricesBdt: {
      '3ML': 414,
      '5ML': 598,
      '10ML': 1117,
      '15ML': 1618,
      '30ML': 3098,
      FULL: 15800,
    },
    liquidHex: '#3B2D24',
    accentHex: '#D4A857',
    image: './src/assets/images/regenerated_image_1795520869879.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795520869879.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 7,
    longevity: '10–12 Hours',
    sillage: 'Warm & Magnetic',
    tagline: 'Spicy Guatemalan cardamom layered over aromatic lavender, powdery iris, and deep black vanilla woods.',
    notes: {
      top: ['Cardamom'],
      heart: ['Lavender', 'Iris'],
      base: ['Black Vanilla', 'Oriental Woods', 'Amber'],
    },
    accords: [
      { name: 'Warm Vanilla', strength: 95, toneHex: '#C99852' },
      { name: 'Spiced Cardamom', strength: 88, toneHex: '#A67A48' },
      { name: 'Aromatic Lavender', strength: 80, toneHex: '#84789C' },
      { name: 'Powdery Iris', strength: 70, toneHex: '#A894A8' },
      { name: 'Smooth Woods', strength: 64, toneHex: '#7B6046' },
    ],
  },
  {
    id: 'afnan-9pm-night-out',
    name: '9PM NIGHT OUT',
    house: 'AFNAN',
    concentration: 'Extrait de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Cognac, Toffee & Spiced Woods',
    fullBottleMl: 75,
    fullPriceBdt: 7300,
    sizePricesBdt: {
      '3ML': 404,
      '5ML': 614,
      '10ML': 1094,
      '15ML': 1524,
      '30ML': 2944,
      FULL: 7300,
    },
    liquidHex: '#4E2A22',
    accentHex: '#D8A35D',
    image: './src/assets/images/regenerated_image_1795865931010.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795865931010.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 5,
    longevity: '10–12 Hours',
    sillage: 'Commanding & Nocturnal',
    tagline: 'Exotic dragon fruit, warm cognac, and crisp apple melting into spiced cardamom toffee, supple suede, tonka bean, and dark woods.',
    notes: {
      top: ['Dragon Fruit', 'Cognac', 'Apple', 'Lavender', 'Bergamot'],
      heart: ['Toffee', 'Cardamom', 'Suede', 'Cedarwood'],
      base: ['Tonka Bean', 'Ambroxan', 'Akigalawood', 'Patchouli'],
    },
    accords: [
      { name: 'Warm Cognac & Sweet', strength: 95, toneHex: '#C98A42' },
      { name: 'Spiced Cardamom', strength: 88, toneHex: '#B66A38' },
      { name: 'Exotic Fruity', strength: 82, toneHex: '#C85E6B' },
      { name: 'Tonka & Amber', strength: 78, toneHex: '#A67A48' },
      { name: 'Dark Woods & Suede', strength: 70, toneHex: '#6B5846' },
    ],
  },
  {
    id: '212-men-carolina-herrera',
    name: '212 MEN NYC',
    house: 'CAROLINA HERRERA',
    concentration: 'Eau de Toilette',
    family: 'Fresh & Citrus',
    displayFamily: 'Green Citrus & Musk',
    fullBottleMl: 100,
    fullPriceBdt: 14600,
    sizePricesBdt: {
      '3ML': 363,
      '5ML': 567,
      '10ML': 1134,
      '15ML': 1498,
      '30ML': 2490,
      FULL: 14600,
    },
    liquidHex: '#7E93A6',
    accentHex: '#B8C4CE',
    image: './src/assets/images/regenerated_image_1795520676354.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795520676354.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 6,
    longevity: '8–10 Hours',
    sillage: 'Crisp & Clean',
    tagline: 'Crushed green leaves and chilled bergamot spiced with fresh ginger, gardenia, and creamy white sandalwood.',
    notes: {
      top: ['Green Notes', 'Grapefruit', 'Bergamot', 'Lavender'],
      heart: ['Ginger', 'Green Pepper', 'Gardenia', 'Sage'],
      base: ['White Musk', 'Sandalwood', 'Guaiac Wood', 'Vetiver'],
    },
    accords: [
      { name: 'Crisp Green', strength: 94, toneHex: '#7A9A68' },
      { name: 'Fresh Citrus', strength: 88, toneHex: '#B8C45E' },
      { name: 'Warm Ginger', strength: 78, toneHex: '#C69558' },
      { name: 'Clean Musk', strength: 74, toneHex: '#9BA8B2' },
      { name: 'Smooth Sandalwood', strength: 64, toneHex: '#B89B74' },
    ],
  },
  {
    id: 'liquid-brun-french-avenue',
    name: 'LIQUID BRUN',
    house: 'FRENCH AVENUE',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Vanilla & Cinnamon',
    fullBottleMl: 100,
    fullPriceBdt: 4300,
    sizePricesBdt: {
      '3ML': 274,
      '5ML': 548,
      '10ML': 704,
      '15ML': 994,
      '30ML': 1894,
      FULL: 4300,
    },
    liquidHex: '#8E4E2E',
    accentHex: '#D49E5A',
    image: './src/assets/images/regenerated_image_1795521031969.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795521031969.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 8,
    longevity: '10–12 Hours',
    sillage: 'Warm & Gourmand',
    tagline: 'Toasted Ceylon cinnamon and orange blossom folded into rich Bourbon vanilla, praline, and guaiac wood.',
    notes: {
      top: ['Cinnamon', 'Cardamom', 'Orange Blossom', 'Bergamot'],
      heart: ['Bourbon Vanilla', 'Elemi'],
      base: ['Praline', 'Ambroxan', 'Guaiac Wood', 'Musk'],
    },
    accords: [
      { name: 'Bourbon Vanilla', strength: 96, toneHex: '#D49E5A' },
      { name: 'Warm Cinnamon', strength: 88, toneHex: '#B66A38' },
      { name: 'Sweet Praline', strength: 82, toneHex: '#A67248' },
      { name: 'Smoky Guaiac', strength: 70, toneHex: '#7A5B44' },
      { name: 'Orange Blossom', strength: 60, toneHex: '#D8B884' },
    ],
  },
  {
    id: 'stronger-with-you-intensely',
    name: 'STRONGER WITH YOU INTENSELY',
    house: 'GIORGIO ARMANI',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Toffee & Vanilla',
    fullBottleMl: 100,
    fullPriceBdt: 13800,
    sizePricesBdt: {
      '3ML': 618,
      '5ML': 548,
      '10ML': 1618,
      '15ML': 2488,
      '30ML': 4758,
      FULL: 13800,
    },
    liquidHex: '#9E4B1E',
    accentHex: '#DFAD6B',
    image: './src/assets/images/regenerated_image_1795521384282.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795521384282.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 9,
    longevity: '10–12 Hours',
    sillage: 'Warm & Seductive',
    tagline: 'Spiced pink pepper and juniper over molten sugar-coated chestnut, warm toffee, cinnamon, and suede vanilla.',
    notes: {
      top: ['Pink Pepper', 'Juniper', 'Violet'],
      heart: ['Toffee', 'Cinnamon', 'Lavender', 'Sage'],
      base: ['Vanilla', 'Amber', 'Tonka Bean', 'Suede'],
    },
    accords: [
      { name: 'Sweet Toffee', strength: 96, toneHex: '#C97B3E' },
      { name: 'Warm Vanilla', strength: 92, toneHex: '#D8A660' },
      { name: 'Spiced Cinnamon', strength: 82, toneHex: '#B65B32' },
      { name: 'Golden Amber', strength: 76, toneHex: '#A67242' },
      { name: 'Aromatic Lavender', strength: 60, toneHex: '#84789C' },
    ],
  },
  {
    id: 'amber-empire-french-avenue',
    name: 'AMBER EMPIRE',
    house: 'FRENCH AVENUE',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Spiced Rum & Amber',
    fullBottleMl: 100,
    fullPriceBdt: 4350,
    sizePricesBdt: {
      '3ML': 270,
      '5ML': 486,
      '10ML': 688,
      '15ML': 958,
      '30ML': 1818,
      FULL: 4350,
    },
    liquidHex: '#7C2318',
    accentHex: '#C59B4A',
    image: './src/assets/images/regenerated_image_1795521612667.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795521612667.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 10,
    longevity: '10–12 Hours',
    sillage: 'Opulent & Golden',
    tagline: 'Velvety aged rum, bitter orange, and cardamom layered over blond tobacco, warm vanilla, and golden amber.',
    notes: {
      top: ['Rum', 'Cardamom', 'Bergamot', 'Bitter Orange'],
      heart: ['Blond Tobacco', 'Saffron', 'Sandalwood', 'Osmanthus'],
      base: ['Amber', 'Vanilla', 'Tonka Bean', 'Musk'],
    },
    accords: [
      { name: 'Golden Amber', strength: 96, toneHex: '#C57B3A' },
      { name: 'Spiced Rum', strength: 88, toneHex: '#9E3E22' },
      { name: 'Blond Tobacco', strength: 82, toneHex: '#B68A4A' },
      { name: 'Warm Vanilla', strength: 76, toneHex: '#D8B268' },
      { name: 'Aromatic Cardamom', strength: 64, toneHex: '#8C7A52' },
    ],
  },
  {
    id: 'grand-soir',
    name: 'GRAND SOIR',
    house: 'MAISON FRANCIS KURKDJIAN',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Amber & Vanilla',
    fullBottleMl: 100,
    fullPriceBdt: 32400,
    liquidHex: '#AD5A1C',
    accentHex: '#E5B769',
    image: './src/assets/images/sillux_film_scene_two_1795011473691.jpg',
    gallery: [
      './src/assets/images/sillux_film_scene_two_1795011473691.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '12 Hours',
    sillage: 'Evening Glow',
    tagline: 'Molten Spanish labdanum, Siamese benzoin, and dark vanilla shimmering like Parisian lamplight.',
    notes: {
      top: ['Spanish Cistus Labdanum'],
      heart: ['Siam Benzoin', 'Lavender Mist'],
      base: ['Deep Amber', 'Tonka Bean', 'Vanilla'],
    },
    accords: [
      { name: 'Molten Amber', strength: 98, toneHex: '#C97B3A' },
      { name: 'Balsamic Benzoin', strength: 86, toneHex: '#A66238' },
      { name: 'Creamy Vanilla', strength: 82, toneHex: '#DFB66E' },
      { name: 'Warm Tonka', strength: 70, toneHex: '#8C623E' },
      { name: 'Resinous Labdanum', strength: 64, toneHex: '#7E5438' },
    ],
  },
  {
    id: 'born-in-roma-intense-valentino',
    name: 'BORN IN ROMA INTENSE',
    house: 'VALENTINO',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Vanilla & Lavender',
    fullBottleMl: 100,
    fullPriceBdt: 14400,
    sizePricesBdt: {
      '3ML': 874,
      '5ML': 1288,
      '10ML': 2324,
      '15ML': 3308,
      '30ML': 6334,
      FULL: 14400,
    },
    liquidHex: '#7C333B',
    accentHex: '#D4969A',
    image: './src/assets/images/regenerated_image_1795521811982.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795521811982.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestsellerRank: 11,
    longevity: '10–12 Hours',
    sillage: 'Magnetic & Smooth',
    tagline: 'Creamy Madagascar vanilla infusion fused with crisp lavandin heart and smoky Haitian vetiver.',
    notes: {
      top: ['Bourbon Vanilla', 'Nutmeg', 'Amber'],
      heart: ['Lavandin', 'Clary Sage'],
      base: ['Haitian Vetiver', 'Smoky Woods'],
    },
    accords: [
      { name: 'Sweet Vanilla', strength: 96, toneHex: '#D8A868' },
      { name: 'Aromatic Lavender', strength: 88, toneHex: '#84789C' },
      { name: 'Warm Amber', strength: 80, toneHex: '#B66A48' },
      { name: 'Earthy Vetiver', strength: 72, toneHex: '#6F7252' },
      { name: 'Soft Spice', strength: 60, toneHex: '#A66D52' },
    ],
  },
  {
    id: 'pacific-chill',
    name: 'PACIFIC CHILL',
    house: 'LOUIS VUITTON',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Mint & Apricot',
    fullBottleMl: 100,
    fullPriceBdt: 41200,
    liquidHex: '#6FB9A2',
    accentHex: '#B6DFCE',
    image: './src/assets/images/atelier_decanting_craft_1795009105859.jpg',
    gallery: [
      './src/assets/images/atelier_decanting_craft_1795009105859.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '8–9 Hours',
    sillage: 'Breezy & Crisp',
    tagline: 'Crushed coastal mint, blackcurrant, and bright citron softened by sun-ripened apricot.',
    notes: {
      top: ['Citron', 'Orange', 'Mint', 'Blackcurrant'],
      heart: ['Apricot', 'Basil', 'May Rose', 'Carrot Seed'],
      base: ['Fig', 'Dates', 'Ambrette'],
    },
    accords: [
      { name: 'Fresh Citrus', strength: 94, toneHex: '#8CC4B2' },
      { name: 'Cooling Mint', strength: 88, toneHex: '#6BA88E' },
      { name: 'Juicy Apricot', strength: 78, toneHex: '#D6A66E' },
      { name: 'Green Basil', strength: 64, toneHex: '#76986A' },
      { name: 'Clean Ambrette', strength: 52, toneHex: '#A4ABA2' },
    ],
  },
  {
    id: 'afternoon-swim',
    name: 'AFTERNOON SWIM',
    house: 'LOUIS VUITTON',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Mandarin & Ginger',
    fullBottleMl: 100,
    fullPriceBdt: 40800,
    liquidHex: '#5CA5D6',
    accentHex: '#A6D2EE',
    image: './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
    gallery: [
      './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '6–7 Hours',
    sillage: 'Sunlit Splash',
    tagline: 'Sparkling Sicilian orange and Calabrian bergamot plunging into cool ambergris and ginger.',
    notes: {
      top: ['Sicilian Orange', 'Mandarin'],
      heart: ['Calabrian Bergamot', 'Fresh Ginger'],
      base: ['Marine Ambergris'],
    },
    accords: [
      { name: 'Juicy Mandarin', strength: 98, toneHex: '#D99448' },
      { name: 'Zesty Bergamot', strength: 86, toneHex: '#A8C26E' },
      { name: 'Marine Breeze', strength: 74, toneHex: '#74ACC8' },
      { name: 'Crisp Ginger', strength: 62, toneHex: '#C6A164' },
      { name: 'Clean Ambergris', strength: 50, toneHex: '#8EA2AD' },
    ],
  },
  {
    id: 'bleu-de-chanel',
    name: 'BLEU DE CHANEL PARFUM',
    house: 'CHANEL',
    concentration: 'Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Citrus & Sandalwood',
    fullBottleMl: 100,
    fullPriceBdt: 24600,
    liquidHex: '#465F78',
    accentHex: '#98AEC4',
    image: './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
    gallery: [
      './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '9–10 Hours',
    sillage: 'Refined',
    tagline: 'Lemon zest and aromatic lavender elevated by New Caledonian sandalwood and warm cedar.',
    notes: {
      top: ['Lemon Zest', 'Bergamot', 'Mint'],
      heart: ['Lavender', 'Geranium', 'Green Notes'],
      base: ['New Caledonian Sandalwood', 'Cedar', 'Amberwood'],
    },
    accords: [
      { name: 'Aromatic Woods', strength: 92, toneHex: '#647686' },
      { name: 'Crisp Citrus', strength: 86, toneHex: '#A6B86C' },
      { name: 'Creamy Sandalwood', strength: 78, toneHex: '#B89B6E' },
      { name: 'Clean Lavender', strength: 68, toneHex: '#7C869E' },
      { name: 'Subtle Incense', strength: 54, toneHex: '#7E7D78' },
    ],
  },
  {
    id: 'torino21-xerjoff',
    name: 'TORINO 21',
    house: 'XERJOFF',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Mint & Lemon',
    fullBottleMl: 100,
    fullPriceBdt: 32400,
    liquidHex: '#7BB88E',
    accentHex: '#C2DEC8',
    image: './src/assets/images/atelier_decanting_craft_1795009105859.jpg',
    gallery: [
      './src/assets/images/atelier_decanting_craft_1795009105859.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '9 Hours',
    sillage: 'Verdant Crisp',
    tagline: 'Frosty crushed spearmint, basil leaf, and Amalfi lemon verbena resting on white musk.',
    notes: {
      top: ['Spearmint', 'Lemon', 'Basil', 'Thyme'],
      heart: ['Blackcurrant', 'Lavender', 'Rosemary', 'Jasmine'],
      base: ['Lemon Verbena', 'White Musk'],
    },
    accords: [
      { name: 'Fresh Mint', strength: 96, toneHex: '#69A87E' },
      { name: 'Aromatic Herbs', strength: 88, toneHex: '#7A9662' },
      { name: 'Zesty Lemon', strength: 82, toneHex: '#C8C15E' },
      { name: 'Crisp Lavender', strength: 60, toneHex: '#8B84A2' },
      { name: 'Sheer Musk', strength: 52, toneHex: '#A6ABA2' },
    ],
  },
  {
    id: 'ombre-leather',
    name: 'OMBRÉ LEATHER PARFUM',
    house: 'TOM FORD',
    concentration: 'Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Leather & Jasmine',
    fullBottleMl: 100,
    fullPriceBdt: 28800,
    liquidHex: '#593A2B',
    accentHex: '#C29A6A',
    image: './src/assets/images/sillux_cinema_banner_1795010746604.jpg',
    gallery: [
      './src/assets/images/sillux_cinema_banner_1795010746604.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '10–12 Hours',
    sillage: 'Supple Trail',
    tagline: 'Black Italian leather brightened by dewy violet leaf, night-blooming jasmine, and cedar.',
    notes: {
      top: ['Violet Leaf', 'Cedar'],
      heart: ['Jasmine Sambac', 'Orris'],
      base: ['Black Leather', 'Woody Notes', 'Tobacco'],
    },
    accords: [
      { name: 'Supple Leather', strength: 96, toneHex: '#6E4C3A' },
      { name: 'White Jasmine', strength: 78, toneHex: '#D6CEB8' },
      { name: 'Green Violet', strength: 72, toneHex: '#6F8466' },
      { name: 'Dry Cedar', strength: 64, toneHex: '#8C6C4E' },
      { name: 'Warm Tobacco', strength: 52, toneHex: '#946542' },
    ],
  },
  {
    id: 'delina-exclusif',
    name: 'DELINA EXCLUSIF',
    house: 'PARFUMS DE MARLY',
    concentration: 'Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Rose & Lychee',
    fullBottleMl: 100,
    fullPriceBdt: 36600,
    liquidHex: '#C97B84',
    accentHex: '#E8B8BE',
    image: './src/assets/images/sillux_film_scene_two_1795011473691.jpg',
    gallery: [
      './src/assets/images/sillux_film_scene_two_1795011473691.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '12 Hours',
    sillage: 'Velvet Floral',
    tagline: 'Dewy Turkish rose petals folded with velvety lychee, pear, incense smoke, and vanilla.',
    notes: {
      top: ['Lychee', 'Pear', 'Bergamot'],
      heart: ['Turkish Rose', 'Agarwood', 'Incense'],
      base: ['Vanilla', 'Amber', 'Woody Notes'],
    },
    accords: [
      { name: 'Turkish Rose', strength: 96, toneHex: '#C6747D' },
      { name: 'Velvet Vanilla', strength: 84, toneHex: '#DFB67E' },
      { name: 'Sweet Lychee', strength: 78, toneHex: '#D88D90' },
      { name: 'Soft Incense', strength: 66, toneHex: '#8E8278' },
      { name: 'Warm Amber', strength: 58, toneHex: '#B8844E' },
    ],
  },
  {
    id: 'tuscan-leather',
    name: 'TUSCAN LEATHER',
    house: 'TOM FORD',
    concentration: 'Eau de Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Saffron & Suede',
    fullBottleMl: 100,
    fullPriceBdt: 38400,
    liquidHex: '#7A3B2E',
    accentHex: '#CFA274',
    image: './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
    gallery: [
      './src/assets/images/sillux_film_scene_one_1795011473534.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    outOfStock: true,
    stockLabel: 'Sold Out',
    longevity: '12 Hours',
    sillage: 'Bold & Smoky',
    tagline: 'Raw Tuscan suede and wild raspberry leaf spiced with red saffron and night jasmine.',
    notes: {
      top: ['Raspberry', 'Saffron', 'Thyme'],
      heart: ['Olibanum', 'Night Jasmine'],
      base: ['Suede Leather', 'Black Suede', 'Amber'],
    },
    accords: [
      { name: 'Raw Leather', strength: 97, toneHex: '#7A4C3A' },
      { name: 'Tart Raspberry', strength: 82, toneHex: '#B24B58' },
      { name: 'Red Saffron', strength: 74, toneHex: '#C46E3E' },
      { name: 'Smoky Olibanum', strength: 64, toneHex: '#847464' },
      { name: 'Night Jasmine', strength: 50, toneHex: '#CFC4AA' },
    ],
  },
  {
    id: 'halfeti-penhaligons',
    name: 'HALFETI',
    house: "PENHALIGON'S",
    concentration: 'Eau de Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Black Rose & Oud',
    fullBottleMl: 100,
    fullPriceBdt: 33000,
    liquidHex: '#64382A',
    accentHex: '#D2A66C',
    image: './src/assets/images/sillux_cinema_banner_1795010746604.jpg',
    gallery: [
      './src/assets/images/sillux_cinema_banner_1795010746604.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '11 Hours',
    sillage: 'Exotic Trail',
    tagline: 'Rare Turkish black rose threaded with cypress, warm cardamom, leather, and oud.',
    notes: {
      top: ['Cypress', 'Saffron', 'Cardamom', 'Bergamot'],
      heart: ['Bulgarian Rose', 'Nutmeg', 'Jasmine'],
      base: ['Agarwood', 'Leather', 'Cedar', 'Tonka Bean'],
    },
    accords: [
      { name: 'Spiced Woods', strength: 94, toneHex: '#8E6240' },
      { name: 'Black Rose', strength: 86, toneHex: '#A6545B' },
      { name: 'Warm Cardamom', strength: 78, toneHex: '#B68A52' },
      { name: 'Smoky Leather', strength: 70, toneHex: '#6F4E3C' },
      { name: 'Resinous Oud', strength: 64, toneHex: '#7D5C3E' },
    ],
  },
  {
    id: 'gris-charnel-extrait',
    name: 'GRIS CHARNEL EXTRAIT',
    house: 'BDK PARFUMS',
    concentration: 'Extrait de Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Fig & Cardamom',
    fullBottleMl: 100,
    fullPriceBdt: 34200,
    liquidHex: '#8A7356',
    accentHex: '#D6BE96',
    image: './src/assets/images/atelier_decanting_craft_1795009105859.jpg',
    gallery: [
      './src/assets/images/atelier_decanting_craft_1795009105859.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: false,
    hiddenFromHome: true,
    longevity: '11–12 Hours',
    sillage: 'Velvet Intimate',
    tagline: 'Green fig and smoky black tea enriched with Florentine iris, cedar, and patchouli.',
    notes: {
      top: ['Cardamom', 'Black Tea', 'Green Fig'],
      heart: ['Florentine Iris', 'Bourbon Vetiver', 'Cistus'],
      base: ['Sandalwood', 'Madagascar Vanilla', 'Patchouli'],
    },
    accords: [
      { name: 'Creamy Woods', strength: 92, toneHex: '#9C8262' },
      { name: 'Spiced Cardamom', strength: 86, toneHex: '#B6935E' },
      { name: 'Black Tea', strength: 80, toneHex: '#7A5E42' },
      { name: 'Powdery Iris', strength: 72, toneHex: '#ABA09C' },
      { name: 'Dark Vanilla', strength: 64, toneHex: '#C99F66' },
    ],
  },
  // 15 separate empty Best Seller perfume slots for individual product photos
  {
    id: 'hawas-ice-rasasi',
    name: 'HAWAS ICE',
    house: 'RASASI',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Icy Citrus & Amber',
    fullBottleMl: 100,
    fullPriceBdt: 3900,
    sizePricesBdt: {
      '3ML': 245,
      '5ML': 358,
      '10ML': 588,
      '15ML': 818,
      '30ML': 1448,
      FULL: 3900,
    },
    liquidHex: '#4C8CC4',
    accentHex: '#A7D1EC',
    image: './src/assets/images/regenerated_image_1795093608084.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795093608084.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 12,
    longevity: '10–12 Hours',
    sillage: 'Crisp & Projected',
    tagline: 'Chilled Sicilian bergamot and frozen apple layered over spiced plum, orange blossom, and ambergris.',
    notes: {
      top: ['Frozen Apple', 'Italian Lemon', 'Sicilian Bergamot', 'Star Anise'],
      heart: ['Plum', 'Orange Blossom', 'Cardamom'],
      base: ['Driftwood', 'Amber', 'Moss', 'Musk'],
    },
    accords: [
      { name: 'Icy Citrus', strength: 95, toneHex: '#7CC0D8' },
      { name: 'Fruity Plum', strength: 84, toneHex: '#8E648E' },
      { name: 'Aromatic Spice', strength: 74, toneHex: '#B68A52' },
      { name: 'Clean Musk', strength: 68, toneHex: '#9BA8B2' },
      { name: 'Woody Amber', strength: 60, toneHex: '#B88B58' },
    ],
  },
  {
    id: 'blonde-amber-clive-christian',
    name: 'BLONDE AMBER',
    house: 'CLIVE CHRISTIAN',
    concentration: 'Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Blonde Tobacco & Amber',
    fullBottleMl: 100,
    fullPriceBdt: 49500,
    liquidHex: '#B66E2E',
    accentHex: '#E2B46E',
    image: './src/assets/images/regenerated_image_1795093717637.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795093717637.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 13,
    longevity: '12+ Hours',
    sillage: 'Opulent & Velvet',
    tagline: 'Sun-warmed blonde tobacco and dark aged rum steeped with dried fruits, saffron, and golden amber.',
    notes: {
      top: ['Aged Rum', 'Olibanum', 'Bitter Orange', 'Pink Pepper'],
      heart: ['Blonde Tobacco', 'Dried Fruits', 'Sandalwood', 'Saffron'],
      base: ['Ambergris', 'Tonka Bean', 'Madagascar Vanilla', 'Myrrh'],
    },
    accords: [
      { name: 'Golden Amber', strength: 96, toneHex: '#C97B3A' },
      { name: 'Blonde Tobacco', strength: 88, toneHex: '#9C683D' },
      { name: 'Spiced Rum', strength: 80, toneHex: '#A84E2C' },
      { name: 'Dried Fruits', strength: 72, toneHex: '#8E4944' },
      { name: 'Warm Vanilla', strength: 64, toneHex: '#D8A860' },
    ],
  },
  {
    id: 'city-of-stars-lv',
    name: 'CITY OF STARS',
    house: 'LOUIS VUITTON',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Citrus & Tiare Flower',
    fullBottleMl: 100,
    fullPriceBdt: 40800,
    liquidHex: '#DF7F78',
    accentHex: '#C3A2D4',
    image: './src/assets/images/regenerated_image_1795093805477.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795093805477.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 14,
    longevity: '8–10 Hours',
    sillage: 'Luminous Dusk',
    tagline: 'Blood orange, red mandarin, and sparkling lime glowing over warm tiare flower, powdery musk, and sandalwood.',
    notes: {
      top: ['Blood Orange', 'Lime', 'Red Mandarin', 'Bergamot'],
      heart: ['Tiare Flower'],
      base: ['Powdery Musk', 'Sandalwood'],
    },
    accords: [
      { name: 'Sparkling Citrus', strength: 96, toneHex: '#E08858' },
      { name: 'Tiare Blossom', strength: 84, toneHex: '#D8B4C6' },
      { name: 'Powdery Musk', strength: 74, toneHex: '#B6A8B8' },
      { name: 'Creamy Sandalwood', strength: 64, toneHex: '#CFAF7D' },
      { name: 'Sunset Mandarin', strength: 58, toneHex: '#E29864' },
    ],
  },
  {
    id: 'supremacy-incense-afnan',
    name: 'SUPREMACY INCENSE',
    house: 'AFNAN',
    concentration: 'Eau de Parfum',
    family: 'Oud & Wood',
    displayFamily: 'Smoky Incense & Herbs',
    fullBottleMl: 100,
    fullPriceBdt: 16500,
    liquidHex: '#1A4B52',
    accentHex: '#94B6BA',
    image: './src/assets/images/regenerated_image_1795093905299.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795093905299.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 15,
    longevity: '12+ Hours',
    sillage: 'Monolithic Smoke',
    tagline: 'Resinous opoponax and charred incense smoke cut with crushed oregano, dark amber, and smoked leather.',
    notes: {
      top: ['Oregano', 'Herbal Notes', 'Spices', 'Bergamot'],
      heart: ['Opoponax', 'Amber', 'Labdanum'],
      base: ['Smoky Incense', 'Agarwood', 'Leather', 'Patchouli'],
    },
    accords: [
      { name: 'Sacred Incense', strength: 95, toneHex: '#5E6E74' },
      { name: 'Smoky Resins', strength: 88, toneHex: '#7A5B3E' },
      { name: 'Aromatic Herbs', strength: 78, toneHex: '#4E6B5C' },
      { name: 'Dark Agarwood', strength: 70, toneHex: '#6E4C36' },
      { name: 'Warm Amber', strength: 62, toneHex: '#C2935B' },
    ],
  },
  {
    id: 'aariz-arabiyat-prestige',
    name: 'AARIZ',
    house: 'ARABIYAT PRESTIGE',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Velvet Amber & Vanilla',
    fullBottleMl: 100,
    fullPriceBdt: 15500,
    liquidHex: '#C9A46A',
    accentHex: '#E6CE9E',
    image: './src/assets/images/regenerated_image_1795094017576.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094017576.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 16,
    longevity: '10–12 Hours',
    sillage: 'Warm & Luminous',
    tagline: 'Creamy golden amber and whipped Madagascar vanilla spiced with cardamom, rose petals, and cashmere woods.',
    notes: {
      top: ['Cardamom', 'Orange Blossom', 'Ginger'],
      heart: ['Damask Rose', 'Caramel', 'Cinnamon'],
      base: ['Golden Amber', 'Madagascar Vanilla', 'Sandalwood', 'White Musk'],
    },
    accords: [
      { name: 'Golden Amber', strength: 94, toneHex: '#C9954E' },
      { name: 'Creamy Vanilla', strength: 88, toneHex: '#E2BA74' },
      { name: 'Warm Spice', strength: 76, toneHex: '#B67B42' },
      { name: 'Velvet Rose', strength: 68, toneHex: '#C48286' },
      { name: 'Cashmere Woods', strength: 60, toneHex: '#9C8262' },
    ],
  },
  {
    id: 'mahd-al-dhahab-arabiyat-prestige',
    name: 'MAHD AL DHAHAB',
    house: 'ARABIYAT PRESTIGE',
    concentration: 'Extrait de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Golden Honey & Vanilla',
    fullBottleMl: 100,
    fullPriceBdt: 16500,
    liquidHex: '#C9963A',
    accentHex: '#EDD082',
    image: './src/assets/images/regenerated_image_1795094119541.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094119541.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 17,
    longevity: '12+ Hours',
    sillage: 'Golden Opulence',
    tagline: 'Molten golden honey and aged cognac spiced with crushed cardamom, cinnamon bark, and bourbon vanilla.',
    notes: {
      top: ['Red Berries', 'Nutmeg', 'Cardamom', 'Cognac'],
      heart: ['Golden Honey', 'Cinnamon', 'Orris', 'Jasmine'],
      base: ['Bourbon Vanilla', 'Amber', 'Cedarwood', 'Tonka Bean'],
    },
    accords: [
      { name: 'Golden Honey', strength: 95, toneHex: '#D8A648' },
      { name: 'Warm Vanilla', strength: 88, toneHex: '#DFB66E' },
      { name: 'Spiced Cognac', strength: 80, toneHex: '#B66932' },
      { name: 'Molten Amber', strength: 74, toneHex: '#C97B3A' },
      { name: 'Creamy Tonka', strength: 62, toneHex: '#A57C52' },
    ],
  },
  {
    id: 'sauvage-dior',
    name: 'SAUVAGE',
    house: 'DIOR',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Bergamot & Ambroxan',
    fullBottleMl: 100,
    fullPriceBdt: 22500,
    liquidHex: '#2A3E59',
    accentHex: '#94AECC',
    image: './src/assets/images/regenerated_image_1795094224017.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094224017.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 18,
    longevity: '10–12 Hours',
    sillage: 'Commanding & Crisp',
    tagline: 'Radiant Calabrian bergamot and crushed Sichuan pepper wrapped in smoky ambroxan and Papua vanilla.',
    notes: {
      top: ['Calabrian Bergamot', 'Sichuan Pepper'],
      heart: ['Lavender', 'Star Anise', 'Nutmeg', 'Pink Pepper'],
      base: ['Ambroxan', 'Papua Vanilla', 'Cedarwood'],
    },
    accords: [
      { name: 'Fresh Bergamot', strength: 95, toneHex: '#7BA8C4' },
      { name: 'Warm Ambroxan', strength: 90, toneHex: '#5C748C' },
      { name: 'Aromatic Pepper', strength: 82, toneHex: '#948674' },
      { name: 'Crisp Lavender', strength: 70, toneHex: '#7C869E' },
      { name: 'Subtle Vanilla', strength: 58, toneHex: '#D8B67A' },
    ],
  },
  {
    id: 'lynked-freedom',
    name: 'LYNKED FREEDOM',
    house: 'SIGNATURE EDITION',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Bergamot & White Woods',
    fullBottleMl: 100,
    fullPriceBdt: 14500,
    liquidHex: '#B8B478',
    accentHex: '#DFDCB2',
    image: './src/assets/images/regenerated_image_1795094329227.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094329227.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 19,
    longevity: '9–10 Hours',
    sillage: 'Crisp & Tailored',
    tagline: 'Radiant Calabrian bergamot and neroli blossom resting on aromatic clary sage, cedarwood, and clean ambergris.',
    notes: {
      top: ['Calabrian Bergamot', 'Green Mandarin', 'Pink Pepper'],
      heart: ['Orange Blossom', 'Clary Sage', 'Lavender'],
      base: ['White Cedarwood', 'Patchouli', 'Ambroxan'],
    },
    accords: [
      { name: 'Fresh Citrus', strength: 94, toneHex: '#B8C46E' },
      { name: 'White Floral', strength: 84, toneHex: '#D8CFAF' },
      { name: 'Aromatic Sage', strength: 76, toneHex: '#7A8E6E' },
      { name: 'Dry Woods', strength: 68, toneHex: '#8E7456' },
      { name: 'Clean Ambroxan', strength: 60, toneHex: '#8FA3AE' },
    ],
  },
  {
    id: 'y-edp-ysl',
    name: 'Y EAU DE PARFUM',
    house: 'YVES SAINT LAURENT',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Apple & Sage & Wood',
    fullBottleMl: 100,
    fullPriceBdt: 22800,
    liquidHex: '#2E4764',
    accentHex: '#94B0CC',
    image: './src/assets/images/regenerated_image_1795094448170.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094448170.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 20,
    longevity: '10 Hours',
    sillage: 'Clean & Magnetic',
    tagline: 'Crisp green apple and sharp ginger contrasted against aromatic clary sage, juniper, and rich amberwood.',
    notes: {
      top: ['Crisp Apple', 'Ginger', 'Bergamot'],
      heart: ['Sage', 'Juniper Berries', 'Geranium'],
      base: ['Amberwood', 'Tonka Bean', 'Cedar', 'Olibanum'],
    },
    accords: [
      { name: 'Aromatic Sage', strength: 95, toneHex: '#647E74' },
      { name: 'Fresh Apple', strength: 88, toneHex: '#9CB36B' },
      { name: 'Warm Amberwood', strength: 80, toneHex: '#7A654E' },
      { name: 'Crisp Ginger', strength: 72, toneHex: '#C9955A' },
      { name: 'Cedar & Tonka', strength: 64, toneHex: '#8E7258' },
    ],
  },
  {
    id: 'percival-pdm',
    name: 'PERCIVAL',
    house: 'PARFUMS DE MARLY',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Aromatic Citrus & Musk',
    fullBottleMl: 100,
    fullPriceBdt: 33600,
    liquidHex: '#285284',
    accentHex: '#94B6DE',
    image: './src/assets/images/regenerated_image_1795094582759.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094582759.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 21,
    longevity: '9–11 Hours',
    sillage: 'Crisp & Radiant',
    tagline: 'Bright Mediterranean mandarin and lavender lifted over clean jasmine, balsam fir, and smooth ambroxan.',
    notes: {
      top: ['Bergamot', 'Mandarin', 'Pink Pepper', 'Lavender'],
      heart: ['Jasmine', 'Violet', 'Geranium'],
      base: ['Ambroxan', 'Balsam Fir', 'Musk', 'Nutmeg'],
    },
    accords: [
      { name: 'Fresh Citrus', strength: 94, toneHex: '#7BA8C4' },
      { name: 'Aromatic Lavender', strength: 86, toneHex: '#84789C' },
      { name: 'Clean Ambroxan', strength: 80, toneHex: '#647C94' },
      { name: 'Balsam Fir', strength: 68, toneHex: '#5E7C64' },
      { name: 'Warm Musk', strength: 60, toneHex: '#9BA8B2' },
    ],
  },
  {
    id: 'vibrato-sospiro',
    name: 'VIBRATO',
    house: 'SOSPIRO',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Grapefruit & Ginger & Musk',
    fullBottleMl: 100,
    fullPriceBdt: 32500,
    liquidHex: '#1F6B43',
    accentHex: '#9CC9AC',
    image: './src/assets/images/regenerated_image_1795094694540.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094694540.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 22,
    longevity: '12+ Hours',
    sillage: 'Radiant & Crisp',
    tagline: 'Sparkling pink grapefruit and zesty fresh ginger softened by powdery orris, magnolia, and clean white musk.',
    notes: {
      top: ['Grapefruit', 'Calabrian Bergamot', 'Magnolia', 'Jasmine'],
      heart: ['Fresh Ginger', 'Powdery Notes', 'Green Notes'],
      base: ['White Musk', 'Cedar', 'Amber', 'Orris Root'],
    },
    accords: [
      { name: 'Sparkling Citrus', strength: 96, toneHex: '#D8B34A' },
      { name: 'Zesty Ginger', strength: 88, toneHex: '#C9955A' },
      { name: 'Clean Musk', strength: 80, toneHex: '#9BA8B2' },
      { name: 'Powdery Iris', strength: 70, toneHex: '#ABA09C' },
      { name: 'Warm Cedar', strength: 60, toneHex: '#8E7258' },
    ],
  },
  {
    id: 'myslf-edp-ysl',
    name: 'MYSLF EAU DE PARFUM',
    house: 'YVES SAINT LAURENT',
    concentration: 'Eau de Parfum',
    family: 'Floral & Leather',
    displayFamily: 'Orange Blossom & Woods',
    fullBottleMl: 100,
    fullPriceBdt: 22800,
    liquidHex: '#2A2B2F',
    accentHex: '#B6BAC4',
    image: './src/assets/images/regenerated_image_1795094798370.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094798370.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 23,
    longevity: '8–10 Hours',
    sillage: 'Sleek & Radiant',
    tagline: 'Vibrant Calabrian bergamot brightening luminous Tunisian orange blossom over textured patchouli and ambrofix.',
    notes: {
      top: ['Calabrian Bergamot', 'Green Bergamot'],
      heart: ['Tunisian Orange Blossom'],
      base: ['Ambrofix', 'Indonesian Patchouli', 'Warm Woods'],
    },
    accords: [
      { name: 'Orange Blossom', strength: 95, toneHex: '#D8CFAF' },
      { name: 'Fresh Bergamot', strength: 88, toneHex: '#A8C26E' },
      { name: 'Clean Ambrofix', strength: 80, toneHex: '#8FA3AE' },
      { name: 'Woody Patchouli', strength: 70, toneHex: '#7A6852' },
      { name: 'Sheer Musk', strength: 62, toneHex: '#A6ABA2' },
    ],
  },
  {
    id: 'liam-lattafa',
    name: 'LIAM',
    house: 'LATTAFA',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Fig, Tea & Sandalwood',
    fullBottleMl: 100,
    fullPriceBdt: 13500,
    liquidHex: '#B5A488',
    accentHex: '#DCD2BF',
    image: './src/assets/images/regenerated_image_1795094901489.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795094901489.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 24,
    longevity: '9–11 Hours',
    sillage: 'Velvet Spiced',
    tagline: 'Creamy green fig and spiced black tea folded over powdery iris, Bourbon vetiver, and smooth sandalwood.',
    notes: {
      top: ['Cardamom', 'Green Fig', 'Black Tea'],
      heart: ['Iris', 'Vetiver', 'Labdanum'],
      base: ['Sandalwood', 'Madagascar Vanilla', 'Tonka Bean', 'Patchouli'],
    },
    accords: [
      { name: 'Creamy Sandalwood', strength: 94, toneHex: '#B59E7A' },
      { name: 'Spiced Cardamom', strength: 86, toneHex: '#B6935E' },
      { name: 'Black Tea', strength: 82, toneHex: '#7A5E42' },
      { name: 'Powdery Iris', strength: 74, toneHex: '#ABA09C' },
      { name: 'Warm Vanilla', strength: 64, toneHex: '#D8B67A' },
    ],
  },
  {
    id: 'tobacco-vanille-50ml-tf',
    name: 'TOBACCO VANILLE (50ML)',
    house: 'TOM FORD',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Tobacco Leaf, Vanilla & Cacao',
    fullBottleMl: 50,
    fullPriceBdt: 28500,
    liquidHex: '#4E2614',
    accentHex: '#C9A25D',
    image: './src/assets/images/regenerated_image_1795165576399.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795165576399.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 25,
    longevity: '12+ Hours',
    sillage: 'Velvet Rich',
    tagline: 'Private Blend spiced tobacco leaves infused with crushed clove, creamy tonka bean, cacao, and rich vanilla.',
    notes: {
      top: ['Tobacco Leaf', 'Warm Spices'],
      heart: ['Vanilla', 'Cacao', 'Tonka Bean', 'Tobacco Blossom'],
      base: ['Dried Fruits', 'Sweet Woods'],
    },
    accords: [
      { name: 'Rich Tobacco', strength: 96, toneHex: '#7D482E' },
      { name: 'Sweet Vanilla', strength: 90, toneHex: '#D8A95F' },
      { name: 'Warm Cacao', strength: 78, toneHex: '#694436' },
      { name: 'Clove & Spice', strength: 72, toneHex: '#A86238' },
      { name: 'Dried Fruit', strength: 60, toneHex: '#8E4944' },
    ],
  },
  {
    id: 'tiger-rayhaan',
    name: 'TIGER',
    house: 'RAYHAAN',
    concentration: 'Eau de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Spiced Nutmeg, Rose & Amber',
    fullBottleMl: 100,
    fullPriceBdt: 13500,
    liquidHex: '#B85A1E',
    accentHex: '#E39A5C',
    image: './src/assets/images/regenerated_image_1795165697337.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795165697337.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 26,
    longevity: '10–12 Hours',
    sillage: 'Bold & Spiced',
    tagline: 'Fiery nutmeg and clove over smoky incense, velvety rose, golden amber, and supple dark patchouli.',
    notes: {
      top: ['Nutmeg', 'Clove', 'Zesty Lemon'],
      heart: ['Turkish Rose', 'Milk Accord', 'Saffron'],
      base: ['Smoky Incense', 'Golden Amber', 'Patchouli', 'Labdanum'],
    },
    accords: [
      { name: 'Warm Spices', strength: 95, toneHex: '#C66828' },
      { name: 'Golden Amber', strength: 88, toneHex: '#D89648' },
      { name: 'Smoky Incense', strength: 82, toneHex: '#7A543E' },
      { name: 'Velvet Rose', strength: 72, toneHex: '#A64D58' },
      { name: 'Earthy Patchouli', strength: 66, toneHex: '#6E5A44' },
    ],
  },
  // 20 additional empty separate Best Seller perfume slots
  {
    id: 'azure-royal-afnan',
    name: 'AZURE ROYAL',
    house: 'AFNAN',
    concentration: 'Eau de Parfum',
    family: 'Fresh & Citrus',
    displayFamily: 'Pear, Bergamot & Ambroxan',
    fullBottleMl: 100,
    fullPriceBdt: 13500,
    liquidHex: '#123B8A',
    accentHex: '#7FB2F0',
    image: './src/assets/images/regenerated_image_1795165799109.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795165799109.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 27,
    longevity: '8–10 Hours',
    sillage: 'Crisp & Luminous',
    tagline: 'Juicy chilled pear and sparkling bergamot lifted by clean orange blossom, ambroxan, and royal cedarwood.',
    notes: {
      top: ['Bergamot', 'Chilled Pear', 'Mandarin Orange'],
      heart: ['Orange Blossom', 'Ambroxan', 'Geranium'],
      base: ['Atlas Cedar', 'Ambergris', 'Crisp Musk', 'Vetiver'],
    },
    accords: [
      { name: 'Fresh Citrus', strength: 94, toneHex: '#6CA6E8' },
      { name: 'Orchard Pear', strength: 86, toneHex: '#9AC974' },
      { name: 'Marine Ambergris', strength: 82, toneHex: '#4A7EB8' },
      { name: 'Orange Blossom', strength: 74, toneHex: '#D8CFA8' },
      { name: 'Royal Cedar', strength: 64, toneHex: '#7A6B56' },
    ],
  },
  {
    id: 'pure-musk-afnan',
    name: 'PURE MUSK',
    house: 'AFNAN',
    concentration: 'Eau de Parfum',
    family: 'Floral & Leather',
    displayFamily: 'White Musk, Soft Florals & Vanilla',
    fullBottleMl: 100,
    fullPriceBdt: 12800,
    liquidHex: '#EAE7E0',
    accentHex: '#B8BDC4',
    image: './src/assets/images/regenerated_image_1795165926076.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795165926076.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 28,
    longevity: '8–10 Hours',
    sillage: 'Clean & Velvety',
    tagline: 'Luminous clouds of airy white musk layered over delicate ivory florals, sheer vanilla, and creamy white woods.',
    notes: {
      top: ['White Musk', 'Soft White Florals'],
      heart: ['Powdery Musk', 'Natural Vanilla'],
      base: ['Clean Musk', 'White Woods', 'Ambergris'],
    },
    accords: [
      { name: 'White Musk', strength: 98, toneHex: '#D8D6D0' },
      { name: 'Powdery Veil', strength: 86, toneHex: '#C4BEC2' },
      { name: 'Sheer Florals', strength: 76, toneHex: '#E3D5CE' },
      { name: 'Soft Vanilla', strength: 68, toneHex: '#DFC99E' },
      { name: 'Clean Woods', strength: 60, toneHex: '#9EA3A8' },
    ],
  },
  {
    id: 'tobacco-01-swiss-arabian',
    name: 'TOBACCO 01',
    house: 'SWISS ARABIAN',
    concentration: 'Extrait de Parfum',
    family: 'Amber & Spice',
    displayFamily: 'Spiced Tobacco, Plum & Honey',
    fullBottleMl: 50,
    fullPriceBdt: 17500,
    liquidHex: '#4A3628',
    accentHex: '#C29B61',
    image: './src/assets/images/regenerated_image_1795166043804.jpg',
    gallery: [
      './src/assets/images/regenerated_image_1795166043804.jpg',
      './src/assets/images/sillux_decant_vial_1795020000257.jpg',
      './src/assets/images/regenerated_image_1795022153510.png',
    ],
    trending: true,
    isBestSeller: true,
    bestSellerOnly: true,
    bestsellerRank: 29,
    longevity: '12+ Hours',
    sillage: 'Opulent & Honeyed',
    tagline: 'Dark spiced plum and licorice melting into molten golden honey, aromatic tobacco leaf, amber, and cashmere wood.',
    notes: {
      top: ['Dark Plum', 'Licorice', 'Pink Pepper', 'Cumin'],
      heart: ['Golden Amber', 'Ylang-Ylang', 'Labdanum', 'Patchouli'],
      base: ['Tobacco Leaf', 'Raw Honey', 'Madagascar Vanilla', 'Cashmere Wood'],
    },
    accords: [
      { name: 'Sweet Tobacco', strength: 96, toneHex: '#6E4730' },
      { name: 'Golden Honey', strength: 88, toneHex: '#D19A44' },
      { name: 'Spiced Plum', strength: 80, toneHex: '#7A3E4E' },
      { name: 'Resinous Amber', strength: 74, toneHex: '#B67B3E' },
      { name: 'Cashmere Wood', strength: 64, toneHex: '#8C7A68' },
    ],
  },
];

export const CURRENCY_CODE = 'BDT';
export const CURRENCY_SYMBOL = '৳';

export function formatBdt(amount: number): string {
  return `${CURRENCY_SYMBOL}${Math.round(amount).toLocaleString('en-US')}`;
}

export function getMlSelectorBannerImage(perfume: Perfume, sizeId: PerfumeSizeId): string {
  const sizeOpt = PERFUME_SIZES.find((s) => s.id === sizeId);
  if (sizeId === 'FULL') {
    return perfume.mlSizeImages?.FULL || sizeOpt?.image || perfume.image;
  }
  return (
    perfume.mlSizeImages?.[sizeId] ||
    sizeOpt?.image ||
    perfume.mlBannerImage ||
    perfume.image
  );
}

export function getPerfumeGallery(perfume: Perfume): string[] {
  if (perfume.gallery && perfume.gallery.length >= 3) {
    return perfume.gallery.slice(0, 3);
  }
  return [
    perfume.image,
    './src/assets/images/sillux_decant_vial_1795020000257.jpg',
    './src/assets/images/regenerated_image_1795022153510.png',
  ];
}

export function getPriceForSize(perfume: Perfume, sizeId: PerfumeSizeId): number {
  const explicitPrice = perfume.sizePricesBdt?.[sizeId];
  if (typeof explicitPrice === 'number') return explicitPrice;
  const size = PERFUME_SIZES.find((s) => s.id === sizeId) ?? PERFUME_SIZES[2];
  if (size.id === 'FULL') return perfume.fullPriceBdt;
  return Math.round((perfume.fullPriceBdt * size.priceMultiplier) / 50) * 50;
}

export function getVisibleSizesForPerfume(perfume: Perfume): PerfumeSizeOption[] {
  if (!perfume.hiddenSizes?.length) return PERFUME_SIZES;
  return PERFUME_SIZES.filter((s) => !perfume.hiddenSizes!.includes(s.id));
}

export function isSizeOutOfStock(perfume: Perfume, sizeId: PerfumeSizeId): boolean {
  if (perfume.outOfStock) return true;
  if (perfume.hiddenSizes?.includes(sizeId)) return true;
  return Boolean(perfume.outOfStockSizes?.includes(sizeId));
}

export function isPerfumeFullyOutOfStock(perfume: Perfume): boolean {
  if (perfume.outOfStock) return true;
  const visibleSizes = getVisibleSizesForPerfume(perfume);
  return visibleSizes.every((s) => isSizeOutOfStock(perfume, s.id));
}

export function getStockLabel(perfume: Perfume): string {
  return perfume.stockLabel ?? 'Stock Out';
}

export function getFirstAvailableSize(
  perfume: Perfume,
  preferred: PerfumeSizeId = '10ML'
): PerfumeSizeId {
  const visibleSizes = getVisibleSizesForPerfume(perfume);
  if (visibleSizes.some((s) => s.id === preferred) && !isSizeOutOfStock(perfume, preferred)) {
    return preferred;
  }
  const available = visibleSizes.find((s) => !isSizeOutOfStock(perfume, s.id));
  return available ? available.id : visibleSizes[0]?.id ?? preferred;
}

export function sortBestSellersFirst(list: Perfume[]): Perfume[] {
  return [...list].sort((a, b) => {
    const aBest = a.isBestSeller ? 1 : 0;
    const bBest = b.isBestSeller ? 1 : 0;
    if (aBest !== bBest) return bBest - aBest;
    return (a.bestsellerRank ?? 99) - (b.bestsellerRank ?? 99);
  });
}

export function normalizePerfumeImageKey(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  return trimmed
    .replace(/^\.\//, '/')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase();
}

export function getUniquePerfumesByImage(list: Perfume[]): Perfume[] {
  const sorted = sortBestSellersFirst(list);
  const seenIds = new Set<string>();
  const seenImages = new Set<string>();
  return sorted.filter((perfume) => {
    const idKey = perfume.id.trim().toLowerCase();
    const imageKey = normalizePerfumeImageKey(perfume.image);
    if (!imageKey || seenIds.has(idKey) || seenImages.has(imageKey)) {
      return false;
    }
    seenIds.add(idKey);
    seenImages.add(imageKey);
    return true;
  });
}

export const DECANTING_STEPS = [
  {
    step: '01',
    title: 'Sealed Maison Sourcing',
    detail:
      'Every fragrance enters our climate-controlled vault directly from authorized niche houses and flagship boutiques, complete with verifiable batch codes.',
  },
  {
    step: '02',
    title: 'Sterile Glass Micro-Transfer',
    detail:
      'We extract directly through calibrated medical-grade borosilicate syringes—never spraying into open air—preserving delicate volatile top notes.',
  },
  {
    step: '03',
    title: 'Heavy-Wall Atomizer Sealing',
    detail:
      'Each 3ML, 5ML, 10ML, 15ML, and 30ML vessel is sealed with PTFE thread tape and high-pressure crimp brass collars to prevent evaporation.',
  },
  {
    step: '04',
    title: 'Full Presentation Coffrets',
    detail:
      'Choosing Full Bottle delivers the untouched, factory-cellophaned 100ML master flacon inside its original rigid presentation box and authenticity sleeve.',
  },
];

export const FAQ_ITEMS = [
  {
    q: 'Are all Sillux decants and full bottles 100% authentic?',
    a: 'Without exception. Every 3ML to 30ML decant is hand-drawn straight from original, batch-verified niche and designer master bottles housed in our vault. We never dilute, alter, or source grey-market imitations.',
  },
  {
    q: 'How is a decant different from a Full Bottle with Presentation?',
    a: 'Decants (3ML, 5ML, 10ML, 15ML, and 30ML) are transferred into Sillux heavy glass travel atomizers so you can live with a luxury scent before committing to a full flacon. Full Bottles arrive brand new, sealed in the original designer presentation box.',
  },
  {
    q: 'How many wears do I get from each ML size?',
    a: 'A 3ML vial yields ~45 sprays (about 10–15 wears), 5ML delivers ~75 sprays, 10ML gives ~150 sprays, 15ML offers ~225 sprays, 30ML collector decant lasts ~450 sprays, and a 100ML Full Bottle yields ~1,500 sprays.',
  },
  {
    q: 'How can I place an order or ask for scent recommendations?',
    a: 'Add your chosen sizes directly to your Sillux bag to check out, or message our fragrance concierge directly on WhatsApp or phone at 01954987111 for bespoke layering advice and same-day dispatch.',
  },
];

export const CONTACT_INFO = {
  phone: '01954987111',
  whatsappDisplay: '01954987111',
  whatsappInternational: '8801954987111',
  whatsappUrl: 'https://wa.me/8801954987111',
  telUrl: 'tel:01954987111',
  email: 'elitedrivebd1@gmail.com',
  mailtoUrl: 'mailto:elitedrivebd1@gmail.com',
  hours: 'Daily · 10:00 AM – 10:00 PM',
  studio: 'Sillux Fragrance Atelier · Private Decant Bar',
};

export type DeliveryZoneId = 'Dhaka' | 'Outside Dhaka';

export const DELIVERY_CHARGES_BDT: Record<DeliveryZoneId, number> = {
  Dhaka: 80,
  'Outside Dhaka': 150,
};

export interface OrderNotificationPayload {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryZone?: DeliveryZoneId;
  deliveryChargeBdt?: number;
  subtotalBdt?: number;
  itemsSummary: string[];
  totalBdt: number;
  paymentMethod: PaymentMethodId;
  paymentTrxId?: string;
  paymentSenderPhone?: string;
  createdAtIso?: string;
}

export function formatOrderAlertBody(order: OrderNotificationPayload): string {
  const paymentLine =
    order.paymentMethod === 'COD'
      ? 'Cash on Delivery (COD)'
      : `${order.paymentMethod}${order.paymentSenderPhone ? ` · Sender: ${order.paymentSenderPhone}` : ''}${
          order.paymentTrxId ? ` · TrxID: ${order.paymentTrxId}` : ''
        }`;

  const pricingLines =
    typeof order.deliveryChargeBdt === 'number'
      ? [
          ...(typeof order.subtotalBdt === 'number'
            ? [`Subtotal: ${formatBdt(order.subtotalBdt)} BDT`]
            : []),
          `Delivery Charge (${order.deliveryZone ?? 'Standard'}): ${formatBdt(
            order.deliveryChargeBdt
          )} BDT`,
          `Total Payable: ${formatBdt(order.totalBdt)} BDT`,
        ]
      : [`Total Payable: ${formatBdt(order.totalBdt)} BDT`];

  return [
    `NEW SILLUX ORDER (CONFIRMED): #${order.orderId}`,
    `Store Email: ${CONTACT_INFO.email}`,
    `Store WhatsApp: ${CONTACT_INFO.whatsappDisplay}`,
    '',
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Delivery Address: ${order.customerAddress}`,
    `Payment: ${paymentLine}`,
    '',
    'Ordered Fragrances:',
    ...order.itemsSummary.map((line) => `• ${line}`),
    '',
    ...pricingLines,
    `Placed At: ${order.createdAtIso ?? new Date().toISOString()}`,
  ].join('\n');
}

export function buildWhatsAppOrderAlertUrl(order: OrderNotificationPayload): string {
  return `${CONTACT_INFO.whatsappUrl}?text=${encodeURIComponent(formatOrderAlertBody(order))}`;
}

export function buildMailtoOrderAlertUrl(order: OrderNotificationPayload): string {
  const subject = `New Sillux Order #${order.orderId} · ${order.customerName} (${formatBdt(
    order.totalBdt
  )} BDT)`;
  return `${CONTACT_INFO.mailtoUrl}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    formatOrderAlertBody(order)
  )}`;
}

export type PaymentMethodId = 'COD' | 'bKash' | 'Nagad';

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  shortLabel: string;
  subtitle: string;
  walletNumber?: string;
  accentHex: string;
  instructions: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'COD',
    label: 'Cash on Delivery',
    shortLabel: 'COD',
    subtitle: 'Pay in cash when parcel arrives',
    accentHex: '#8C641E',
    instructions:
      'Inspect your outer Sillux seal on delivery and settle the full amount in cash directly with the courier.',
  },
  {
    id: 'bKash',
    label: 'bKash',
    shortLabel: 'bKash',
    subtitle: 'Instant mobile wallet transfer',
    walletNumber: '01954987111',
    accentHex: '#D12053',
    instructions:
      'Open bKash App → Send Money / Payment to 01954987111, then enter your sender number and TrxID below.',
  },
  {
    id: 'Nagad',
    label: 'Nagad',
    shortLabel: 'Nagad',
    subtitle: 'Fast Nagad wallet transfer',
    walletNumber: '01954987111',
    accentHex: '#E84A27',
    instructions:
      'Open Nagad App → Send Money / Payment to 01954987111, then enter your sender number and TrxID below.',
  },
];

export const AUTHENTICITY_PILLARS = [
  {
    code: '01',
    title: 'Authorized Maison Provenance',
    detail:
      'Every 100ML master flacon in the Sillux vault is procured directly from official perfumery houses, flagship boutiques, and verified authorized distributors with full invoice traceability.',
  },
  {
    code: '02',
    title: 'Batch Code & Serial Verification',
    detail:
      'All full presentation boxes and decant source flacons carry etched or stamped production batch codes. Upon request via WhatsApp (01954987111), we photograph your exact bottle batch code prior to dispatch.',
  },
  {
    code: '03',
    title: 'Zero Dilution & Pure Extraction',
    detail:
      'Our 3ML, 5ML, 10ML, 15ML, and 30ML atomizers contain 100% pure, unaltered fragrance liquid drawn directly via sterile borosilicate syringes—never topped with alcohol, carrier oils, or fixatives.',
  },
  {
    code: '04',
    title: 'Lifetime Authenticity Guarantee',
    detail:
      'We stand behind every drop we pour and every sealed coffret we ship. Should any independent maison inspection ever question provenance, Sillux issues a full 100% refund immediately.',
  },
];

export const REFUND_POLICY_ITEMS = [
  {
    code: '01',
    category: '100ML Full Bottles with Presentation',
    window: '7-Day Return Window',
    detail:
      'Full 100ML presentation bottles may be returned for a full refund or exchange within 7 calendar days of delivery, provided the outer factory cellophane seal, magnetic coffret, and bottle remain completely unopened and unused.',
  },
  {
    code: '02',
    category: 'Custom Decants (3ML, 5ML, 10ML, 15ML, 30ML)',
    window: 'Made-to-Order Policy',
    detail:
      'Because every 3ML to 30ML decant is freshly hand-extracted to order from a master flacon, opened or sprayed decants cannot be returned for scent-preference reasons to protect hygiene and formula integrity.',
  },
  {
    code: '03',
    category: 'Transit Damage, Leakage & Wrong Scent',
    window: '48-Hour Instant Coverage',
    detail:
      'If a bottle or atomizer arrives damaged, leaking, with a faulty sprayer, or incorrect, message our concierge on WhatsApp (01954987111) within 48 hours of delivery with unboxing photos for a complimentary replacement or full refund.',
  },
  {
    code: '04',
    category: 'Refund Inspection & Payout Timeline',
    window: '3–5 Business Days',
    detail:
      'Once a qualifying return reaches our atelier and passes seal inspection, refunds are processed back to your original payment method or mobile wallet within 3 to 5 business days with confirmation sent directly.',
  },
];

