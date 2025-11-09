import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sparkles, Github, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

const LandingEmergentStyle = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const showcaseApps = [
    {
      title: 'Task Manager Pro',
      description: 'Full-featured task management',
      gradient: 'from-blue-600 to-cyan-600',
      image: null
    },
    {
      title: 'E-Commerce Store',
      description: 'Complete shopping experience',
      gradient: 'from-purple-600 to-pink-600',
      image: null
    },
    {
      title: 'Social Dashboard',
      description: 'Analytics and insights',
      gradient: 'from-green-600 to-teal-600',
      image: null
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % showcaseApps.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + showcaseApps.length) % showcaseApps.length);
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f10]/80 backdrop-blur-sm border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-semibold">creator surge</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Already have an account?</span>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/chat')}
              className="text-white hover:text-white/80"
            >
              Sign in
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Auth */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Build Full-Stack Web &<br />
                Mobile Apps <span className="text-green-500">in minutes</span>
              </h1>

              <p className="text-gray-400 text-sm">Already have an account? <button onClick={() => navigate('/chat')} className="text-white underline">Sign in</button></p>

              {/* Auth Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/chat')}
                  className="w-full bg-white hover:bg-white/90 text-black h-12 text-base font-medium"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/chat')}
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-12"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/chat')}
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-12"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Apple
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0f0f10] text-gray-500">Or start with email</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input 
                    placeholder="Enter your email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
                  />
                  <Button 
                    onClick={() => navigate('/chat')}
                    className="w-full bg-green-700 hover:bg-green-800 text-white h-12 text-base font-medium"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Sign up with Email
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our{' '}
                  <a href="#" className="underline">Terms of Service</a> and{' '}
                  <a href="#" className="underline">Privacy Policy</a>
                </p>
              </div>
            </div>

            {/* Right Column - App Showcase */}
            <div className="relative">
              <div className="absolute top-0 right-0 flex items-center gap-2 text-sm z-10">
                <div className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1.5">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                    <div className="w-6 h-6 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-2">Trusted by 1.5M+ Users</span>
                </div>
              </div>

              {/* Carousel */}
              <div className="relative mt-16">
                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm overflow-hidden">
                  <div className="relative" style={{ height: '400px' }}>
                    {showcaseApps.map((app, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <div className={`h-full rounded-2xl bg-gradient-to-br ${app.gradient} p-8 flex flex-col items-center justify-center`}>
                          <Sparkles className="w-16 h-16 mb-4" />
                          <h3 className="text-2xl font-bold mb-2">{app.title}</h3>
                          <p className="text-white/80">{app.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex gap-2">
                    {showcaseApps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1.5M+</div>
              <div className="text-gray-400 text-sm">Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-gray-400 text-sm">Apps</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">180+</div>
              <div className="text-gray-400 text-sm">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-lg">Y</div>C
              </div>
              <div className="text-gray-400 text-sm">Backed by</div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Section */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Meet Creator Surge AI</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Creator Surge AI turns concepts into production-ready applications with AI-powered agents,
            saving time and eliminating technical barriers.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingEmergentStyle;
