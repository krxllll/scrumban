import { api } from "../../../shared/lib/apiClient";
import type {
  BoardColumn,
  CreateBoardColumnRequest,
  UpdateBoardColumnRequest,
} from "../model/types";

type DeleteResponse = {
  deleted: boolean;
};

export function getBoardColumns(
  token: string,
  projectId: string,
): Promise<BoardColumn[]> {
  return api.get<BoardColumn[]>(`/api/projects/${projectId}/columns`, {
    token,
  });
}

export function createBoardColumn(
  token: string,
  projectId: string,
  payload: CreateBoardColumnRequest,
): Promise<BoardColumn> {
  return api.post<BoardColumn>(`/api/projects/${projectId}/columns`, payload, {
    token,
  });
}

export function updateBoardColumn(
  token: string,
  projectId: string,
  columnId: string,
  payload: UpdateBoardColumnRequest,
): Promise<BoardColumn> {
  return api.put<BoardColumn>(
    `/api/projects/${projectId}/columns/${columnId}`,
    payload,
    { token },
  );
}

export function deleteBoardColumn(
  token: string,
  projectId: string,
  columnId: string,
): Promise<DeleteResponse> {
  return api.del<DeleteResponse>(
    `/api/projects/${projectId}/columns/${columnId}`,
    { token },
  );
}

export const columnsApi = {
  getBoardColumns,
  createBoardColumn,
  updateBoardColumn,
  deleteBoardColumn,
};
