export type BoardColumn = {
  id: string;
  projectId: string;
  name: string;
  position: number;
  wipLimit?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBoardColumnRequest = {
  name: string;
  position: number;
  wipLimit?: number | null;
};

export type UpdateBoardColumnRequest = {
  name: string;
  position: number;
  wipLimit?: number | null;
};
