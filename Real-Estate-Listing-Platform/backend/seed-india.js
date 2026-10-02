const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Agent = require('./models/Agent');
const Property = require('./models/Property');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI) dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/gharfind';
const propertyImages = [
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85'
];

const agentsData = [
  { name: 'Mira Shah', email: 'mira.shah@gharfind.in', phone: '+91 98200 44120', agency: 'GharFind Mumbai', bio: 'Mumbai residential advisor specialising in established neighbourhoods and sea-facing homes.' },
  { name: 'Arya Menon', email: 'arya.menon@gharfind.in', phone: '+91 98450 22810', agency: 'GharFind South', bio: 'Local advisor for homes across Bengaluru, Hyderabad and Chennai.' },
  { name: 'Kabir Sethi', email: 'kabir.sethi@gharfind.in', phone: '+91 98100 71340', agency: 'GharFind North', bio: 'Residential advisor for Delhi NCR and Rajasthan.' }
];

const propertyData = [
  { title: 'Sea-facing residence in Worli', description: 'A high-floor home with broad Arabian Sea views, a private lift lobby and resident access to a swimming pool, fitness studio and concierge.', price: 68500000, type: 'sale', propertyType: 'apartment', bedrooms: 4, bathrooms: 4, areaSqft: 3180, address: { street: 'Worli Sea Face', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400030' }, location: { type: 'Point', coordinates: [72.8174, 19.0112] }, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: true },
  { title: 'Garden villa near Indiranagar', description: 'A contemporary Bengaluru home set on a tree-lined street, with an inner courtyard, shaded deck and flexible study.', price: 42500000, type: 'sale', propertyType: 'villa', bedrooms: 4, bathrooms: 5, areaSqft: 3650, address: { street: 'Defence Colony, Indiranagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', zip: '560038' }, location: { type: 'Point', coordinates: [77.6408, 12.9784] }, amenities: ['parking', 'garden', 'security', 'smartHome'], featured: true },
  { title: 'Lutyens’ bungalow, New Delhi', description: 'An independent residence with gracious proportions, a landscaped garden and quiet access to the central diplomatic and cultural districts.', price: 185000000, type: 'sale', propertyType: 'house', bedrooms: 5, bathrooms: 6, areaSqft: 7200, address: { street: 'Jor Bagh', city: 'New Delhi', state: 'Delhi', country: 'India', zip: '110003' }, location: { type: 'Point', coordinates: [77.2183, 28.5897] }, amenities: ['parking', 'garden', 'security'], featured: true },
  { title: 'Penthouse above Jubilee Hills', description: 'A light-filled duplex with a private terrace, city views and access to a pool and wellness facilities.', price: 56000000, type: 'sale', propertyType: 'apartment', bedrooms: 4, bathrooms: 4, areaSqft: 4020, address: { street: 'Road No. 36, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India', zip: '500033' }, location: { type: 'Point', coordinates: [78.4071, 17.4310] }, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: true },
  { title: 'Portuguese courtyard home in Assagao', description: 'A restored Goan home with a shaded central courtyard, generous verandah and separate guest suite, set among Assagao’s village lanes.', price: 39000000, type: 'sale', propertyType: 'villa', bedrooms: 4, bathrooms: 4, areaSqft: 3350, address: { street: 'Assagao village', city: 'Assagao', state: 'Goa', country: 'India', zip: '403507' }, location: { type: 'Point', coordinates: [73.7630, 15.6055] }, amenities: ['pool', 'garden', 'parking', 'balcony'], featured: true },
  { title: 'Haveli restoration in the Pink City', description: 'A heritage residence with carved stone details, a courtyard, roof terrace and carefully updated services, close to Jaipur’s historic core.', price: 27500000, type: 'sale', propertyType: 'house', bedrooms: 4, bathrooms: 4, areaSqft: 4100, address: { street: 'Civil Lines', city: 'Jaipur', state: 'Rajasthan', country: 'India', zip: '302006' }, location: { type: 'Point', coordinates: [75.7873, 26.9124] }, amenities: ['garden', 'parking', 'security'], featured: true },
  { title: 'Skyline apartment at Kalyani Nagar', description: 'A spacious corner apartment with a deep balcony, landscaped grounds, clubhouse and a 24-hour security desk.', price: 24800000, type: 'sale', propertyType: 'apartment', bedrooms: 3, bathrooms: 3, areaSqft: 2180, address: { street: 'Kalyani Nagar', city: 'Pune', state: 'Maharashtra', country: 'India', zip: '411006' }, location: { type: 'Point', coordinates: [73.9037, 18.5481] }, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: false },
  { title: 'Quiet family home in Adyar', description: 'An independent home with a private garden, natural light and easy access to the coast, schools and South Chennai.', price: 31500000, type: 'sale', propertyType: 'house', bedrooms: 4, bathrooms: 4, areaSqft: 2920, address: { street: 'Gandhi Nagar, Adyar', city: 'Chennai', state: 'Tamil Nadu', country: 'India', zip: '600020' }, location: { type: 'Point', coordinates: [80.2570, 13.0067] }, amenities: ['garden', 'parking', 'security'], featured: false },
  { title: 'Furnished residence in Bandra West', description: 'A polished three-bedroom home with balcony, dedicated parking and flexible move-in in one of Mumbai’s most connected neighbourhoods.', price: 285000, type: 'rent', propertyType: 'apartment', bedrooms: 3, bathrooms: 3, areaSqft: 1960, address: { street: 'Pali Hill, Bandra West', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400050' }, location: { type: 'Point', coordinates: [72.8295, 19.0607] }, amenities: ['parking', 'balcony', 'security'], featured: false },
  { title: 'Private villa near Candolim beach', description: 'A relaxed coastal home with outdoor dining veranda, plunge pool and landscaped garden, suited to longer stays in North Goa.', price: 325000, type: 'rent', propertyType: 'villa', bedrooms: 3, bathrooms: 3, areaSqft: 2450, address: { street: 'Candolim', city: 'Candolim', state: 'Goa', country: 'India', zip: '403515' }, location: { type: 'Point', coordinates: [73.7626, 15.5181] }, amenities: ['pool', 'garden', 'parking', 'security'], featured: false },
  { title: 'Terrace apartment on Golf Course Road', description: 'A contemporary Gurugram home with a private terrace, club facilities and direct access to the business district and rapid transit.', price: 195000, type: 'rent', propertyType: 'apartment', bedrooms: 3, bathrooms: 3, areaSqft: 2250, address: { street: 'Sector 54, Golf Course Road', city: 'Gurugram', state: 'Haryana', country: 'India', zip: '122011' }, location: { type: 'Point', coordinates: [77.1025, 28.4420] }, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: false },
  { title: 'Lake-view apartment in Powai', description: 'An airy two-bedroom residence with a balcony overlooking landscaped grounds, a residents’ club and convenient Mumbai connections.', price: 145000, type: 'rent', propertyType: 'apartment', bedrooms: 2, bathrooms: 2, areaSqft: 1340, address: { street: 'Hiranandani Gardens, Powai', city: 'Mumbai', state: 'Maharashtra', country: 'India', zip: '400076' }, location: { type: 'Point', coordinates: [72.9111, 19.1176] }, amenities: ['pool', 'gym', 'parking', 'balcony', 'security'], featured: false }
];

async function seedIndia() {
  try {
    await mongoose.connect(mongoUri);
    await Promise.all([Agent.deleteMany({}), Property.deleteMany({}), User.deleteMany({})]);

    const agents = await Agent.create(agentsData);
    const properties = await Property.create(propertyData.map((property, index) => ({
      ...property,
      images: propertyImages,
      agent: agents[index % agents.length]._id
    })));

    for (const agent of agents) {
      agent.listings = properties.filter((property) => property.agent.equals(agent._id)).map((property) => property._id);
      await agent.save();
    }

    await User.create([
      { name: 'GharFind Administrator', email: 'admin@gharfind.in', password: 'password123', role: 'admin' },
      ...agentsData.map((agent) => ({ name: agent.name, email: agent.email, password: 'password123', role: 'agent', phone: agent.phone }))
    ]);

    console.log(`Seeded ${properties.length} India listings, ${agents.length} advisors and a GharFind admin.`);
    console.log('Demo access: admin@gharfind.in / password123');
  } catch (error) {
    console.error('India seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedIndia();
