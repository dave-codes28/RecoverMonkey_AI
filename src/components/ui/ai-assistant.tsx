"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, Bot, User, Clock, MessageSquare, Zap, TrendingUp, Mail, RefreshCw, Activity, Command } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface CommandHistory {
  id: string
  command: string
  result: string
  status: 'success' | 'pending' | 'error'
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

const mockCommandHistory: CommandHistory[] = [
  {
    id: "1",
    command: "Show abandoned carts this week",
    result: "Found 47 abandoned carts totaling $3,247.89",
    status: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2", 
    command: "Send reminder to customer #123",
    result: "Recovery email sent successfully",
    status: "success",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "3",
    command: "What's my recovery rate?",
    result: "Current recovery rate: 36% (above average)",
    status: "success",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "4",
    command: "Export cart data to CSV",
    result: "Processing export...",
    status: "pending",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
]

const statusConfig = {
  success: { variant: "secondary", className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50" },
  pending: { variant: "secondary", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300/50" },
  error: { variant: "secondary", className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300/50" },
} as const

export function AIAssistantChatWindow({ onSendCommand }: { onSendCommand?: (command: string) => void } = {}) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)
  React.useEffect(() => setIsClient(true), [])

  // If onSendCommand is not provided, use a no-op
  const sendCommand = onSendCommand || (() => {});

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    sendCommand(input)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/assistant-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer || "Sorry, I couldn't get an answer.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "assistant",
          content: "Sorry, there was an error contacting the assistant API.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Remove generateResponse and simulation logic

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedCommand = (command: string) => {
    setInput(command)
  }

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  return (
    <div className="h-[500px] flex flex-col bg-background/80 rounded-2xl overflow-hidden border border-muted-foreground/10">
      {/* Chat Messages */}
      <div className="flex-1 flex flex-col px-4 py-6 pb-24 space-y-4 overflow-y-auto">
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
              className={`max-w-[80%] rounded-xl p-3 shadow-sm text-sm ${
                message.type === "user"
                  ? "bg-green-500 text-black"
                  : "bg-gray-100 text-gray-900 border border-gray-200"
              }`}
            >
              <div className="whitespace-pre-line">{message.content}</div>
                      <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                        <Clock className="h-3 w-3" />
                {isClient ? (
                  <span>{message.timestamp.toLocaleString("en-GB", { hour12: false })}</span>
                ) : (
                  <span suppressHydrationWarning></span>
                )}
                      </div>
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
            <div className="bg-muted rounded-xl p-3 shadow-sm">
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
        <div ref={messagesEndRef} />
              </div>
              {/* Input */}
      <div className="border-t border-muted-foreground/10 bg-background/95 px-4 py-3 flex gap-2 shadow-sm">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a command... (e.g., 'Show abandoned carts this week')"
          className="min-h-[44px] max-h-32 resize-none shadow-sm flex-1 rounded-lg"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
          className="h-[44px] w-[44px] shadow-sm rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
    </div>
  );
}

export function AIAssistant() {
  const [commandHistory, setCommandHistory] = React.useState<CommandHistory[]>(mockCommandHistory)
  const [loading, setLoading] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);

  const handleSendCommand = (command: string) => {
    const newCommand: CommandHistory = {
      id: Date.now().toString(),
      command,
      result: "Processing...",
      status: "pending",
      timestamp: new Date(),
    }
    setCommandHistory(prev => [newCommand, ...prev])
    
    // Simulate completion
    setTimeout(() => {
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === newCommand.id 
            ? { ...cmd, result: "Command executed successfully", status: "success" as const }
            : cmd
        )
      )
    }, 2000)
  }

  const stats = React.useMemo(() => {
    const totalCommands = commandHistory.length
    const successfulCommands = commandHistory.filter(cmd => cmd.status === 'success').length
    const successRate = totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0
    const recentActivity = commandHistory.filter(cmd => 
      Date.now() - cmd.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length
    
    return {
      totalCommands,
      successRate: successRate.toFixed(1),
      recentActivity
    }
  }, [commandHistory])

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-muted-foreground">Get help managing your abandoned carts with AI-powered commands and insights.</p>
          </div>
          <Button
            onClick={() => setLoading(!loading)}
            variant="outline"
            className="shadow-sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Dashboard Stats Header */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commands Executed</CardTitle>
              <Command className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.totalCommands}</div>
              <p className="text-xs text-muted-foreground">Total AI commands processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">Commands completed successfully</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">Commands in last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <AIAssistantChatWindow onSendCommand={handleSendCommand} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
        {/* Suggested Commands */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Suggested Commands
                </CardTitle>
                <CardDescription>Click to try these common AI commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedCommands.map((command, index) => (
                <Button
                  key={index}
                  variant="outline"
                    className="w-full justify-start text-left h-auto p-3 shadow-sm hover:shadow-md transition-shadow hover:bg-muted/50"
                >
                    <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                  {command}
                </Button>
              ))}
            </CardContent>
          </Card>
            {/* Quick Stats widget removed */}
              </div>
        </div>
        {/* Command History widget removed */}
      </div>
    </TooltipProvider>
  )
}