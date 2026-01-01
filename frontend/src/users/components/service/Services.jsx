import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Zap, Droplets, Snowflake, Sparkles, 
  Paintbrush, Wrench, Settings, Bug, Clock, DollarSign, 
  CheckCircle, Star, MapPin, Users, Shield, ArrowRight
} from 'lucide-react';

export const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const serviceCategories = [
    { id: 'all', name: 'All Services', icon: <Settings className="w-5 h-5" />, count: 40 },
    { id: 'electrical', name: 'Electrical', icon: <Zap className="w-5 h-5" />, count: 8 },
    { id: 'plumbing', name: 'Plumbing', icon: <Droplets className="w-5 h-5" />, count: 6 },
    { id: 'ac-repair', name: 'AC Repair', icon: <Snowflake className="w-5 h-5" />, count: 5 },
    { id: 'cleaning', name: 'Cleaning', icon: <Sparkles className="w-5 h-5" />, count: 7 },
    { id: 'painting', name: 'Painting', icon: <Paintbrush className="w-5 h-5" />, count: 4 },
    { id: 'carpentry', name: 'Carpentry', icon: <Wrench className="w-5 h-5" />, count: 5 },
    { id: 'appliance', name: 'Appliance Repair', icon: <Settings className="w-5 h-5" />, count: 5 },
    { id: 'pest-control', name: 'Pest Control', icon: <Bug className="w-5 h-5" />, count: 5 },
  ];

  const services = [
    // Electrical Services
    {
      id: 1,
      name: 'Electrical Wiring Installation',
      category: 'electrical',
      description: 'Complete electrical wiring for new construction or renovation projects',
      price: 'LKR 15,000 - 25,000',
      estimatedTime: '1-2 days',
      rating: 4.8,
      reviews: 124,
      popular: true,
      features: ['Free Consultation', 'Quality Materials', 'Safety Certified'],
      issues: ['New construction wiring', 'Complete rewiring', 'Additional circuits'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 2,
      name: 'Switch & Socket Installation',
      category: 'electrical',
      description: 'Installation of new switches, sockets, and electrical points',
      price: 'LKR 2,500 - 5,000',
      estimatedTime: '2-4 hours',
      rating: 4.7,
      reviews: 89,
      popular: true,
      features: ['Modern Designs', 'Child Safety Options', 'Warranty Included'],
      issues: ['Adding new sockets', 'Replacing old switches', 'Safety upgrades'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      name: 'Circuit Breaker Repair',
      category: 'electrical',
      description: 'Fix tripping circuit breakers and electrical faults',
      price: 'LKR 3,000 - 7,000',
      estimatedTime: '1-3 hours',
      rating: 4.6,
      reviews: 67,
      popular: false,
      features: ['Emergency Service', 'Diagnostic Check', 'Same-day Fix'],
      issues: ['Frequent tripping', 'Power outages', 'Faulty breakers'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 4,
      name: 'Light Fixture Installation',
      category: 'electrical',
      description: 'Installation of ceiling lights, chandeliers, and outdoor lighting',
      price: 'LKR 4,000 - 10,000',
      estimatedTime: '2-5 hours',
      rating: 4.9,
      reviews: 112,
      popular: true,
      features: ['Professional Installation', 'Safety Check', 'Clean Setup'],
      issues: ['New light installation', 'Fixture replacement', 'Electrical wiring'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 5,
      name: 'Electrical Safety Inspection',
      category: 'electrical',
      description: 'Complete electrical safety assessment and certification',
      price: 'LKR 5,000 - 8,000',
      estimatedTime: '2-4 hours',
      rating: 4.7,
      reviews: 56,
      popular: false,
      features: ['Detailed Report', 'Safety Certificate', 'Expert Recommendations'],
      issues: ['Safety concerns', 'Insurance requirements', 'Property inspection'],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500'
    },

    // Plumbing Services
    {
      id: 6,
      name: 'Pipe Leak Repair',
      category: 'plumbing',
      description: 'Fix leaking pipes, joints, and connections',
      price: 'LKR 3,000 - 8,000',
      estimatedTime: '1-3 hours',
      rating: 4.7,
      reviews: 98,
      popular: true,
      features: ['Leak Detection', 'Quality Materials', 'Waterproofing'],
      issues: ['Water leaks', 'Pipe damage', 'Joint repairs'],
      icon: <Droplets className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 7,
      name: 'Bathroom Fitting Installation',
      category: 'plumbing',
      description: 'Install taps, showers, toilets, and bathroom fixtures',
      price: 'LKR 8,000 - 20,000',
      estimatedTime: '3-6 hours',
      rating: 4.8,
      reviews: 76,
      popular: true,
      features: ['Modern Fixtures', 'Water Saving', 'Professional Setup'],
      issues: ['New installations', 'Upgrade fixtures', 'Bathroom renovation'],
      icon: <Droplets className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 8,
      name: 'Drain Cleaning',
      category: 'plumbing',
      description: 'Clear clogged drains and pipes',
      price: 'LKR 2,500 - 6,000',
      estimatedTime: '1-2 hours',
      rating: 4.6,
      reviews: 145,
      popular: true,
      features: ['High-pressure Cleaning', 'Root Removal', 'Camera Inspection'],
      issues: ['Slow drainage', 'Complete blockages', 'Recurring clogs'],
      icon: <Droplets className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 9,
      name: 'Water Heater Installation',
      category: 'plumbing',
      description: 'Install or repair water heaters and geysers',
      price: 'LKR 12,000 - 25,000',
      estimatedTime: '2-4 hours',
      rating: 4.9,
      reviews: 63,
      popular: false,
      features: ['Energy Efficient', 'Safety Checks', 'Warranty Included'],
      issues: ['New installation', 'Heater repair', 'Upgrade existing'],
      icon: <Droplets className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 10,
      name: 'Sewer Line Repair',
      category: 'plumbing',
      description: 'Fix main sewer line issues and backups',
      price: 'LKR 15,000 - 40,000',
      estimatedTime: '4-8 hours',
      rating: 4.7,
      reviews: 42,
      popular: false,
      features: ['Professional Equipment', 'Minimal Disruption', 'Guaranteed Fix'],
      issues: ['Sewer backups', 'Main line clogs', 'Pipe replacement'],
      icon: <Droplets className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500'
    },

    // AC Repair Services
    {
      id: 11,
      name: 'AC Gas Charging',
      category: 'ac-repair',
      description: 'Complete AC gas refill and pressure check',
      price: 'LKR 6,000 - 12,000',
      estimatedTime: '1-2 hours',
      rating: 4.8,
      reviews: 134,
      popular: true,
      features: ['Original Gas', 'Pressure Testing', 'Performance Check'],
      issues: ['Weak cooling', 'Gas leakage', 'Low pressure'],
      icon: <Snowflake className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 12,
      name: 'AC Installation',
      category: 'ac-repair',
      description: 'Professional AC unit installation',
      price: 'LKR 15,000 - 30,000',
      estimatedTime: '3-5 hours',
      rating: 4.9,
      reviews: 89,
      popular: true,
      features: ['Professional Setup', 'Testing & Calibration', 'Warranty'],
      issues: ['New AC installation', 'Window/split AC', 'Relocation'],
      icon: <Snowflake className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 13,
      name: 'AC Cleaning Service',
      category: 'ac-repair',
      description: 'Deep cleaning of AC indoor and outdoor units',
      price: 'LKR 3,500 - 7,000',
      estimatedTime: '1-2 hours',
      rating: 4.7,
      reviews: 178,
      popular: true,
      features: ['Deep Cleaning', 'Mold Removal', 'Filter Replacement'],
      issues: ['Poor airflow', 'Bad odor', 'Dust accumulation'],
      icon: <Snowflake className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 14,
      name: 'AC PCB Repair',
      category: 'ac-repair',
      description: 'Repair or replace AC circuit boards',
      price: 'LKR 8,000 - 20,000',
      estimatedTime: '2-4 hours',
      rating: 4.6,
      reviews: 45,
      popular: false,
      features: ['Expert Diagnosis', 'Quality Parts', 'Testing'],
      issues: ['AC not starting', 'Display errors', 'Circuit faults'],
      icon: <Snowflake className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      id: 15,
      name: 'AC Preventive Maintenance',
      category: 'ac-repair',
      description: 'Regular maintenance for optimal performance',
      price: 'LKR 2,500 - 5,000',
      estimatedTime: '1-2 hours',
      rating: 4.8,
      reviews: 96,
      popular: false,
      features: ['Full Inspection', 'Performance Tuning', 'Cleaning'],
      issues: ['Regular maintenance', 'Performance check', 'Prevent breakdowns'],
      icon: <Snowflake className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500'
    },

    // Cleaning Services
    {
      id: 16,
      name: 'Deep Home Cleaning',
      category: 'cleaning',
      description: 'Complete deep cleaning of entire house',
      price: 'LKR 8,000 - 15,000',
      estimatedTime: '4-8 hours',
      rating: 4.9,
      reviews: 234,
      popular: true,
      features: ['Eco-friendly Products', 'Professional Equipment', 'Satisfaction Guaranteed'],
      issues: ['Spring cleaning', 'Post-renovation', 'Regular deep clean'],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 17,
      name: 'Office Cleaning',
      category: 'cleaning',
      description: 'Commercial office space cleaning',
      price: 'LKR 10,000 - 25,000',
      estimatedTime: '3-6 hours',
      rating: 4.8,
      reviews: 167,
      popular: true,
      features: ['Commercial Grade', 'Flexible Timing', 'Custom Packages'],
      issues: ['Daily cleaning', 'Weekly maintenance', 'Special events'],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 18,
      name: 'Carpet & Upholstery Cleaning',
      category: 'cleaning',
      description: 'Professional cleaning of carpets and furniture',
      price: 'LKR 4,000 - 10,000',
      estimatedTime: '2-4 hours',
      rating: 4.7,
      reviews: 89,
      popular: false,
      features: ['Steam Cleaning', 'Stain Removal', 'Deodorizing'],
      issues: ['Stain removal', 'Regular cleaning', 'Allergen removal'],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 19,
      name: 'Kitchen Deep Cleaning',
      category: 'cleaning',
      description: 'Intensive kitchen cleaning including appliances',
      price: 'LKR 5,000 - 9,000',
      estimatedTime: '2-4 hours',
      rating: 4.8,
      reviews: 112,
      popular: true,
      features: ['Grease Removal', 'Appliance Cleaning', 'Sanitization'],
      issues: ['Grease buildup', 'Appliance cleaning', 'Hygiene maintenance'],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 20,
      name: 'Window Cleaning',
      category: 'cleaning',
      description: 'Interior and exterior window cleaning',
      price: 'LKR 3,000 - 7,000',
      estimatedTime: '1-3 hours',
      rating: 4.6,
      reviews: 78,
      popular: false,
      features: ['Streak-free Finish', 'High Access Equipment', 'Safety First'],
      issues: ['Regular maintenance', 'High windows', 'Hard water stains'],
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500'
    },

    // Painting Services
    {
      id: 21,
      name: 'Interior Wall Painting',
      category: 'painting',
      description: 'Complete interior wall painting service',
      price: 'LKR 25,000 - 50,000',
      estimatedTime: '2-5 days',
      rating: 4.8,
      reviews: 145,
      popular: true,
      features: ['Premium Paints', 'Surface Preparation', 'Clean Finish'],
      issues: ['New paint job', 'Color change', 'Wall restoration'],
      icon: <Paintbrush className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 22,
      name: 'Exterior Painting',
      category: 'painting',
      description: 'Exterior wall and building painting',
      price: 'LKR 40,000 - 80,000',
      estimatedTime: '3-7 days',
      rating: 4.7,
      reviews: 98,
      popular: true,
      features: ['Weatherproof Paint', 'Surface Repair', 'Long-lasting Finish'],
      issues: ['Weather damage', 'Fading paint', 'Building maintenance'],
      icon: <Paintbrush className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 23,
      name: 'Wall Texture & Design',
      category: 'painting',
      description: 'Creative wall textures and designs',
      price: 'LKR 35,000 - 70,000',
      estimatedTime: '3-6 days',
      rating: 4.9,
      reviews: 67,
      popular: false,
      features: ['Custom Designs', 'Modern Techniques', 'Artistic Finish'],
      issues: ['Wall texture', 'Design work', 'Feature walls'],
      icon: <Paintbrush className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 24,
      name: 'Woodwork Painting',
      category: 'painting',
      description: 'Painting of doors, windows, and wooden furniture',
      price: 'LKR 15,000 - 30,000',
      estimatedTime: '2-4 days',
      rating: 4.7,
      reviews: 56,
      popular: false,
      features: ['Wood Primer', 'Quality Finish', 'Durability'],
      issues: ['Door/window painting', 'Furniture refresh', 'Protection coat'],
      icon: <Paintbrush className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500'
    },

    // Carpentry Services
    {
      id: 25,
      name: 'Custom Furniture Making',
      category: 'carpentry',
      description: 'Custom made furniture as per requirements',
      price: 'LKR 30,000 - 100,000',
      estimatedTime: '7-14 days',
      rating: 4.9,
      reviews: 89,
      popular: true,
      features: ['Custom Design', 'Quality Wood', 'Expert Craftsmanship'],
      issues: ['Custom furniture', 'Unique designs', 'Space optimization'],
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-amber-700 to-amber-900'
    },
    {
      id: 26,
      name: 'Kitchen Cabinet Installation',
      category: 'carpentry',
      description: 'Installation of kitchen cabinets and storage',
      price: 'LKR 50,000 - 150,000',
      estimatedTime: '5-10 days',
      rating: 4.8,
      reviews: 112,
      popular: true,
      features: ['Space Planning', 'Modern Designs', 'Durable Finish'],
      issues: ['Kitchen renovation', 'New cabinets', 'Storage solutions'],
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-amber-700 to-amber-900'
    },
    {
      id: 27,
      name: 'Door & Window Repair',
      category: 'carpentry',
      description: 'Repair and maintenance of doors and windows',
      price: 'LKR 5,000 - 15,000',
      estimatedTime: '1-3 days',
      rating: 4.7,
      reviews: 78,
      popular: false,
      features: ['Quick Repair', 'Quality Materials', 'Proper Fit'],
      issues: ['Sticking doors', 'Window repairs', 'Frame issues'],
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-amber-700 to-amber-900'
    },
    {
      id: 28,
      name: 'Wood Flooring Installation',
      category: 'carpentry',
      description: 'Installation of wooden flooring',
      price: 'LKR 40,000 - 80,000',
      estimatedTime: '3-7 days',
      rating: 4.8,
      reviews: 45,
      popular: false,
      features: ['Quality Wood', 'Professional Installation', 'Finishing'],
      issues: ['New flooring', 'Floor renovation', 'Wood installation'],
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-amber-700 to-amber-900'
    },
    {
      id: 29,
      name: 'Wardrobe Construction',
      category: 'carpentry',
      description: 'Built-in wardrobe construction',
      price: 'LKR 35,000 - 70,000',
      estimatedTime: '4-8 days',
      rating: 4.7,
      reviews: 67,
      popular: true,
      features: ['Space Saving', 'Custom Design', 'Quality Finish'],
      issues: ['Bedroom storage', 'Custom wardrobe', 'Closet organization'],
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-amber-700 to-amber-900'
    },

    // Appliance Repair
    {
      id: 30,
      name: 'Refrigerator Repair',
      category: 'appliance',
      description: 'Repair of all refrigerator types and issues',
      price: 'LKR 4,000 - 12,000',
      estimatedTime: '1-3 hours',
      rating: 4.7,
      reviews: 134,
      popular: true,
      features: ['Expert Diagnosis', 'Original Parts', 'Warranty'],
      issues: ['Not cooling', 'Compressor issues', 'Temperature problems'],
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 31,
      name: 'Washing Machine Repair',
      category: 'appliance',
      description: 'Repair of washing machine mechanical and electrical issues',
      price: 'LKR 3,500 - 10,000',
      estimatedTime: '1-3 hours',
      rating: 4.8,
      reviews: 156,
      popular: true,
      features: ['Same-day Service', 'Quality Parts', 'Testing'],
      issues: ['Not spinning', 'Water leakage', 'Electrical faults'],
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 32,
      name: 'Television Repair',
      category: 'appliance',
      description: 'Repair of LED, LCD, and Smart TVs',
      price: 'LKR 6,000 - 20,000',
      estimatedTime: '2-4 hours',
      rating: 4.6,
      reviews: 98,
      popular: false,
      features: ['Expert Technicians', 'Genuine Parts', 'On-site Service'],
      issues: ['No display', 'Sound problems', 'Power issues'],
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 33,
      name: 'Microwave Oven Repair',
      category: 'appliance',
      description: 'Repair of microwave heating and electrical issues',
      price: 'LKR 2,500 - 6,000',
      estimatedTime: '1-2 hours',
      rating: 4.7,
      reviews: 67,
      popular: false,
      features: ['Quick Fix', 'Safety Check', 'Testing'],
      issues: ['Not heating', 'Spark issues', 'Control problems'],
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 34,
      name: 'Water Purifier Service',
      category: 'appliance',
      description: 'Service and repair of water purifiers',
      price: 'LKR 2,000 - 5,000',
      estimatedTime: '1-2 hours',
      rating: 4.8,
      reviews: 89,
      popular: true,
      features: ['Filter Replacement', 'UV Check', 'Water Testing'],
      issues: ['Filter change', 'UV repair', 'Water flow issues'],
      icon: <Settings className="w-6 h-6" />,
      color: 'from-gray-600 to-gray-800'
    },

    // Pest Control
    {
      id: 35,
      name: 'Cockroach & Ant Control',
      category: 'pest-control',
      description: 'Complete elimination of cockroaches and ants',
      price: 'LKR 3,000 - 6,000',
      estimatedTime: '1-2 hours',
      rating: 4.8,
      reviews: 178,
      popular: true,
      features: ['Eco-friendly', 'Long-lasting', 'Follow-up Service'],
      issues: ['Infestation', 'Recurring problem', 'Kitchen pests'],
      icon: <Bug className="w-6 h-6" />,
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 36,
      name: 'Mosquito Control',
      category: 'pest-control',
      description: 'Mosquito fogging and control solutions',
      price: 'LKR 4,000 - 8,000',
      estimatedTime: '1-2 hours',
      rating: 4.7,
      reviews: 145,
      popular: true,
      features: ['Safe Chemicals', 'Indoor/Outdoor', 'Preventive'],
      issues: ['Mosquito breeding', 'Dengue prevention', 'Garden mosquitoes'],
      icon: <Bug className="w-6 h-6" />,
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 37,
      name: 'Termite Treatment',
      category: 'pest-control',
      description: 'Professional termite treatment and prevention',
      price: 'LKR 8,000 - 20,000',
      estimatedTime: '2-4 hours',
      rating: 4.9,
      reviews: 89,
      popular: false,
      features: ['Complete Treatment', 'Warranty Period', 'Structural Protection'],
      issues: ['Wood damage', 'Termite infestation', 'Preventive treatment'],
      icon: <Bug className="w-6 h-6" />,
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 38,
      name: 'Rat & Rodent Control',
      category: 'pest-control',
      description: 'Elimination of rats and rodents from premises',
      price: 'LKR 5,000 - 10,000',
      estimatedTime: '1-3 hours',
      rating: 4.8,
      reviews: 112,
      popular: true,
      features: ['Humane Methods', 'Entry Point Sealing', 'Follow-up'],
      issues: ['Rat infestation', 'Rodent control', 'Damage prevention'],
      icon: <Bug className="w-6 h-6" />,
      color: 'from-red-500 to-rose-500'
    },
    {
      id: 39,
      name: 'Bed Bug Treatment',
      category: 'pest-control',
      description: 'Complete bed bug elimination service',
      price: 'LKR 6,000 - 12,000',
      estimatedTime: '2-3 hours',
      rating: 4.7,
      reviews: 67,
      popular: false,
      features: ['Steam Treatment', 'Chemical Treatment', 'Guaranteed Results'],
      issues: ['Bed bug bites', 'Furniture infestation', 'Recurring problem'],
      icon: <Bug className="w-6 h-6" />,
      color: 'from-red-500 to-rose-500'
    },
  ];

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularServices = services.filter(service => service.popular);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find the Right Service</h1>
            <p className="text-xl text-blue-100 mb-8">
              Browse 40+ professional services. Book verified professionals with guaranteed quality.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services (e.g., 'Electrical wiring', 'AC repair')"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
                </div>
                
                <div className="space-y-2">
                  {serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 dark:bg-blue-800'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {category.icon}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Services */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Most Popular</h3>
                <div className="space-y-4">
                  {popularServices.slice(0, 5).map((service) => (
                    <Link
                      key={service.id}
                      to={`/service/${service.id}`}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${service.color}`}>
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{service.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Services Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCategory === 'all' ? 'All Services' : 
                   serviceCategories.find(c => c.id === selectedCategory)?.name + ' Services'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredServices.length} services found
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      {/* Service Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${service.color}`}>
                            {service.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {service.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="ml-1 text-sm font-medium">{service.rating}</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {service.reviews} reviews
                              </span>
                              {service.popular && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-sm text-green-600 font-medium">Popular</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {service.description}
                      </p>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Key Features:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Common Issues */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Common Issues:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer with Price & Time */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-gray-900 dark:text-white">
                              {service.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {service.estimatedTime}
                            </span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/book/${service.category}/${service.id}`}
                          className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                          Book Now
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Quality Guaranteed</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  All services come with our 100% satisfaction guarantee
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Verified Professionals</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  All workers are background checked and verified
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-8 h-8 text-purple-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Local Service</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Get service from professionals in your local area
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};