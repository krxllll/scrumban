export type Project = {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  name: string;
  description?: string | null;
};

export type UpdateProjectRequest = {
  name: string;
  description?: string | null;
};
