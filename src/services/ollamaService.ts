import { OllamaModelsResponse, GenerateRequest, GenerateResponse, ChatMessage } from '../types/ollama';

// Get the API base URL from environment variables or use a default
// This allows configuring the API URL through environment variables in production
const API_BASE_URL = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434/api';

// Log the API URL being used to help with debugging
console.log('Using Ollama API URL:', API_BASE_URL);

export const fetchModels = async (): Promise<OllamaModelsResponse> => {
  try {
    console.log(`Fetching models from: ${API_BASE_URL}/tags`);
    const response = await fetch(`${API_BASE_URL}/tags`, {
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Models fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching models:', error);

    // Provide more detailed error information
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to Ollama API at ${API_BASE_URL}. Make sure Ollama is running and accessible.`);
    }

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
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate completion: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating completion:', error);

    // Provide more detailed error information
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to Ollama API at ${API_BASE_URL}. Make sure Ollama is running and accessible.`);
    }

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
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to stream completion: ${response.status} ${response.statusText}`);
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

    // Provide more detailed error information
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to Ollama API at ${API_BASE_URL}. Make sure Ollama is running and accessible.`);
    }

    throw error;
  }
};

export const generateChatCompletion = async (
  model: string,
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  options: {
    reasoning?: boolean;
    reasoning_depth?: 'basic' | 'detailed' | 'comprehensive';
    search_enabled?: boolean;
    calculation_enabled?: boolean;
    temperature?: number;
    top_p?: number;
    repeat_penalty?: number;
    [key: string]: any;
  } = {}
): Promise<void> => {
  // Create a system message with appropriate instructions based on options
  let systemInstruction = "You are a helpful assistant. Provide clear, concise responses without repeating words or phrases.";

  // Add reasoning instructions if enabled
  if (options.reasoning) {
    const depth = options.reasoning_depth || 'basic';

    if (depth === 'basic') {
      systemInstruction += " Before answering, briefly think through the problem step by step.";
    } else if (depth === 'detailed') {
      systemInstruction += " Before answering, think through the problem step by step in detail, considering different angles.";
    } else if (depth === 'comprehensive') {
      systemInstruction += " Before answering, perform a comprehensive analysis of the problem. Break it down into steps, consider multiple perspectives, evaluate evidence, and draw logical conclusions.";
    }

    // Add search instructions if enabled
    if (options.search_enabled) {
      systemInstruction += " When relevant, search for information to support your answer. Format search queries as [SEARCH: your query].";
    }

    // Add calculation instructions if enabled
    if (options.calculation_enabled) {
      systemInstruction += " When calculations are needed, show your work step by step. Format calculations as [CALCULATION: your steps].";
    }

    // Add formatting instructions for reasoning
    systemInstruction += " Format your thinking process as [REASONING: your thoughts]. After your reasoning, provide your final answer.";
  }

  // Convert chat messages to a prompt format that Ollama can understand
  let formattedMessages = [];

  // Add system instruction first
  formattedMessages.push(`System: ${systemInstruction}`);

  // Add conversation history
  for (const msg of messages) {
    if (msg.role === 'user') {
      formattedMessages.push(`User: ${msg.content}`);
    } else if (msg.role === 'assistant') {
      // Include reasoning if present
      let assistantMessage = `Assistant: ${msg.content}`;
      if (msg.reasoning && msg.reasoning.length > 0 && options.reasoning) {
        const reasoningText = msg.reasoning
          .map(step => `[${step.type.toUpperCase()}: ${step.content}]`)
          .join('\n');
        assistantMessage = `${reasoningText}\n${assistantMessage}`;
      }
      formattedMessages.push(assistantMessage);
    } else if (msg.role === 'system') {
      formattedMessages.push(`System: ${msg.content}`);
    }
  }

  const prompt = formattedMessages.join('\n\n');

  // Add the assistant prefix to indicate we want the model to respond as the assistant
  const fullPrompt = `${prompt}\n\nAssistant: `;

  // Use the streaming completion function with appropriate parameters
  await streamCompletion(
    model,
    fullPrompt,
    onChunk,
    onComplete,
    {
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      repeat_penalty: options.repeat_penalty || 1.2,
      ...options
    }
  );
};
