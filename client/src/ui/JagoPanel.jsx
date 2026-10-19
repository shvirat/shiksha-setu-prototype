import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Microphone, PaperPlaneRight, X, SpeakerHigh } from '@phosphor-icons/react';
import { apiRequest } from '../services/api';

export function JagoPanel({ isOpen, onClose, isMobileTab = false }) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      sender: 'JAGO',
      text:
        i18n.language === 'hi'
          ? 'नमस्ते! मैं जागो (JAGO) हूँ, जनजातीय कार्य मंत्रालय छात्रवृत्ति सहायक। आप मुझसे योजनाओं की पात्रता, आवेदन स्थिति या आवश्यक दस्तावेजों के बारे में पूछ सकते हैं।'
          : 'Hello! I am JAGO, your multilingual guide for Ministry of Tribal Affairs (MoTA) scholarships. You can ask me about scheme eligibility, application status, or required documents.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'You', text: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiRequest('/jago/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: query.trim(),
          language: i18n.language
        })
      });

      const jagoMsg = {
        sender: 'JAGO',
        text: res.data.reply,
        source: res.data.source
      };
      setMessages((prev) => [...prev, jagoMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'JAGO',
          text:
            i18n.language === 'hi'
              ? 'क्षमा करें, प्रतिक्रिया प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
              : 'Sorry, there was an error processing your query. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const suggestedQuestions = [
    t('jago.q1'),
    t('jago.q2'),
    t('jago.q3')
  ];

  if (!isOpen && !isMobileTab) return null;

  const containerClasses = isMobileTab
    ? 'w-full h-full flex flex-col bg-surface'
    : 'fixed inset-y-0 right-0 w-[380px] bg-surface border-l border-line shadow-overlay z-40 flex flex-col';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="h-14 border-b border-line px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lead font-semibold text-navy-700">
            {t('jago.title')}
          </span>
          <span className="text-caption px-1.5 py-0.5 bg-navy-50 text-navy-700 rounded border border-navy-100 font-mono">
            Bilingual AI
          </span>
        </div>
        {!isMobileTab && (
          <button
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink focus-visible:outline-navy-600"
            aria-label="Close JAGO panel"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 divide-y divide-line">
        {messages.map((msg, idx) => (
          <div key={idx} className="py-3 first:pt-0">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-caption font-semibold uppercase tracking-wider ${
                  msg.sender === 'JAGO' ? 'text-navy-700' : 'text-ink-muted'
                }`}
              >
                {msg.sender}
              </span>
              {msg.sender === 'JAGO' && (
                <button
                  onClick={() => handleSpeak(msg.text)}
                  className="inline-flex items-center gap-1 text-caption text-navy-600 hover:underline"
                >
                  <SpeakerHigh size={14} />
                  <span>{t('jago.readAloud')}</span>
                </button>
              )}
            </div>
            <p className="text-body text-ink leading-relaxed whitespace-pre-wrap">
              {msg.text}
            </p>
          </div>
        ))}

        {loading && (
          <div className="py-3 text-caption text-ink-muted italic">
            JAGO is searching scholarship records...
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2 border-t border-line bg-paper">
        <span className="text-caption font-semibold text-ink-muted block mb-1">
          {t('jago.suggestedQuestions')}:
        </span>
        <ul className="space-y-1">
          {suggestedQuestions.map((q, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSend(q)}
                className="text-small text-navy-600 hover:underline text-left block"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Voice Listening Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-navy-50 border-t border-navy-100 flex flex-col">
          <span className="text-small font-medium text-navy-700">
            {t('jago.listening')}
          </span>
          <div className="w-full h-0.5 bg-navy-700 mt-1 animate-pulse" />
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t border-line bg-surface">
        <div className="flex items-end gap-2 border border-line-strong rounded p-1.5 focus-within:border-navy-600">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('jago.placeholder')}
            className="flex-1 resize-none bg-transparent text-small text-ink border-0 focus:outline-none placeholder:text-ink-subtle"
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            title="Voice input (Speech to text)"
            className={`p-2 rounded text-ink-muted hover:text-navy-700 ${
              isListening ? 'text-saffron-700' : ''
            }`}
          >
            <Microphone size={20} weight={isListening ? 'fill' : 'regular'} />
          </button>

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            title={t('jago.send')}
            className="p-2 bg-navy-700 text-white rounded hover:bg-navy-900 disabled:bg-line disabled:text-ink-muted"
          >
            <PaperPlaneRight size={18} />
          </button>
        </div>

        <p className="text-caption text-ink-subtle mt-1.5 text-center">
          {t('jago.disclaimer')}
        </p>
      </div>
    </div>
  );
}
