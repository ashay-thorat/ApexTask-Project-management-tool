# ApexTask 🚀

ApexTask is a sleek, modern, dark-themed Project Management tool built for high-performance teams. It features a stunning, animated user interface and robust backend functionality that allows teams to manage workspaces, projects, and tasks with ease.

## ✨ Features

- **Premium Dark UI:** Designed with a carefully crafted, dark-first color palette (`zinc-950` base, `violet-blue` accents), clean typography (Inter), and smooth micro-animations using Framer Motion.
- **Global Command Palette (Cmd+K):** A centralized, lightning-fast overlay for quick navigation across the app, switching projects, and executing actions like creating tasks.
- **Workspace & Project Management:** Create, rename, delete, and switch between multiple isolated workspaces and projects.
- **Kanban Board:** Drag-and-drop tasks across fully customizable columns (Backlog, Todo, In Progress, In Review, Done).
- **Comprehensive Task Management:** Create tasks, assign team members, set due dates with a native picker, apply labels, manage priorities, and track activity and comments.
- **Role-Based Access Control (RBAC):** Invite members to your workspace and assign roles (Owner, Admin, Member, Viewer).
- **Responsive Layout:** Dynamic collapsible sidebar, persistent topbar with search, and an intuitive dashboard landing page.

## 🛠️ Technology Stack

**Frontend:**
- [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v3](https://tailwindcss.com/) (Custom Design System)
- [Zustand](https://zustand-demo.pmnd.rs/) (Global State Management)
- [Framer Motion](https://www.framer.com/motion/) (Animations)
- [React Router v6](https://reactrouter.com/) (Routing)
- [Lucide React](https://lucide.dev/) (Icons)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [Neon Serverless PostgreSQL](https://neon.tech/)
- JSON Web Tokens (JWT) for Authentication

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or higher recommended)
- A [Neon Postgres](https://neon.tech/) database (or any PostgreSQL instance)

### 1. Clone the repository

```bash
git clone https://github.com/ashay-thorat/ApexTask-Project-management-tool.git
cd ApexTask-Project-management-tool
```

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=4000
DATABASE_URL="postgresql://neondb_owner:password@ep-withered-surf-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your_super_secret_jwt_string_here"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
```

Sync your database schema using Prisma:
```bash
npx prisma db push
```

Start the backend development server:
```bash
npm run dev
```
*The backend will run on `http://localhost:4000`.*

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend development server:
```bash
npm run dev
```
*The frontend will be available at `http://localhost:5173` (or the port specified by Vite).*

---

## 📸 Usage

1. Open `http://localhost:5173` in your browser.
2. Register a new account.
3. Create your first Workspace and Project.
4. Press `Cmd+K` (or `Ctrl+K`) to open the Command Palette.
5. Start creating and moving tasks!

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request for improvements and bug fixes.

## 📝 License

This project is licensed under the MIT License.
