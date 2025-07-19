import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  BookOpen, 
  MessageCircle, 
  Brain,
  User,
  Bot,
  Loader2,
  FileText,
  MapPin
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat = () => {
  const { supportType } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [sessionTitle, setSessionTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportConfig = {
    tutoring: {
      title: 'AI Tutoring',
      icon: BookOpen,
      color: 'bg-blue-500',
      placeholder: 'Ask me to explain any concept or help you understand a topic...'
    },
    general: {
      title: 'General Support',
      icon: MessageCircle,
      color: 'bg-green-500',
      placeholder: 'Ask me about study tips, time management, or any academic question...'
    },
    assignment: {
      title: 'Assignment Helper',
      icon: Brain,
      color: 'bg-purple-500',
      placeholder: 'Describe your assignment and I\'ll guide you through it...'
    },
    research_paper: {
      title: 'Research Paper Generator',
      icon: FileText,
      color: 'bg-orange-500',
      placeholder: 'Tell me what research paper you want to generate...'
    },
    learning_path: {
      title: 'Learning Path Generator',
      icon: MapPin,
      color: 'bg-teal-500',
      placeholder: 'What topic or skill would you like to learn?'
    }
  };

  const config = supportConfig[supportType as keyof typeof supportConfig];

  useEffect(() => {
    if (!user || !supportType) return;

    if (currentSessionId) {
      loadExistingSession();
    } else {
      createNewSession();
    }
  }, [user, supportType, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadExistingSession = async () => {
    if (!currentSessionId) return;

    try {
      // Load session details
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', currentSessionId)
        .single();

      if (sessionData) {
        setSessionTitle(sessionData.title);
      }

      // Load messages
      const { data: messagesData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true });

      setMessages((messagesData || []) as Message[]);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      const title = `${config?.title} Session - ${new Date().toLocaleDateString()}`;
      
      const { data: sessionData, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          support_type: supportType as Database['public']['Enums']['support_type'],
          title: title
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(sessionData.id);
      setSessionTitle(title);
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSessionId || loading) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      // Add user message to UI immediately
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);

      // Save user message to database
      await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role: 'user',
          content: userMessage
        });

      // Call Gemini AI
      const response = await fetch(
        `https://uxjoaghopyrnnrsrmapu.supabase.co/functions/v1/gemini-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            message: userMessage,
            supportType: supportType,
            sessionHistory: messages.slice(-10) // Send last 10 messages for context
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { response: aiResponse } = await response.json();

      // Add AI response to UI
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Save AI response to database
      await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: aiResponse
        });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Support Type</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${config.color}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">{config.title}</h1>
                <p className="text-sm text-muted-foreground">{sessionTitle}</p>
              </div>
            </div>
          </div>
          <Badge variant="outline">{supportType}</Badge>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {config.placeholder}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-3xl ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <Card className={`${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white dark:bg-gray-800'
                    }`}>
                      <CardContent className="p-3">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 max-w-3xl">
                  <div className="p-2 rounded-full bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={config.placeholder}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || loading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;