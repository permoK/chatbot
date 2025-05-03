import { OllamaModelsResponse, GenerateRequest, GenerateResponse, ChatMessage } from '../types/ollama';

const API_BASE_URL = 'http://localhost:11434/api';

export const fetchModels = async (): Promise<OllamaModelsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const generateCompletion = async (
  model: string,
  prompt: string,
  options = {}
): Promise<GenerateResponse> => {
  try {
    const request: GenerateRequest = {
      model,
      prompt,
      stream: false,
      options
    };

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate completion: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating completion:', error);
    throw error;
  }
};

export const streamCompletion = async (
  model: string,
  prompt: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  options = {}
): Promise<void> => {
  try {
    const request: GenerateRequest = {
      model,
      prompt,
      stream: true,
      options
    };

    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to stream completion: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            onChunk(json.response);
            fullResponse += json.response;
          }
          if (json.done) {
            onComplete(fullResponse);
            return;
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error streaming completion:', error);
    throw error;
  }
};

export const generateChatCompletion = async (
  model: string,
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  options = {}
): Promise<void> => {
  // Create a system message to instruct the model not to repeat words
  const systemInstruction = "You are a helpful assistant. Provide clear, concise responses without repeating words or phrases.";

  // Convert chat messages to a prompt format that Ollama can understand
  let formattedMessages = [];

  // Add system instruction first
  formattedMessages.push(`System: ${systemInstruction}`);

  // Add conversation history
  for (const msg of messages) {
    if (msg.role === 'user') {
      formattedMessages.push(`User: ${msg.content}`);
    } else if (msg.role === 'assistant') {
      formattedMessages.push(`Assistant: ${msg.content}`);
    } else if (msg.role === 'system') {
      formattedMessages.push(`System: ${msg.content}`);
    }
  }

  const prompt = formattedMessages.join('\n\n');

  // Add the assistant prefix to indicate we want the model to respond as the assistant
  const fullPrompt = `${prompt}\n\nAssistant: `;

  // Use the streaming completion function with temperature adjustment to reduce repetition
  await streamCompletion(
    model,
    fullPrompt,
    onChunk,
    onComplete,
    {
      ...options,
      temperature: 0.7,  // Adjust temperature for more deterministic responses
      top_p: 0.9,        // Limit token selection to reduce repetition
      repeat_penalty: 1.2 // Penalize repetition
    }
  );
};
