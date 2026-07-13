import { create } from "zustand";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import type { Workspace, Project, Task, Label, WorkspaceRole } from "@/types";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  projects: Project[];
  tasks: Task[];
  labels: Label[];
  isLoading: boolean;
  isCommandPaletteOpen: boolean;
  isCreateTaskModalOpen: boolean;

  currentUserRole: WorkspaceRole | null;

  setCommandPaletteOpen: (open: boolean) => void;
  setCreateTaskModalOpen: (open: boolean) => void;
  initialize: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (ws: Workspace) => Promise<void>;
  fetchProjects: (workspaceId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => Promise<void>;
  fetchTasks: (projectId: string) => Promise<void>;
  fetchLabels: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (name: string) => Promise<void>;
  createProject: (data: Partial<Project> & { workspaceId: string }) => Promise<void>;
  updateProject: (projectId: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createTask: (data: Partial<Task> & { projectId: string }) => Promise<void>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  assignTask: (taskId: string, assigneeIds: string[]) => Promise<void>;
  updateTaskLabels: (taskId: string, labelIds: string[]) => Promise<void>;
  reorderTasks: (projectId: string, tasks: { id: string; status: string; sortOrder: number }[]) => Promise<void>;
  addMember: (email: string, role?: WorkspaceRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  currentProject: null,
  projects: [],
  tasks: [],
  labels: [],
  isLoading: false,
  isCommandPaletteOpen: false,
  isCreateTaskModalOpen: false,
  currentUserRole: null,

  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setCreateTaskModalOpen: (open) => set({ isCreateTaskModalOpen: open }),

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: wsData } = await api.get("/workspaces");
      const workspaces: Workspace[] = wsData.workspaces;
      set({ workspaces, isLoading: false });

      if (workspaces.length > 0) {
        const ws = workspaces[0];
        const { data: wsDetail } = await api.get(`/workspaces/${ws.id}`);
        const userId = useAuthStore.getState().user?.id;
        const myMembership = wsDetail.members?.find((m: any) => m.userId === userId);
        set({ currentWorkspace: wsDetail, projects: wsDetail.projects || [], currentUserRole: myMembership?.role || null });

        if (wsDetail.projects && wsDetail.projects.length > 0) {
          const project = wsDetail.projects[0];
          const { data: projectDetail } = await api.get(`/projects/${project.id}`);
          set({ currentProject: projectDetail, tasks: projectDetail.tasks || [] });
        }

        const { data: labelData } = await api.get(`/labels/workspace/${ws.id}`);
        set({ labels: labelData.labels || [] });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchWorkspaces: async () => {
    const { data } = await api.get("/workspaces");
    set({ workspaces: data.workspaces });
  },

  setCurrentWorkspace: async (ws) => {
    set({ currentWorkspace: ws, currentProject: null, tasks: [] });
    const { data } = await api.get(`/workspaces/${ws.id}`);
    const userId = useAuthStore.getState().user?.id;
    const myMembership = data.members?.find((m: any) => m.userId === userId);
    set({ currentWorkspace: data, projects: data.projects || [], currentUserRole: myMembership?.role || null });
  },

  fetchProjects: async (workspaceId) => {
    const { data } = await api.get(`/projects/workspace/${workspaceId}`);
    set({ projects: data.projects });
  },

  setCurrentProject: async (project) => {
    set({ currentProject: project });
    if (project) {
      const { data } = await api.get(`/projects/${project.id}`);
      set({ tasks: data.tasks || [] });
    } else {
      set({ tasks: [] });
    }
  },

  fetchTasks: async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}`);
    set({ tasks: data.tasks || [] });
  },

  fetchLabels: async (workspaceId) => {
    const { data } = await api.get(`/labels/workspace/${workspaceId}`);
    set({ labels: data.labels || [] });
  },

  createWorkspace: async (name) => {
    const { data } = await api.post("/workspaces", { name });
    set((s) => ({ workspaces: [...s.workspaces, data] }));
    return data;
  },

  updateWorkspace: async (name) => {
    const { currentWorkspace } = get();
    if (!currentWorkspace) return;
    const { data } = await api.patch(`/workspaces/${currentWorkspace.id}`, { name });
    set((s) => ({
      currentWorkspace: { ...s.currentWorkspace, ...data },
      workspaces: s.workspaces.map((w) => w.id === currentWorkspace.id ? { ...w, ...data } : w)
    }));
  },

  createProject: async (projectData) => {
    const { data } = await api.post("/projects", projectData);
    set((s) => ({ projects: [data, ...s.projects] }));
    get().setCurrentProject(data);
  },

  updateProject: async (projectId, projectData) => {
    const { data } = await api.patch(`/projects/${projectId}`, projectData);
    set((s) => ({
      projects: s.projects.map((p) => p.id === projectId ? { ...p, ...data } : p),
      currentProject: s.currentProject?.id === projectId ? { ...s.currentProject, ...data } : s.currentProject
    }));
  },

  deleteProject: async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== projectId),
      currentProject: s.currentProject?.id === projectId ? null : s.currentProject
    }));
  },

  createTask: async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    // Optimistically add to local state
    set((s) => ({ tasks: [...s.tasks, data] }));
    // If created task belongs to currentProject, refetch to get full data (assignees, labels, etc.)
    const { currentProject } = get();
    if (currentProject && taskData.projectId === currentProject.id) {
      try {
        const { data: projectData } = await api.get(`/projects/${currentProject.id}`);
        set({ tasks: projectData.tasks || [] });
      } catch { /* keep optimistic data */ }
    }
  },

  updateTask: async (taskId, taskData) => {
    const { data } = await api.patch(`/tasks/${taskId}`, taskData);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
    }));
  },

  assignTask: async (taskId, assigneeIds) => {
    const { data } = await api.post(`/tasks/${taskId}/assign`, { assigneeIds });
    const { tasks } = get();
    const update = tasks.find((t) => t.id === taskId);
    if (update) {
      set({ tasks: tasks.map((t) => (t.id === taskId ? { ...t, assignees: data.assignees } : t)) });
    }
  },

  updateTaskLabels: async (taskId, labelIds) => {
    const { data } = await api.post(`/tasks/${taskId}/labels`, { labelIds });
    const { tasks } = get();
    const update = tasks.find((t) => t.id === taskId);
    if (update) {
      set({ tasks: tasks.map((t) => (t.id === taskId ? { ...t, labels: data.labels } : t)) });
    }
  },

  deleteTask: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },

  reorderTasks: async (projectId, tasks) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        const update = tasks.find((u) => u.id === t.id);
        if (update) return { ...t, status: update.status as any, sortOrder: update.sortOrder };
        return t;
      }).sort((a, b) => a.sortOrder - b.sortOrder),
    }));
    await api.post("/tasks/reorder", { projectId, tasks });
  },

  addMember: async (email, role = "MEMBER") => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const { data } = await api.post(`/workspaces/${ws.id}/members`, { email, role });
    set((s) => ({
      currentWorkspace: s.currentWorkspace
        ? { ...s.currentWorkspace, members: [...(s.currentWorkspace.members || []), data] }
        : null,
    }));
  },

  removeMember: async (memberId) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    // memberId here is the WorkspaceMember.id - find userId for the API call
    const member = ws.members?.find((m) => m.id === memberId);
    if (!member) return;
    await api.delete(`/workspaces/${ws.id}/members/${member.userId}`);
    set((s) => ({
      currentWorkspace: s.currentWorkspace
        ? { ...s.currentWorkspace, members: s.currentWorkspace.members?.filter((m) => m.id !== memberId) }
        : null,
    }));
  },

  updateMemberRole: async (memberId, role) => {
    const ws = get().currentWorkspace;
    if (!ws) return;
    const member = ws.members?.find((m) => m.id === memberId);
    if (!member) return;
    await api.patch(`/workspaces/${ws.id}/members/${member.userId}`, { role });
    set((s) => ({
      currentWorkspace: s.currentWorkspace
        ? {
            ...s.currentWorkspace,
            members: s.currentWorkspace.members?.map((m) =>
              m.id === memberId ? { ...m, role } : m
            ),
          }
        : null,
    }));
  },

  updateProfile: async (profileData) => {
    const { data } = await api.patch("/auth/me", profileData);
    useAuthStore.getState().fetchProfile();
  },
}));
