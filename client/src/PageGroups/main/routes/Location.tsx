import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, ClockIcon, CreditCardIcon, CarIcon, StarIcon, TagIcon } from "lucide-react"
import TimeBookingDialog, { IDetailedParking } from '@/components/custom/TimeBookingDialog'
import { useParams } from "react-router-dom"
import newRequest from "@/lib/newRequest"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import ShareModal from '@/components/modals/ShareModal'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IUser } from '@/lib/types'

interface Review {
    id: string;
    user: IUser;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function LocationPage() {
    const [selectedSlot, setSelectedSlot] = useState<string>()
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' })
    const { id } = useParams();
    const queryClient = useQueryClient()

    const { data: location, isLoading: locationLoading, error: locationError, refetch: refetchLocation } = useQuery<IDetailedParking>({
        queryKey: ["GET_LOCATION", id],
        queryFn: async () => {
            const response = await newRequest.get(`/parking/${id}`)
            return response.data
        },
        refetchInterval: 10000
    })

    const { data: reviews, isLoading: reviewsLoading, error: reviewsError } = useQuery<Review[]>({
        queryKey: ["GET_REVIEWS", id],
        queryFn: async () => {
            const response = await newRequest.get(`/parking/${id}/reviews`)
            return response.data
        },
    })

    const { mutate: createReviewMutation, isPending: isSubmitting } = useMutation({
        mutationFn: (reviewData: { rating: number; comment: string }) =>
            newRequest.post(`/parking/${id}/reviews`, reviewData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["GET_REVIEWS", id],
            })
            toast({
                title: "Review submitted",
                description: "Thank you for your feedback!",
            })
            setNewReview({ rating: 0, comment: '' })
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to submit review. Please try again.",
                variant: "destructive",
            })
        },
    })

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        date.setHours(date.getHours() - 5);
        date.setMinutes(date.getMinutes() - 30);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };

        return new Intl.DateTimeFormat('en-IN', options).format(date);
    };

    const handleReviewSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createReviewMutation(newReview)
    }

    if (locationLoading || reviewsLoading) {
        return (
            <div className="container px-4 py-12 md:px-6">
                <Skeleton className="w-2/3 h-12 mb-8" />
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="w-1/3 h-8" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="w-full h-6" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="w-1/3 h-8" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full h-48" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (locationError || reviewsError) {
        return (
            <div className="container px-4 py-12 text-center md:px-6">
                <h2 className="mb-4 text-2xl font-bold">Error loading data</h2>
                <p className="mb-4 text-muted-foreground">We're sorry, but we couldn't load the details for this location. Please try again later.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        )
    }

    if (!location || !reviews) {
        return null
    }

    console.log(location)

    return (
        <main className="flex-1 bg-gray-100 dark:bg-gray-900">
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="flex items-center justify-between mb-8">
                        <motion.h1
                            className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {location.name}
                        </motion.h1>
                        <ShareModal location={location} />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Location Details</span>
                                    <div className="flex items-center">
                                        <StarIcon className="w-5 h-5 mr-1 text-yellow-400" />
                                        <span className="text-sm font-medium">{location.rating}</span>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="w-5 h-5 text-primary" />
                                        <span>{location.address}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <ClockIcon className="w-5 h-5 text-primary" />
                                        <span>{location.hours?.start} - {location.hours?.end}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CreditCardIcon className="w-5 h-5 text-primary" />
                                        <span className="font-semibold">₹{location.ratePerHour}/hour</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CarIcon className="w-5 h-5 text-primary" />
                                        <span>{location.availableSpots} / {location.totalSpots} spots available</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <TagIcon className="w-5 h-5 text-primary" />
                                        <div className="flex flex-wrap gap-2">
                                            {location.tags?.map((tag, index) => (
                                                <Badge key={index} variant="secondary">{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{location.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Reserve a Spot</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {selectedSlot ? (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="text-sm font-medium text-green-600 dark:text-green-400"
                                            >
                                                You've selected spot number: <strong>A{selectedSlot}</strong>
                                            </motion.p>
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="text-sm text-muted-foreground"
                                            >
                                                Select an available parking spot from the grid below.
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <div className="grid grid-cols-5 gap-2">
                                        {location.slots?.length > 0 ? (
                                            location.slots.map((slot) => (
                                                <motion.div
                                                    key={slot._id}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Button
                                                        variant={slot.isAvailable ? "outline" : "secondary"}
                                                        className={`h-12 w-full ${slot.isAvailable
                                                            ? "hover:bg-green-100 focus:ring-green-500"
                                                            : "bg-red-100 hover:bg-red-200 cursor-not-allowed"
                                                            } ${selectedSlot === slot._id ? "ring-2 ring-primary" : ""}`}
                                                        onClick={() => slot.isAvailable && setSelectedSlot(slot._id)}
                                                        disabled={!slot.isAvailable}
                                                    >
                                                        {slot.position}
                                                    </Button>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="col-span-5 text-center text-muted-foreground">No parking slots available</p>
                                        )}
                                    </div>
                                    <div className='flex items-center justify-center w-full mt-6'>
                                        <TimeBookingDialog location={location} refetch={refetchLocation} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="flex items-start space-x-4">
                                        <Avatar>
                                            <AvatarImage src={review.user.image} alt={review.user.username} />
                                            <AvatarFallback>{review.user.username.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">{review.user.username}</h4>
                                                <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Write a Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="rating">Rating</Label>
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                className={`w-6 h-6 cursor-pointer ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="comment">Comment</Label>
                                    <Textarea
                                        id="comment"
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your experience..."
                                        className="mt-1"
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    )
}