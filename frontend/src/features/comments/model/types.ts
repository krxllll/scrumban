export type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommentRequest = {
  content: string;
};

export type UpdateCommentRequest = {
  content: string;
};
