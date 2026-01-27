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
// import Photographer from "../pages/Profile/Photographer";
import About from "../pages/About";
import Event from "../pages/Event/Event";
import MyFavourites from "../pages/Photo/MyFavourites";
import Tagged from "../pages/Photo/TaggedIn";
import { lazy, Suspense } from "react";
import PhotoView from "../pages/Photo/PhotoView";
// import PhotoDashboardDesktop from "../pages/Profile/Photographer";
import UploadPhoto from "../components/RBAC/Photographer/UploadPhoto";
import PhotographerDashboard from "../pages/Profile/Photographer";
import OAuthCallback from "../pages/OAuthCallback";
import Rejected from "../pages/Rejected";

const EventGallery = lazy(() => import("../pages/Photo/EventGallery"));
const NotificationPage = lazy(() => import("../pages/NotificationPage"))
// const UpdateEvent = lazy(() => import("../components/RBAC/Coordinator/UpdateEvent") )


export const router = createBrowserRouter(
  createRoutesFromElements(
      <>
    <Route path="/" element={<Home />} errorElement={<NotFound />}>
      <Route element={<PersistLogin />}>
        <Route index element={
          <Protected authentication>
            <About/>
          </Protected>
        }
        />

        <Route path="signin" element={
          <Protected authentication={false}>
            <SignIn />
          </Protected>
        }
        />
      <Route path="accounts/channeli/callback/" element={<Protected authentication={false}>
          <OAuthCallback />
      </Protected>} />
        <Route path="signup" element={
          <Protected authentication={false}>
            <SignUp />
          </Protected>
        }
        />

  <Route
    path="/rejected"
    element={
      <Protected authentication={false}>
        <Rejected />
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

        <Route path="profile/:username/" element={
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

        <Route path="events/:event_id/" element={
          <Protected authentication  >
              <EventCoordinatorPanel />
          </Protected>
        } />

        <Route path="photographer/dashboard/" element={
          <Protected authentication  >
              <PhotographerDashboard />
          </Protected>
        } />

        <Route path="photographer/dashboard/:event_id" element={
          <Protected authentication>
            <UploadPhoto />
          </Protected>
        } />
        
        <Route path="photographer/dashboard/:event_id/update_delete/" element={
          <Protected authentication >
            <EventGallery viewMode={'bulk'}/>
          </Protected>
        } />
        
        <Route path="events/" element={
          <Protected authentication >
            <Event />
          </Protected>
        } />
          
        <Route path="events/:event_id/photos/" element={
          <Protected authentication  >
            <Suspense fallback={<p>loading...</p>}>
              <EventGallery viewMode={'view'}/>
            </Suspense>
          </Protected>
        } />
     <Route path="photos/:photo_id/" element={
          <Protected authentication  >
            {/* <Suspense fallback={<p>loading...</p>}> */}
              <PhotoView />
            {/* </Suspense> */}
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


        <Route path="notifications/" element={
          <Protected authentication allowedRole={['A', 'M']} >
            <NotificationPage />
          </Protected>
        } />


      </Route>
    </Route>
        
    </>

  )
)