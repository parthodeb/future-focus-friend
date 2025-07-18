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
  GraduationCap
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-xl font-bold text-primary">StudySupport AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:block">
                {profile?.full_name || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-muted-foreground">
            Choose how you'd like to study today
          </p>
        </div>

        <Tabs defaultValue="support" className="space-y-6">
          <TabsList>
            <TabsTrigger value="support">AI Support</TabsTrigger>
            <TabsTrigger value="history">Recent Sessions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {supportTypes.map((support) => {
                const Icon = support.icon;
                return (
                  <Card key={support.type} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className={`${support.bgColor} rounded-t-lg`}>
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-6 w-6 ${support.color}`} />
                        <CardTitle className="text-lg">{support.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <CardDescription className="mb-4">
                        {support.description}
                      </CardDescription>
                      <Button 
                        onClick={() => startNewChat(support.type)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Session
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No recent sessions. Start a new chat to begin!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{session.support_type}</Badge>
                            {session.subject && <span>• {session.subject}</span>}
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{new Date(session.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/chat/${session.support_type}?session=${session.id}`)}
                        >
                          Continue
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm text-muted-foreground">
                      {profile?.full_name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Grade Level</label>
                    <p className="text-sm text-muted-foreground">
                      {profile?.grade_level || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subjects of Interest</label>
                    <p className="text-sm text-muted-foreground">
                      {profile?.subjects_of_interest?.join(', ') || 'None specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;