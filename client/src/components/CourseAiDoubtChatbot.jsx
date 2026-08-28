import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import { askCourseDoubtApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CourseAiDoubtChatbot = ({ course, modules = [] }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize welcoming chat message on course mount or change
  useEffect(() => {
    if (course?._id) {
      const initialAssistantMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi **${user?.name?.split(' ')[0] || 'there'}**! 👋 I'm your dedicated AI Course Assistant for **"${course.title}"**.\n\nAsk me any doubt regarding course concepts, lessons, module quizzes, or practical code!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const defaultStarters = [
        'Summarize this course curriculum',
        'What are the key prerequisites?',
        'How is the final assessment structured?',
        ...(modules.length > 0 ? [`Explain Module 1: ${modules[0].title}`] : []),
      ];

      setMessages([initialAssistantMessage]);
      setSuggestedPrompts(defaultStarters);
    }
  }, [course?._id, user?.name]);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading || !course?._id) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update message stream with user message
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = updatedMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askCourseDoubtApi(course._id, query, historyPayload);

      if (res?.success && res.data) {
        const assistantMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.data.answer || 'I am ready to help with your course doubts!',
          source: res.data.source || 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (Array.isArray(res.data.suggestedFollowUps) && res.data.suggestedFollowUps.length > 0) {
          setSuggestedPrompts(res.data.suggestedFollowUps);
        }
      } else {
        throw new Error(res?.message || 'Could not get an answer.');
      }
    } catch (err) {
      console.warn('Course doubt chatbot error:', err.message);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered a momentary issue processing your question. Please try asking again or check your network connection.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (course?._id) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Chat session refreshed! How can I assist you with **"${course.title}"**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setSuggestedPrompts([
        'Summarize this course curriculum',
        'What are the key prerequisites?',
        'How is the final assessment structured?',
      ]);
    }
  };

  // Helper to format simple markdown (bold, lists, code block)
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Heading 3
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-indigo-950 dark:text-indigo-200 text-sm mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }

          // Bullet list item
          if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
            const bulletText = line.replace(/^[•\-\*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{formatInlineText(bulletText)}</span>
              </div>
            );
          }

          // Numbered list item
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+\.)\s/)[1];
            const numText = line.replace(/^\d+\.\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-indigo-600 font-semibold">{num}</span>
                <span>{formatInlineText(numText)}</span>
              </div>
            );
          }

          return <p key={idx}>{formatInlineText(line)}</p>;
        })}
      </div>
    );
  };

  const formatInlineText = (text) => {
    // Basic bold **text** replacement
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 border border-indigo-400/40 cursor-pointer"
          aria-label="Open Course AI Doubts Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-700 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block leading-tight">Ask Course AI</span>
            <span className="text-[10px] text-indigo-200 block font-medium">Doubts & Q&A Assistant</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform ml-1" />
        </button>
      )}

      {/* Chatbot Window Container */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-white border border-indigo-100 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-indigo-900/40 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600/40 border border-indigo-400/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>Course Doubt Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-indigo-300 truncate max-w-[210px]">
                  {course?.title || 'AI Course Tutor'}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset Chat Session"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Body & Messages Stream (Only when not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-start gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`rounded-2xl p-3.5 shadow-2xs ${
                            isUser
                              ? 'bg-indigo-700 text-white rounded-tr-none'
                              : msg.isError
                              ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tl-none'
                              : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                          }`}
                        >
                          {isUser ? (
                            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          ) : (
                            renderFormattedContent(msg.content)
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* AI Thinking Animation */}
                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-none p-3 shadow-2xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-indigo-600 font-medium ml-1">Analyzing course materials...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Follow-up Prompt Chips */}
              {suggestedPrompts.length > 0 && !loading && (
                <div className="px-3.5 py-2 bg-indigo-50/60 border-t border-indigo-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] text-indigo-800 bg-white hover:bg-indigo-100 border border-indigo-200/80 rounded-full px-2.5 py-1 transition-all text-left truncate max-w-full flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      <span className="truncate">{prompt}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask any doubt about this course..."
                    disabled={loading}
                    className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 disabled:opacity-60 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="p-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    title="Send Question"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between px-1 mt-1.5 text-[10px] text-slate-400">
                  <span>Press <kbd className="font-mono bg-slate-100 px-1 rounded text-slate-500">Enter</kbd> to ask</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                    <span>Contextual AI Tutor</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CourseAiDoubtChatbot;
