import OpenAI from 'openai';

export function getOpenAIClient() {
  const apiKey = sessionStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

export async function sendMessage(prompt: string) {
  const client = getOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant. Format your responses using markdown for better readability. Use markdown features like headings, lists, code blocks, and emphasis where appropriate."
      },
      {
        role: "system",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || '';
}