import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Send, MessageCircle, Sprout, Loader2, X, Swords, BookOpen, SunMedium } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzePlant, createGardeningChat, askExpertScientific, askExpertPractical } from './lib/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// Scanner Tab Component
// ----------------------------------------------------------------------
function ScannerTab() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzePlant(file);
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setResult(err.message || "An error occurred while analyzing the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-serif text-olive-800">Identify Your Plant</h2>
          <p className="text-stone-500">Take a photo or upload an image to get instant care instructions.</p>
        </div>

        {!previewUrl ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-olive-600/30 rounded-3xl bg-white shadow-sm gap-4 transition-colors hover:border-olive-600/60">
            <div className="flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 w-32 h-32 bg-stone-50 rounded-2xl text-olive-700 hover:bg-stone-100 transition-colors"
                aria-label="Upload photo"
              >
                <ImageIcon size={32} />
                <span className="font-medium text-sm">Upload Photo</span>
              </button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-md bg-stone-200 aspect-[4/3] md:aspect-[16/9]">
              <img src={previewUrl} alt="Plant preview" className="w-full h-full object-cover" />
              <button 
                onClick={handleClear}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                title="Clear image"
              >
                <X size={20} />
              </button>
            </div>
            
            {!result && (
              <div className="flex justify-center">
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading}
                  className="olive-button flex items-center justify-center gap-2 w-full md:w-auto min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sprout size={20} />
                      Identify Plant
                    </>
                  )}
                </button>
              </div>
            )}
            
            {result && (
              <div className="card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="markdown-body text-stone-800">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Chat Tab Component
// ----------------------------------------------------------------------
type Message = { role: 'user' | 'model'; text: string };

function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm Flora, your gardening assistant. How can I help your garden grow today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Keep the chat session ref
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session once when the component mounts
    try {
      chatRef.current = createGardeningChat();
    } catch (err: any) {
      console.error("Failed to initialize chat:", err);
      setMessages([{ role: 'model', text: "Hi! It looks like there's an issue with setup: " + err.message }]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || !chatRef.current) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userText });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl w-full mx-auto relative bg-stone-50 md:card md:my-4 md:h-[calc(100%-2rem)] overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 p-4 flex items-center gap-3 z-10 shrink-0">
        <div className="bg-olive-100 text-olive-800 p-2 rounded-full">
          <Sprout size={24} />
        </div>
        <div>
          <h2 className="font-serif font-bold text-lg text-olive-800 leading-tight">Flora</h2>
          <p className="text-xs text-stone-500 font-medium">Gardening Assistant</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", 
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed",
              msg.role === 'user' 
                ? "bg-olive-600 text-white rounded-br-sm" 
                : "bg-white text-stone-800 rounded-bl-sm border border-stone-100"
            )}>
              {msg.role === 'model' ? (
                <div className="markdown-body text-sm md:text-[15px]">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex w-full justify-start animate-pulse">
            <div className="bg-white border border-stone-100 px-5 py-3.5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-olive-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-olive-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-olive-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-stone-200 shrink-0">
        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-stone-100 rounded-full pr-2 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-olive-600/50 transition-all shadow-inner"
        >
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about plants, soil, watering..."
            className="flex-1 bg-transparent border-none focus:outline-none py-2 text-stone-800 placeholder-stone-500"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-olive-600 hover:bg-olive-700 disabled:bg-stone-300 text-white p-2 rounded-full transition-colors flex items-center justify-center shrink-0"
            aria-label="Send message"
          >
            <Send size={18} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Expert Debate Tab Component
// ----------------------------------------------------------------------
function DebateTab() {
  const [question, setQuestion] = useState('');
  const [hasAsked, setHasAsked] = useState(false);
  const [sciResult, setSciResult] = useState<string | null>(null);
  const [pracResult, setPracResult] = useState<string | null>(null);
  const [sciLoading, setSciLoading] = useState(false);
  const [pracLoading, setPracLoading] = useState(false);

  const handleDebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const q = question.trim();
    setHasAsked(true);
    setSciResult(null);
    setPracResult(null);
    setSciLoading(true);
    setPracLoading(true);

    // Call scientific expert (Gemini 3.1 Pro)
    askExpertScientific(q)
      .then(res => setSciResult(res))
      .catch(err => setSciResult("Error: " + err.message))
      .finally(() => setSciLoading(false));

    // Call practical expert (Gemini 3 Flash)
    askExpertPractical(q)
      .then(res => setPracResult(res))
      .catch(err => setPracResult("Error: " + err.message))
      .finally(() => setPracLoading(false));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto space-y-8">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-3xl font-serif text-olive-800">Expert Battle</h2>
          <p className="text-stone-500">Ask a question and see how science and folklore approach the same problem differently.</p>
        </div>

        <form onSubmit={handleDebate} className="flex gap-2">
          <input 
            type="text" 
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. How to treat yellowing tomato leaves?"
            className="flex-1 bg-white border border-stone-200 rounded-full px-6 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-olive-600/50"
            disabled={sciLoading || pracLoading}
          />
          <button 
            type="submit"
            disabled={!question.trim() || sciLoading || pracLoading}
            className="olive-button flex items-center gap-2"
          >
            <Swords size={20} />
            <span className="hidden sm:inline">Compare</span>
          </button>
        </form>

        {hasAsked && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pb-8">
            {/* Scientific Perspective */}
            <div className="card border border-stone-200 overflow-hidden flex flex-col">
              <div className="bg-stone-100 p-4 border-b border-stone-200 flex items-center gap-3">
                <div className="bg-stone-800 text-white p-2 rounded-full">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-800">Dr. Silva</h3>
                  <p className="text-xs text-stone-500 font-mono">Scientific AI (Pro)</p>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1 bg-white">
                {sciLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 text-stone-400 py-12">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm">Analyzing biological processes...</p>
                  </div>
                ) : (
                  <div className="markdown-body text-[15px] text-stone-700">
                    <ReactMarkdown>{sciResult || ''}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Practical Perspective */}
            <div className="card shadow-[0_4px_20px_rgba(245,158,11,0.08)] border border-amber-100 overflow-hidden flex flex-col">
              <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center gap-3">
                <div className="bg-amber-600 text-white p-2 rounded-full">
                  <SunMedium size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-900">Granny Rose</h3>
                  <p className="text-xs text-amber-600 font-mono">Practical AI (Flash)</p>
                </div>
              </div>
              <div className="p-6 md:p-8 flex-1 bg-amber-50/30">
                {pracLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 text-amber-700/50 py-12">
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm">Consulting the almanac...</p>
                  </div>
                ) : (
                  <div className="markdown-body text-[15px] text-amber-900/90">
                    <ReactMarkdown>{pracResult || ''}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main Application Container
// ----------------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'chat' | 'debate'>('scanner');

  return (
    <div className="flex flex-col h-screen w-full bg-stone-50 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="bg-olive-800 text-white p-4 shadow-md shrink-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="text-olive-300" size={28} />
            <h1 className="font-serif text-2xl font-bold tracking-wide">Botanist AI</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-stone-100/50">
        {activeTab === 'scanner' && <ScannerTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'debate' && <DebateTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-stone-200 shrink-0 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
        <div className="max-w-md mx-auto flex">
          <button 
            onClick={() => setActiveTab('scanner')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative",
              activeTab === 'scanner' ? "text-olive-700" : "text-stone-400 hover:text-stone-600"
            )}
          >
            {activeTab === 'scanner' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-olive-600 rounded-b-full shadow-[0_2px_8px_rgba(90,90,64,0.5)]" />
            )}
            <Camera size={24} className={activeTab === 'scanner' ? "drop-shadow-sm" : ""} />
            <span className="text-xs font-medium">Identify</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative",
              activeTab === 'chat' ? "text-olive-700" : "text-stone-400 hover:text-stone-600"
            )}
          >
            {activeTab === 'chat' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-olive-600 rounded-b-full shadow-[0_2px_8px_rgba(90,90,64,0.5)]" />
            )}
            <MessageCircle size={24} className={activeTab === 'chat' ? "drop-shadow-sm" : ""} />
            <span className="text-xs font-medium">Assistant</span>
          </button>

          <button 
            onClick={() => setActiveTab('debate')}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative",
              activeTab === 'debate' ? "text-olive-700" : "text-stone-400 hover:text-stone-600"
            )}
          >
            {activeTab === 'debate' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-olive-600 rounded-b-full shadow-[0_2px_8px_rgba(90,90,64,0.5)]" />
            )}
            <Swords size={24} className={activeTab === 'debate' ? "drop-shadow-sm" : ""} />
            <span className="text-xs font-medium">Battle</span>
          </button>
        </div>
      </nav>
    </div>
  );
}