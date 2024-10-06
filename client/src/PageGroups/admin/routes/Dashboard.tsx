import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import newRequest from "@/lib/newRequest"
import { IParking, IReservation } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { UsersIcon, MapPinIcon, CarIcon, Loader2, DollarSignIcon } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line, LineChart, PieChart, Pie, Cell } from "recharts"
import { motion } from "framer-motion"

// Mock data for the charts
const dailyBookings = [
    { name: "Mon", total: 120, revenue: 1200 },
    { name: "Tue", total: 150, revenue: 1500 },
    { name: "Wed", total: 180, revenue: 1800 },
    { name: "Thu", total: 200, revenue: 2000 },
    { name: "Fri", total: 250, revenue: 2500 },
    { name: "Sat", total: 300, revenue: 3000 },
    { name: "Sun", total: 280, revenue: 2800 },
]

const monthlyBookings = [
    { name: "Jan", total: 1200, revenue: 12000 },
    { name: "Feb", total: 1100, revenue: 11000 },
    { name: "Mar", total: 1300, revenue: 13000 },
    { name: "Apr", total: 1400, revenue: 14000 },
    { name: "May", total: 1600, revenue: 16000 },
    { name: "Jun", total: 1800, revenue: 18000 },
]

const parkingDistribution = [
    { name: "Available", value: 65 },
    { name: "Occupied", value: 35 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState("daily")

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ["GET_USERS"],
        queryFn: async () => {
            const response = await newRequest.get("/user");
            return response.data;
        },
    });

    const { data: locations, isLoading: locationsLoading } = useQuery<IParking[]>({
        queryKey: ["GET_LOCATIONS"],
        queryFn: async () => {
            const response = await newRequest.get("/parking")
            return response.data
        },
    })

    const { data: reservations, isLoading: reservationsLoading } = useQuery<IReservation[]>({
        queryKey: ["GET_RESERVATIONS"],
        queryFn: async () => {
            const response = await newRequest.get(`/reservation/user`)
            return response.data
        }
    })

    if (usersLoading || locationsLoading || reservationsLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const totalRevenue = reservations?.reduce((acc, reservation) => acc + reservation.price, 0)

    return (
        <div className="flex-1 p-8 pt-6 space-y-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <UsersIcon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                            <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{locations?.length}</div>
                            <p className="text-xs text-muted-foreground">
                                +4 new locations this month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <CarIcon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reservations?.length}</div>
                            <p className="text-xs text-muted-foreground">
                                +19% from last month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalRevenue}</div>
                            <p className="text-xs text-muted-foreground">
                                +12.5% from last month
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
            <Tabs defaultValue="bookings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Trends</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={timeRange === "daily" ? dailyBookings : monthlyBookings}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={timeRange === "daily" ? dailyBookings : monthlyBookings}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="occupancy" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parking Space Occupancy</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={parkingDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {parkingDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}