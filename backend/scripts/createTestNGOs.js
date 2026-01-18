// Script to create test NGOs in MongoDB
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/food_donation_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✓ Connected to MongoDB'))
.catch(err => {
  console.error('✗ MongoDB connection error:', err);
  process.exit(1);
});

// Define Organization schema inline
const organizationSchema = new mongoose.Schema({
  uuid: { type: String, default: () => uuidv4(), unique: true },
  name: { type: String, required: true },
  organization_type: { type: String, default: 'NGO' },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip_code: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  verification_status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'APPROVED' },
  verification_documents: [{ type: String }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  average_rating: { type: Number, default: 0 },
  rating_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

// Test NGO data
const testNGOs = [
  {
    name: 'Hope Foundation',
    organization_type: 'NGO',
    address: '123 Main Street, Sector 15',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '400001',
    phone: '+91-9876543210',
    email: 'contact@hopefoundation.org',
    website: 'www.hopefoundation.org',
    verification_status: 'APPROVED',
    average_rating: 4.5,
    rating_count: 25,
    is_active: true
  },
  {
    name: 'Seva Trust',
    organization_type: 'NGO',
    address: '456 Gandhi Road, MG Area',
    city: 'Delhi',
    state: 'Delhi',
    zip_code: '110001',
    phone: '+91-9876543211',
    email: 'info@sevatrust.org',
    website: 'www.sevatrust.org',
    verification_status: 'APPROVED',
    average_rating: 4.8,
    rating_count: 42,
    is_active: true
  },
  {
    name: 'Food For All Initiative',
    organization_type: 'NGO',
    address: '789 Church Street, Brigade Road',
    city: 'Bangalore',
    state: 'Karnataka',
    zip_code: '560001',
    phone: '+91-9876543212',
    email: 'hello@foodforall.org',
    website: 'www.foodforall.org',
    verification_status: 'APPROVED',
    average_rating: 4.2,
    rating_count: 18,
    is_active: true
  },
  {
    name: 'Helping Hands Society',
    organization_type: 'NGO',
    address: '321 Park Avenue, Indiranagar',
    city: 'Pune',
    state: 'Maharashtra',
    zip_code: '411001',
    phone: '+91-9876543213',
    email: 'support@helpinghands.org',
    website: 'www.helpinghands.org',
    verification_status: 'APPROVED',
    average_rating: 4.6,
    rating_count: 33,
    is_active: true
  },
  {
    name: 'Community Kitchen Network',
    organization_type: 'NGO',
    address: '555 Lake View Road, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    zip_code: '600001',
    phone: '+91-9876543214',
    email: 'network@communitykitchen.org',
    website: 'www.communitykitchen.org',
    verification_status: 'APPROVED',
    average_rating: 4.9,
    rating_count: 56,
    is_active: true
  }
];

// Insert NGOs
async function createNGOs() {
  try {
    console.log('\n🔄 Creating test NGOs...\n');
    
    // Clear existing test NGOs (optional - comment out if you want to keep existing)
    await Organization.deleteMany({ name: { $in: testNGOs.map(n => n.name) } });
    console.log('✓ Cleared existing test NGOs');
    
    // Insert new NGOs
    const created = await Organization.insertMany(testNGOs);
    
    console.log(`\n✓ Successfully created ${created.length} test NGOs:\n`);
    created.forEach((ngo, index) => {
      console.log(`${index + 1}. ${ngo.name}`);
      console.log(`   UUID: ${ngo.uuid}`);
      console.log(`   City: ${ngo.city}, ${ngo.state}`);
      console.log(`   Phone: ${ngo.phone}`);
      console.log(`   Rating: ${ngo.average_rating} (${ngo.rating_count} reviews)`);
      console.log(`   Status: ${ngo.verification_status}`);
      console.log('');
    });
    
    console.log('✓ All test NGOs created successfully!');
  } catch (error) {
    console.error('✗ Error creating NGOs:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

// Run the script
createNGOs();
