import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { toast } from "sonner";
import { User, Mail, Building2, Shield, Save } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuthStore();
  const { workspaces, updateProfile } = useWorkspaceStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const roleLabel: Record<string, string> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MEMBER: "Member",
    VIEWER: "Viewer",
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 max-w-3xl">
      <h1 className="text-headline-md text-on-surface">Profile</h1>

      <div className="glass-panel rounded-2xl p-lg space-y-md">
        <div className="flex items-center gap-4 pb-md border-b border-outline-variant/20">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl text-primary font-bold">
            {user?.name?.[0] || user?.email?.[0] || "?"}
          </div>
          <div>
            <h2 className="text-body-lg text-on-surface font-semibold">{user?.name || "Unnamed"}</h2>
            <p className="text-body-md text-on-surface-variant">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-label-md text-on-surface-variant mb-1.5 block flex items-center gap-1.5">
              <User size={14} /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="text-label-md text-on-surface-variant mb-1.5 block flex items-center gap-1.5">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              className="input-field w-full opacity-60"
              disabled
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-lg space-y-md">
        <h3 className="text-body-lg text-on-surface font-semibold flex items-center gap-2">
          <Building2 size={18} /> Workspaces
        </h3>
        <div className="space-y-2">
          {workspaces.map((ws) => {
            const myMembership = ws.members?.[0];
            return (
              <div key={ws.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container/50 border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                    {ws.name[0]}
                  </div>
                  <div>
                    <p className="text-sm text-on-surface font-medium">{ws.name}</p>
                    <p className="text-[11px] text-on-surface-variant">{ws._count?.members || 0} members</p>
                  </div>
                </div>
                {myMembership && (
                  <span className="text-[11px] font-label px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Shield size={11} className="inline mr-1" />
                    {roleLabel[myMembership.role] || myMembership.role}
                  </span>
                )}
              </div>
            );
          })}
          {workspaces.length === 0 && (
            <p className="text-sm text-on-surface-variant/60 py-4 text-center">No workspaces yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
