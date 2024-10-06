import { Link, Outlet } from 'react-router-dom'
import { CarIcon, ParkingMeterIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

const AuthLayout = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute z-10 top-4 left-4 sm:top-6 sm:left-6 lg:top-8 lg:left-8"
            >
                <Link to="/" className="flex items-center text-blue-600 transition-colors hover:text-blue-800">
                    <CarIcon className="w-6 h-6 mr-2" />
                    <span className="text-lg font-semibold">ParkEase</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-20 w-full max-w-md"
            >
                <Card className="shadow-2xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-3xl font-bold text-center text-blue-800">Create an account</CardTitle>
                        <CardDescription className="text-center text-blue-600">
                            Sign up for ParkEase and start reserving parking spots with ease
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Outlet />
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 text-gray-500 bg-white">Or continue with</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full text-gray-800 bg-white border-gray-300 hover:bg-gray-50">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" className="w-full text-gray-800 bg-white border-gray-300 hover:bg-gray-50">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </svg>
                                Facebook
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 text-sm text-center text-gray-600"
            >
                By signing up, you agree to our{" "}
                <Link to="/terms" className="font-medium text-blue-600 underline hover:text-blue-500">
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-medium text-blue-600 underline hover:text-blue-500">
                    Privacy Policy
                </Link>
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-0 z-0 pointer-events-none"
            >
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/4 left-1/4">
                    <ParkingMeterIcon className="w-64 h-64 text-blue-200" />
                </div>
                <div className="absolute transform translate-x-1/2 translate-y-1/2 bottom-1/4 right-1/4">
                    <CarIcon className="w-64 h-64 text-blue-200" />
                </div>
            </motion.div>
        </div>
    )
}

export default AuthLayout