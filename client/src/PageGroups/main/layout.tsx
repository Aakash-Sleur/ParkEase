import { Outlet } from "react-router-dom"

import Header from "@/components/custom/Header"

const MainLayout = () => {
    return (
        <main className="flex flex-col min-h-screen">
            <Header />
            <Outlet />
        </main>
    )
}

export default MainLayout