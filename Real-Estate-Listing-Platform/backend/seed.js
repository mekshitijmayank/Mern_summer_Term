const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Agent = require('./models/Agent');
const Property = require('./models/Property');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/estate-platform';

const seedAgents = [
  {
    name: 'Alexandra Vance',
    email: 'alexandra.vance@estate.com',
    phone: '555-0101',
    agency: 'Estate Premium Partners',
    bio: 'Alexandra Vance is a top-producing agent with over 15 years of experience in the luxury residential market, specializing in Beverly Hills and Malibu beachfront estates.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Marcus Sterling',
    email: 'marcus.sterling@estate.com',
    phone: '555-0102',
    agency: 'Estate Manhattan Group',
    bio: 'Marcus focuses on luxury high-rise penthouses and townhouses in Manhattan. He has closed over $500M in lifetime sales.',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Julienne Brooks',
    email: 'julienne.brooks@estate.com',
    phone: '555-0103',
    agency: 'Estate Dubai International',
    bio: 'Specializing in ultra-luxury waterfront villas in Palm Jumeirah and high-end plots in Emirates Hills.',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'David Chen',
    email: 'david.chen@estate.com',
    phone: '555-0104',
    agency: 'Estate London Elite',
    bio: 'David manages real estate investments and heritage townhouses across Mayfair, Chelsea, and Belgravia.',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Sophia Martinez',
    email: 'sophia.martinez@estate.com',
    phone: '555-0105',
    agency: 'Estate Miami Waterfront',
    bio: 'Sophia is a Miami native specializing in high-end waterfront mansions in Biscayne Bay and Key Biscayne.',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  }
];

const seedProperties = [
  // Los Angeles
  {
    title: 'The Glass Pavilion Villa',
    description: 'Stunning modern architectural masterpiece featuring floor-to-ceiling glass walls, infinity pool, and panoramic city views.',
    price: 12450000,
    type: 'sale',
    propertyType: 'villa',
    bedrooms: 5,
    bathrooms: 6,
    areaSqft: 6800,
    address: { street: '9420 Wilshire Blvd', city: 'Los Angeles', state: 'CA', zip: '90210', country: 'United States' },
    location: { type: 'Point', coordinates: [-118.4003, 34.0696] },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'parking', 'garage', 'balcony', 'fireplace', 'airConditioning', 'smartHome'],
    featured: true
  },
  {
    title: 'Bel Air Modern Estate',
    description: 'A newly constructed modern estate situated on a private ridge in Bel Air. Includes an indoor theater, infinity pool, spa, and bowling alley.',
    price: 24500000,
    type: 'sale',
    propertyType: 'villa',
    bedrooms: 7,
    bathrooms: 9,
    areaSqft: 14200,
    address: { street: '864 Stradella Rd', city: 'Los Angeles', state: 'CA', zip: '90077', country: 'United States' },
    location: { type: 'Point', coordinates: [-118.4419, 34.0924] },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'garage', 'balcony', 'fireplace', 'airConditioning', 'security', 'elevator'],
    featured: false
  },
  {
    title: 'Sunset Strip Designer Penthouse',
    description: 'Beautiful designer penthouse apartment sitting right off the Sunset Strip. Wrap-around glass walls overlook downtown LA.',
    price: 18000,
    type: 'rent',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2.5,
    areaSqft: 2400,
    address: { street: '8490 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90069', country: 'United States' },
    location: { type: 'Point', coordinates: [-118.3756, 34.0912] },
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'parking', 'balcony', 'airConditioning', 'security'],
    featured: false
  },

  // New York
  {
    title: 'Skyline Penthouse Suites',
    description: 'Ultra-luxurious triplex penthouse overlooking Central Park with private elevator, wrap-around terrace, and bespoke finishes.',
    price: 8600000,
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: 3,
    bathrooms: 3.5,
    areaSqft: 4100,
    address: { street: '432 Park Avenue', city: 'New York', state: 'NY', zip: '10022', country: 'United States' },
    location: { type: 'Point', coordinates: [-73.9712, 40.7615] },
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['gym', 'parking', 'balcony', 'petFriendly', 'airConditioning', 'smartHome', 'security'],
    featured: true
  },
  {
    title: 'Tribeca industrial Loft',
    description: 'Massive high-ceilinged industrial loft in downtown Manhattan, featuring exposed brick, original columns, and direct elevator entrance.',
    price: 5400000,
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 3100,
    address: { street: '145 Hudson St', city: 'New York', state: 'NY', zip: '10013', country: 'United States' },
    location: { type: 'Point', coordinates: [-74.0094, 40.7208] },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['fireplace', 'petFriendly', 'airConditioning', 'security', 'elevator'],
    featured: false
  },
  {
    title: 'Upper East Side Townhouse',
    description: 'Charming historic single-family townhouse in New York Upper East Side. Fully renovated with a private garden patio.',
    price: 14500,
    type: 'rent',
    propertyType: 'house',
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 4800,
    address: { street: '163 E 78th St', city: 'New York', state: 'NY', zip: '10021', country: 'United States' },
    location: { type: 'Point', coordinates: [-73.9602, 40.7738] },
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['parking', 'balcony', 'fireplace', 'garden', 'airConditioning'],
    featured: false
  },

  // Dubai
  {
    title: 'Azure Oasis Beachfront Estate',
    description: 'Private waterfront sanctuary with direct beach access, lush tropical gardens, guest house, and private boat dock.',
    price: 15200000,
    type: 'sale',
    propertyType: 'villa',
    bedrooms: 6,
    bathrooms: 7,
    areaSqft: 8500,
    address: { street: 'Palm Jumeirah Crescent', city: 'Dubai', state: 'UAE', zip: '00000', country: 'United Arab Emirates' },
    location: { type: 'Point', coordinates: [55.1381, 25.1124] },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'garage', 'balcony', 'waterfront', 'garden', 'smartHome', 'security'],
    featured: true
  },
  {
    title: 'Downtown Dubai Luxury Apartment',
    description: 'High-end apartment in the heart of Downtown Dubai, offering stunning views of Burj Khalifa and direct fountain access.',
    price: 2900000,
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2.5,
    areaSqft: 1800,
    address: { street: 'Sheikh Mohammed bin Rashid Blvd', city: 'Dubai', state: 'UAE', zip: '00000', country: 'United Arab Emirates' },
    location: { type: 'Point', coordinates: [55.2744, 25.1972] },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'parking', 'balcony', 'airConditioning', 'security'],
    featured: false
  },

  // Paris
  {
    title: 'Seine River Historic Duplex',
    description: 'Elegant Parisian residence featuring high ceilings, original moldings, chevron hardwood floors, and balcony views of Notre Dame.',
    price: 4800000,
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 2200,
    address: { street: 'Quai de la Mégisserie', city: 'Paris', state: 'France', zip: '75001', country: 'France' },
    location: { type: 'Point', coordinates: [2.3470, 48.8575] },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['balcony', 'fireplace', 'petFriendly', 'airConditioning'],
    featured: true
  },

  // London
  {
    title: 'Mayfair Heritage Townhouse',
    description: 'Meticulously restored Georgian townhouse spanning 5 floors with private walled garden, wine cellar, and elevator.',
    price: 9500000,
    type: 'sale',
    propertyType: 'house',
    bedrooms: 4,
    bathrooms: 4.5,
    areaSqft: 4600,
    address: { street: 'Chesterfield Hill', city: 'London', state: 'UK', zip: 'W1J 5JN', country: 'United Kingdom' },
    location: { type: 'Point', coordinates: [-0.1494, 51.5074] },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['fireplace', 'garden', 'elevator', 'security', 'smartHome'],
    featured: true
  },

  // Miami
  {
    title: 'Biscayne Bay Waterfront Mansion',
    description: 'Stunning contemporary bayfront estate with custom boat lift, negative-edge pool, private dock, and full smart-home features.',
    price: 11200000,
    type: 'sale',
    propertyType: 'villa',
    bedrooms: 5,
    bathrooms: 5.5,
    areaSqft: 6100,
    address: { street: 'Hibiscus Island Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'United States' },
    location: { type: 'Point', coordinates: [-80.1601, 25.7825] },
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'garage', 'balcony', 'waterfront', 'smartHome', 'security'],
    featured: true
  },
  {
    title: 'South Beach Skyline Condominium',
    description: 'Luxury modern high-rise condominium overlooking South Beach sandy beaches and the Atlantic Ocean.',
    price: 6500,
    type: 'rent',
    propertyType: 'apartment',
    bedrooms: 1,
    bathrooms: 1.5,
    areaSqft: 1100,
    address: { street: '300 Ocean Dr', city: 'Miami', state: 'FL', zip: '33139', country: 'United States' },
    location: { type: 'Point', coordinates: [-80.1309, 25.7725] },
    images: [
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['pool', 'gym', 'parking', 'balcony', 'waterfront', 'airConditioning', 'security'],
    featured: false
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to Database for seeding...');

    // Clear existing data
    await Agent.deleteMany({});
    await Property.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing collections (Agents, Properties, Users).');

    // Create Agents
    const agents = await Agent.create(seedAgents);
    console.log(`Seeded ${agents.length} agents.`);

    // Distribute Properties among agents
    const propertiesToSave = seedProperties.map((prop, index) => {
      // Rotate agent assignment
      const assignedAgent = agents[index % agents.length];
      return {
        ...prop,
        agent: assignedAgent._id
      };
    });

    const savedProperties = await Property.create(propertiesToSave);
    console.log(`Seeded ${savedProperties.length} properties.`);

    // Link listings back to Agent documents
    for (let agent of agents) {
      const agentListings = savedProperties.filter(
        p => p.agent.toString() === agent._id.toString()
      );
      agent.listings = agentListings.map(p => p._id);
      await agent.save();
    }
    console.log('Updated agent listings arrays.');

    // Seed dummy user account for testing: User/Agent and User/Buyer
    const adminUser = await User.create({
      name: 'Agent User',
      email: 'agent@estate.com',
      password: 'password123',
      role: 'agent'
    });
    console.log('Seeded mock agent login: email: agent@estate.com / password: password123');

    const buyerUser = await User.create({
      name: 'Buyer User',
      email: 'buyer@estate.com',
      password: 'password123',
      role: 'buyer'
    });
    console.log('Seeded mock buyer login: email: buyer@estate.com / password: password123');

    console.log('Database seeding completed successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error: ', error);
    process.exit(1);
  }
};

seedData();
