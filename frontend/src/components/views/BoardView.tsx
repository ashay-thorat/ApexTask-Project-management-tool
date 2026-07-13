import { useState } from "react";
import {
  DragDropContext, Droppable, Draggable, type DropResult,
} from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import {
  Plus, MoreHorizontal, Calendar, AlertCircle, User,
  Clock, CheckCircle2, Radio, Target,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

const columns: { id: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { id: "BACKLOG", label: "Backlog", icon: <Clock size={14} strokeWidth={1.5} /> },
  { id: "TODO", label: "Todo", icon: <Radio size={14} strokeWidth={1.5} /> },
  { id: "IN_PROGRESS", label: "In Progress", icon: <Target size={14} strokeWidth={1.5} /> },
  { id: "IN_REVIEW", label: "In Review", icon: <AlertCircle size={14} strokeWidth={1.5} /> },
  { id: "DONE", label: "Done", icon: <CheckCircle2 size={14} strokeWidth={1.5} /> },
];

const priorityBorderColors: Record<string, string> = {
  URGENT: "bg-tertiary",
  HIGH: "bg-error",
  MEDIUM: "bg-primary",
  LOW: "bg-on-surface-variant",
};

interface BoardViewProps {
  tasks: Task[];
  onReorder: (projectId: string, updates: { id: string; status: TaskStatus; sortOrder: number }[]) => void;
  projectId: string;
}

export function BoardView({ tasks, onReorder, projectId }: BoardViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createInStatus, setCreateInStatus] = useState<TaskStatus | null>(null);
  const grouped = columns.reduce(
    (acc, col) => {
      acc[col.id] = (tasks || []).filter((t) => t.status === col.id).sort((a, b) => a.sortOrder - b.sortOrder);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId as TaskStatus;
    const destCol = destination.droppableId as TaskStatus;
    const newTasks = [...tasks];
    const movedTask = newTasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    movedTask.status = destCol;
    const colTasks = newTasks.filter((t) => t.status === destCol).sort((a, b) => a.sortOrder - b.sortOrder);
    colTasks.splice(destination.index, 0, movedTask);
    colTasks.forEach((t, i) => (t.sortOrder = i));

    onReorder(
      projectId,
      newTasks.map((t) => ({ id: t.id, status: t.status as TaskStatus, sortOrder: t.sortOrder }))
    );
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-6 bg-surface-base">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((col) => {
            const colTasks = grouped[col.id] || [];
            return (
              <div key={col.id} className="w-[280px] lg:w-72 flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant">{col.icon}</span>
                    <h3 className="text-xs font-label text-on-surface tracking-wide uppercase">{col.label}</h3>
                    <span className="text-on-surface-variant text-[10px] font-mono opacity-60">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded p-0.5 transition-colors duration-[150ms] ease-fast"
                    onClick={() => setCreateInStatus(col.id)}
                    title={`Add task to ${col.label}`}
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 overflow-y-auto space-y-2 p-1 rounded-lg transition-colors duration-[150ms] ease-fast",
                        snapshot.isDraggingOver && "bg-surface-container/30"
                      )}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                              className="group outline-none"
                            >
                              <motion.div
                                onClick={() => setSelectedTaskId(task.id)}
                                animate={{ scale: snapshot.isDragging ? 1.02 : 1 }}
                                whileHover={{ scale: snapshot.isDragging ? 1.02 : 1.01 }}
                                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                                className={cn(
                                  "glass-card rounded-lg p-3 cursor-pointer relative overflow-hidden",
                                  snapshot.isDragging && "shadow-2xl z-50 ring-1 ring-primary/50 bg-surface-container-high",
                                  task.status === "IN_PROGRESS" && "ring-1 ring-primary/30"
                                )}
                              >
                                {/* Left border accent for priority */}
                                {task.priority !== "NONE" && (
                                  <div className={cn(
                                    "absolute left-0 top-0 bottom-0 w-[2px]",
                                    priorityBorderColors[task.priority]
                                  )} />
                                )}
                                
                                <div className="flex items-start justify-between mb-2">
                                  <span className={cn(
                                    "text-[10px] font-mono",
                                    task.status === "IN_PROGRESS" ? "text-primary" : "text-on-surface-variant/60"
                                  )}>
                                    {task.identifier || task.id.slice(0, 8)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <MoreHorizontal size={14} strokeWidth={1.5} className="text-on-surface-variant/40 opacity-0 group-hover:opacity-100 transition-opacity duration-[150ms] ease-fast" />
                                  </div>
                                </div>
                                <h4 className={cn(
                                  "text-sm leading-snug mb-3 transition-colors duration-[150ms] ease-fast font-medium",
                                  task.status === "DONE" ? "text-on-surface-variant/60 line-through" : "text-on-surface",
                                )}>
                                  {task.title}
                                </h4>
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1.5 flex-wrap">
                                    {task.labels?.slice(0, 2).map((tl) => (
                                      <span
                                        key={tl.id}
                                        className="bg-surface-container-high px-1.5 py-0.5 rounded text-[9px] font-label text-on-surface-variant border border-outline-variant/30"
                                      >
                                        {tl.label.name}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {task.dueDate && (
                                      <span className={cn(
                                        "text-[10px] font-label flex items-center gap-1",
                                        new Date(task.dueDate) < new Date() && task.status !== "DONE"
                                          ? "text-error"
                                          : "text-on-surface-variant/60"
                                      )}>
                                        <Calendar size={10} strokeWidth={1.5} />
                                        {formatDate(task.dueDate)}
                                      </span>
                                    )}
                                    <div className="flex -space-x-1">
                                      {task.assignees?.slice(0, 3).map((a) => (
                                        <div
                                          key={a.id}
                                          className="w-5 h-5 rounded-full bg-surface-container-highest border border-surface-container flex items-center justify-center text-[8px] font-semibold text-on-surface overflow-hidden"
                                          title={a.user.name || a.user.email}
                                        >
                                          {a.user.avatarUrl ? (
                                            <img src={a.user.avatarUrl} className="w-full h-full object-cover" />
                                          ) : (
                                            (a.user.name?.[0] || a.user.email[0])
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
      <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      <CreateTaskModal
        open={createInStatus !== null}
        onClose={() => setCreateInStatus(null)}
        defaultStatus={createInStatus ?? undefined}
      />
    </div>
  );
}
