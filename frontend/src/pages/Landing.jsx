import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Sparkles, Zap, MessageSquare, Code, Palette, TrendingUp } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Full App Builder',
      description: 'Build complete applications with AI - from idea to deployment-ready code'
    },
    {
      icon: Code,
      title: 'Code Assistant',
      description: 'Get help with coding, debugging, and technical problem-solving'
    },
    {
      icon: MessageSquare,
      title: 'Multi-Agent System',
      description: 'Specialized AI agents for different tasks - auto-detects or manual selection'
    },
    {
      icon: Palette,
      title: 'Creative Content',
      description: 'Generate stories, articles, and creative content effortlessly'
    },
    {
      icon: TrendingUp,
      title: 'Business Strategy',
      description: 'Develop strategies, analyze data, and make informed decisions'
    },
    {
      icon: Sparkles,
      title: 'Lightning Fast',
      description: 'Get instant responses with our optimized AI infrastructure'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Creator Surge AI
            </span>
          </div>
          <Button 
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Start Creating
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Powered by Advanced AI
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create, Innovate,
            </span>
            <br />
            <span className="text-slate-900">Surge Forward</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Unleash your creativity with AI-powered assistance. From writing and coding to strategic planning, 
            Creator Surge AI is your intelligent partner for everything.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg"
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-purple-200 hover:border-purple-300 text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Floating Cards Animation */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent pointer-events-none" />
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto border border-purple-100">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-slate-600 mb-2">Help me create a marketing strategy for my startup</p>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-slate-700">I'd be happy to help! Let's start with your target audience...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-xl text-slate-600">
            Powerful features designed for creators, developers, and innovators
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100 hover:border-purple-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Surge Forward?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of creators who are already using AI to accelerate their projects
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/chat')}
            className="bg-white text-purple-600 hover:bg-slate-50 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-100 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900">Creator Surge AI</span>
            </div>
            <p className="text-slate-600 text-sm">
              © 2025 Creator Surge AI. Empowering creators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
