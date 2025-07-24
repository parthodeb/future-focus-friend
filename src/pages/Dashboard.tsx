import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  MessageCircle, 
  Brain, 
  History, 
  User, 
  LogOut,
  Plus,
  Clock,
  GraduationCap,
  FileText,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);

      // Fetch recent chat sessions
      const { data: sessionsData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentSessions(sessionsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startNewChat = (supportType: string) => {
    navigate(`/chat/${supportType}`);
  };

  const supportTypes = [
    {
      type: 'tutoring',
      title: 'AI Tutoring',
      description: 'Get personalized explanations and learn step-by-step',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      type: 'general',
      title: 'General Support',
      description: 'Quick answers and study guidance',
      icon: MessageCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      type: 'assignment',
      title: 'Assignment Helper',
      description: 'Get help with homework and projects',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      type: 'research_paper',
      title: 'Research Papers',
      description: 'Generate IEEE format research papers with AI assistance',
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      type: 'learning_path',
      title: 'Learning Paths',
      description: 'AI-generated personalized learning roadmaps',
      icon: MapPin,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-950/20'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center animate-fade-in">
              <div className="relative">
                <GraduationCap className="h-8 w-8 text-primary mr-3 animate-float" />
                <div className="absolute inset-0 h-8 w-8 text-primary mr-3 animate-glow opacity-50"></div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                StudySupport AI
              </h1>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in">
              <div className="relative">
                <Avatar className="ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-glow/20 text-primary font-semibold">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-sm font-medium hidden sm:block text-foreground/80">
                {profile?.full_name || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 🎓
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to study today and unlock your learning potential
          </p>
        </div>

        <Tabs defaultValue="support" className="space-y-8">
          <div className="flex justify-center animate-scale-in">
            <TabsList className="glass-effect p-1 rounded-xl shadow-lg">
              <TabsTrigger value="support" className="rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                🤖 AI Support
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                📚 Recent Sessions
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg font-medium transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                👤 Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="support" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportTypes.map((support, index) => {
                const Icon = support.icon;
                const animationClass = `animate-stagger-${Math.min(index + 1, 5)}`;
                return (
                  <div key={support.type} className={`feature-card group cursor-pointer ${animationClass}`}>
                    <div className="relative overflow-hidden">
                      <div className={`h-24 ${support.bgColor} flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5"></div>
                        <Icon className={`h-12 w-12 ${support.color} relative z-10 transition-transform duration-300 group-hover:scale-110`} />
                      </div>
                      <div className="p-6">
                        <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                          {support.title}
                        </CardTitle>
                        <CardDescription className="mb-6 text-sm leading-relaxed">
                          {support.description}
                        </CardDescription>
                        <Button 
                          onClick={() => startNewChat(support.type)}
                          className="w-full btn-gradient group-hover:shadow-xl transition-all duration-300"
                          size="lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Start New Session
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 animate-fade-in">
            <div className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <History className="h-6 w-6 mr-3 text-primary" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <History className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">No recent sessions yet</p>
                    <p className="text-sm text-muted-foreground">Start a new chat to begin your learning journey!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSessions.map((session, index) => (
                      <div key={session.id} className={`glass-effect p-4 rounded-xl transition-all duration-300 hover:shadow-lg animate-slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{session.title}</h4>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="rounded-full px-3 py-1">
                                {session.support_type.replace('_', ' ')}
                              </Badge>
                              {session.subject && <span>• {session.subject}</span>}
                              <div className="flex items-center ml-auto">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{new Date(session.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/chat/${session.support_type}?session=${session.id}`)}
                            className="btn-gradient ml-4"
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-fade-in">
            <div className="card-enhanced max-w-2xl mx-auto">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="flex items-center justify-center text-2xl">
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Full Name</label>
                    <div className="glass-effect p-3 rounded-lg">
                      <p className="text-foreground">
                        {profile?.full_name || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Email</label>
                    <div className="glass-effect p-3 rounded-lg">
                      <p className="text-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Grade Level</label>
                    <div className="glass-effect p-3 rounded-lg">
                      <p className="text-foreground">
                        {profile?.grade_level || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-primary">Subjects of Interest</label>
                    <div className="glass-effect p-3 rounded-lg">
                      <p className="text-foreground">
                        {profile?.subjects_of_interest?.join(', ') || 'None specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;