# Quick Reference - Desi Bazaar

## 🚀 Quick Start (After Initial Setup)

### Windows
```cmd
# Option 1: Use the batch file
start-dev.bat

# Option 2: Manual start
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Linux/Mac
```bash
# Option 1: Use the shell script
chmod +x start-dev.sh
./start-dev.sh

# Option 2: Manual start
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 📍 URLs

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:4000
- **Health Check:** http://localhost:4000/api/health

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/desi_bazaar"
PORT=4000
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### Frontend (root `.env` - optional)
```env
VITE_API_URL=http://localhost:4000/api
```

## 📦 Installation (First Time)

```bash
# 1. Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate

# 2. Frontend
cd ..
npm install

# 3. ML (Optional)
cd backend/ml
pip install -r requirements.txt
python train.py
```

## 🛠️ Common Commands

| Task | Command |
|------|---------|
| Start Backend | `cd backend && npm run dev` |
| Start Frontend | `npm run dev` |
| Database Migration | `cd backend && npm run prisma:migrate` |
| Generate Prisma Client | `cd backend && npm run prisma:generate` |
| Train ML Model | `cd backend/ml && python train.py` |
| Test ML Prediction | `cd backend/ml && python test_predict.py` |

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Port 4000 in use | Change `PORT` in `backend/.env` |
| Database error | Check PostgreSQL is running & `DATABASE_URL` is correct |
| Module not found | Run `npm install` in respective folder |
| Prisma error | Run `npm run prisma:generate` |
| ML model not found | Run `python train.py` in `backend/ml/` |

## 📚 Documentation

- **Full Setup Guide:** `SETUP.md`
- **ML Documentation:** `backend/ml/README.md`
- **ML Quick Start:** `backend/ml/QUICKSTART.md`







