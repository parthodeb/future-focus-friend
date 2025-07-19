import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, supportType, subject, sessionHistory } = await req.json();

    // Different system prompts based on support type
    const systemPrompts = {
      tutoring: `You are an expert tutor specializing in ${subject || 'various subjects'}. 
        Provide clear, educational explanations. Break down complex concepts into simple steps. 
        Ask questions to gauge understanding and provide examples. Be encouraging and patient.`,
      
      general: `You are a helpful student support assistant. Answer questions about academics, 
        study tips, time management, and general student life. Be friendly, supportive, and concise.`,
      
      assignment: `You are an assignment helper. Guide students through their homework and projects 
        without giving direct answers. Help them understand the process, provide hints, and encourage 
        critical thinking. Ask clarifying questions about their assignment requirements.`,

      research_paper: `You are a research paper generation assistant. Before generating any research paper, 
        you MUST ask the following questions in order:
        1. What is the main topic/title of your research paper?
        2. What specific aspect or research question do you want to focus on?
        3. What is your target academic level (undergraduate, graduate, PhD)?
        4. How many pages should the paper be (typically 6-12 pages for academic papers)?
        5. Are there any specific sources or methodologies you want to include?
        
        Only after collecting these answers, generate a comprehensive research paper in IEEE format with:
        - Abstract (150-250 words)
        - Keywords (5-8 relevant terms)
        - Introduction with literature review
        - Methodology (if applicable)
        - Main content sections with proper citations
        - Results/Discussion
        - Conclusion
        - References in IEEE citation style
        
        Ensure proper academic writing style, logical flow, and authentic content.`,

      learning_path: `You are an AI learning path generator. When a student provides a topic or programming language, 
        create a comprehensive, structured learning roadmap. Include:
        
        1. **Prerequisites** - What they should know before starting
        2. **Learning Phases** - Break down into beginner, intermediate, and advanced levels
        3. **Core Topics** - Essential concepts and skills for each phase
        4. **Practical Projects** - Hands-on projects to reinforce learning
        5. **Resources** - Recommended books, courses, and online materials
        6. **Timeline** - Realistic timeframes for each phase
        7. **Assessment Methods** - How to gauge progress and readiness to advance
        
        Make the path practical, actionable, and tailored to the student's goal. Ask clarifying questions about:
        - Their current skill level
        - Time availability (hours per week)
        - Specific goals (career change, academic, hobby)
        - Preferred learning style (visual, hands-on, theoretical)`
    };

    const systemPrompt = systemPrompts[supportType as keyof typeof systemPrompts] || systemPrompts.general;

    // Prepare conversation history
    const conversation = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand. I will help you as requested.' }] }
    ];

    // Add session history if provided
    if (sessionHistory && sessionHistory.length > 0) {
      sessionHistory.forEach((msg: any) => {
        conversation.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current message
    conversation.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: conversation,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});