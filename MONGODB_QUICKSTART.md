# 🚀 Quick Start: MongoDB Setup (5 Minutes)

## Choose Your MongoDB Setup

### ✅ Option 1: MongoDB Atlas (Cloud - Recommended for Beginners)

**No installation needed!**

1. **Create Free Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)

2. **Create a Cluster**
   - Click "Create" → Select "Free" tier
   - Choose region (close to you)
   - Click "Create Cluster"

3. **Get Connection String**
   - Go to "Databases" → "Connect"
   - Choose "Drivers"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/food_donation_db?retryWrites=true&w=majority
   ```

4. **Add to .env**
   Edit `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_donation_db?retryWrites=true&w=majority
   ```

5. **Done!** Skip to "Run Backend" below

---

### ⚡ Option 2: MongoDB Locally (Windows)

1. **Download**
   - Visit: https://www.mongodb.com/try/download/community
   - Download Windows installer

2. **Install**
   - Run installer
   - Choose "Install MongoDB as a Service" (recommended)
   - Finish installation

3. **Verify Installation**
   Open PowerShell:
   ```powershell
   mongosh
   ```
   If you see `>`, MongoDB is running! Type `exit` to close.

4. **Configure .env**
   Edit `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/food_donation_db
   ```

5. **Ready!** Go to "Run Backend" below

---

### 🍎 Option 2B: MongoDB Locally (Mac)

1. **Install via Homebrew**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

2. **Verify Installation**
   ```bash
   mongosh
   ```
   If you see `>`, it's working! Type `exit` to close.

3. **Configure .env**
   Edit `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/food_donation_db
   ```

4. **Ready!** Go to "Run Backend" below

---

### 🐧 Option 2C: MongoDB Locally (Linux - Ubuntu)

1. **Install**
   ```bash
   sudo apt-get install -y mongodb-org
   sudo systemctl start mongod
   ```

2. **Verify**
   ```bash
   mongosh
   ```
   If you see `>`, it's working! Type `exit` to close.

3. **Configure .env**
   Edit `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/food_donation_db
   ```

4. **Ready!** Go to "Run Backend" below

---

## 🏃 Run Backend

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

You should see Mongoose downloading along with other packages.

### Step 2: Start Backend
```bash
npm run dev
```

**You should see:**
```
✓ MongoDB Connected: localhost
✓ Server running on port 5000
```

**If you see an error**, check:
- Is MongoDB running? (See troubleshooting below)
- Is `MONGODB_URI` correct in `.env`?

---

## 🧪 Test Connection

Open new PowerShell/Terminal and test API:

```powershell
# Test if server is running
curl http://localhost:5000/api/health

# Should see:
# {"success":true,"message":"Server is running"}
```

---

## 🎨 MongoDB Compass (GUI - Optional)

For visual database management:

1. Download: https://www.mongodb.com/products/compass
2. Install
3. Connect to:
   - **Local**: `mongodb://localhost:27017`
   - **Atlas**: Paste your connection string
4. Browse collections, data, and indexes visually

---

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Means**: MongoDB is not running

**Solution**:
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongodb-community

# Windows
# MongoDB should auto-start. If not:
# 1. Open Services.msc
# 2. Find "MongoDB"
# 3. Right-click → Start

# Or in PowerShell (admin):
net start MongoDB
```

### Error: "Command not found: mongosh"

**Means**: MongoDB not installed or path issue

**Solution**: 
- Verify MongoDB installed correctly
- Restart terminal/computer
- Check installation path

### Connection works but can't create database?

**Solution**: This is normal! MongoDB creates collections automatically when you insert first document.

---
  
## 📝 .env Configuration

### Local Setup
```env
MONGODB_URI=mongodb://localhost:27017/food_donation_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### MongoDB Atlas Setup
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/food_donation_db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
```

---

## ✅ Verification Checklist

- [ ] MongoDB installed or Atlas account created
- [ ] `backend/.env` configured with `MONGODB_URI`
- [ ] `npm install` completed in backend folder
- [ ] `npm run dev` shows "✓ MongoDB Connected"
- [ ] Can reach http://localhost:5000/api/health

---

## 🎉 You're Ready!

Your Food Donation System is now using **MongoDB**!

### Next Steps:
1. Frontend is still available on http://localhost:3000
2. Backend API on http://localhost:5000
3. Start frontend: `cd frontend && npm start`
4. Register and test features!

---

## 💡 Pro Tips

1. **Local Development**: Use local MongoDB for fast testing
2. **Production**: Use MongoDB Atlas (free tier includes 512MB)
3. **Backups**: Atlas auto-backups daily
4. **Performance**: Add indexes for frequently searched fields
5. **Monitoring**: Use Compass to inspect data

---

## 📚 Learn More

- MongoDB Docs: https://docs.mongodb.com/
- Mongoose Docs: https://mongoosejs.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

**Congratulations!** Your project is now using MongoDB! 🍃

Next: Run `npm run dev` and start the frontend!
