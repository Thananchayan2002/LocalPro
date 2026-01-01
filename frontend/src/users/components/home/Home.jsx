import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Droplets, Snowflake, Camera, Paintbrush, Sparkles, GraduationCap, Wrench,
  Shield, Clock, CheckCircle, Star, ArrowRight, Users, MapPin, Phone, Calendar,
  Award, ThumbsUp, Truck, Home as HomeIcon, Settings, Leaf, Heart,
  PlayCircle, TrendingUp, UserCheck, BadgeCheck, ShoppingBag, PhoneCall,
  Plug, Scissors, Wifi, Cctv, Lock, Hammer, Thermometer, Printer
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  const serviceCategories = [
    { id: '1', name: 'Electrical', description: 'Wiring, switches, installations', icon: 'Zap', color: 'from-yellow-500 to-orange-500' },
    { id: '2', name: 'Plumbing', description: 'Leaks, pipes, bathroom fittings', icon: 'Droplets', color: 'from-blue-500 to-cyan-500' },
    { id: '3', name: 'AC Repair', description: 'AC servicing and installation', icon: 'Snowflake', color: 'from-cyan-500 to-blue-500' },
    { id: '4', name: 'Cleaning', description: 'Home & office cleaning services', icon: 'Sparkles', color: 'from-purple-500 to-pink-500' },
    { id: '5', name: 'Painting', description: 'Interior & exterior painting', icon: 'Paintbrush', color: 'from-green-500 to-emerald-500' },
    { id: '6', name: 'Carpentry', description: 'Furniture & woodwork', icon: 'Wrench', color: 'from-amber-700 to-amber-900' },
    { id: '7', name: 'Appliance Repair', description: 'TV, fridge, washing machine', icon: 'Settings', color: 'from-gray-600 to-gray-800' },
    { id: '8', name: 'Pest Control', description: 'Home & garden pest removal', icon: 'Bug', color: 'from-red-500 to-rose-500' },
  ];

  const iconComponents = {
    Zap, Droplets, Snowflake, Camera, Paintbrush, Sparkles, GraduationCap, Wrench,
    HomeIcon, Settings, Leaf, Heart, Truck, ShoppingBag, PhoneCall,
    Plug, Scissors, Wifi, Cctv, Lock, Hammer, Thermometer, Printer
  };

  const stats = [
    { value: '50K+', label: 'Happy Customers', icon: <Users className="w-6 h-6" /> },
    { value: '2K+', label: 'Verified Pros', icon: <UserCheck className="w-6 h-6" /> },
    { value: '98%', label: 'Satisfaction Rate', icon: <ThumbsUp className="w-6 h-6" /> },
    { value: '4.8', label: 'Average Rating', icon: <Star className="w-6 h-6" /> },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Homeowner',
      text: 'LocalPro saved my day when my AC broke down. The technician arrived within 2 hours and fixed everything perfectly!',
      rating: 5,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
    },
    {
      name: 'Priya Sharma',
      role: 'Office Manager',
      text: 'Regular cleaning service for our office. Always punctual and thorough. Highly recommended!',
      rating: 5,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    },
    {
      name: 'Amit Patel',
      role: 'Restaurant Owner',
      text: 'Electrical issues solved professionally. The electrician was knowledgeable and fixed all problems efficiently.',
      rating: 5,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
    },
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Professionals',
      description: 'All workers are background checked and verified',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Response',
      description: 'Get matched with pros in minutes, not days',
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Quality Guaranteed',
      description: 'We stand behind every job with our satisfaction guarantee',
    },
    {
      icon: <BadgeCheck className="w-8 h-8" />,
      title: 'Transparent Pricing',
      description: 'No hidden fees, upfront quotes for all services',
    },
  ];

  const handleBookService = (categoryId) => {
    navigate(`/book/${categoryId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 pt-20 pb-16 lg:pt-24 lg:pb-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 animate-pulse">
              <Shield className="h-4 w-4" />
              Trusted by 50,000+ customers across the country
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Find Trusted{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Local Professionals
              </span>{' '}
              Near You
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Book verified electricians, plumbers, cleaners, and more. Quality service guaranteed. Satisfaction or your money back.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/services')}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
              >
                Book a Service Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/become-pro')}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300"
              >
                Become a Professional
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Popular Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our wide range of professional services. All workers are verified and experienced.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {serviceCategories.map((category) => {
              const Icon = iconComponents[category.icon] || Wrench;
              return (
                <div
                  key={category.id}
                  onClick={() => handleBookService(category.id)}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/services')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center justify-center gap-2 mx-auto"
            >
              View all services
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Simple, fast, and reliable service booking</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                step: '1', 
                title: 'Choose Service', 
                desc: 'Select the service you need and describe your issue',
                icon: <ShoppingBag className="w-8 h-8" />
              },
              { 
                step: '2', 
                title: 'We Assign a Pro', 
                desc: 'Our system assigns the best available verified worker',
                icon: <UserCheck className="w-8 h-8" />
              },
              { 
                step: '3', 
                title: 'Job Done', 
                desc: 'Pro arrives, completes work, and you pay securely',
                icon: <CheckCircle className="w-8 h-8" />
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10">
                  {item.icon}
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 hidden md:block"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose LocalPro
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're changing the way people find reliable local services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Join thousands of satisfied customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers who trust LocalPro for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/services')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book a Service Now
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        @media (prefers-color-scheme: dark) {
          .bg-grid-pattern {
            background-image: 
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          }
        }
      `}</style>
    </div>
  );
};