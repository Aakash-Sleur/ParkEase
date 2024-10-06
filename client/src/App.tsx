import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"

import * as auth from "@/PageGroups/auth"
import * as main from "@/PageGroups/main"
import * as admin from "@/PageGroups/admin"
import AuthLayout from "./PageGroups/auth/layout"
import MainLayout from "./PageGroups/main/layout"
import AdminLayout from "./PageGroups/admin/layout"
import { useUserStore } from "./lib/context"
import { Toaster } from "@/components/ui/toaster"

const App = () => {
  const checkAuthFromLocalStorage = useUserStore((state) => state.checkAuthFromLocalStorage);

  useEffect(() => {
    checkAuthFromLocalStorage();
  }, [checkAuthFromLocalStorage]);

  return (
    <main>
      <Toaster />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<auth.SignInForm />} />
          <Route path="/signup" element={<auth.SignUpForm />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route index element={<main.Home />} />
          <Route path="/explore" element={<main.ExplorePage />} />
          <Route path="/location/:id" element={<main.LocationPage />} />
          <Route path="/profile" element={<main.ProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="" element={<admin.DashboardPage />} />
          <Route path="users" element={<admin.UsersPage />} />
          <Route path="locations" element={<admin.LocationsPage />} />
          <Route path="create" element={<admin.CreateLocationPage />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App