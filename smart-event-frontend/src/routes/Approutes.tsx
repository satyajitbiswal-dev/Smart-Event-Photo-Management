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
import PersistLogin from "../components/common/PersistLogin";
import Admin from "../pages/Profile/Admin";
import EventCoordinatorPanel from "../pages/Profile/EventCoordinatorPanel";
import Photographer from "../pages/Profile/Photographer";
import About from "../pages/About";
import EventGallery from "../pages/Photo/EventGallery";
import Event from "../pages/Event/Event";
import MyFavourites from "../pages/Photo/MyFavourites";
import Tagged from "../pages/Photo/TaggedIn";


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

        <Route path="profile" element={
          <Protected authentication>
            <Member />
          </Protected>
        } />
        <Route path="about" element={
          <Protected authentication>
            <About />
          </Protected>
        } />
        <Route path="admin" element={
          <Protected authentication allowedRole={['A']} >
            <Admin />
          </Protected>
        } />
        <Route path="event_coordinator/:event_id" element={
          <Protected authentication>
            <EventCoordinatorPanel />
          </Protected>
        } />
        <Route path="photographer/dashboard/:event_id" element={
          <Protected authentication>
            <Photographer />
          </Protected>
        } />
        <Route path="event/" element={
          <Protected authentication >
            <Event />
          </Protected>
        } />
        <Route path="event/:event_id/photos/" element={
          <Protected authentication  >
            <EventGallery />
          </Protected>
        } />

        <Route path="favourites/" element={
          <Protected authentication allowedRole={['A', 'M']} >
            <MyFavourites />
          </Protected>
        } />
        <Route path="tagged/" element={
          <Protected authentication allowedRole={['A', 'M']} >
            <Tagged />
          </Protected>
        } />

      </Route>
      
    </Route>

  )
)