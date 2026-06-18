import { createBrowserRouter } from "react-router-dom";
import { App } from "./App";
import { HomeRedirect } from "../features/auth/model/HomeRedirect";
import { RedirectIfAuthenticated } from "../features/auth/model/RedirectIfAuthenticated";
import { RequireAuth } from "../features/auth/model/RequireAuth";
import { LogInPage } from "../pages/auth/LogInPage.tsx";
import { SignUpPage } from "../pages/auth/SignUpPage";
import { BoardPage } from "../pages/board/BoardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeRedirect />,
      },
      {
        path: "login",
        element: (
          <RedirectIfAuthenticated>
            <LogInPage />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: "signup",
        element: (
          <RedirectIfAuthenticated>
            <SignUpPage />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: "projects/demo/board",
        element: (
          <RequireAuth>
            <BoardPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);
