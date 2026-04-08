# Deployment Guide: Host Bankly for Free

Follow these 3 steps to take your app from local development to a live URL.

### 1. Database (MongoDB Atlas)
Since your local MongoDB won't work on the internet, you need a cloud database.
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a "Shared Cluster" (Free).
3. Under **Network Access**, click "Add IP Address" and select **Allow Access from Anywhere**.
4. Under **Database Access**, create a user and password.
5. Click **Connect** → **Connect your application** and copy the URI.
   - *Example:* `mongodb+srv://user:pass@cluster.mongodb.net/bankly?retryWrites=true&w=majority`

---

### 2. Backend (Render.com)
1. Push your code to a **GitHub Repository**.
2. Go to [Render](https://render.com/) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Use these settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add these **Environment Variables**:
   - `MONGO_URI`: (mongodb+srv://fawwerty:<20303400Ge2re2>@cluster0.ytzeqk9.mongodb.net/?appName=Cluster0)
   - `JWT_SECRET`: (Any random long string)
   - `FRONTEND_URL`: `https://your-app.vercel.app` (You'll get this in the next step)
6. Click **Deploy**. Copy your new URL (e.g., `https://bankly-api.onrender.com`).

---

### 3. Frontend (Vercel.com)
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Select the `web` directory as the Root Directory.
4. Add this **Environment Variable**:
   - `NEXT_PUBLIC_API_URL`: `https://your-api-name.onrender.com/api` (The Render URL from Step 2)
5. Click **Deploy**.

---

### 4. Mobile Update
Once your Render backend is live:
1. Open `mobile/lib/api.ts`.
2. Update `PROD_URL` with your new Render URL:
   ```typescript
   const PROD_URL = "https://your-api-name.onrender.com/api";
   ```
3. Your mobile app will now automatically use the live backend when you build it for production!

> [!TIP]
> **Free Tier Sleep**: Render's free tier spins down after 15 minutes of inactivity. The first time you open the app after a break, it might take 30 seconds to "wake up". This is normal for free hosting!
