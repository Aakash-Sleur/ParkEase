import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"
import { Loader2, X } from "lucide-react"
import FileUploader from '@/components/custom/FileUploader'
import { uploadImage } from '@/lib/upload'
import newRequest from '@/lib/newRequest'
import { useNavigate } from "react-router-dom"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    address: z.string().min(5, {
        message: "Address must be at least 5 characters.",
    }),
    hoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "Start time must be in HH:MM format.",
    }),
    hoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: "End time must be in HH:MM format.",
    }),
    ratePerHour: z.number().positive({
        message: "Rate per hour must be a positive number.",
    }),
    totalSpots: z.number().int().positive({
        message: "Total spots must be a positive integer.",
    }),
    file: z.custom<File[]>(),
    tags: z.array(z.string()).min(1, {
        message: "At least one tag is required.",
    }),
})

export default function CreateLocationPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [currentTag, setCurrentTag] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const navigate = useNavigate()

    const addTag = () => {
        if (currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()])
            setCurrentTag("")
            form.setValue("tags", [...tags, currentTag.trim()])
        }
    }

    const removeTag = (tagToRemove: string) => {
        const updatedTags = tags.filter(tag => tag !== tagToRemove)
        setTags(updatedTags)
        form.setValue("tags", updatedTags)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            address: "",
            hoursStart: "",
            hoursEnd: "",
            ratePerHour: 0,
            totalSpots: 0,
            file: [],
            tags: [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const bannerImg = await uploadImage(values.file[0]);

            if (!bannerImg) {
                toast({ title: 'Failed to upload image' });
                throw new Error('Failed to upload image');
            }

            const data = {
                name: values.name,
                description: values.description,
                address: values.address,
                hours: {
                    start: values.hoursStart,
                    end: values.hoursEnd,
                },
                ratePerHour: values.ratePerHour,
                totalSpots: values.totalSpots,
                availableSpots: values.totalSpots,
                banner: bannerImg,
                tags: values.tags,
            }

            console.log(data)
            const response = await newRequest.post(
                "/parking",
                data
            )

            if (!response) {
                console.log(response)
                throw new Error("Failed to create location")
            }
            toast({
                title: "Location created",
                description: "New parking location has been successfully added.",
            })
            form.reset()
            navigate(-1);
        } catch (error) {
            toast({
                title: "Error",
                description: "There was a problem creating the location.",
                variant: "destructive",
            })
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Parking Location</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Central Park Parking" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The name of the parking location.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the parking location, its features, and any important information for users."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a detailed description of the parking location.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The full address of the parking location.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex space-x-4">
                            <FormField
                                control={form.control}
                                name="hoursStart"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Opening Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursEnd"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Closing Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="ratePerHour"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rate per Hour (&#8377;)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalSpots"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Total Spots</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='file'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Banner Image</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-4">
                                            <FileUploader
                                                fieldChange={field.onChange}
                                                mediaUrl={""}
                                                setIsFileUploaded={setIsFileUploaded}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Upload a banner image for the parking location.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tags"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <div className="flex space-x-2">
                                                <Input
                                                    placeholder="Add a tag"
                                                    value={currentTag}
                                                    onChange={(e) => setCurrentTag(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addTag()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" onClick={addTag}>Add</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map((tag, index) => (
                                                    <div key={index} className="flex items-center px-3 py-1 text-blue-800 bg-blue-100 rounded-full">
                                                        <span>{tag}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Add relevant tags for the parking location (e.g., "downtown", "covered", "24/7").
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create Location
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}