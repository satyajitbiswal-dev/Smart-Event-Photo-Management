import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Home from "../pages/Home";
import PhotoList from "../pages/Photo";
import ConfirmationPage from "../pages/ConfirmationPage";
import { Protected } from "../pages/ProtectedRoute";
import NotFound from "../pages/NotFound";
import Logout from "../features/auth/Logout";
import Member from "../pages/Profile/Profile";
import App from "../App";
import PersistLogin from "../components/common/PersistLogin";


export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Home />} errorElement={<NotFound />}>
          <Route element={<PersistLogin />}>
            <Route index element={
                  <Protected authentication>
                  <PhotoList />
                </Protected>
              }
            />

            <Route path="signin" element={
                 <Protected authentication={false}>
                  <SignIn />
                </Protected>
            }
            />

            <Route path="signup" element={
                <Protected authentication={false}>
                  <SignUp />
                </Protected>
            }
            />

            <Route path="signup/confirmation" element={
                <Protected authentication={false}>
                  <ConfirmationPage />
                </Protected>
              }
             />

            <Route path="logout" element={
                <Protected authentication>
                  <Logout />
                </Protected>
              }
            />

            <Route path="profile" element={<Member />} />
          </Route>
        </Route>

    )
)