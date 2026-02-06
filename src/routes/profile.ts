import express from 'express';
import type { Router } from 'express';
import { chatWithGeminiSync, ChatMessage } from '@/src/services/gemini.js';
import type { UserProfile } from '@/src/types.js';

const router: Router = express.Router();

router.post('/parse-profile', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    const systemPrompt = `You are a user profile extraction assistant. Analyze the user's description and extract a structured UserProfile JSON object.

Target JSON Structure (TypeScript Interface):
interface UserProfile {
  age: number; // Default to 20 if not specified
  gender: 'male' | 'female' | 'other'; // Infer if possible, default to 'other'
  programmingLanguage: 'C' | 'C++' | 'Python' | 'Java' | 'Go' | string; // Default to 'Python'
  studyCycle: string; // e.g., "3h/day". Default to "2h/day"
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Infer from context (e.g., "newbie" -> beginner). Default to 'beginner'
  learningGoal: string; // Summary of goals. Default to "Learn computer science concepts"
}

Instructions:
1. Extract values from the input text.
2. Infer missing values based on context where possible.
3. Use reasonable defaults for completely missing fields.
4. Return ONLY the valid JSON object. No markdown formatting. No explanations.
`;

    const userMessage = `Input Text: "${text}"`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const responseContent = await chatWithGeminiSync(messages);
    
    // Clean up potential markdown formatting (e.g. ```json ... ```)
    const cleanedContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let profile: UserProfile;
    try {
      profile = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse LLM response:', responseContent);
      // Fallback or retry logic could go here, for now return a basic error or default
      return res.status(500).json({ error: 'Failed to parse generated profile' });
    }

    res.json(profile);

  } catch (error) {
    console.error('Profile parsing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
