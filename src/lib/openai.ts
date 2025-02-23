import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function getOpenAIClient() {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

export async function sendMessage(messages: Message[]) {
  const client = getOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || '';
}