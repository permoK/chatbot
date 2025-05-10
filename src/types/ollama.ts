export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaModelsResponse {
  models: OllamaModel[];
}

export interface ReasoningStep {
  type: 'thinking' | 'search' | 'calculation' | 'code' | 'reference';
  content: string;
  metadata?: {
    source?: string;
    timestamp?: string;
    confidence?: number;
    [key: string]: any;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning?: ReasoningStep[];
  artifacts?: {
    type: 'image' | 'code' | 'table' | 'chart' | 'file' | 'link';
    content: string;
    metadata?: {
      title?: string;
      description?: string;
      mimeType?: string;
      [key: string]: any;
    };
  }[];
}

export interface GenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    repeat_penalty?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    reasoning?: boolean;
    reasoning_depth?: 'basic' | 'detailed' | 'comprehensive';
    search_enabled?: boolean;
    calculation_enabled?: boolean;
  };
}

export interface GenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
  reasoning?: ReasoningStep[];
  artifacts?: {
    type: string;
    content: string;
    metadata?: Record<string, any>;
  }[];
}
