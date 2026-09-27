import { createBrowserRouter, RouterProvider } from "react-router";
import AppShell from "./components/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import ProjectBriefing from "./pages/ProjectBriefing";
import Workspace from "./pages/Workspace";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Instructor from "./pages/Instructor";
import InstructorAssignments from "./pages/InstructorAssignments";
import Social from "./pages/Social";
import JoinInvite from "./pages/JoinInvite";
import Discussion from "./pages/Discussion";
import UniversityPortal from "./pages/UniversityPortal";

import { AuthProvider } from "./lib/auth";

const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/auth/login", Component: Login },
  { path: "/auth/signup", Component: Signup },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  {
    Component: AppShell,
    children: [
      { path: "/dashboard", Component: Dashboard },
      { path: "/learn", Component: Learn },
      { path: "/learn/:project", Component: ProjectBriefing },
      { path: "/challenges", Component: Challenges },
      { path: "/challenges/:id", Component: ChallengeDetail },
      { path: "/history", Component: History },
      { path: "/leaderboard", Component: Leaderboard },
      { path: "/profile", Component: Profile },
      { path: "/instructor", Component: Instructor },
      { path: "/instructor/assignments", Component: InstructorAssignments },
      { path: "/social", Component: Social },
      { path: "/discussions", Component: Discussion },
      { path: "/university", Component: UniversityPortal },
      { path: "/collaborate/join/:token", Component: JoinInvite },
    ],
  },
  { path: "/workspace", Component: Workspace },
  { path: "/ide", Component: Workspace },
]);


export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

