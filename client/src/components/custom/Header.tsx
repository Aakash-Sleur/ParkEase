"use client"

import React, { useMemo } from 'react'
import { CarIcon, LogOut, Home, MapPin, Settings, UserCircle, Menu } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/lib/context'
import newRequest from '@/lib/newRequest'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"

const NavLink = ({ to, children, isActive }: {
    to: string,
    children: React.ReactNode,
    isActive: boolean
}) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <Link
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
                } flex items-center space-x-1 p-2 rounded-md ${isActive ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
            to={to}
        >
            {children}
        </Link>
    </motion.div>
)

const Header = () => {
    const { authStatus, isAdmin, resetUser, username } = useUserStore((state) => state)
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const handleLogout = async () => {
        await newRequest.post("/logout")
        localStorage.removeItem("currentUser")
        resetUser()
        navigate("/signin")
    }

    const navItems = useMemo(() => [
        { to: '/', label: 'Home', icon: Home },
        { to: '/explore', label: 'Explore', icon: MapPin },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Settings }] : []),
        ...(authStatus === 'authenticated' ? [{ to: '/profile', label: 'My Profile', icon: UserCircle }] : []),
    ], [isAdmin, authStatus])

    const renderAuthSection = () => {
        switch (authStatus) {
            case 'authenticated':
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative w-10 h-10 rounded-full">
                                <Avatar className="w-10 h-10 transition-all hover:scale-110">
                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${username}`} alt={username} />
                                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem asChild>
                                <Link to="/profile" className="flex items-center">
                                    <UserCircle className="w-4 h-4 mr-2" />
                                    <span>My Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="w-4 h-4 mr-2" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            case 'loading':
                return <span className="text-sm text-muted-foreground animate-pulse">Loading...</span>
            default:
                return (
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" asChild>
                            <Link to="/signin">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link to="/signup">Sign Up</Link>
                        </Button>
                    </div>
                )
        }
    }

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
        >
            <div className="container flex items-center justify-between w-full h-16 px-4 mx-auto sm:px-6 lg:px-8">
                <Link className="flex items-center space-x-2 text-primary" to="/">
                    <CarIcon className="w-8 h-8" />
                    <span className="hidden text-2xl font-bold sm:inline-block">ParkEase</span>
                </Link>
                <nav className="items-center hidden space-x-1 md:flex">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink key={to} to={to} isActive={pathname === to}>
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="flex items-center space-x-4">
                    {renderAuthSection()}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="w-4 h-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col mt-4 space-y-4">
                                {navItems.map(({ to, label, icon: Icon }) => (
                                    <NavLink key={to} to={to} isActive={pathname === to}>
                                        <Icon className="w-4 h-4" />
                                        <span>{label}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </motion.header>
    )
}

export default Header