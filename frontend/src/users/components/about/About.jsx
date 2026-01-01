import React from 'react';
import { 
  Shield, Users, Award, Target, Heart, Globe,
  ArrowRight, Star, CheckCircle, TrendingUp, 
  Clock, MapPin, Phone, Mail, MessageSquare,
  ThumbsUp, Briefcase, Award as AwardIcon, Users as UsersIcon
} from 'lucide-react';

export const About = () => {
  const teamMembers = [
    {
      name: 'Rajesh Fernando',
      role: 'Founder & CEO',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
      description: 'Former tech entrepreneur with 10+ years in service industry',
    },
    {
      name: 'Priya Silva',
      role: 'Operations Director',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      description: 'Expert in service management and customer satisfaction',
    },
    {
      name: 'Kamal Perera',
      role: 'Tech Lead',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kamal',
      description: 'Software engineer specializing in marketplace platforms',
    },
    {
      name: 'Nimali Rathnayake',
      role: 'Head of Community',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nimali',
      description: 'Building strong relationships with professionals and customers',
    },
  ];

  const milestones = [
    { year: '2020', title: 'LocalPro Founded', description: 'Started with 50 professionals in Colombo' },
    { year: '2021', title: 'Expanded Nationwide', description: 'Covered all 25 districts of Sri Lanka' },
    { year: '2022', title: '50K+ Customers', description: 'Reached milestone of serving 50,000 customers' },
    { year: '2023', title: '2K+ Professionals', description: 'Grew network to 2,000 verified professionals' },
    { year: '2024', title: 'Award Winning', description: 'Received Best Service Platform Award' },
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Trust & Safety',
      description: 'Every professional is thoroughly verified and background checked',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Customer First',
      description: 'Your satisfaction is our top priority in every service',
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Excellence',
      description: 'We maintain high standards for all services provided',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community',
      description: 'Building connections between professionals and customers',
    },
  ];

  const stats = [
    { value: '50,000+', label: 'Happy Customers', icon: <UsersIcon className="w-6 h-6" /> },
    { value: '2,000+', label: 'Verified Pros', icon: <Briefcase className="w-6 h-6" /> },
    { value: '98%', label: 'Satisfaction Rate', icon: <ThumbsUp className="w-6 h-6" /> },
    { value: '25', label: 'Districts Covered', icon: <MapPin className="w-6 h-6" /> },
    { value: '4.8', label: 'Avg. Rating', icon: <Star className="w-6 h-6" /> },
    { value: '15,000+', label: 'Jobs Completed', icon: <AwardIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-16 lg:py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6">
              <Award className="h-4 w-4" />
              <span className="text-sm">Award Winning Service Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Connecting Trusted{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Professionals
              </span>{' '}
              with You
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              LocalPro is Sri Lanka's leading platform connecting customers with verified local professionals. 
              Our mission is to make quality services accessible, reliable, and convenient for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                Our Services <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Contact Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full mb-6">
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">Our Story</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Revolutionizing Local Services in Sri Lanka
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  Founded in 2020, LocalPro started with a simple vision: to solve the challenge of finding 
                  reliable local professionals in Sri Lanka. We noticed that customers struggled to find 
                  trustworthy service providers, while skilled professionals lacked a platform to showcase 
                  their expertise.
                </p>
                <p>
                  Today, we've grown into Sri Lanka's most trusted service platform, connecting thousands 
                  of customers with verified professionals across all 25 districts. Our rigorous verification 
                  process ensures that every professional on our platform meets our high standards of 
                  quality and reliability.
                </p>
                <p>
                  We're proud to have created opportunities for local professionals while providing 
                  peace of mind to customers across the country.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 lg:p-12 text-white">
                <h3 className="text-2xl font-bold mb-6">Our Mission</h3>
                <p className="text-blue-100 mb-8">
                  To empower local communities by creating reliable connections between customers 
                  and verified professionals, while setting new standards for service quality and 
                  customer satisfaction in Sri Lanka.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>100% Verified Professionals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Quality Service Guarantee</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Nationwide Coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>24/7 Customer Support</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-blue-600 dark:text-blue-400">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
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
      </section>

      {/* Our Values */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These principles guide everything we do at LocalPro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Milestones in our growth story
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 hidden lg:block"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index} 
                  className={`relative flex flex-col lg:flex-row items-center lg:items-start ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 lg:left-1/2 lg:-translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full z-10"></div>
                  
                  {/* Content */}
                  <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-12 text-right' : 'lg:pl-12'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate people behind LocalPro's success
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100 dark:border-blue-900"
                />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {member.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400">
              And 50+ more dedicated team members working across Sri Lanka
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you're looking for reliable services or want to grow your professional business, 
            LocalPro is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              Book a Service
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300">
              Become a Professional
            </button>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Our Office</h3>
              <p className="text-gray-600 dark:text-gray-400">
                123 Innovation Street,<br />
                Colombo 07, Sri Lanka
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
              <p className="text-gray-600 dark:text-gray-400">
                +94 11 234 5678<br />
                24/7 Customer Support
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
              <p className="text-gray-600 dark:text-gray-400">
                hello@localpro.lk<br />
                support@localpro.lk
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};