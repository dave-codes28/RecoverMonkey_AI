"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Clock } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "Hello! I'm your RecoverMonkey AI assistant. I can help you manage abandoned carts, send recovery emails, and analyze your store's performance. Try commands like:\n\n• 'Show abandoned carts this week'\n• 'Send reminder to customer sarah@example.com'\n• 'What's my recovery rate?'",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
]

const suggestedCommands = [
  "Show abandoned carts this week",
  "Send reminder to customer #123",
  "What's my recovery rate?",
  "Export cart data to CSV",
  "Schedule email campaign",
]

export function AIAssistantChatWindow() {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateResponse(input),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateResponse = (command: string): string => {
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes("abandoned carts") && lowerCommand.includes("week")) {
      return "📊 **Abandoned Carts This Week:**\n\n• Total: 47 carts\n• Value: $3,247.89\n• Top customer: Sarah Johnson ($89.99)\n• Most abandoned item: Wireless Headphones\n\nWould you like me to send recovery emails to these customers?"
    }
    if (lowerCommand.includes("recovery rate")) {
      return "📈 **Your Recovery Performance:**\n\n• Overall recovery rate: 36%\n• This month: 38% (+2%)\n• Email recovery: 42%\n• SMS recovery: 28%\n\nYour performance is above average! The industry standard is around 30%."
    }
    if (lowerCommand.includes("send reminder")) {
      return "✅ **Recovery Email Sent!**\n\nI've queued a personalized recovery email for the customer. The email will be sent within the next 5 minutes.\n\n**Email Details:**\n• Template: Standard Recovery\n• Discount: 10% off\n• Follow-up: Scheduled for 24 hours\n\nI'll notify you when the customer opens the email."
    }
    if (lowerCommand.includes("export") || lowerCommand.includes("csv")) {
      return "📁 **Export Started:**\n\nI'm preparing your cart data export with the following:\n\n• All abandoned carts (last 30 days)\n• Customer information\n• Product details\n• Recovery status\n\nThe CSV file will be ready in 2-3 minutes. I'll send you a download link via email."
    }
    return (
      'I understand you want help with: "' +
      command +
      "\"\n\nI can assist with:\n• Viewing abandoned cart data\n• Sending recovery emails\n• Analyzing performance metrics\n• Exporting data\n• Scheduling campaigns\n\nCould you be more specific about what you'd like to do?"
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="h-[500px] flex flex-col card-shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          RecoverMonkey Assistant
        </CardTitle>
        <CardDescription>Type commands to manage your store</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "assistant" && (
                <Avatar className="h-8 w-8 shadow-sm">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                  message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-line text-sm">{message.content}</div>
                {isClient && (
                  <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
              {message.type === "user" && (
                <Avatar className="h-8 w-8 shadow-sm">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 shadow-sm">
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command... (e.g., 'Show abandoned carts this week')"
            className="min-h-[60px] resize-none shadow-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] shadow-sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AIAssistant() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground">Get help managing your abandoned carts with AI-powered commands</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <AIAssistantChatWindow />
        </div>
        {/* Suggested Commands */}
        <div className="space-y-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Suggested Commands</CardTitle>
              <CardDescription>Click to try these common commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedCommands.map((command, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => setInput(command)}
                >
                  {command}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm">Active Carts</span>
                <Badge className="shadow-sm">247</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm">Emails Queued</span>
                <Badge variant="outline" className="shadow-sm">
                  12
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="text-sm">Recovery Rate</span>
                <Badge variant="secondary" className="shadow-sm">
                  36%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
