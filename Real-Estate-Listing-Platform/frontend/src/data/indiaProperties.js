export const INDIAN_AGENTS = [
  { _id: 'agent-mira', name: 'Mira Shah', agency: 'GharFind Mumbai', phone: '+91 98200 44120', email: 'mira.shah@gharfind.in', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=85', bio: 'Specialising in established neighbourhoods and sea-facing luxury residences across Mumbai.' },
  { _id: 'agent-arya', name: 'Arya Menon', agency: 'GharFind South', phone: '+91 98450 22810', email: 'arya.menon@gharfind.in', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=85', bio: 'Local property advisor representing villas and prime homes in Bengaluru, Hyderabad and Chennai.' },
  { _id: 'agent-kabir', name: 'Kabir Sethi', agency: 'GharFind North', phone: '+91 98100 71340', email: 'kabir.sethi@gharfind.in', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=85', bio: 'Residential advisor guiding buyers and investors across Delhi NCR, Gurugram and Rajasthan.' }
];

const residenceImages = {
  modern: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85'
  ],
  apartment: [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85'
  ],
  heritage: [
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85'
  ]
};

export const INDIA_PROPERTIES = [
  {
    _id: 'india-001', id: 'india-001', title: 'Sea-facing residence in Worli', description: 'A considered high-floor home with broad Arabian Sea views, a private lift lobby, generous entertaining spaces and resident access to a swimming pool, fitness studio and concierge.', price: 68500000, type: 'sale', propertyType: 'apartment', bedrooms: 4, bathrooms: 4, areaSqft: 3180, address: { street: 'Worli Sea Face', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400030' }, location: { type: 'Point', coordinates: [72.8174, 19.0112] }, images: residenceImages.apartment, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: true, agent: INDIAN_AGENTS[0], createdAt: '2026-08-21T10:00:00.000Z'
  },
  {
    _id: 'india-002', id: 'india-002', title: 'Garden villa near Indiranagar', description: 'A private contemporary home set on a tree-lined street, with an inner courtyard, shaded deck and flexible study. Close to Bengaluru’s dining and design districts.', price: 42500000, type: 'sale', propertyType: 'villa', bedrooms: 4, bathrooms: 5, areaSqft: 3650, address: { street: 'Defence Colony, Indiranagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560038' }, location: { type: 'Point', coordinates: [77.6408, 12.9784] }, images: residenceImages.modern, amenities: ['parking', 'garden', 'security', 'smartHome'], featured: true, agent: INDIAN_AGENTS[1], createdAt: '2026-08-18T09:30:00.000Z'
  },
  {
    _id: 'india-003', id: 'india-003', title: 'Lutyens’ bungalow, New Delhi', description: 'A rare independent residence with gracious proportions, a landscaped garden and quiet access to the central diplomatic and cultural districts.', price: 185000000, type: 'sale', propertyType: 'house', bedrooms: 5, bathrooms: 6, areaSqft: 7200, address: { street: 'Jor Bagh', city: 'New Delhi', state: 'Delhi', country: 'India', zip: '110003' }, location: { type: 'Point', coordinates: [77.2183, 28.5897] }, images: residenceImages.heritage, amenities: ['parking', 'garden', 'security'], featured: true, agent: INDIAN_AGENTS[2], createdAt: '2026-08-16T12:00:00.000Z'
  },
  {
    _id: 'india-004', id: 'india-004', title: 'Penthouse above Jubilee Hills', description: 'A light-filled duplex with a private terrace, city views and a layout designed for both family life and hosting. The gated community includes a pool and wellness facilities.', price: 56000000, type: 'sale', propertyType: 'apartment', bedrooms: 4, bathrooms: 4, areaSqft: 4020, address: { street: 'Road No. 36, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', zip: '500033' }, location: { type: 'Point', coordinates: [78.4071, 17.4310] }, images: residenceImages.modern, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: true, agent: INDIAN_AGENTS[1], createdAt: '2026-08-12T08:00:00.000Z'
  },
  {
    _id: 'india-005', id: 'india-005', title: 'Portuguese courtyard home in Assagao', description: 'A restored Goan home with a shaded central courtyard, generous verandah and a separate guest suite, set among Assagao’s village lanes and cafes.', price: 39000000, type: 'sale', propertyType: 'villa', bedrooms: 4, bathrooms: 4, areaSqft: 3350, address: { street: 'Assagao village', city: 'Assagao', state: 'Goa', country: 'India', zip: '403507' }, location: { type: 'Point', coordinates: [73.7630, 15.6055] }, images: residenceImages.heritage, amenities: ['pool', 'garden', 'parking', 'balcony'], featured: true, agent: INDIAN_AGENTS[0], createdAt: '2026-08-10T14:00:00.000Z'
  },
  {
    _id: 'india-006', id: 'india-006', title: 'Haveli restoration in the Pink City', description: 'An intimate heritage residence with carved stone details, a courtyard, roof terrace and carefully updated services, moments from Jaipur’s historic core.', price: 27500000, type: 'sale', propertyType: 'house', bedrooms: 4, bathrooms: 4, areaSqft: 4100, address: { street: 'Civil Lines', city: 'Jaipur', state: 'Rajasthan', country: 'India', zip: '302006' }, location: { type: 'Point', coordinates: [75.7873, 26.9124] }, images: residenceImages.heritage, amenities: ['garden', 'parking', 'security'], featured: true, agent: INDIAN_AGENTS[2], createdAt: '2026-08-08T11:00:00.000Z'
  },
  {
    _id: 'india-007', id: 'india-007', title: 'Skyline apartment at Kalyani Nagar', description: 'A spacious corner apartment with a deep balcony, separate utility area and access to landscaped grounds, a clubhouse and a 24-hour security desk.', price: 24800000, type: 'sale', propertyType: 'apartment', bedrooms: 3, bathrooms: 3, areaSqft: 2180, address: { street: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', country: 'India', zip: '411006' }, location: { type: 'Point', coordinates: [73.9037, 18.5481] }, images: residenceImages.apartment, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: false, agent: INDIAN_AGENTS[0], createdAt: '2026-08-05T10:00:00.000Z'
  },
  {
    _id: 'india-008', id: 'india-008', title: 'Quiet family home in Adyar', description: 'A well-proportioned independent home with a private garden, natural light and easy access to the coast, schools and South Chennai’s established neighbourhoods.', price: 31500000, type: 'sale', propertyType: 'house', bedrooms: 4, bathrooms: 4, areaSqft: 2920, address: { street: 'Gandhi Nagar, Adyar', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zip: '600020' }, location: { type: 'Point', coordinates: [80.2570, 13.0067] }, images: residenceImages.modern, amenities: ['garden', 'parking', 'security'], featured: false, agent: INDIAN_AGENTS[1], createdAt: '2026-08-02T07:30:00.000Z'
  },
  {
    _id: 'india-009', id: 'india-009', title: 'Furnished residence in Bandra West', description: 'A polished three-bedroom home with a balcony, dedicated parking and a flexible move-in date in one of Mumbai’s most connected residential pockets.', price: 285000, type: 'rent', propertyType: 'apartment', bedrooms: 3, bathrooms: 3, areaSqft: 1960, address: { street: 'Pali Hill, Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400050' }, location: { type: 'Point', coordinates: [72.8295, 19.0607] }, images: residenceImages.apartment, amenities: ['parking', 'balcony', 'security'], featured: false, agent: INDIAN_AGENTS[0], createdAt: '2026-07-29T12:00:00.000Z'
  },
  {
    _id: 'india-010', id: 'india-010', title: 'Private villa near Candolim beach', description: 'A relaxed coastal home with an outdoor dining veranda, plunge pool and landscaped garden, suited to longer stays in North Goa.', price: 325000, type: 'rent', propertyType: 'villa', bedrooms: 3, bathrooms: 3, areaSqft: 2450, address: { street: 'Candolim', city: 'Candolim', state: 'Goa', country: 'India', zip: '403515' }, location: { type: 'Point', coordinates: [73.7626, 15.5181] }, images: residenceImages.heritage, amenities: ['pool', 'garden', 'parking', 'security'], featured: false, agent: INDIAN_AGENTS[1], createdAt: '2026-07-24T10:00:00.000Z'
  },
  {
    _id: 'india-011', id: 'india-011', title: 'Terrace apartment in Golf Course Road', description: 'A contemporary high-rise home with a private terrace, club facilities and direct access to Gurugram’s business district and rapid transit.', price: 195000, type: 'rent', propertyType: 'apartment', bedrooms: 3, bathrooms: 3, areaSqft: 2250, address: { street: 'Sector 54, Golf Course Road', city: 'Gurugram', state: 'Haryana', country: 'India', zip: '122011' }, location: { type: 'Point', coordinates: [77.1025, 28.4420] }, images: residenceImages.modern, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: false, agent: INDIAN_AGENTS[2], createdAt: '2026-07-18T09:00:00.000Z'
  },
  {
    _id: 'india-012', id: 'india-012', title: 'Lake-view apartment in Powai', description: 'An airy two-bedroom residence with a balcony overlooking landscaped grounds, a residents’ club and convenient connections across Mumbai.', price: 145000, type: 'rent', propertyType: 'apartment', bedrooms: 2, bathrooms: 2, areaSqft: 1340, address: { street: 'Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400076' }, location: { type: 'Point', coordinates: [72.9111, 19.1176] }, images: residenceImages.apartment, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: false, agent: INDIAN_AGENTS[0], createdAt: '2026-07-12T08:30:00.000Z'
  }
];