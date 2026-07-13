import { useEffect } from "react";
import { Navigate, Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { AppShell } from "@/components/layout/AppShell";
import { BoardView } from "@/components/views/BoardView";
import { ListView } from "@/components/views/ListView";
import { DashboardView } from "@/components/views/DashboardView";
import { TimelineView } from "@/components/views/TimelineView";
import { CalendarView } from "@/components/views/CalendarView";
import { AuthPage } from "@/pages/AuthPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { MyTasksPage } from "@/pages/MyTasksPage";
import { SettingsPage } from "@/pages/SettingsPage";

function ProtectedRoute() {
  const { isAuthenticated, accessToken, fetchProfile } = useAuthStore();
  const { initialize, workspaces } = useWorkspaceStore();

  useEffect(() => {
    if (accessToken && !isAuthenticated) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && workspaces.length === 0) {
      initialize();
    }
  }, [isAuthenticated]);

  if (!accessToken) return <Navigate to="/login" replace />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}

function PublicRoute() {
  const { accessToken } = useAuthStore();
  if (accessToken) return <Navigate to="/" replace />;
  return <Outlet />;
}

function BoardPage() {
  const { tasks, currentProject, reorderTasks } = useWorkspaceStore();
  return (
    <BoardView
      tasks={tasks}
      projectId={currentProject?.id || ""}
      onReorder={reorderTasks}
    />
  );
}

function ListPage() {
  const { tasks } = useWorkspaceStore();
  return <ListView tasks={tasks} />;
}

function DashboardPage() {
  const { tasks } = useWorkspaceStore();
  return <DashboardView tasks={tasks} />;
}

function TimelinePage() {
  const { tasks } = useWorkspaceStore();
  return <TimelineView tasks={tasks} />;
}

function CalendarPage() {
  const { tasks } = useWorkspaceStore();
  return <CalendarView tasks={tasks} />;
}

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <AuthPage mode="login" /> },
      { path: "/register", element: <AuthPage mode="register" /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/board", element: <BoardPage /> },
          { path: "/list", element: <ListPage /> },
          { path: "/my-tasks", element: <MyTasksPage /> },
          { path: "/timeline", element: <TimelinePage /> },
          { path: "/calendar", element: <CalendarPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

export function App() {
  return <RouterProvider router={router} />;
}
