

# 🌾 Farmers Hub

A digital platform that connects **farmers directly with buyers** to enable transparent, fair, and efficient agricultural trade. Farmers Hub aims to reduce middlemen dependency, provide better price visibility, and empower farmers using technology.

---

## 📌 Project Overview

Farmers Hub is a web-based application designed as part of a **final-year software project**. The platform allows farmers to list their crops and buyers to directly view, negotiate, and purchase crops. An additional focus of the project is **price transparency** and **data-driven insights** for farmers.

The system is built with scalability, usability, and real-world applicability in mind.

---

## 🎯 Objectives

* Enable **direct farmer-to-buyer communication**
* Reduce exploitation by intermediaries
* Provide **fair and transparent crop pricing**
* Digitize crop listings and demand
* Help farmers make informed selling decisions

---

## 👥 Target Users

* **Farmers** – to list crops, view prices, and find buyers
* **Buyers / Traders** – to search crops and connect with farmers
* **Admins** – to manage users, listings, and platform integrity

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL
- **ML:** Python, scikit-learn, Random Forest


### Other Tools & Technologies

 Git, GitHub, Postman ,DBeaver

---

## ✨ Key Features

### 👨‍🌾 Farmer Module

* Farmer registration & login
* Crop listing with details (name, quantity, price, location)
* View buyer requests
* Manage own listings

### 🛒 Buyer Module

* Buyer registration & login
* Search crops by category, price, or location
* View farmer details
* Contact farmers directly

### 📊 Price Prediction (ML Feature)

* Predicts crop prices based on historical data
* Helps farmers decide the right selling price
* here we are using Random forest algorithm to implement this 

### 🛡️ Admin Module

* Manage users (farmers & buyers)
* Monitor crop listings
* Ensure platform safety and data validity

---

## 🚀 Quick Start

**For detailed setup instructions, see [SETUP.md](./SETUP.md)**

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL (v12+)

### Quick Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   npm install
   
   # ML (Optional)
   cd backend/ml && pip install -r requirements.txt
   ```

2. **Set up database:**
   ```bash
   cd backend
   # Create .env file with DATABASE_URL
   npm run prisma:generate
   npm run prisma:migrate
   ```

3. **Start servers:**
   ```bash
   # Windows
   start-dev.bat
   
   # Linux/Mac
   ./start-dev.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:4000

## 📁 Project Structure

- `src/` - React frontend (Vite)
- `backend/` - Node.js/Express API
- `backend/ml/` - ML model for crop price prediction
- `backend/prisma/` - Database schema

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick command reference
- **[backend/ml/README.md](./backend/ml/README.md)** - ML model documentation


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


## 🤝 Team Members

* Subramanya Bhaskar Achari(4SU22IS051) 
* Prateek Gokhale(4SU22IS035)
* C H Devaraj(4SU22IS013)
* Srujan(4SU22IS049)



## 📜 License

This project is developed for **academic purposes**.
Team ID: 7ISP10

---

## 🙏 Acknowledgements

* College / University
* Project Guide
* Open-source tools and libraries

---



> *“Empowering farmers through technology and transparency.”* 🌱

