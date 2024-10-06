import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClockIcon, CreditCardIcon, MapPinIcon, TagIcon, CarIcon, InfoIcon, CalendarIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import newRequest from '@/lib/newRequest'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

type ParkingSlot = {
    _id: string;
    position: number;
    isAvailable: boolean;
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

const TimeBookingDialog = ({ location }: { location: IDetailedParking }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedStartTime, setSelectedStartTime] = useState<string>("")
    const [selectedEndTime, setSelectedEndTime] = useState<string>("")
    const [price, setPrice] = useState(0)
    const [timeSlots, setTimeSlots] = useState<string[]>([])
    const queryClient = useQueryClient()

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
        const currentTime = new Date(`2000-01-01T${start}`)
        const endTime = end === "00:00" ? new Date(`2000-01-02T00:00`) : new Date(`2000-01-01T${end}`)

        while (currentTime < endTime) {
            slots.push(currentTime.toTimeString().slice(0, 5))
            currentTime.setMinutes(currentTime.getMinutes() + 30)
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

    const handleSlotSelection = (slot: ParkingSlot | undefined) => {
        if (slot) {
            setSelectedSlot(slot)
            setSelectedStartTime("")
            setSelectedEndTime("")
        }
    }

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
        }
    })

    const handleBooking = async () => {
        if (selectedSlot && selectedStartTime && selectedEndTime && selectedDate) {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd')
            const startDateTime = `${formattedDate}T${selectedStartTime}:00Z`
            let endDateTime = `${formattedDate}T${selectedEndTime}:00Z`

            if (selectedEndTime < selectedStartTime) {
                const tomorrow = new Date(selectedDate)
                tomorrow.setDate(tomorrow.getDate() + 1)
                const tomorrowDate = format(tomorrow, 'yyyy-MM-dd')
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
                    description: `You have booked slot ${selectedSlot.position} from ${formatTimeDisplay(selectedStartTime)} to ${formatTimeDisplay(selectedEndTime)} on ${format(selectedDate, 'MMMM d, yyyy')}`,
                })
                setIsOpen(false)
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
                description: "Please select a slot, date, start time, and end time",
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
                <Button className="px-4 py-2 font-semibold text-white transition duration-300 ease-in-out transform bg-blue-600 rounded-full shadow-md hover:bg-blue-700 hover:scale-105">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Book Parking
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">{location.name}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center space-x-2 text-sm">
                            <MapPinIcon className="w-4 h-4 text-blue-600" />
                            <span>{location.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <ClockIcon className="w-4 h-4 text-blue-600" />
                            <span>Hours: {formatTimeDisplay(location.hours.start)} - {formatTimeDisplay(location.hours.end)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <CarIcon className="w-4 h-4 text-blue-600" />
                            <span>Available: {location.availableSpots} / {location.totalSpots}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <TagIcon className="w-4 h-4 text-blue-600" />
                            <div className="flex flex-wrap gap-1">
                                {location.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-start space-x-2 text-sm">
                            <InfoIcon className="w-4 h-4 mt-1 text-blue-600" />
                            <p className="text-gray-600">{location.description}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="slot" className="text-sm font-medium">
                                Parking Slot
                            </Label>
                            <Select onValueChange={(value) => handleSlotSelection(location.slots.find(s => s._id === value))}>
                                <SelectTrigger id="slot">
                                    <SelectValue placeholder="Choose a slot" />
                                </SelectTrigger>
                                <SelectContent>
                                    {location.slots.map((slot) => (
                                        <SelectItem key={slot._id} value={slot._id}>
                                            Slot {slot.position} {slot.isAvailable ? '(Available)' : '(Unavailable)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedSlot && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="date" className="text-sm font-medium">
                                        Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start-time" className="text-sm font-medium">
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
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {formatTimeDisplay(time)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end-time" className="text-sm font-medium">
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
                                            {timeSlots
                                                .filter(time => time > selectedStartTime || time <= selectedStartTime)
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
                    </div>
                </ScrollArea>
                <AnimatePresence>
                    {selectedStartTime && selectedEndTime && (
                        <motion.div
                            key={price}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="p-4 mt-4 rounded-lg shadow-inner bg-blue-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CreditCardIcon className="w-5 h-5 text-blue-600" />
                                    <span className="ml-2 text-lg font-semibold text-blue-800">
                                        ₹{price.toFixed(2)}
                                    </span>
                                </div>
                                <Button onClick={handleBooking} className="px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 bg-green-600 hover:bg-green-700">
                                    Confirm Booking
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}

export default TimeBookingDialog