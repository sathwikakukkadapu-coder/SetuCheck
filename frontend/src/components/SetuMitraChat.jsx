import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bot, 
  User, 
  RotateCcw,
  Languages,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { sendChatMessage } from '../api/apiClient';

const INITIAL_PROMPTS = {
  en: [
    "Why was my IFSC code flagged?",
    "How do I fix name spelling in my passbook?",
    "Can I submit an electricity bill as address proof?",
    "What is the Document Readiness Score?"
  ],
  te: [
    "నా IFSC కోడ్ ఎందుకు తిరస్కరించబడింది?",
    "బ్యాంక్ పాస్‌బుక్‌లో పేరు ఎలా మార్చుకోవాలి?",
    "చిరునామా రుజువు కోసం విద్యుత్ బిల్లు సమర్పించవచ్చా?",
    "ఈ సంసిద్ధత స్కోర్ (Readiness Score) ఎలా పనిచేస్తుంది?"
  ],
  hi: [
    "मेरा IFSC कोड क्यों अमान्य बताया गया?",
    "बैंक पासबुक में नाम की स्पेलिंग कैसे सुधारें?",
    "क्या बिजली बिल निवास प्रमाण के रूप में मान्य है?",
    "तैयारी स्कोर (Readiness Score) कैसे तय होता है?"
  ]
};

export default function SetuMitraChat({ auditResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am SetuMitra, your civic document auditor assistant. You can ask me how to rectify flagged fields, understand government scheme guidelines, or submit valid documents in English, Telugu (తెలుగు), or Hindi (हिन्दी)."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Update welcome message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      if (language === 'te') {
        setMessages([{
          role: 'assistant',
          content: "నమస్కారం! నేను మీ సేతుమిత్ర (SetuMitra) AI సహాయకుడిని. మీ దరఖాస్తులోని లోపాలు, బ్యాంక్ వివరాలు, లేదా పథకం అర్హతల గురించి నన్ను ఏదైనా అడగవచ్చు."
        }]);
      } else if (language === 'hi') {
        setMessages([{
          role: 'assistant',
          content: "नमस्ते! मैं आपका सेतुमित्र (SetuMitra) AI सहायक हूँ। आप अपने आवेदन, बैंक विवरण या योजना नियमों से जुड़े किसी भी सवाल के लिए मुझसे पूछ सकते हैं।"
        }]);
      } else {
        setMessages([{
          role: 'assistant',
          content: "Hello! I am SetuMitra, your civic document auditor assistant. You can ask me how to rectify flagged fields, understand government scheme guidelines, or submit valid documents in English, Telugu (తెలుగు), or Hindi (हिन्दी)."
        }]);
      }
    }
  }, [language]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage({
        message: text,
        language: language,
        audit_id: auditResult?.audit_id || null,
        audit_result: auditResult || null,
        history: history
      });

      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: response.reply, 
          rules: response.referenced_rules,
          source: response.source 
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "I encountered a network issue reaching the civic assistant. Please verify your connection and try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-Speech playback
  const handleSpeak = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'te' ? 'te-IN' : (language === 'hi' ? 'hi-IN' : 'en-IN');
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingIdx(idx);
  };

  // Speech-to-Text Microphone
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'te' ? 'te-IN' : (language === 'hi' ? 'hi-IN' : 'en-IN');
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-xl shadow-teal-500/25 transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
          </div>
          <span className="text-xs tracking-tight">Ask SetuMitra AI</span>
          <span className="text-[10px] bg-slate-950 text-teal-300 px-2 py-0.5 rounded-full uppercase font-mono">
            Co-Pilot
          </span>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] bg-white rounded-3xl border border-slate-300 shadow-2xl flex flex-col overflow-hidden animate-fade-in text-slate-800">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">SetuMitra (సేతుమిత్ర)</h3>
                  <span className="text-[9px] bg-teal-950 text-teal-400 border border-teal-800 px-1.5 py-0.2 rounded font-mono">
                    Civic AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Pre-Submission Explainer Co-Pilot</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px]">
                {['en', 'te', 'hi'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-1.5 py-0.5 rounded uppercase font-bold transition ${
                      language === l ? 'bg-teal-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[82%] rounded-2xl p-3 shadow-sm ${
                    isAssistant 
                      ? 'bg-white border border-slate-200 text-slate-800' 
                      : 'bg-teal-600 text-white font-medium rounded-br-none'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-line">{m.content}</p>

                    {isAssistant && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono">Grounded Civic Rule</span>
                        <button
                          onClick={() => handleSpeak(m.content, idx)}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold"
                        >
                          {speakingIdx === idx ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                <div className="w-5 h-5 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <span>SetuMitra is verifying rules...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(INITIAL_PROMPTS[language] || INITIAL_PROMPTS.en).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap text-[10px] font-medium bg-white hover:bg-teal-50 hover:border-teal-300 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isListening ? "Listening... click to stop" : "Speak your query"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                language === 'te' 
                  ? "మీ సందేహాన్ని ఇక్కడ టైప్ చేయండి..." 
                  : (language === 'hi' ? "अपना सवाल यहाँ लिखें..." : "Ask a question about this audit...")
              }
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl transition shadow"
            >
              <Send className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
