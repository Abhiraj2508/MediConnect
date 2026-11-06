# Database Connection Fix Guide

## ✅ Fixed Issues

1. **Added proper error handling** - The database connection now shows clear error messages
2. **Added environment variable validation** - Checks if MONGODB_URI exists
3. **Server waits for database connection** - Server only starts after successful database connection
4. **Better logging** - Clear success/error messages

## 🔧 Common Database Connection Errors & Fixes

### 1. **Port Already in Use (EADDRINUSE)**

**Error:** `EADDRINUSE: address already in use :::4000`

**Fix Options:**

**Option A: Kill the process using the port**
```powershell
# Find the process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace <PID> with the process ID)
taskkill /PID <PID> /F
```

**Option B: Use a different port**
- Change `PORT=4000` to `PORT=4001` (or any other port) in your `.env` file

---

### 2. **Missing MONGODB_URI**

**Error:** `MONGODB_URI is not defined in environment variables`

**Fix:**
1. Create a `.env` file in the `backend` directory (if it doesn't exist)
2. Add your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net
```

---

### 3. **Invalid MongoDB Connection String**

**Error:** `Invalid connection string` or `MongooseServerSelectionError`

**Fix:**
- Check your MongoDB connection string format:
  - Format: `mongodb+srv://<username>:<password>@<cluster-url>`
  - Example: `mongodb+srv://myuser:mypass@cluster0.abc123.mongodb.net`
- Make sure there are no extra spaces or quotes in your `.env` file

---

### 4. **Authentication Failed**

**Error:** `Authentication failed` or `bad auth`

**Fix:**
- Verify your MongoDB username and password are correct
- If your password contains special characters like `@`, you need to URL-encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`
  - etc.
- Make sure your MongoDB user has proper permissions

---

### 5. **Network/Connection Timeout**

**Error:** `Connection timeout` or `MongooseServerSelectionError: connect ECONNREFUSED`

**Fix:**
- Check your internet connection
- Verify your MongoDB cluster allows connections from your IP address (check IP whitelist in MongoDB Atlas)
- Check if your firewall is blocking the connection
- Try accessing MongoDB Atlas dashboard to verify cluster status

---

### 6. **Wrong Database Name**

The code automatically appends `/prescripto` to your connection string. If you want a different database name, modify `backend/config/mongodb.js` line 24.

---

## 📋 Required Environment Variables

Make sure your `.env` file in the `backend` directory contains:

```env
# MongoDB Connection URI (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net

# Server Port (optional, defaults to 4000)
PORT=4000

# JWT Secret Key (for authentication)
JWT_SECRET=your-secret-key-here

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password

# Cloudinary Configuration (for image uploads)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET_KEY=your-cloudinary-secret-key
```

---

## ✅ How to Test

1. Make sure your `.env` file is in the `backend` directory
2. Stop any existing server (if running)
3. Start the server:
   ```powershell
   cd backend
   node server.js
   ```

4. You should see:
   - ✅ `Database Connected Successfully`
   - ✅ `Server started on PORT:4000`

If you see errors, check the error message - it will now tell you exactly what's wrong!

---

## 🔍 Quick Troubleshooting Checklist

- [ ] `.env` file exists in `backend` directory
- [ ] `MONGODB_URI` is set in `.env` file
- [ ] MongoDB connection string is valid
- [ ] No special characters in password (or properly URL-encoded)
- [ ] MongoDB cluster is running and accessible
- [ ] Your IP is whitelisted in MongoDB Atlas (if using Atlas)
- [ ] Port 4000 is not already in use
- [ ] Internet connection is working

---

## 💡 Tip

If you're using MongoDB Atlas (cloud), make sure:
1. Your cluster is running (not paused)
2. Your IP address is whitelisted (0.0.0.0/0 for development)
3. Database user credentials are correct
4. Network Access is properly configured
