# 🚀 ApexTask - Project Management Tool

Welcome to **ApexTask**, a modern, full-stack Kanban-style Project Management application designed for teams! This project features a beautiful React frontend, a robust Node.js backend, and uses Neon PostgreSQL for the database and Firebase for Authentication.

---

## ✨ Features
* 🔐 **Authentication:** Secure Email/Password & Google Sign-In powered by Firebase.
* 📋 **Kanban Board:** Smooth drag-and-drop task management with real-time optimistic UI updates.
* 🎨 **Modern Design:** Beautiful UI with a sleek Dark/Light mode toggle.
* 👥 **Workspaces & Collaboration:** Organize projects by workspaces and assign tasks to teammates.
* 🔔 **Real-Time Notifications:** Stay updated on task assignments and project changes.

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, TypeScript, Tailwind CSS, Zustand (State Management), Hello Pangea DND (Drag & Drop).
* **Backend:** Node.js, Express, TypeScript, Prisma ORM.
* **Database:** Neon Serverless PostgreSQL.
* **Authentication:** Firebase Auth.

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1️⃣ Prerequisites
Make sure you have installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Git](https://git-scm.com/)

### 2️⃣ Installation
Clone the repository and install all the necessary dependencies. The project uses npm Workspaces, so you only need to run the install command once from the root directory!

```bash
# Clone the repository
git clone https://github.com/Ashay1111-at/Codsoft-ApexTask--Project-management-tool.git

# Navigate into the project folder
cd "Codsoft-ApexTask--Project-management-tool/apextask"

# Install all dependencies for both Frontend and Backend
npm install
```

### 3️⃣ Environment Setup
You will need to set up environment variables for both the backend and frontend.

**Backend Setup:**
1. Navigate to the backend folder: `cd backend`
2. Copy the example environment file: `cp .env.example .env` (or manually copy the contents of `.env.example` into a new `.env` file).
3. Fill in your `DATABASE_URL` (from Neon) and your Firebase service account details.

**Frontend Setup:**
1. Navigate to the frontend folder: `cd ../frontend`
2. Create a `.env` file and add your Firebase client configuration keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4️⃣ Database Setup
Once your `DATABASE_URL` is set up in the backend `.env`, run the following commands from the `apextask` root directory to initialize the database:

```bash
# Push the database schema to Neon PostgreSQL
npm run db:push

# Seed the database with sample data (optional but recommended!)
npm run db:seed
```

### 5️⃣ Run the Application
Start both the Frontend and Backend servers simultaneously with one command from the `apextask` root directory:

```bash
npm run dev
```

* 🌐 **Frontend URL:** `http://localhost:5173`
* 🔌 **Backend API:** `http://localhost:4000`

---

## 👨‍💻 Admin Access (Seed Data)
If you ran the `npm run db:seed` command, an admin account with sample data (workspaces, projects, and tasks) was created for you! You can log into it by clicking **Continue with Google** using the admin email you set up during the seed process.

Happy coding! 🎉
