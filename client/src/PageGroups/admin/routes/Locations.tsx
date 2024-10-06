import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, MoreHorizontal, ChevronsUpDown, MapPin, Car, DollarSign } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IParking } from "@/lib/types"
import newRequest from "@/lib/newRequest"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast'
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"

export default function LocationsPage() {
    const navigate = useNavigate()
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data: locations, isLoading } = useQuery<IParking[]>({
        queryKey: ["GET_LOCATIONS"],
        queryFn: async () => {
            const response = await newRequest.get("/parking")
            return response.data
        },
    })

    const { mutateAsync: deleteParking } = useMutation({
        mutationFn: (id: string) => {
            return newRequest.delete(`/parking/${id}`)
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

    const handleDelete = async (id: string) => {
        try {
            await deleteParking(id)
            toast({
                title: "Location Deleted!",
                description: "Location deleted successfully",
                variant: "default",
            })
            setDeleteConfirmation(null)
        } catch (error) {
            toast({
                title: "Error while deleting!",
                description: "Error: " + error,
                variant: "destructive",
            })
        }
    }

    const columns: ColumnDef<IParking>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ChevronsUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{row.getValue("name")}</span>
                </div>
            ),
        },
        {
            accessorKey: "address",
            header: "Address",
            cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue("address")}</div>,
        },
        {
            accessorKey: "totalSpots",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Capacity
                        <ChevronsUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Car className="w-4 h-4 mr-2 text-green-500" />
                    <span>{row.getValue("totalSpots")}</span>
                </div>
            ),
        },
        {
            accessorKey: "ratePerHour",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Rate/Hour
                        <ChevronsUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />
                    <span>₹{row.getValue("ratePerHour")}</span>
                </div>
            ),
        },
        {
            accessorKey: "availableSpots",
            header: "Status",
            cell: ({ row }) => {
                const availableSpots = row.getValue("availableSpots") as number
                const totalSpots = row.original.totalSpots
                const occupancyPercentage = ((totalSpots - availableSpots) / totalSpots) * 100
                let status: "Low" | "Medium" | "High"
                let color: "green" | "yellow" | "red"

                if (occupancyPercentage < 33) {
                    status = "Low"
                    color = "green"
                } else if (occupancyPercentage < 66) {
                    status = "Medium"
                    color = "yellow"
                } else {
                    status = "High"
                    color = "red"
                }

                return (
                    <Badge variant={color === "green" ? "default" : color === "yellow" ? "secondary" : "destructive"}>
                        {status} Occupancy
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const parking = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-8 h-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/admin/edit/${parking._id}`)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteConfirmation(parking._id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data: locations || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Parking Locations</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Input
                                placeholder="Search locations..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        <Button onClick={() => navigate("/admin/create")} className="text-white bg-green-500 hover:bg-green-600">
                            <PlusCircle className="w-4 h-4 mr-2" /> Create Location
                        </Button>
                    </div>
                    <div className="overflow-hidden border rounded-md">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                ))}
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end py-4 space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
            <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete this location?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the parking location and remove all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => deleteConfirmation && handleDelete(deleteConfirmation)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}