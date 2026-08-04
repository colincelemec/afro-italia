// ============================================
// ChatBot — assistente virtuale con Q&A predefinite
// Widget flottante, trilingue (it/fr/en), matching per keyword.
// Nessuna chiamata esterna: tutte le risposte sono in chatbotFaq.js.
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { FAQ, BOT_UI } from '../../data/chatbotFaq';
import Icon from './Icon';
import '../../styles/ChatBot.css';

// Punteggio: quante keyword della voce compaiono nel testo utente
const scoreEntry = (entry, text) => {
  const lower = text.toLowerCase();
  return entry.keywords.reduce((score, kw) => (lower.includes(kw.toLowerCase()) ? score + 1 : score), 0);
};

const findBestAnswer = (text) => {
  let best = null;
  let bestScore = 0;
  for (const entry of FAQ) {
    const s = scoreEntry(entry, text);
    if (s > bestScore) {
      best = entry;
      bestScore = s;
    }
  }
  return bestScore > 0 ? best : null;
};

const ChatBot = () => {
  const { language } = useLanguage();
  const lang = ['it', 'fr', 'en'].includes(language) ? language : 'it';
  const ui = (key) => BOT_UI[key][lang] || BOT_UI[key].it;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // { from: 'bot'|'user', text, link? }
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);

  // Messaggio di benvenuto alla prima apertura / cambio lingua
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: 'bot', text: ui('greeting') }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll automatico in basso
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const reply = useCallback((entry) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      if (entry) {
        setMessages(prev => [...prev, {
          from: 'bot',
          text: entry.answer[lang] || entry.answer.it,
          link: entry.link
            ? { path: entry.link.path, label: entry.link.label[lang] || entry.link.label.it }
            : null,
        }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: ui('fallback') }]);
      }
    }, 450); // piccola pausa per naturalezza
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const send = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages(prev => [...prev, { from: 'user', text: clean }]);
    setInput('');
    reply(findBestAnswer(clean));
  };

  const askPredefined = (entry) => {
    setMessages(prev => [...prev, { from: 'user', text: entry.question[lang] || entry.question.it }]);
    reply(entry);
  };

  return (
    <>
      {/* ── Bottone flottante ── */}
      <button
        className={`cb-fab ${open ? 'cb-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? ui('close') : ui('open')}
        title={open ? ui('close') : ui('open')}
      >
        {open ? <span className="cb-fab__x">✕</span> : <Icon name="chat" size={24} />}
      </button>

      {/* ── Pannello chat ── */}
      {open && (
        <div className="cb-panel" role="dialog" aria-label={ui('title')}>
          <header className="cb-head">
            <div className="cb-head__avatar"><Icon name="chat" size={18} /></div>
            <div>
              <strong>{ui('title')}</strong>
              <span>{ui('subtitle')}</span>
            </div>
            <button className="cb-head__close" onClick={() => setOpen(false)} aria-label={ui('close')}>✕</button>
          </header>

          <div className="cb-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`cb-msg cb-msg--${m.from}`}>
                <p>{m.text}</p>
                {m.link && (
                  <Link to={m.link.path} className="cb-msg__link" onClick={() => setOpen(false)}>
                    {m.link.label} →
                  </Link>
                )}
              </div>
            ))}
            {typing && (
              <div className="cb-msg cb-msg--bot cb-typing">
                <span /><span /><span />
              </div>
            )}

            {/* Suggerimenti — domande predefinite */}
            <div className="cb-suggests">
              <span className="cb-suggests__label">{ui('suggestionsLabel')}</span>
              {FAQ.map(entry => (
                <button key={entry.id} className="cb-suggest" onClick={() => askPredefined(entry)}>
                  {entry.question[lang] || entry.question.it}
                </button>
              ))}
            </div>
          </div>

          <form
            className="cb-input"
            onSubmit={e => { e.preventDefault(); send(input); }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={ui('placeholder')}
              aria-label={ui('placeholder')}
            />
            <button type="submit" disabled={!input.trim()} aria-label={ui('send')}>
              <Icon name="send" size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
