# 🍃 MongoDB Setup Guide

This project has been converted from MySQL/Sequelize to **MongoDB/Mongoose**.

---

## ✅ What Changed

### Dependencies Updated
- ❌ Removed: `mysql2`, `sequelize`
- ✅ Added: `mongoose` (v8.0.0)

### Configuration Updated
- ❌ Old: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- ✅ New: `MONGODB_URI`

### Database Connection
- ❌ Old: Sequelize with MySQL
- ✅ New: Mongoose with MongoDB

---

## 🚀 Quick Start with MongoDB

### Step 1: Install MongoDB Locally

#### Windows
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer and follow prompts
3. Install MongoDB Compass (GUI) - optional but recommended
4. MongoDB will start automatically

#### Mac (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Step 2: Configure .env

Edit `backend/.env`:

#### Option A: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/food_donation_db
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string (looks like):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_donation_db?retryWrites=true&w=majority
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

### Step 4: Start Backend

```bash
npm run dev
```

You should see:
```
✓ MongoDB Connected: localhost
```

---

## 📝 Model Examples

### User Model (Already Updated)
```javascript
const userSchema = new mongoose.Schema({
  uuid: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['DONOR', 'RECEIVER', 'ADMIN'] },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  }
});

module.exports = mongoose.model('User', userSchema);
```

---

## 🔄 Other Models to Update

The following models still need to be updated from Sequelize to Mongoose. Follow this pattern:

### Donation Model Example
**Old (Sequelize):**
```javascript
const Donation = sequelize.define('Donation', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  donor_id: { type: DataTypes.INTEGER, references: { model: 'users' } },
  food_type: { type: DataTypes.STRING },
  // ...
});
```

**New (Mongoose):**
```javascript
const donationSchema = new mongoose.Schema({
  donor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  food_type: { type: String, required: true },
  // ...
});

module.exports = mongoose.model('Donation', donationSchema);
```

---

## 📚 Models Needing Update

Replace these files with Mongoose schemas:
1. ✅ `models/User.js` - **DONE**
2. ⏳ `models/Donation.js`
3. ⏳ `models/Organization.js`
4. ⏳ `models/PickupRequest.js`
5. ⏳ `models/Message.js`
6. ⏳ `models/Notification.js`
7. ⏳ `models/Rating.js`
8. ⏳ `models/Analytics.js`

---

## 🔍 Querying with Mongoose

### Find User by Email
```javascript
const user = await User.findOne({ email: 'user@example.com' });
```

### Find with Relationships
```javascript
const donation = await Donation.findById(id).populate('donor_id');
```

### Location-based Search (10km radius)
```javascript
const nearbyDonations = await Donation.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: 10000 // 10km in meters
    }
  }
});
```

### Create Document
```javascript
const newUser = await User.create({
  first_name: 'John',
  email: 'john@example.com',
  password_hash: hashedPassword
});
```

---

## 🛠️ Updating Controllers

### Changes in Controllers

**Before (Sequelize):**
```javascript
const user = await User.findByPk(id);
await user.update({ first_name: 'New Name' });
```

**After (Mongoose):**
```javascript
const user = await User.findByIdAndUpdate(id, { first_name: 'New Name' });
```

---

## 📊 MongoDB vs MySQL

| Feature | MongoDB | MySQL |
|---------|---------|-------|
| Type | NoSQL Document | Relational |
| Schema | Flexible | Strict |
| Setup | Easier | More complex |
| Scalability | Horizontal | Vertical |
| Relationships | References | Foreign Keys |
| Local Setup | Simple | Complex |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB is running
```bash
# Check status
mongosh

# If not running:
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: Check Services app for MongoDB
```

### "collection does not exist" Error
**Solution**: This is normal with MongoDB - collections are created automatically when first used

### Port 27017 Already in Use
```bash
# Find process
lsof -i :27017
kill -9 <PID>
```

---

## 🌍 MongoDB Atlas (Free Cloud Option)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Cluster**: Free tier available
3. **Get Connection String**: Copy from "Connect" button
4. **Add to .env**:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_donation_db?retryWrites=true&w=majority
```
5. **Done!** No local setup needed

---

## 📝 Migration Checklist

- [x] Update package.json (remove mysql2, sequelize; add mongoose)
- [x] Update .env.example (MongoDB URI)
- [x] Update config/database.js (MongoDB connection)
- [x] Update models/User.js to Mongoose
- [ ] Update remaining models (Donation, Organization, etc.)
- [ ] Update controllers (Sequelize methods → Mongoose)
- [ ] Test all API endpoints
- [ ] Verify relationships work
- [ ] Test location-based search

---

## 💡 Tips

1. **GUI Tool**: Install MongoDB Compass for visual database management
2. **Testing**: Use MongoDB Atlas free tier for testing
3. **Local Development**: Install MongoDB Community locally
4. **Backups**: MongoDB Atlas handles backups automatically
5. **Performance**: Add indexes for frequently queried fields

---

## 📖 Useful Resources

- **Mongoose Docs**: https://mongoosejs.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Mongoose Query Helpers**: https://mongoosejs.com/docs/api/query.html

---

## ✅ Verification

After setup, test the connection:

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✓ MongoDB Connected: localhost
Server running on port 5000
```

---

**Next Steps**: Continue updating remaining models from Sequelize to Mongoose following the pattern shown above.

Need help? Check examples in `models/User.js`!
