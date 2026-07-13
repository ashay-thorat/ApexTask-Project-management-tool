import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace";
import { useAuthStore } from "@/stores/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { WorkspaceRole } from "@/types";
import { UserPlus, Shield, Trash2, Plus, Pencil, Check, X } from "lucide-react";

const roleColors: Record<string, string> = {
  OWNER: "bg-tertiary/20 text-tertiary border-tertiary/30",
  ADMIN: "bg-primary/20 text-primary border-primary/30",
  MEMBER: "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
  VIEWER: "bg-surface-container-high text-on-surface-variant/60 border-outline-variant/20",
};

export function SettingsPage() {
  const { currentWorkspace, currentUserRole, addMember, removeMember, updateMemberRole, projects, tasks, createProject, updateWorkspace, updateProject, deleteProject } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [editWorkspaceName, setEditWorkspaceName] = useState("");
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState("");

  const isAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN";
  const members = currentWorkspace?.members || [];

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      await addMember(email.trim());
      toast.success("Member added");
      setEmail("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to add member";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this workspace?`)) return;
    try {
      await removeMember(memberId);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleRoleChange = async (memberId: string, role: WorkspaceRole) => {
    try {
      await updateMemberRole(memberId, role);
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !currentWorkspace) return;
    setCreatingProject(true);
    try {
      await createProject({ title: newProjectTitle.trim(), workspaceId: currentWorkspace.id });
      toast.success("Project created");
      setNewProjectTitle("");
      setShowNewProject(false);
    } catch {
      toast.error("Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleUpdateWorkspace = async () => {
    if (!editWorkspaceName.trim() || editWorkspaceName === currentWorkspace?.name) {
      setIsEditingWorkspace(false);
      return;
    }
    try {
      await updateWorkspace(editWorkspaceName.trim());
      toast.success("Workspace updated");
      setIsEditingWorkspace(false);
    } catch {
      toast.error("Failed to update workspace");
    }
  };

  const handleUpdateProject = async (projectId: string) => {
    if (!editProjectTitle.trim()) {
      setEditingProjectId(null);
      return;
    }
    try {
      await updateProject(projectId, { title: editProjectTitle.trim() });
      toast.success("Project updated");
      setEditingProjectId(null);
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete the project "${projectTitle}"? All tasks inside will be permanently deleted.`)) return;
    try {
      await deleteProject(projectId);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-3xl">
      <h1 className="text-headline-md text-on-surface">Settings</h1>

      <div className="glass-panel rounded-2xl p-lg space-y-md">
        <div className="flex items-center justify-between">
          {isEditingWorkspace ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input 
                autoFocus
                className="input-field flex-1 text-sm py-1" 
                value={editWorkspaceName}
                onChange={(e) => setEditWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateWorkspace();
                  if (e.key === "Escape") setIsEditingWorkspace(false);
                }}
              />
              <button onClick={handleUpdateWorkspace} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30"><Check size={14}/></button>
              <button onClick={() => setIsEditingWorkspace(false)} className="p-1.5 bg-error/20 text-error rounded hover:bg-error/30"><X size={14}/></button>
            </div>
          ) : (
            <h3 className="text-body-lg text-on-surface font-semibold flex items-center gap-2">
              <Shield size={18} /> Workspace — {currentWorkspace?.name || "Loading..."}
              {isAdmin && (
                <button onClick={() => {
                  setEditWorkspaceName(currentWorkspace?.name || "");
                  setIsEditingWorkspace(true);
                }} className="ml-2 p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md">
                  <Pencil size={14} />
                </button>
              )}
            </h3>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20">
            <p className="text-on-surface-variant text-[11px] font-label">Projects</p>
            <p className="text-headline-md text-on-surface mt-1">{projects.length}</p>
          </div>
          <div className="bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20">
            <p className="text-on-surface-variant text-[11px] font-label">Members</p>
            <p className="text-headline-md text-on-surface mt-1">{members.length}</p>
          </div>
          <div className="bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20">
            <p className="text-on-surface-variant text-[11px] font-label">Tasks</p>
            <p className="text-headline-md text-on-surface mt-1">{tasks.length}</p>
          </div>
          <div className="bg-surface-container/50 rounded-xl p-3 border border-outline-variant/20">
            <p className="text-on-surface-variant text-[11px] font-label">Your Role</p>
            <p className="text-headline-md text-on-surface mt-1">{currentUserRole || "—"}</p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="glass-panel rounded-2xl p-lg space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="text-body-lg text-on-surface font-semibold flex items-center gap-2">
            <Shield size={18} /> Projects
          </h3>
          {isAdmin && (
            <button
              onClick={() => setShowNewProject(!showNewProject)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Plus size={14} /> New Project
            </button>
          )}
        </div>

        {showNewProject && (
          <form onSubmit={handleCreateProject} className="flex items-center gap-2">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Project name"
              className="input-field flex-1"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={creatingProject}
              className="btn-primary text-sm"
            >
              {creatingProject ? (
                <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : "Create"}
            </button>
            <button type="button" onClick={() => setShowNewProject(false)} className="btn-ghost text-sm">Cancel</button>
          </form>
        )}

        <div className="space-y-1">
          {projects.length === 0 && (
            <p className="text-sm text-on-surface-variant/60 py-4 text-center">No projects yet</p>
          )}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/50 border border-outline-variant/20 group">
              <div className="flex-1">
                {editingProjectId === p.id ? (
                  <div className="flex items-center gap-2 max-w-sm">
                    <input 
                      autoFocus
                      className="input-field text-sm py-1 flex-1"
                      value={editProjectTitle}
                      onChange={(e) => setEditProjectTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateProject(p.id);
                        if (e.key === "Escape") setEditingProjectId(null);
                      }}
                    />
                    <button onClick={() => handleUpdateProject(p.id)} className="p-1 bg-primary/20 text-primary rounded"><Check size={14}/></button>
                    <button onClick={() => setEditingProjectId(null)} className="p-1 bg-error/20 text-error rounded"><X size={14}/></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-on-surface font-medium">{p.title}</p>
                      {isAdmin && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button onClick={() => {
                            setEditProjectTitle(p.title);
                            setEditingProjectId(p.id);
                          }} className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-md">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteProject(p.id, p.title)} className="p-1 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant">{p.status}</p>
                  </>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-label px-2 py-0.5 rounded-full border",
                p.priority === "URGENT" ? "bg-tertiary/20 text-tertiary border-tertiary/30" :
                p.priority === "HIGH" ? "bg-error/20 text-error border-error/30" :
                "bg-surface-container-high text-on-surface-variant border-outline-variant/30"
              )}>
                {p.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Members Section */}
      <div className="glass-panel rounded-2xl p-lg space-y-md">
        <h3 className="text-body-lg text-on-surface font-semibold flex items-center gap-2">
          <UserPlus size={18} /> Members
        </h3>

        {isAdmin && (
          <form onSubmit={handleAddMember} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              Add
            </button>
          </form>
        )}

        <div className="space-y-1">
          {members.map((m) => {
            const isSelf = m.userId === user?.id;
            return (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/50 border border-outline-variant/20">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold shrink-0">
                    {m.user.name?.[0] || m.user.email[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-on-surface truncate">
                      {m.user.name || "Unnamed"}
                      {isSelf && <span className="text-on-surface-variant/60 text-[11px] ml-1">(you)</span>}
                    </p>
                    <p className="text-[11px] text-on-surface-variant truncate">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && !isSelf && m.role !== "OWNER" ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value as WorkspaceRole)}
                      className="text-[10px] font-label px-2 py-0.5 rounded-full border bg-surface-container-high text-on-surface-variant border-outline-variant/30 cursor-pointer"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  ) : (
                    <span className={cn(
                      "text-[10px] font-label px-2 py-0.5 rounded-full border",
                      roleColors[m.role] || ""
                    )}>
                      {m.role}
                    </span>
                  )}
                  {isAdmin && !isSelf && m.role !== "OWNER" && (
                    <button
                      onClick={() => handleRemoveMember(m.id, m.user.name || m.user.email)}
                      className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error/5 transition-all"
                      title="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="text-sm text-on-surface-variant/60 py-4 text-center">No members found</p>
          )}
        </div>
      </div>
    </div>
  );
}




