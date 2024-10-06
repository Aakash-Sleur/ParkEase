import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PhoneIcon, MailIcon, MapPinIcon, Loader2, CalendarIcon, CreditCardIcon, CarIcon, XCircle } from "lucide-react";
import { useUserStore } from '@/lib/context';
import { useQuery, UseQueryResult, useMutation, useQueryClient } from '@tanstack/react-query';
import newRequest from '@/lib/newRequest';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface IReservation {
    _id: string;
    reservationTime: {
        start: string;
        end: string;
    };
    slot: {
        _id: string;
        position: number;
    };
    parking: {
        _id: string;
        name: string;
        address: string;
    };
    status: string;
    price: number;
}

interface IUser {
    username: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);
    const user: IUser = useUserStore((state) => state);
    const queryClient = useQueryClient();

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

    const { data: user_reservations, isLoading, error }: UseQueryResult<IReservation[]> = useQuery({
        queryKey: ["GET_RESERVATIONS"],
        queryFn: async () => {
            const response = await newRequest.get(`/reservation/user`);
            return response.data;
        },
        refetchInterval: 10000
    });

    const cancelReservationMutation = useMutation({
        mutationFn: (reservationId: string) => newRequest.delete(`/reservation/${reservationId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["GET_RESERVATIONS"],
            });
            toast({
                title: "Reservation Cancelled",
                description: "Your reservation has been successfully cancelled.",
                variant: "default",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to cancel reservation. Please try again. " + error,
                variant: "destructive",
            });
        },
    });

    const handleCancelReservation = (reservationId: string) => {
        cancelReservationMutation.mutate(reservationId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className='animate-spin size-8 text-primary' />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center text-red-500">Error loading reservations. Please try again later.</div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const activeReservations = user_reservations?.filter(reservation => reservation.status === 'active') || [];
    const upcomingReservations = user_reservations?.filter(reservation => reservation.status === 'upcoming') || [];
    const completedReservations = user_reservations?.filter(reservation => reservation.status === 'completed') || [];
    const cancelledReservations = user_reservations?.filter(reservation => reservation.status === 'cancelled') || [];

    return (
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <motion.h1
                        className="mb-8 text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl lg:text-6xl/none"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        My Profile
                    </motion.h1>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">User Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center mb-6 space-x-4">
                                    <Avatar className="w-20 h-20">
                                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="text-2xl font-bold">{user.username}</h2>
                                        <p className="text-sm text-muted-foreground">Member since {new Date(user.createdAt).getFullYear()}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <MailIcon className="w-5 h-5 text-primary" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <PhoneIcon className="w-5 h-5 text-primary" />
                                        <span>+91 {user.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <MapPinIcon className="w-5 h-5 text-primary" />
                                        <span>{user.address}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">My Reservations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="active" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="active">Active</TabsTrigger>
                                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                        <TabsTrigger value="completed">Completed</TabsTrigger>
                                        <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="active">
                                        <ReservationList
                                            reservations={activeReservations}
                                            setSelectedReservation={setSelectedReservation}
                                            formatDate={formatDate}
                                            handleCancelReservation={handleCancelReservation}
                                            showCancelButton={true}
                                        />
                                    </TabsContent>
                                    <TabsContent value="upcoming">
                                        <ReservationList
                                            reservations={upcomingReservations}
                                            setSelectedReservation={setSelectedReservation}
                                            formatDate={formatDate}
                                            handleCancelReservation={handleCancelReservation}
                                            showCancelButton={true}
                                        />
                                    </TabsContent>
                                    <TabsContent value="completed">
                                        <ReservationList
                                            reservations={completedReservations}
                                            setSelectedReservation={setSelectedReservation}
                                            formatDate={formatDate}
                                            handleCancelReservation={handleCancelReservation}
                                            showCancelButton={false}
                                        />
                                    </TabsContent>
                                    <TabsContent value="cancelled">
                                        <ReservationList
                                            reservations={cancelledReservations}
                                            setSelectedReservation={setSelectedReservation}
                                            formatDate={formatDate}
                                            handleCancelReservation={handleCancelReservation}
                                            showCancelButton={false}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </main>
    );
}

interface ReservationListProps {
    reservations: IReservation[];
    setSelectedReservation: (reservation: IReservation | null) => void;
    formatDate: (dateString: string) => string;
    handleCancelReservation: (reservationId: string) => void;
    showCancelButton: boolean;
}

function ReservationList({ reservations, setSelectedReservation, formatDate, handleCancelReservation, showCancelButton }: ReservationListProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Spot</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    {showCancelButton && <TableHead>Action</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                <AnimatePresence>
                    {reservations.map((reservation) => (
                        <motion.tr
                            key={reservation._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TableCell>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link" onClick={() => setSelectedReservation(reservation)}>
                                            {reservation.parking.name}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-bold">Reservation Details</DialogTitle>
                                        </DialogHeader>
                                        <ReservationDetails reservation={reservation} formatDate={formatDate} />
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                            <TableCell>{reservation.slot.position}</TableCell>
                            <TableCell>{formatDate(reservation.reservationTime.start)}</TableCell>
                            <TableCell>
                                <ReservationStatusBadge status={reservation.status} />
                            </TableCell>
                            {showCancelButton && (
                                <TableCell>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleCancelReservation(reservation._id)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </TableCell>
                            )}
                        </motion.tr>
                    ))}
                </AnimatePresence>
            </TableBody>
        </Table>
    );
}

interface ReservationStatusBadgeProps {
    status: string;
}

function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
    let color;
    switch (status.toLowerCase()) {
        case 'active':
            color = 'bg-green-500';
            break;
        case 'completed':
            color = 'bg-blue-500';
            break;
        case 'upcoming':
            color = 'bg-yellow-500';
            break;
        default:
            color = 'bg-gray-500';
            break;
    }
    return <Badge className={`${color} text-white`}>{status}</Badge>;
}

interface ReservationDetailsProps {
    reservation: IReservation;
    formatDate: (dateString: string) => string;
}

function ReservationDetails({ reservation, formatDate }: ReservationDetailsProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="grid items-center grid-cols-4 gap-4">
                <MapPinIcon className="w-5 h-5 text-primary" />
                <div className="col-span-3">
                    <p className="font-semibold">{reservation.parking.name}</p>
                    <p className="text-sm text-muted-foreground">{reservation.parking.address}</p>
                </div>
            </div>
            <div className="grid items-center grid-cols-4 gap-4">
                <CarIcon className="w-5 h-5 text-primary" />
                <p className="col-span-3">Spot: {reservation.slot.position}</p>
            </div>
            <div className="grid items-center grid-cols-4 gap-4">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <div className="col-span-3">
                    <p>Start: {formatDate(reservation.reservationTime.start)}</p>
                    <p>End: {formatDate(reservation.reservationTime.end)}</p>
                </div>
            </div>
            <div className="grid items-center grid-cols-4 gap-4">
                <CreditCardIcon className="w-5 h-5 text-primary" />
                <p className="col-span-3">Price: ₹{reservation.price}</p>
            </div>
        </div>
    );
}