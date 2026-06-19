export type ActivityLog = {
  id: string;
  taskId: string;
  userId: string | null;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
};
