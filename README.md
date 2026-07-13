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
git clone https://github.com/ashay-thorat/ApexTask-Project-management-tool.git

# Navigate into the project folder
cd ApexTask-Project-management-tool

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
Once your `DATABASE_URL` is set up in the backend `.env`, run the following commands from the root directory to initialize the database:

```bash
# Push the database schema to Neon PostgreSQL
npm run db:push

# Seed the database with sample data (optional but recommended!)
npm run db:seed
```

### 5️⃣ Run the Application Locally
Start both the Frontend and Backend servers simultaneously with one command from the root directory:

```bash
npm run dev
```

* 🌐 **Frontend URL:** `http://localhost:5173`
* 🔌 **Backend API:** `http://localhost:4000`

---

## ☁️ Deployment

You can deploy the frontend to Vercel and the backend to Render easily.

### Deploying Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New** -> **Project**.
2. Import your GitHub repository.
3. Under **Configure Project**, set the **Root Directory** to `frontend`.
4. Add all environment variables from your `frontend/.env` file.
5. Click **Deploy**.

### Deploying Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
2. Connect your GitHub repository. Render will detect the `render.yaml` file in the `backend/` folder.
3. Make sure the Root Directory is set to `backend` if asked.
4. Once the Web Service is created, navigate to its **Environment** tab and add the environment variables from your `backend/.env` file (`DATABASE_URL`, `JWT_SECRET`, Firebase variables).
5. Click **Save Changes** to deploy the API.
6. *(Important)* Copy your live Render URL and update your Vercel frontend environment variables to point to this new API URL.

---

## 👨‍💻 Admin Access (Seed Data)
If you ran the `npm run db:seed` command, an admin account with sample data (workspaces, projects, and tasks) was created for you! You can log into it by clicking **Continue with Google** using the admin email you set up during the seed process.

Happy coding! 🎉
