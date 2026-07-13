import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace";
import type { WorkspaceRole } from "@/types";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const { addMember } = useWorkspaceStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");
    try {
      await addMember(email, role);
      setEmail("");
      setRole("MEMBER");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to invite teammate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-surface-base border border-outline-variant/30 rounded-xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2 text-on-surface">
                  <UserPlus size={16} strokeWidth={1.5} className="text-primary" />
                  <h2 className="text-sm font-semibold">Invite Teammate</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-md hover:bg-surface-container transition-colors"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
                {error && (
                  <div className="bg-error/10 text-error text-xs p-3 rounded border border-error/20">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-label text-on-surface-variant">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="bg-surface-container-low border border-outline-variant/30 text-sm rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="role" className="text-xs font-label text-on-surface-variant">Role</label>
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 text-sm rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-on-surface-variant">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="btn-primary text-xs"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Send Invite"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
