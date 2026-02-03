# Render Deployment Fix - MongoDB Connection Error

## ❌ Current Error
```
Error: The `uri` parameter to `openUri()` must be a string, got "undefined". 
Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.
```

**Root Cause**: Environment variables are not set in Render dashboard.

---

## ✅ Solution: Add Environment Variables in Render

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Log in to your account
3. Find your backend service (aviravastra-backend)
4. Click on the service name

### Step 2: Navigate to Environment Tab
1. In the left sidebar, click **"Environment"**
2. You'll see a section for "Environment Variables"

### Step 3: Add These Environment Variables

Click **"Add Environment Variable"** and add each of these:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://puranforwork88_db_user:Enw8YBVNwwrGUkX4@cluster0.n7ftype.mongodb.net/?appName=Cluster0` |
| `JWT_SECRET` | `testmode` |
| `FRONTEND_URL` | `https://aviravastra.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | `dywonchlj` |
| `CLOUDINARY_API_KEY` | `324936888622344` |
| `CLOUDINARY_API_SECRET` | `dfmu9EHbEUpO0Zam5R2zfjeOFA4` |
| `RAZORPAY_KEY_ID` | `rzp_test_S9fyKwu6ifrCc9` |
| `RAZORPAY_KEY_SECRET` | `exAYx7tTNVMh10t7E1ANQFDS` |
| `RAZORPAY_WEBHOOK_SECRET` | `avira_secret_123` |
| `WHATSAPP_NUMBER` | `918780055674` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `ENABLE_EMAIL` | `false` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

### Step 4: Save and Deploy
1. Click **"Save Changes"** button
2. Render will **automatically redeploy** your service
3. Wait for the deployment to complete (usually 2-5 minutes)

---

## 🔍 How to Verify It's Fixed

### Check Deployment Logs
1. Go to your service in Render
2. Click on **"Logs"** tab
3. Look for these success messages:
   ```
   MongoDB Connected: cluster0.n7ftype.mongodb.net
   Server running in production mode on port 5000
   ```

### If You Still See Errors
- Make sure you clicked "Save Changes" after adding variables
- Check that `MONGODB_URI` is spelled exactly right (case-sensitive)
- Verify the MongoDB connection string is correct
- Try manually triggering a redeploy: Click "Manual Deploy" → "Deploy latest commit"

---

## 📝 Important Notes

1. **Never commit `.env` file to Git** ✅ (Already configured in .gitignore)
2. **Always set environment variables in Render dashboard** for production
3. **Local `.env` file** is only for local development
4. **Render reads environment variables** from its dashboard, NOT from `.env` files

---

## 🆘 Still Having Issues?

If you're still seeing the MongoDB connection error after adding environment variables:

1. **Double-check the MongoDB URI** - Make sure it's the correct connection string
2. **Check MongoDB Atlas** - Ensure your IP address is whitelisted (or use 0.0.0.0/0 for all IPs)
3. **Verify MongoDB user** - Ensure the database user exists and has correct permissions
4. **Check Render logs** - Look for any other error messages

---

## ✅ Expected Success Output

After fixing, you should see in Render logs:
```
[dotenv@17.2.3] injecting env (15) from .env
MongoDB Connected: cluster0.n7ftype.mongodb.net
Server running in production mode on port 5000
🌐 Accessible at:
   - http://localhost:5000
```

**Note**: The dotenv message will still show, but it should inject environment variables from Render's environment (not from a .env file).
