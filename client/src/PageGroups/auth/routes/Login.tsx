
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Link, useNavigate } from 'react-router-dom'
import newRequest from '@/lib/newRequest'
import { useToast } from '@/hooks/use-toast'
import { useUserStore } from '@/lib/context'



const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export default function SignInForm() {
    const [error, setError] = useState('')
    const navigate = useNavigate();
    const { toast } = useToast();
    const setUser = useUserStore(state => state.setUser)


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const res = await newRequest.post("/login", values, {
                withCredentials: true
            });
            localStorage.setItem("currentUser", JSON.stringify(res.data));
            setUser(res.data);
            navigate("/");
            toast({
                title: "Login Successful",
                description: "Welcome back!",
                duration: 5000,
            });
            window.location.reload();
        } catch (err) {
            toast({
                title: `Error`,
                description: JSON.stringify(err),
                duration: 5000,
            })
            console.error(err);
            setError("Invalid email or password");
        }
    }

    return (
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="m@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" className="w-full">
                        Sign In
                    </Button>
                </form>
            </Form>
            <div className="mt-4 text-sm text-center">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                    Forgot password?
                </Link>
            </div>
            <p className="mt-4 text-sm text-center text-gray-600">
                Create new account{" "}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign Up
                </Link>
            </p>
        </CardContent>
    )
}