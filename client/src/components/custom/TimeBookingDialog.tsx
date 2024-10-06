"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClockIcon, CreditCardIcon, MapPinIcon, TagIcon, CarIcon, InfoIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import newRequest from '@/lib/newRequest'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

type ParkingSlot = {
    _id: string;
    position: number;
    isAvailable: boolean;
    timing?: Array<{
        start: string;
        end: string;
        isReserved: boolean;
        reservedBy: string | null;
    }>;
}

export type IDetailedParking = {
    _id: string;
    name: string;
    address: string;
    description: string;
    banner: string;
    hours: {
        start: string;
        end: string;
    };
    ratePerHour: number;
    totalSpots: number;
    availableSpots: number;
    rating: number;
    tags: string[];
    slots: ParkingSlot[];
}

type mutationType = {
    slotId: string;
    start: string;
    end: string;
    price: number;
    parkingId: string;
}

const TimeBookingDialog = ({ location, refetch }: { location: IDetailedParking, refetch: () => void }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
    const [selectedStartTime, setSelectedStartTime] = useState<string>("")
    const [selectedEndTime, setSelectedEndTime] = useState<string>("")
    const [price, setPrice] = useState(0)
    const [timeSlots, setTimeSlots] = useState<string[]>([])
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
    const queryClient = useQueryClient();
    const navigate = useNavigate()

    useEffect(() => {
        if (location && location.hours) {
            const slots = generateTimeSlots(location.hours.start, location.hours.end)
            setTimeSlots(slots)
        }
    }, [location])

    useEffect(() => {
        if (selectedStartTime && selectedEndTime && location) {
            const duration = calculateDuration(selectedStartTime, selectedEndTime)
            setPrice(location.ratePerHour * duration)
        }
    }, [selectedStartTime, selectedEndTime, location])

    const generateTimeSlots = (start: string, end: string) => {
        const slots = []
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTime = new Date(`2000-01-01T${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`)
        let startTime = new Date(`2000-01-01T${start}`)
        const endTime = end === "00:00" ? new Date(`2000-01-02T00:00`) : new Date(`2000-01-01T${end}`)

        // If the current time is after the start time, use the current time as the start
        if (currentTime > startTime) {
            startTime = currentTime
        }

        while (startTime < endTime) {
            slots.push(startTime.toTimeString().slice(0, 5))
            startTime.setMinutes(startTime.getMinutes() + 30)
        }

        return slots
    }

    const calculateDuration = (start: string, end: string) => {
        const startDate = new Date(`2000-01-01T${start}:00`)
        let endDate = new Date(`2000-01-01T${end}:00`)

        if (endDate < startDate) {
            endDate = new Date(`2000-01-02T${end}:00`)
        }

        const durationMs = endDate.getTime() - startDate.getTime()
        return durationMs / (1000 * 60 * 60)
    }

    const handleSlotSelection = useCallback((slot: ParkingSlot | undefined) => {
        if (slot) {
            setSelectedSlot(slot)
            setSelectedStartTime("")
            setSelectedEndTime("")

            const reservedTimes = slot.timing || []
            const allTimeSlots = generateTimeSlots(location.hours.start, location.hours.end)
            const availableSlots = allTimeSlots.filter(time => {
                const now = new Date()
                const slotTime = new Date(`${now.toDateString()} ${time}`)
                return slotTime > now && !reservedTimes.some(reservation => {
                    const reservationStart = new Date(reservation.start).toTimeString().slice(0, 5)
                    const reservationEnd = new Date(reservation.end).toTimeString().slice(0, 5)
                    return time >= reservationStart && time < reservationEnd
                })
            })
            setAvailableTimeSlots(availableSlots)
        }
    }, [location])

    const { mutateAsync: createReservation } = useMutation({
        mutationFn: (payload: mutationType) => {
            return newRequest.post("/reservation", payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["GET_LOCATION"]
            })
            queryClient.invalidateQueries({
                queryKey: ["GET_LOCATIONS"]
            })
        },
        onError: (error) => {
            console.error("Reservation failed:", error)
            toast({
                title: "Booking Failed",
                description: "This slot is no longer available. Please try another slot or time.",
                variant: "destructive",
            })
        }
    })

    const handleBooking = async () => {
        if (selectedSlot && selectedStartTime && selectedEndTime) {
            const today = new Date()
            const formattedDate = today.toISOString().split('T')[0]

            const startDateTime = `${formattedDate}T${selectedStartTime}:00Z`
            let endDateTime = `${formattedDate}T${selectedEndTime}:00Z`

            if (selectedEndTime < selectedStartTime) {
                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)
                const tomorrowDate = tomorrow.toISOString().split('T')[0]
                endDateTime = `${tomorrowDate}T${selectedEndTime}:00Z`
            }

            const payload = {
                slotId: selectedSlot._id,
                start: startDateTime,
                end: endDateTime,
                price: price,
                parkingId: location._id
            }

            try {
                const response = await createReservation(payload)
                if (!response) {
                    throw new Error("Error in creating reservation")
                }
                toast({
                    title: "Booking Confirmed",
                    description: `You have booked slot ${selectedSlot.position} from ${formatTimeDisplay(selectedStartTime)} to ${formatTimeDisplay(selectedEndTime)}`,
                })
                setIsOpen(false)
                refetch()
                navigate("/profile")
            } catch (error) {
                toast({
                    title: "Booking Failed",
                    description: "An error occurred while creating the reservation " + error,
                    variant: "destructive",
                })
            }
        } else {
            toast({
                title: "Booking Failed",
                description: "Please select a slot, start time, and end time",
                variant: "destructive",
            })
        }
    }

    const formatTimeDisplay = (time: string) => {
        const [hours, minutes] = time.split(':')
        const formattedHours = parseInt(hours) % 12 || 12
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
        return `${formattedHours}:${minutes} ${ampm}`
    }

    if (!location || !location.hours) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="px-4 py-2 font-bold text-white transition duration-300 ease-in-out transform bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 hover:scale-105">
                    <ClockIcon className="w-5 h-5 mr-2" />
                    Book Parking Slot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">{location.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-5 h-5 text-gray-500" />
                        <span>{location.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-500" />
                        <span>Hours: {formatTimeDisplay(location.hours.start)} - {formatTimeDisplay(location.hours.end)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CarIcon className="w-5 h-5 text-gray-500" />
                        <span>Available Spots: {location.availableSpots} / {location.totalSpots}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <TagIcon className="w-5 h-5 text-gray-500" />
                        <div className="flex flex-wrap gap-2">
                            {location.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <InfoIcon className="w-5 h-5 mt-1 text-gray-500" />
                        <p className="text-sm text-gray-600">{location.description}</p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="slot" className="text-lg font-semibold">
                            Select Parking Slot
                        </Label>
                        <Select onValueChange={(value) => handleSlotSelection(location.slots.find(s => s._id === value))}>
                            <SelectTrigger id="slot">
                                <SelectValue placeholder="Choose a parking slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {location.slots.map((slot) => (
                                    <SelectItem key={slot._id} value={slot._id} disabled={!slot.isAvailable}>
                                        Slot {slot.position} {slot.isAvailable ? '(Available)' : '(Unavailable)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedSlot && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="start-time" className="text-lg font-semibold">
                                    Start Time
                                </Label>
                                <Select
                                    value={selectedStartTime}
                                    onValueChange={setSelectedStartTime}
                                >
                                    <SelectTrigger id="start-time">
                                        <SelectValue placeholder="Select start time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTimeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {formatTimeDisplay(time)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end-time" className="text-lg font-semibold">
                                    End Time
                                </Label>
                                <Select
                                    value={selectedEndTime}
                                    onValueChange={setSelectedEndTime}
                                    disabled={!selectedStartTime}
                                >
                                    <SelectTrigger id="end-time">
                                        <SelectValue placeholder="Select end time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTimeSlots
                                            .filter(time => time > selectedStartTime)
                                            .map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {formatTimeDisplay(time)}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    <AnimatePresence>
                        {selectedStartTime && selectedEndTime && (
                            <motion.div
                                key={price}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="p-4 bg-blue-100 rounded-lg shadow-inner"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <CreditCardIcon className="w-6 h-6 text-blue-600" />
                                        <span className="ml-2 text-lg font-bold">
                                            Price: ₹{price.toFixed(2)}
                                        </span>
                                    </div>
                                    <Button onClick={handleBooking} className="bg-green-500 hover:bg-green-600">
                                        Confirm Booking
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TimeBookingDialog;