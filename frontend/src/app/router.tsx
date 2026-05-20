import { Navigate, createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { BoardPage } from "../pages/board/BoardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/projects/demo/board" replace />,
      },
      {
        path: "projects/demo/board",
        element: <BoardPage />,
      },
    ],
  },
]);
