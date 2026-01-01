import React, { useState } from 'react';
import { 
  Search, Filter, Star, MapPin, Briefcase, Award, 
  Clock, CheckCircle, Users, Phone, Mail, MessageSquare,
  ChevronRight, X, Sparkles, Shield, Award as AwardIcon,
  ThumbsUp, Calendar, ArrowRight, Download
} from 'lucide-react';

export const Professionals = () => {
  const [selectedService, setSelectedService] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  const sriLankaDistricts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const serviceCategories = [
    { id: 'all', name: 'All Professionals', count: 156 },
    { id: 'electrical', name: 'Electrical', count: 28 },
    { id: 'plumbing', name: 'Plumbing', count: 24 },
    { id: 'ac-repair', name: 'AC Repair', count: 18 },
    { id: 'cleaning', name: 'Cleaning', count: 32 },
    { id: 'painting', name: 'Painting', count: 16 },
    { id: 'carpentry', name: 'Carpentry', count: 20 },
    { id: 'appliance', name: 'Appliance Repair', count: 22 },
    { id: 'pest-control', name: 'Pest Control', count: 12 },
  ];

  const professionals = [
    // Electrical Professionals
    {
      id: 1,
      name: 'Kamal Perera',
      title: 'Senior Electrician',
      category: 'electrical',
      district: 'Colombo',
      rating: 4.9,
      completedJobs: 1245,
      experienceYears: 12,
      hourlyRate: 'LKR 1,500',
      description: 'Expert in electrical wiring, switch installations, and home automation systems with 12+ years of experience.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamal',
      verified: true,
      featured: true,
      skills: ['Wiring Installation', 'Circuit Breakers', 'Home Automation', 'Switch Boards'],
      certifications: ['Certified Electrician', 'Safety Certified', 'Government Licensed'],
      availability: 'Available Today',
      feedbacks: [
        { id: 1, customer: 'Rajesh Kumar', issue: 'Complete House Wiring', comment: 'Excellent work! Professional and timely completion.', rating: 5, date: '2024-01-15' },
        { id: 2, customer: 'Priya Silva', issue: 'Switch Installation', comment: 'Very professional and cleaned up after work.', rating: 5, date: '2024-01-10' },
        { id: 3, customer: 'Sunil Fernando', issue: 'Electrical Fault Finding', comment: 'Quickly identified and fixed the issue. Highly recommended.', rating: 4, date: '2024-01-05' }
      ]
    },
    {
      id: 2,
      name: 'Nimal Silva',
      title: 'Electrical Technician',
      category: 'electrical',
      district: 'Gampaha',
      rating: 4.7,
      completedJobs: 876,
      experienceYears: 8,
      hourlyRate: 'LKR 1,200',
      description: 'Specialized in electrical repairs, maintenance, and troubleshooting for residential properties.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nimal',
      verified: true,
      featured: false,
      skills: ['Electrical Repairs', 'Troubleshooting', 'Maintenance', 'Wiring'],
      certifications: ['Electrical Technician', 'Safety Certified'],
      availability: 'Available Tomorrow',
      feedbacks: [
        { id: 1, customer: 'Amara Perera', issue: 'Fan Repair', comment: 'Fixed the ceiling fan quickly and efficiently.', rating: 4, date: '2024-01-12' },
        { id: 2, customer: 'Dinesh Rajapaksa', issue: 'Light Installation', comment: 'Good service at reasonable rates.', rating: 5, date: '2024-01-08' }
      ]
    },
    {
      id: 3,
      name: 'Sunil Jayasinghe',
      title: 'Industrial Electrician',
      category: 'electrical',
      district: 'Kalutara',
      rating: 4.8,
      completedJobs: 654,
      experienceYears: 10,
      hourlyRate: 'LKR 1,800',
      description: 'Industrial electrical systems expert with experience in commercial and factory setups.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil',
      verified: true,
      featured: false,
      skills: ['Industrial Wiring', '3-Phase Systems', 'Motor Controls', 'Panel Boards'],
      certifications: ['Industrial Electrician', 'Advanced Certification'],
      availability: 'Available Next Week',
      feedbacks: [
        { id: 1, customer: 'Factory Solutions Ltd', issue: 'Factory Wiring', comment: 'Professional industrial electrical work.', rating: 5, date: '2024-01-14' }
      ]
    },

    // Plumbing Professionals
    {
      id: 4,
      name: 'Sarath Fernando',
      title: 'Master Plumber',
      category: 'plumbing',
      district: 'Colombo',
      rating: 4.9,
      completedJobs: 987,
      experienceYears: 15,
      hourlyRate: 'LKR 1,400',
      description: '15 years of plumbing experience specializing in pipe installations and bathroom fittings.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarath',
      verified: true,
      featured: true,
      skills: ['Pipe Installation', 'Bathroom Fittings', 'Water Heater', 'Leak Repair'],
      certifications: ['Master Plumber', 'Water System Certified'],
      availability: 'Available Today',
      feedbacks: [
        { id: 1, customer: 'Lakshmi De Silva', issue: 'Bathroom Renovation', comment: 'Excellent plumbing work for our new bathroom.', rating: 5, date: '2024-01-13' },
        { id: 2, customer: 'Kumar Ratnayake', issue: 'Pipe Leak Repair', comment: 'Fixed the leak permanently. Very satisfied.', rating: 5, date: '2024-01-07' }
      ]
    },
    {
      id: 5,
      name: 'Prasanna Jayawardena',
      title: 'Plumbing Technician',
      category: 'plumbing',
      district: 'Kandy',
      rating: 4.6,
      completedJobs: 432,
      experienceYears: 6,
      hourlyRate: 'LKR 1,000',
      description: 'Expert in drain cleaning, leak repairs, and basic plumbing installations.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prasanna',
      verified: true,
      featured: false,
      skills: ['Drain Cleaning', 'Leak Detection', 'Basic Installations', 'Repairs'],
      certifications: ['Plumbing Technician', 'Certified'],
      availability: 'Available Today',
      feedbacks: [
        { id: 1, customer: 'Nimali Perera', issue: 'Kitchen Sink Blockage', comment: 'Quick and efficient service.', rating: 4, date: '2024-01-11' }
      ]
    },

    // AC Repair Professionals
    {
      id: 6,
      name: 'Ravi Kumar',
      title: 'AC Specialist',
      category: 'ac-repair',
      district: 'Colombo',
      rating: 4.8,
      completedJobs: 765,
      experienceYears: 9,
      hourlyRate: 'LKR 2,000',
      description: 'Specialized in AC installation, gas charging, and all types of AC repairs.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi',
      verified: true,
      featured: true,
      skills: ['AC Installation', 'Gas Charging', 'PCB Repair', 'Cleaning'],
      certifications: ['AC Specialist', 'Certified Technician'],
      availability: 'Available Today',
      feedbacks: [
        { id: 1, customer: 'Office Solutions Ltd', issue: 'AC Installation', comment: 'Professional installation of 10 AC units.', rating: 5, date: '2024-01-16' },
        { id: 2, customer: 'Shirley Fernando', issue: 'AC Gas Charging', comment: 'Excellent service, AC cooling perfectly now.', rating: 5, date: '2024-01-09' }
      ]
    },

    // Cleaning Professionals
    {
      id: 7,
      name: 'Anoma Perera',
      title: 'Cleaning Specialist',
      category: 'cleaning',
      district: 'Gampaha',
      rating: 4.7,
      completedJobs: 543,
      experienceYears: 5,
      hourlyRate: 'LKR 800',
      description: 'Professional home and office cleaning with eco-friendly products.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anoma',
      verified: true,
      featured: false,
      skills: ['Deep Cleaning', 'Office Cleaning', 'Carpet Cleaning', 'Window Cleaning'],
      certifications: ['Cleaning Certified', 'Eco-friendly'],
      availability: 'Available Tomorrow',
      feedbacks: [
        { id: 1, customer: 'Tech Company Ltd', issue: 'Office Deep Clean', comment: 'Very thorough cleaning service.', rating: 4, date: '2024-01-14' }
      ]
    },

    // Painting Professionals
    {
      id: 8,
      name: 'Dilshan Rajapakse',
      title: 'Painting Expert',
      category: 'painting',
      district: 'Colombo',
      rating: 4.9,
      completedJobs: 321,
      experienceYears: 7,
      hourlyRate: 'LKR 1,500',
      description: 'Interior and exterior painting with attention to detail and quality finishes.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dilshan',
      verified: true,
      featured: false,
      skills: ['Interior Painting', 'Exterior Painting', 'Wall Texture', 'Wood Painting'],
      certifications: ['Painting Expert', 'Quality Certified'],
      availability: 'Available Next Week',
      feedbacks: [
        { id: 1, customer: 'Hotel Management', issue: 'Hotel Room Painting', comment: 'Excellent painting work, very professional.', rating: 5, date: '2024-01-13' }
      ]
    },

    // Carpentry Professionals
    {
      id: 9,
      name: 'Saman Kumara',
      title: 'Master Carpenter',
      category: 'carpentry',
      district: 'Kandy',
      rating: 4.8,
      completedJobs: 456,
      experienceYears: 11,
      hourlyRate: 'LKR 1,600',
      description: 'Custom furniture making and woodwork with traditional craftsmanship.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Saman',
      verified: true,
      featured: true,
      skills: ['Furniture Making', 'Cabinet Installation', 'Wood Flooring', 'Door Repair'],
      certifications: ['Master Carpenter', 'Traditional Craftsman'],
      availability: 'Available Today',
      feedbacks: [
        { id: 1, customer: 'Restaurant Owner', issue: 'Custom Furniture', comment: 'Beautiful custom furniture made to perfection.', rating: 5, date: '2024-01-15' }
      ]
    },

    // Appliance Repair Professionals
    {
      id: 10,
      name: 'Chaminda Silva',
      title: 'Appliance Technician',
      category: 'appliance',
      district: 'Colombo',
      rating: 4.7,
      completedJobs: 789,
      experienceYears: 8,
      hourlyRate: 'LKR 1,200',
      description: 'Repair of all home appliances including refrigerators, washing machines, and TVs.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chaminda',
      verified: true,
      featured: false,
      skills: ['Refrigerator Repair', 'Washing Machine', 'TV Repair', 'Microwave'],
      certifications: ['Appliance Technician', 'Certified'],
      availability: 'Available Today',
      feedbacks: [
        { id: 1, customer: 'Family Home', issue: 'Refrigerator Repair', comment: 'Fixed our fridge quickly and efficiently.', rating: 4, date: '2024-01-12' }
      ]
    },

    // Pest Control Professionals
    {
      id: 11,
      name: 'Nishantha Perera',
      title: 'Pest Control Expert',
      category: 'pest-control',
      district: 'Gampaha',
      rating: 4.9,
      completedJobs: 234,
      experienceYears: 6,
      hourlyRate: 'LKR 1,800',
      description: 'Eco-friendly pest control solutions for homes and businesses.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nishantha',
      verified: true,
      featured: false,
      skills: ['Termite Control', 'Rodent Control', 'Mosquito Fogging', 'Cockroach'],
      certifications: ['Pest Control Expert', 'Eco-friendly Certified'],
      availability: 'Available Tomorrow',
      feedbacks: [
        { id: 1, customer: 'Hotel Chain', issue: 'Termite Treatment', comment: 'Effective termite control service.', rating: 5, date: '2024-01-10' }
      ]
    },

    // More professionals for variety
    {
      id: 12,
      name: 'Malith Fernando',
      title: 'Electrical Engineer',
      category: 'electrical',
      district: 'Matara',
      rating: 4.8,
      completedJobs: 432,
      experienceYears: 9,
      hourlyRate: 'LKR 1,700',
      description: 'Electrical design and implementation for residential and commercial projects.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Malith',
      verified: true,
      featured: false,
      skills: ['Electrical Design', 'Commercial Wiring', 'Safety Systems', 'Automation'],
      certifications: ['Electrical Engineer', 'Professional License'],
      availability: 'Available Next Week',
      feedbacks: []
    },

    {
      id: 13,
      name: 'Kasun Rathnayake',
      title: 'Plumbing Contractor',
      category: 'plumbing',
      district: 'Kurunegala',
      rating: 4.5,
      completedJobs: 321,
      experienceYears: 7,
      hourlyRate: 'LKR 1,100',
      description: 'Complete plumbing solutions for homes and small businesses.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kasun',
      verified: true,
      featured: false,
      skills: ['Complete Plumbing', 'Water Systems', 'Pipe Networks', 'Repairs'],
      certifications: ['Plumbing Contractor', 'Certified'],
      availability: 'Available Today',
      feedbacks: []
    },

    {
      id: 14,
      name: 'Sanjeewa Bandara',
      title: 'AC Technician',
      category: 'ac-repair',
      district: 'Galle',
      rating: 4.7,
      completedJobs: 543,
      experienceYears: 8,
      hourlyRate: 'LKR 1,500',
      description: 'Specialized in split AC maintenance and repairs.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjeewa',
      verified: true,
      featured: false,
      skills: ['Split AC Repair', 'Maintenance', 'Cleaning', 'Installation'],
      certifications: ['AC Technician', 'Certified'],
      availability: 'Available Today',
      feedbacks: []
    },

    {
      id: 15,
      name: 'Nadeesha Silva',
      title: 'Cleaning Professional',
      category: 'cleaning',
      district: 'Ratnapura',
      rating: 4.6,
      completedJobs: 210,
      experienceYears: 4,
      hourlyRate: 'LKR 700',
      description: 'Professional home cleaning with attention to detail.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadeesha',
      verified: true,
      featured: false,
      skills: ['Home Cleaning', 'Deep Cleaning', 'Post-construction', 'Regular'],
      certifications: ['Cleaning Professional', 'Certified'],
      availability: 'Available Tomorrow',
      feedbacks: []
    },
  ];

  const filteredProfessionals = professionals.filter(professional => {
    const matchesService = selectedService === 'all' || professional.category === selectedService;
    const matchesDistrict = selectedDistrict === 'all' || professional.district === selectedDistrict;
    const matchesSearch = professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         professional.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         professional.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesDistrict && matchesSearch;
  });

  const openProfessionalModal = (professional) => {
    setSelectedProfessional(professional);
    setShowReviews(false);
  };

  const closeModal = () => {
    setSelectedProfessional(null);
    setShowReviews(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Verified Professionals</h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with trusted professionals in your area. All verified and background checked.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search professionals by name, service, or location..."
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
          {/* Sidebar - Filters */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Service Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Service Category</h2>
                </div>
                
                <div className="space-y-2">
                  {serviceCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedService(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedService === category.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* District Filter */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">District</h2>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  <button
                    onClick={() => setSelectedDistrict('all')}
                    className={`w-full p-3 rounded-lg transition-colors text-left ${
                      selectedDistrict === 'all'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All Districts
                  </button>
                  
                  {sriLankaDistricts.map((district) => (
                    <button
                      key={district}
                      onClick={() => setSelectedDistrict(district)}
                      className={`w-full p-3 rounded-lg transition-colors text-left ${
                        selectedDistrict === district
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Professionals</span>
                    <span className="font-bold">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Verified</span>
                    <span className="font-bold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg. Rating</span>
                    <span className="font-bold text-yellow-600">4.8 ★</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Jobs Completed</span>
                    <span className="font-bold">15,000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Professionals Grid */}
          <div className="lg:w-3/4">
            {/* Results Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verified Professionals
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredProfessionals.length} professionals found
                  {selectedService !== 'all' && ` in ${serviceCategories.find(s => s.id === selectedService)?.name}`}
                  {selectedDistrict !== 'all' && ` from ${selectedDistrict}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedService('all');
                    setSelectedDistrict('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Featured Professionals */}
            {selectedService === 'all' && selectedDistrict === 'all' && searchQuery === '' && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Featured Professionals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {professionals.filter(p => p.featured).slice(0, 2).map((pro) => (
                    <div
                      key={pro.id}
                      onClick={() => openProfessionalModal(pro)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img src={pro.image} alt={pro.name} className="w-16 h-16 rounded-full border-4 border-white/20" />
                        <div>
                          <h4 className="font-bold text-lg">{pro.name}</h4>
                          <p className="text-blue-100">{pro.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1">{pro.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4" />
                          <span className="ml-1">{pro.experienceYears} years</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4" />
                          <span className="ml-1">{pro.district}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professionals Grid */}
            {filteredProfessionals.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No professionals found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProfessionals.map((professional) => (
                  <div
                    key={professional.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="p-6">
                      {/* Professional Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={professional.image}
                          alt={professional.name}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-blue-100 dark:border-blue-900"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                {professional.name}
                                {professional.verified && (
                                  <Shield className="inline ml-2 w-4 h-4 text-green-600" />
                                )}
                              </h3>
                              <p className="text-blue-600 dark:text-blue-400 font-medium">
                                {professional.title}
                              </p>
                            </div>
                            {professional.featured && (
                              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                          
                          {/* Rating & Location */}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="ml-1 font-medium">{professional.rating}</span>
                              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                ({professional.completedJobs} jobs)
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <MapPin className="w-4 h-4" />
                              <span className="ml-1 text-sm">{professional.district}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {professional.description}
                      </p>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {professional.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                          {professional.skills.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                              +{professional.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {professional.experienceYears} years experience
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {professional.hourlyRate}/hour
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => openProfessionalModal(professional)}
                          className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust Section */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl">
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Why Choose Our Professionals?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Verified & Safe</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">All professionals are background checked</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AwardIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Quality Guaranteed</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">We stand behind every job completed</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ThumbsUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Customer Reviews</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Real feedback from thousands of customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details Modal */}
      {selectedProfessional && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProfessional.name}
                </h2>
                <p className="text-blue-600 dark:text-blue-400">{selectedProfessional.title}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Overview */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="md:w-1/3">
                  <img
                    src={selectedProfessional.image}
                    alt={selectedProfessional.name}
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-blue-100 dark:border-blue-900 mx-auto"
                  />
                  <div className="text-center mt-4">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 mb-3">
                      Book This Professional
                    </button>
                    <button className="w-full border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Phone className="inline w-4 h-4 mr-2" />
                      Contact Now
                    </button>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedProfessional.rating}
                      </div>
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(selectedProfessional.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProfessional.completedJobs} jobs completed
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedProfessional.experienceYears}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Years Experience</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {selectedProfessional.hourlyRate}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Hourly Rate</div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                      <div className="text-xl font-bold text-green-600 mb-1">
                        {selectedProfessional.availability}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">Availability</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">About</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProfessional.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfessional.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfessional.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Toggle */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Customer Feedback
                  </h3>
                  <button
                    onClick={() => setShowReviews(!showReviews)}
                    className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2"
                  >
                    {showReviews ? 'Hide Reviews' : `Show All Reviews (${selectedProfessional.feedbacks.length})`}
                    <ChevronRight className={`w-4 h-4 transition-transform ${showReviews ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {/* Reviews Section */}
                {showReviews && (
                  <div className="space-y-4">
                    {selectedProfessional.feedbacks.length > 0 ? (
                      selectedProfessional.feedbacks.map((feedback) => (
                        <div key={feedback.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{feedback.customer}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {feedback.issue} • {feedback.date}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 italic">"{feedback.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        No reviews yet. Be the first to book this professional!
                      </div>
                    )}
                  </div>
                )}

                {/* Show only first review if not expanded */}
                {!showReviews && selectedProfessional.feedbacks.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {selectedProfessional.feedbacks[0].customer}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedProfessional.feedbacks[0].issue} • {selectedProfessional.feedbacks[0].date}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < selectedProfessional.feedbacks[0].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "{selectedProfessional.feedbacks[0].comment}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};