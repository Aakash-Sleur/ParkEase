"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, ClockIcon, CreditCardIcon, Loader2, CarIcon, StarIcon, FilterIcon, Search, X, ParkingMeterIcon } from "lucide-react"
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IParking } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import newRequest from '@/lib/newRequest'
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function ExplorePage() {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get("search") || ""
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    const navigate = useNavigate()

    const [sortBy, setSortBy] = useState("name")
    const [isFocused, setIsFocused] = useState(false)
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [availabilityFilter, setAvailabilityFilter] = useState(false)
    const [filteredLocations, setFilteredLocations] = useState<IParking[]>([])

    const { data: locations, isLoading, error } = useQuery<IParking[]>({
        queryKey: ["GET_LOCATIONS"],
        queryFn: async () => {
            const response = await newRequest.get("/parking")
            if (!Array.isArray(response.data)) {
                throw new Error('API did not return an array')
            }
            return response.data
        },
    })

    useEffect(() => {
        if (locations) {
            let filtered = locations.filter(place =>
                place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                place.address.toLowerCase().includes(searchTerm.toLowerCase())
            )

            filtered = filtered.filter(place =>
                place.ratePerHour >= priceRange[0] && place.ratePerHour <= priceRange[1]
            )

            if (availabilityFilter) {
                filtered = filtered.filter(place => place.availableSpots > 0)
            }

            filtered.sort((a, b) => {
                switch (sortBy) {
                    case "price":
                        return a.ratePerHour - b.ratePerHour
                    case "availability":
                        return b.availableSpots - a.availableSpots
                    default:
                        return a.name.localeCompare(b.name)
                }
            })

            setFilteredLocations(filtered)
        }
    }, [searchTerm, locations, priceRange, availabilityFilter, sortBy])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                >
                    <Loader2 className="w-16 h-16 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-semibold text-center text-primary">Loading parking spots...</p>
                </motion.div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                >
                    <p className="mb-4 text-2xl font-semibold text-center text-red-600 dark:text-red-400">Error loading parking locations</p>
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                        Try Again
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <section className="w-full py-12 md:py-24">
                <div className="container px-4 md:px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8 text-4xl font-bold tracking-tighter text-center text-primary sm:text-5xl md:text-6xl/none"
                    >
                        Discover Your Perfect Parking Spot
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-center justify-between w-full max-w-3xl mx-auto mb-12 space-y-4 md:flex-row md:space-y-0"
                    >
                        <div className="relative flex-1 w-full mr-4">
                            <motion.div
                                className={`absolute inset-0 bg-primary/10 rounded-lg transition-all duration-300 ease-in-out ${isFocused ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                    }`}
                                layoutId="searchBackground"
                            />
                            <div className="relative flex items-center">
                                <Search className="absolute w-5 h-5 text-gray-400 left-3" />
                                <Input
                                    className="py-6 pl-10 pr-10 text-lg transition-all duration-300 ease-in-out bg-white border-2 border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Search for parking locations"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="lg" className="flex items-center space-x-2">
                                    <FilterIcon className="w-4 h-4" />
                                    <span>Filters</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Refine Your Search</SheetTitle>
                                    <SheetDescription>
                                        Customize your parking preferences for the perfect spot.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="grid gap-6 py-6">
                                    <div className="space-y-4">
                                        <Label htmlFor="price-range" className="text-lg font-semibold">Price Range (₹/hour)</Label>
                                        <Slider
                                            id="price-range"
                                            min={0}
                                            max={1000}
                                            step={10}
                                            value={priceRange}
                                            onValueChange={setPriceRange}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>₹{priceRange[0]}</span>
                                            <span>₹{priceRange[1]}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Switch
                                            id="available-only"
                                            checked={availabilityFilter}
                                            onCheckedChange={setAvailabilityFilter}
                                        />
                                        <Label htmlFor="available-only" className="text-base">Show only available spots</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sort-by" className="text-lg font-semibold">Sort By</Label>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger id="sort-by" className="w-full">
                                                <SelectValue placeholder="Select sorting option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="name">Name</SelectItem>
                                                <SelectItem value="price">Price: Low to High</SelectItem>
                                                <SelectItem value="availability">Availability</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </motion.div>
                    <AnimatePresence>
                        {filteredLocations.length > 0 ? (
                            <motion.div
                                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                            >
                                {filteredLocations.map((place) => (
                                    <motion.div key={place._id} layout>
                                        <Card className="overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1">
                                            <div className="relative w-full h-48 overflow-hidden">
                                                <img
                                                    src={place.banner}
                                                    alt={place.name}
                                                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                                                />
                                                <Badge className="absolute px-2 py-1 text-sm font-semibold bg-green-500 top-2 right-2">
                                                    {place.availableSpots} spots left
                                                </Badge>
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <span className="text-xl font-bold">{place.name}</span>
                                                    <div className="flex items-center px-2 py-1 bg-yellow-100 rounded-full dark:bg-yellow-900">
                                                        <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                                                        <span className="font-semibold text-yellow-700 dark:text-yellow-300">{place.rating}</span>
                                                    </div>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPinIcon className="w-4 h-4 text-primary" />
                                                        <span>{place.address}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <ClockIcon className="w-4 h-4 text-primary" />
                                                        <span>{place.hours.start} - {place.hours.end}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <CreditCardIcon className="w-4 h-4 text-primary" />
                                                        <span className="text-lg font-bold text-primary">₹{place.ratePerHour}/hour</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <CarIcon className="w-4 h-4 text-primary" />
                                                        <span>{place.totalSpots} total spots</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    className="w-full py-6 text-lg font-semibold transition-all duration-300 bg-primary hover:bg-primary-dark hover:scale-105"
                                                    onClick={() => navigate(`/location/${place._id}`)}
                                                >
                                                    <ParkingMeterIcon className="w-5 h-5 mr-2" />
                                                    Reserve Now
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                className="flex flex-col items-center justify-center p-8 mt-12 bg-white rounded-lg shadow-lg dark:bg-gray-800"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CarIcon className="w-16 h-16 mb-4 text-gray-400 animate-bounce" />
                                <p className="text-2xl font-semibold text-center text-gray-600 dark:text-gray-300">
                                    No parking locations found
                                </p>
                                <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
                                    Try adjusting your search or filters to find the perfect spot
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </main>
    )
}