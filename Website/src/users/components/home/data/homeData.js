import bannerImg from "../../../../assets/images/banner.png";

/* -------------------- Categories -------------------- */
export const categories = [
    {
        id: "1",
        icon: "Zap",
        label: "Electrical",
        colorKey: "yellow",
        jobs: "1.8k+",
        description: "Wiring, switches, installations",
        trending: true,
    },
    {
        id: "2",
        icon: "Wrench",
        label: "Plumbing",
        colorKey: "blue",
        jobs: "2.3k+",
        description: "Leaks, pipes, bathroom fittings",
        trending: true,
    },
    {
        id: "3",
        icon: "Wind",
        label: "AC Repair",
        colorKey: "cyan",
        jobs: "1.2k+",
        description: "AC servicing and installation",
        trending: true,
    },
    {
        id: "4",
        icon: "Sparkles",
        label: "Cleaning",
        colorKey: "green",
        jobs: "3.1k+",
        description: "Home & office cleaning services",
        trending: true,
    },
    {
        id: "5",
        icon: "Paintbrush",
        label: "Painting",
        colorKey: "purple",
        jobs: "980+",
        description: "Interior & exterior painting",
    },
    {
        id: "6",
        icon: "Hammer",
        label: "Carpentry",
        colorKey: "orange",
        jobs: "1.5k+",
        description: "Furniture & woodwork",
    },
    {
        id: "7",
        icon: "Settings",
        label: "Appliance Repair",
        colorKey: "orange",
        jobs: "850+",
        description: "TV, fridge, washing machine",
    },
    {
        id: "8",
        icon: "TreePine",
        label: "Pest Control",
        colorKey: "rose",
        jobs: "550+",
        description: "Home & garden pest removal",
    },
];

/* -------------------- Testimonials -------------------- */
export const testimonials = [
    {
        name: "Rajesh Kumar",
        role: "Homeowner",
        text: "Booked a plumber within minutes. Clean work and fair pricing.",
        rating: 5,
        image: "https://api.dicebear.com/7.x/personas/svg?seed=Rajesh",
    },
    {
        name: "Priya Sharma",
        role: "Office Manager",
        text: "Reliable professionals. The experience was smooth from booking to completion.",
        rating: 5,
        image: "https://api.dicebear.com/7.x/personas/svg?seed=Priya",
    },
    {
        name: "Amit Patel",
        role: "Restaurant Owner",
        text: "Quick response and skilled electrician. Highly recommend.",
        rating: 5,
        image: "https://api.dicebear.com/7.x/personas/svg?seed=Amit",
    },
];

/* -------------------- Featured Workers (ESSENTIAL ONLY) -------------------- */
export const featuredWorkers = [
    {
        id: 1,
        name: "Kamal Silva",
        service: "Plumber",
        rating: 4.9,
        startingFrom: 2500,
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Kamal",
    },
    {
        id: 2,
        name: "Nimal Perera",
        service: "Electrician",
        rating: 4.8,
        startingFrom: 2800,
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Nimal",
    },
    {
        id: 3,
        name: "Sunil Fernando",
        service: "Carpenter",
        rating: 5.0,
        startingFrom: 3000,
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Sunil",
    },
    {
        id: 4,
        name: "Rohana Jayawardena",
        service: "Painter",
        rating: 4.7,
        startingFrom: 2200,
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Rohana",
    },
    {
        id: 5,
        name: "Kasun De Silva",
        service: "AC Technician",
        rating: 4.9,
        startingFrom: 3500,
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Kasun",
    },
];

/* -------------------- How It Works -------------------- */
export const steps = [
    {
        icon: "ShoppingBag",
        title: "Choose Service",
        desc: "Select the service you need",
    },
    {
        icon: "UserCheck",
        title: "Get Matched",
        desc: "We connect you with trusted professionals",
    },
    {
        icon: "CheckCircle",
        title: "Job Done",
        desc: "Pay only after the work is completed",
    },
];

/* -------------------- Platform Features -------------------- */
export const features = [
    {
        icon: "Shield",
        title: "Verified Professionals",
        desc: "All workers are background checked and verified",
    },
    {
        icon: "Clock",
        title: "Quick Response",
        desc: "Get matched with pros in minutes, not days",
    },
    {
        icon: "CheckCircle",
        title: "Quality Guaranteed",
        desc: "We stand behind every job with our satisfaction guarantee",
    },
    {
        icon: "BadgeCheck",
        title: "Transparent Pricing",
        desc: "No hidden fees, upfront quotes for all services",
    },
];

/* -------------------- Emergency Services -------------------- */
export const emergencyServices = [
    { icon: "Zap", label: "Emergency Electrician", time: "15–30 min" },
    { icon: "Wrench", label: "Emergency Plumber", time: "20–40 min" },
    { icon: "Wind", label: "AC Repair", time: "30–60 min" },
];

/* -------------------- Popular Requests -------------------- */
export const popularRequests = [
    {
        service: "Bathroom Leak Repair",
        requests: 234,
        icon: "Wrench",
        color: "blue",
    },
    { service: "AC Installation", requests: 189, icon: "Wind", color: "cyan" },
    {
        service: "House Painting",
        requests: 167,
        icon: "Paintbrush",
        color: "purple",
    },
    { service: "Electrical Wiring", requests: 145, icon: "Zap", color: "yellow" },
    { service: "Deep Cleaning", requests: 298, icon: "Sparkles", color: "green" },
];

/* -------------------- Assets -------------------- */
export const assets = { bannerImg };
