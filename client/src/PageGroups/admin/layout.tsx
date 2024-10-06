import { Outlet, useNavigate } from "react-router-dom"

import SideBar from "@/components/custom/Sidebar"
import { useUserStore } from "@/lib/context"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const AdminLayout = () => {
    const { isAdmin } = useUserStore((state) => state)
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (!isAdmin) {
            navigate("/");
            toast({
                title: `Error`,
                description: "Access Denied",
                duration: 5000,
            })
        }
    }, [isAdmin, navigate])

    return (
        <div className="flex h-screen bg-gray-100">
            <SideBar />

            {/* Main content */}
            <main className="flex-1 p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout