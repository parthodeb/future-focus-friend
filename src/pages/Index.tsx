import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Users, Brain, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-primary">StudySupport AI</h1>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Your AI-Powered Study Companion
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get personalized help with tutoring, assignments, and general academic support. 
            Our AI adapts to your learning style and helps you succeed.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
            Start Learning Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Tutoring</h3>
            <p className="text-muted-foreground">
              Get personalized explanations on any subject with step-by-step guidance tailored to your learning pace.
            </p>
          </div>

          <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">General Support</h3>
            <p className="text-muted-foreground">
              Quick answers to academic questions, study tips, time management advice, and general guidance.
            </p>
          </div>

          <div className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Assignment Helper</h3>
            <p className="text-muted-foreground">
              Get guidance on homework and projects without direct answers - learn the process, not just the solution.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who are already using AI to achieve academic success.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
            Create Your Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
