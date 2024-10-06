"use client"

import { Link, useNavigate } from 'react-router-dom'
import { motion, Variants } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarIcon, MapPinIcon, ClockIcon, CreditCardIcon, PhoneIcon, CheckCircleIcon, StarIcon } from "lucide-react"

const fadeIn: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
}

const staggerChildren: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export default function Home() {
    const navigate = useNavigate();

    return (
        <motion.div initial="initial" animate="animate" className="overflow-hidden">
            <main className="flex-1">
                <motion.section
                    className="relative w-full py-20 overflow-hidden text-white bg-gradient-to-br from-primary to-primary-dark md:py-32 lg:py-48 xl:py-64"
                    variants={fadeIn}
                >
                    <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                    <div className="container relative px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-8 text-center">
                            <motion.div className="space-y-4" variants={fadeIn}>
                                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                                    Park with Ease, Anytime, Anywhere
                                </h1>
                                <p className="mx-auto max-w-[700px] text-xl text-primary-foreground/80 md:text-2xl">
                                    Reserve your parking spot in advance. Save time, reduce stress, and ensure a space is waiting for you.
                                </p>
                            </motion.div>
                            <motion.div
                                className="w-full max-w-sm space-y-4"
                                variants={fadeIn}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="lg" className="w-full text-lg font-semibold" onClick={() => navigate("/explore")}>
                                    Find Parking Now
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                    <motion.div
                        className="absolute bottom-0 left-0 right-0"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
                            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </motion.div>
                </motion.section>

                <motion.section
                    id="how-it-works"
                    className="w-full py-20 bg-background md:py-32 lg:py-40"
                    variants={staggerChildren}
                >
                    <div className="container px-4 md:px-6">
                        <motion.h2
                            className="mb-12 text-4xl font-bold tracking-tighter text-center sm:text-5xl"
                            variants={fadeIn}
                        >
                            How It Works
                        </motion.h2>
                        <div className="grid gap-10 lg:grid-cols-3 lg:gap-16">
                            {[
                                { icon: MapPinIcon, title: "Find a Spot", description: "Enter your destination and choose from available parking locations nearby. Filter by price, distance, or amenities." },
                                { icon: ClockIcon, title: "Reserve", description: "Select your parking duration and confirm your reservation with ease. Receive instant confirmation and directions." },
                                { icon: CarIcon, title: "Park & Go", description: "Arrive at your reserved spot, park your vehicle, and go about your day worry-free. No more circling for parking!" }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    className="flex flex-col items-center space-y-4 text-center"
                                    variants={fadeIn}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="p-4 rounded-full bg-primary/10">
                                        <item.icon className="w-12 h-12 text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold">{item.title}</h3>
                                    <p className="text-muted-foreground">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    id="locations"
                    className="w-full py-20 bg-secondary/20 md:py-32 lg:py-40"
                    variants={staggerChildren}
                >
                    <div className="container px-4 md:px-6">
                        <motion.h2
                            className="mb-12 text-4xl font-bold tracking-tighter text-center sm:text-5xl"
                            variants={fadeIn}
                        >
                            Popular Locations
                        </motion.h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {['Downtown', 'Airport', 'Shopping Center', 'Stadium', 'Beach', 'University Campus'].map((location) => (
                                <motion.div key={location} variants={fadeIn} whileHover={{ scale: 1.03 }}>
                                    <Card className="overflow-hidden">
                                        <CardHeader className="p-0">
                                            <img src={`/locations/${location}.webp`} alt={location} className="object-cover w-full h-48" />
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <CardTitle className="mb-2">{location}</CardTitle>
                                            <CardDescription>Multiple parking options available</CardDescription>
                                            <Button className="w-full mt-4" variant="outline" onClick={() => navigate(`/explore?search=${location}`)}>View Spots</Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    id="pricing"
                    className="w-full py-20 bg-background md:py-32 lg:py-40"
                    variants={fadeIn}
                >
                    <div className="container px-4 md:px-6">
                        <motion.h2
                            className="mb-12 text-4xl font-bold tracking-tighter text-center sm:text-5xl"
                            variants={fadeIn}
                        >
                            Flexible Pricing
                        </motion.h2>
                        <Tabs defaultValue="hourly" className="w-full max-w-4xl mx-auto">
                            <TabsList className="grid w-full grid-cols-3 mb-8">
                                <TabsTrigger value="hourly">Hourly</TabsTrigger>
                                <TabsTrigger value="daily">Daily</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            </TabsList>
                            {['hourly', 'daily', 'monthly'].map((tab) => (
                                <TabsContent key={tab} value={tab}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-3xl">{tab.charAt(0).toUpperCase() + tab.slice(1)} Rates</CardTitle>
                                                <CardDescription className="text-lg">
                                                    {tab === 'hourly' ? 'Perfect for short-term parking needs' :
                                                        tab === 'daily' ? 'Ideal for full-day parking' :
                                                            'Best value for regular parkers'}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="mb-4 text-4xl font-bold">Starting from ${tab === 'hourly' ? '2/hour' : tab === 'daily' ? '15/day' : '200/month'}</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center text-lg">
                                                        <CheckCircleIcon className="w-6 h-6 mr-2 text-green-500" />
                                                        {tab === 'hourly' ? 'Flexible duration' :
                                                            tab === 'daily' ? '24-hour parking' :
                                                                'Unlimited access'}
                                                    </li>
                                                    <li className="flex items-center text-lg">
                                                        <CheckCircleIcon className="w-6 h-6 mr-2 text-green-500" />
                                                        {tab === 'hourly' ? 'Easy extension' :
                                                            tab === 'daily' ? 'In-and-out privileges' :
                                                                'Reserved spot'}
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </motion.section>

                <motion.section
                    className="w-full py-20 bg-primary text-primary-foreground md:py-32 lg:py-40"
                    variants={staggerChildren}
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-8 text-center">
                            <motion.div className="space-y-4" variants={fadeIn}>
                                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Why Choose ParkEase?</h2>
                                <p className="max-w-[900px] text-xl md:text-2xl text-primary-foreground/80">
                                    Join thousands of happy drivers who have simplified their parking experience with ParkEase.
                                </p>
                            </motion.div>
                            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
                                {[
                                    { icon: StarIcon, title: "Trusted by Thousands", description: "Over 100,000 satisfied users and counting", color: "text-yellow-300" },
                                    { icon: CreditCardIcon, title: "Secure Payments", description: "Your transactions are always protected", color: "text-green-300" },
                                    { icon: PhoneIcon, title: "24/7 Support", description: "Our team is always here to help you", color: "text-blue-300" }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex flex-col items-center p-6 space-y-4 rounded-lg bg-primary-foreground/10"
                                        variants={fadeIn}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <item.icon className={`w-12 h-12 ${item.color}`} />
                                        <h3 className="text-2xl font-bold">{item.title}</h3>
                                        <p className="text-lg text-primary-foreground/80">{item.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    id="contact"
                    className="w-full py-20 bg-background md:py-32 lg:py-40"
                    variants={fadeIn}
                >
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-8 text-center">
                            <motion.div className="space-y-4" variants={fadeIn}>
                                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">Get in Touch</h2>
                                <p className="max-w-[600px] text-xl text-muted-foreground">
                                    Have questions or need assistance? Our team is here to help.
                                </p>
                            </motion.div>
                            <motion.div
                                className="w-full max-w-md space-y-4"
                                variants={fadeIn}
                                whileHover={{ scale: 1.02 }}
                            >
                                <form className="space-y-4">
                                    <Input placeholder="Your Name" type="text" className="text-lg" />
                                    <Input placeholder="Your Email" type="email" className="text-lg" />
                                    <Input placeholder="Your Message" type="text" className="text-lg" />
                                    <Button type="submit" size="lg" className="w-full text-lg">Send Message</Button>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </main>

            <motion.footer
                className="w-full py-6 bg-secondary text-secondary-foreground"
                variants={fadeIn}
            >
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
                        <p className="text-sm text-secondary-foreground/80">© 2024 ParkEase. All rights reserved.</p>
                        <nav className="flex gap-4">
                            <Link className="text-sm hover:underline underline-offset-4" to="#">
                                Terms of Service
                            </Link>
                            <Link className="text-sm hover:underline underline-offset-4" to="#">
                                Privacy Policy
                            </Link>
                        </nav>
                    </div>
                </div>
            </motion.footer>
        </motion.div>
    )
}