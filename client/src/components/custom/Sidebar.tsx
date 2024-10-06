import { useState } from 'react'
import {
    CarIcon,
    UsersIcon,
    MapPinIcon,
    LogOutIcon,
    LayoutDashboardIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const sidebarItems = [
    { icon: LayoutDashboardIcon, label: 'Dashboard', href: '/admin' },
    { icon: UsersIcon, label: 'Users', href: '/admin/users' },
    { icon: MapPinIcon, label: 'Locations', href: '/admin/locations' },
]

const SideBar = () => {
    const { pathname } = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed)

    return (
        <motion.aside
            initial={{ width: 256 }}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col h-screen border-r bg-background"
        >
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <Link to="/" className="flex items-center space-x-2 overflow-hidden">
                    <CarIcon className="w-6 h-6 text-primary" />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg font-bold whitespace-nowrap"
                        >
                            ParkEase Admin
                        </motion.span>
                    )}
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="absolute border rounded-full shadow-md -right-3 top-9 bg-background"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <nav className="px-4 py-2">
                    {sidebarItems.map((item) => (
                        <TooltipProvider key={item.label}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        to={item.href}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-300 ease-in-out
                                            ${pathname === item.href
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                            } ${isCollapsed ? 'justify-center' : ''}`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={10}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </nav>
            </ScrollArea>
            <Separator />
            <div className="p-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={() => navigate('/')} variant="outline" className={`justify-center w-full space-x-2 ${isCollapsed ? 'px-0' : ''}`}>
                                <LogOutIcon className="w-5 h-5" />
                                {!isCollapsed && <span>Back to Home</span>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            Back to Home
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </motion.aside>
    )
}

export default SideBar