# Desi Bazaar - Complete Setup Guide

This guide will help you set up and run the entire Desi Bazaar project, including the frontend, backend, database, and ML components.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/downloads)

## 🗂️ Project Structure

```
desi-bazaar-1/
├── src/                    # Frontend (React + Vite)
├── backend/                # Backend (Node.js + Express)
│   ├── ml/                 # ML Model (Python)
│   ├── prisma/             # Database schema
│   └── routes/             # API routes
└── package.json            # Frontend dependencies
```

## 🚀 Step-by-Step Setup

### Step 1: Clone and Navigate to Project

```bash
cd C:\Users\Projects\desi-bazaar-1
```

### Step 2: Set Up Database

1. **Create PostgreSQL Database:**
   ```bash
   # Open PostgreSQL command line or pgAdmin
   # Create a new database
   createdb desi_bazaar
   # Or using psql:
   psql -U postgres
   CREATE DATABASE desi_bazaar;
   \q
   ```

2. **Configure Database Connection:**
   Create a `.env` file in the `backend/` folder:
   ```bash
   cd backend
   # Create .env file
   ```

   Add the following to `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/desi_bazaar?schema=public"
   PORT=4000
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NODE_ENV="development"
   ```

   **Replace:**
   - `username` with your PostgreSQL username (usually `postgres`)
   - `password` with your PostgreSQL password
   - `desi_bazaar` with your database name

### Step 3: Set Up Backend

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Prisma:**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate
   ```

3. **Verify Backend Setup:**
   ```bash
   # Start the backend server
   npm run dev
   ```

   You should see:
   ```
   API listening on http://localhost:4000
   ```

   **Keep this terminal open!**

### Step 4: Set Up ML Model (Optional but Recommended)

1. **Install Python Dependencies:**
   ```bash
   cd backend/ml
   pip install -r requirements.txt
   ```

2. **Train the Model:**
   ```bash
   python train.py
   ```
   
   ⚠️ **Note:** This may take 10-30 minutes depending on your machine.

   After training, you should see model files in `backend/ml/models/`:
   - `model.pkl`
   - `preprocessor.pkl`
   - `features.json`
   - `metrics.json`

### Step 5: Set Up Frontend

1. **Open a NEW terminal window** (keep backend running)

2. **Install Frontend Dependencies:**
   ```bash
   # Navigate to project root
   cd C:\Users\Projects\desi-bazaar-1
   npm install
   ```

3. **Configure Frontend API URL (Optional):**
   
   Create a `.env` file in the project root (if you need to change API URL):
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

   By default, the frontend uses `http://localhost:4000/api`

4. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:8080/
   ```

## ✅ Verify Everything is Running

1. **Backend:** http://localhost:4000/api/health
   - Should return: `{"ok": true, "service": "desi-bazaar-backend"}`

2. **Frontend:** http://localhost:8080
   - Should show the Desi Bazaar homepage

3. **ML Model (if trained):**
   ```bash
   cd backend/ml
   python test_predict.py
   ```

## 🎯 Running the Project

### Development Mode

You need **3 terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# In project root
npm run dev
```

**Terminal 3 - For ML (when needed):**
```bash
cd backend/ml
# Run predictions or training as needed
```

### Quick Start Script (Windows)

Create a `start-dev.bat` file in the project root:

```batch
@echo off
echo Starting Desi Bazaar Development Environment...
echo.

echo [1/2] Starting Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Development servers started!
echo Backend: http://localhost:4000
echo Frontend: http://localhost:8080
pause
```

Run it with:
```bash
start-dev.bat
```

## 📝 Common Commands

### Backend Commands
```bash
cd backend

# Development
npm run dev              # Start development server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:deploy    # Deploy migrations (production)
```

### Frontend Commands
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run linter
```

### ML Commands
```bash
cd backend/ml

# Training
python train.py          # Train the model

# Prediction
python predict.py < test_input.json
python test_predict.py   # Test prediction

# Using API
# POST http://localhost:4000/api/price-predictions/predict
```

## 🔧 Troubleshooting

### Backend Issues

**Problem:** `Error: Cannot find module`
- **Solution:** Run `npm install` in the `backend/` folder

**Problem:** `Prisma Client not generated`
- **Solution:** Run `npm run prisma:generate`

**Problem:** `Database connection error`
- **Solution:** 
  1. Check PostgreSQL is running
  2. Verify `DATABASE_URL` in `backend/.env`
  3. Check database exists: `psql -U postgres -l`

**Problem:** `Port 4000 already in use`
- **Solution:** Change `PORT` in `backend/.env` or kill the process using port 4000

### Frontend Issues

**Problem:** `Cannot connect to API`
- **Solution:** 
  1. Ensure backend is running on port 4000
  2. Check `VITE_API_URL` in root `.env` file
  3. Check CORS settings in `backend/server.js`

**Problem:** `Module not found`
- **Solution:** Run `npm install` in project root

### ML Issues

**Problem:** `Model artifacts not found`
- **Solution:** Run `python train.py` first

**Problem:** `ModuleNotFoundError: No module named 'sklearn'`
- **Solution:** Run `pip install -r requirements.txt` in `backend/ml/`

**Problem:** `Python not found`
- **Solution:** 
  1. Install Python 3.8+
  2. Add Python to PATH
  3. Verify: `python --version`

### Database Issues

**Problem:** `Migration failed`
- **Solution:** 
  1. Check database connection
  2. Ensure database exists
  3. Try: `npm run prisma:migrate -- --reset` (⚠️ This deletes all data!)

## 🌐 API Endpoints

Once running, you can access:

- **Health Check:** `GET http://localhost:4000/api/health`
- **Auth:** `POST http://localhost:4000/api/auth/register`
- **Crops:** `GET http://localhost:4000/api/crops`
- **Price Prediction:** `POST http://localhost:4000/api/price-predictions/predict`
- **Transportation:** `GET http://localhost:4000/api/transport`

See `backend/routes/` for all available endpoints.

## 📚 Additional Resources

- **ML Documentation:** `backend/ml/README.md`
- **ML Quick Start:** `backend/ml/QUICKSTART.md`
- **API Examples:** `backend/ml/API_EXAMPLE.md`
- **Prisma Docs:** https://www.prisma.io/docs

## 🎉 You're All Set!

Your Desi Bazaar application should now be running:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:4000
- **Database:** PostgreSQL (running locally)

Happy coding! 🚀

