// Chat message type
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  intent?: string;
}

// Intent type
export interface ChatIntent {
  name: string;
  confidence: number;
}

// API response type
export interface ChatbotAPIResponse {
  reply: string;
  intent?: ChatIntent;
  actions?: string[];
} 