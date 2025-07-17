const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  async generateChatResponse(message, context = {}) {
    try {
      const systemPrompt = `You are a compassionate mental health support AI assistant. Your role is to:
      1. Provide supportive, empathetic responses
      2. Offer evidence-based coping strategies
      3. Encourage professional help when appropriate
      4. Never diagnose or provide medical advice
      5. Be culturally sensitive and inclusive
      6. Recognize crisis situations and provide appropriate resources
      
      Guidelines:
      - Always maintain a warm, non-judgmental tone
      - Validate the user's feelings
      - Provide practical, actionable advice
      - Encourage self-care and professional support
      - If the user mentions self-harm or crisis, provide crisis resources
      
      Context about the user: ${JSON.stringify(context)}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      return {
        content: response.choices[0].message.content,
        confidence: this.calculateConfidence(response),
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async analyzeJournalEntry(content, userId) {
    try {
      const prompt = `Analyze this journal entry for emotional content, themes, and potential mental health insights. Provide:
      1. Sentiment analysis (positive, negative, neutral, mixed)
      2. Key emotions detected
      3. Main themes
      4. Potential risk indicators
      5. Suggested coping strategies
      
      Journal entry: "${content}"
      
      Respond in JSON format with the structure:
      {
        "sentiment": "positive|negative|neutral|mixed",
        "emotions": [{"emotion": "string", "confidence": 0-1}],
        "keyThemes": ["theme1", "theme2"],
        "riskLevel": "low|medium|high",
        "suggestedActions": ["action1", "action2"],
        "insights": "brief summary"
      }`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Journal analysis error:', error);
      return null;
    }
  }

  async generateMoodInsights(moodData) {
    try {
      const prompt = `Based on this mood tracking data, provide insights and recommendations:
      
      Data: ${JSON.stringify(moodData)}
      
      Please provide:
      1. Patterns observed
      2. Potential triggers
      3. Recommendations for improvement
      4. Areas of concern
      
      Respond in JSON format with:
      {
        "patterns": ["pattern1", "pattern2"],
        "triggers": ["trigger1", "trigger2"],
        "recommendations": ["rec1", "rec2"],
        "alerts": [{"type": "string", "message": "string", "severity": "low|medium|high"}]
      }`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Mood insights error:', error);
      return null;
    }
  }

  calculateConfidence(response) {
    // Simple confidence calculation based on response length and coherence
    const content = response.choices[0].message.content;
    const length = content.length;
    const hasStructure = content.includes('.') || content.includes('?') || content.includes('!');
    
    let confidence = 0.5; // Base confidence
    
    if (length > 100) confidence += 0.2;
    if (length > 200) confidence += 0.1;
    if (hasStructure) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  async moderateContent(content) {
    try {
      const response = await openai.moderations.create({
        input: content,
      });

      return response.results[0];
    } catch (error) {
      console.error('Content moderation error:', error);
      return null;
    }
  }
}

module.exports = new AIService();