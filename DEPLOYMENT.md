# VC Intelligence Hub - Deployment Cheat Sheet

## 🚀 Quick Deploy (5 minutes total)

### Prerequisites
- GitHub account (already done ✅)
- Vercel account (free: https://vercel.com)
- Railway account (free tier: https://railway.app) OR Render (https://render.com)

---

## **OPTION A: Railway + Vercel (Recommended)**

### Backend Deployment (Railway)

**1. Create Railway Account**
```
Go to https://railway.app
Click "Start Project"
Select "Deploy from GitHub"
```

**2. Connect GitHub & Select Repo**
```
Authorize Railway to access GitHub
Select: AllStreets/vc-tool
```

**3. Configure Backend Service**
```
Root Directory: backend
Build Command: npm install
Start Command: npm start (or: node server.js)
Port: 5000
```

**4. Add Environment Variables**
```
Click "Variables" tab
Add your .env contents:
  - GITHUB_TOKEN=your_token
  - NEWSAPI_KEY=your_key
  - SERPER_API_KEY=your_key
  (HackerNews, YC, SEC EDGAR need NO keys)
```

**5. Deploy**
```
Click "Deploy"
Wait ~2 minutes
Backend URL will appear: https://vc-tool-backend.railway.app
Save this URL
```

**6. Test Backend**
```bash
curl https://vc-tool-backend.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

### Frontend Deployment (Vercel)

**1. Go to Vercel**
```
https://vercel.com/new
Click "Import Git Repository"
```

**2. Import from GitHub**
```
Authorize Vercel
Select: AllStreets/vc-tool
```

**3. Configure Frontend**
```
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

**4. Add Environment Variables**
```
Create .env.production.local in frontend/:
VITE_API_URL=https://vc-tool-backend.railway.app
(Replace with your actual Railway backend URL)
```

**5. Deploy**
```
Click "Deploy"
Wait ~1 minute
Frontend URL: https://vc-tool.vercel.app
```

**6. Test Frontend**
```
Visit: https://vc-tool.vercel.app
Should load dashboard
Click "Load Trends" - should fetch from backend
```

---

## **OPTION B: Render + Vercel (Alternative)**

### Backend on Render

**1. Create Render Account**
```
https://render.com
Click "New +" > "Web Service"
Connect GitHub repository
```

**2. Configure Service**
```
Name: vc-tool-backend
Root Directory: backend
Build Command: npm install
Start Command: npm start
Plan: Free (auto-sleeps after 15 min inactivity)
```

**3. Add Environment Variables**
```
Settings > Environment
Add: GITHUB_TOKEN, NEWSAPI_KEY, SERPER_API_KEY
```

**4. Deploy**
```
Click "Create Web Service"
URL will be: https://vc-tool-backend.onrender.com
```

**5. Update Frontend**
```
In frontend, update Vercel env variable:
VITE_API_URL=https://vc-tool-backend.onrender.com
Redeploy frontend
```

---

## **Step-by-Step Command Reference**

### Local Testing Before Deploy
```bash
# Test backend
cd backend
npm install
npm start
# Visit http://localhost:5000/api/health

# Test frontend (in new terminal)
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Build Frontend for Production
```bash
cd frontend
npm run build
# Creates dist/ folder
```

### Check Build Output
```bash
cd frontend
npm run build
ls -la dist/
# Should have index.html, assets/, etc
```

---

## **Frontend Configuration (Critical)**

### Update API URL
**File: `frontend/src/services/api.js`**

Before deployment, verify:
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// For production: https://your-backend-url
```

**Or set in Vercel:**
```
Project Settings > Environment Variables
Add: VITE_API_URL = https://your-railway-backend-url
```

---

## **Testing Live Deployment**

### Backend Health Check
```bash
curl https://your-backend-url/api/health
# Expected: {"status":"ok","timestamp":"2026-02-21T..."}
```

### Backend API Status
```bash
curl https://your-backend-url/api/api-status
# Should show active plugins
```

### Frontend Data Load
```
1. Visit your frontend URL
2. Click "Load Trends"
3. Should display trends from HackerNews
4. Check browser console for any errors
```

### Test All Endpoints
```bash
BACKEND_URL="https://your-backend-url"

# Trends
curl $BACKEND_URL/api/trends

# Scored Trends
curl $BACKEND_URL/api/trends/scored

# Deals
curl $BACKEND_URL/api/deals

# Founders
curl $BACKEND_URL/api/founders

# API Status
curl $BACKEND_URL/api-status
```

---

## **Cost Breakdown**

| Service | Cost | Notes |
|---------|------|-------|
| Railway Backend | Free | 5GB/month, auto-sleeps if idle |
| Vercel Frontend | Free | Unlimited bandwidth |
| GitHub | Free | Public repo |
| HackerNews API | Free | No auth required |
| YC Scraper | Free | Web scraping |
| SEC EDGAR | Free | No auth required |
| **TOTAL** | **$0/month** | ✅ Fully free |

---

## **Common Issues & Fixes**

### Backend Won't Start
```bash
# Check logs in Railway/Render dashboard
# Likely issue: Missing environment variables
# Fix: Add all .env variables to deployment service
```

### Frontend Gets 404 from API
```bash
# Check VITE_API_URL is correct
# Vercel > Project Settings > Environment Variables
# Redeploy after changing env vars
```

### CORS Errors
```bash
# Backend already has CORS enabled
# If still failing, check backend logs:
# Railway > Logs tab
```

### Backend Keeps Sleeping (Render)
```bash
# Render free tier auto-sleeps after 15 min
# Solution: Upgrade to $7/month OR keep using Railway
```

---

## **Environment Variables Checklist**

### Backend (.env or Vercel/Railway)
```
GITHUB_TOKEN=github_pat_xxxxx (optional)
NEWSAPI_KEY=xxxxx (optional)
SERPER_API_KEY=xxxxx (optional)
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel Environment Variables)
```
VITE_API_URL=https://your-backend-url
```

---

## **Monitoring After Deploy**

### Railway Dashboard
```
https://railway.app/dashboard
- View logs: Logs tab
- Check CPU/Memory: Metrics tab
- Redeploy: Deploy tab
```

### Vercel Dashboard
```
https://vercel.com/dashboard
- View logs: Deployments > Details
- Check analytics: Analytics tab
- Redeploy: Redeploy tab
```

### Monitor API Health
```bash
# Add to cron job (optional - every 5 min)
curl -s https://your-backend-url/api/health | jq .
```

---

## **Rollback Plan**

### If deployment breaks:

**Railway**
```
Go to Deploy tab
Click previous commit
Click "Redeploy"
Takes ~1 minute
```

**Vercel**
```
Go to Deployments
Click previous deployment
Click "Promote to Production"
Takes ~10 seconds
```

---

## **Domain Setup (Optional)**

### Add Custom Domain
```
Railway: Settings > Domains > Add Domain
Vercel: Settings > Domains > Add Domain
Point DNS to provided nameservers
```

### GitHub Pages Alternative
```bash
cd frontend
npm run build
# Push dist/ to GitHub Pages branch
```

---

## **Quick Reference: Deploy URLs**

After deployment, save these:
```
GitHub: https://github.com/AllStreets/vc-tool
Backend: https://vc-tool-backend.railway.app
Frontend: https://vc-tool.vercel.app
Health Check: [Backend]/api/health
```

---

## **One-Click Deploy Links** (If Enabled)

```
Railway Deploy Button: (requires setup)
Render Deploy Button: (requires setup)
```

---

**Total Deployment Time: ~5-10 minutes**
**Total Cost: $0/month**
**Uptime: 99.9% (both services)**
