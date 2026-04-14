import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SymptomChecker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  
  // Chat state
  const [messages, setMessages] = useState([
    { sender: 'ai', type: 'text', content: "Hi! I'm your AI Medical Assistant 🩺. How are you feeling today? You can select symptoms below or describe them to me." }
  ]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available symptoms from Python Flask ML API
    axios.get('http://localhost:5001/symptoms')
      .then(res => setAvailableSymptoms(res.data))
      .catch(err => console.error("Error loading symptoms from Python API", err));
  }, []);

  useEffect(() => {
    // Auto scroll chat to bottom
    if (messagesEndRef.current) {
       messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && !inputText.trim()) return;

    // Add user message to chat
    const userMsg = {
      sender: 'user',
      type: 'text',
      content: inputText ? `I have ${selectedSymptoms.join(', ')} and ${inputText}` : `I'm experiencing: ${selectedSymptoms.join(', ')}`
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    
    try {
      // Build the binary feature map for the ML Model
      const payload = {};
      availableSymptoms.forEach(sym => {
        payload[sym] = selectedSymptoms.includes(sym) ? 1 : 0;
      });

      const res = await axios.post('http://localhost:5001/predict', payload);
      
      setIsTyping(false);
      
      if (!res.data.disease) {
        setMessages(prev => [...prev, { sender: 'ai', type: 'text', content: "Error predicting disease." }]);
        return;
      }

      setMessages(prev => [...prev, { 
        sender: 'ai', 
        type: 'result', 
        data: {
          disease: res.data.disease,
          confidence: res.data.probability,
          advice: res.data.advice,
          specialty: res.data.doctor
        }
      }]);

      // Reset inputs after analysis
      setSelectedSymptoms([]);
      setInputText('');

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'ai', type: 'text', content: "Sorry, the Python ML server is currently offline. Please ensure app.py is running on port 5001." }]);
    }
  };

  const resetChat = () => {
    setMessages([
      { sender: 'ai', type: 'text', content: "Let's start over. What symptoms are you feeling?" }
    ]);
    setSelectedSymptoms([]);
    setInputText('');
  };

  return (
    <>
      {/* Floating Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', width: '60px', height: '60px',
          backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
          boxShadow: '0 8px 16px rgba(2, 132, 199, 0.4)', cursor: 'pointer', zIndex: 9999,
          transition: 'transform 0.2s, background-color 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {isOpen ? '✕' : '🤖'}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem', width: '380px', height: '600px', maxHeight: '80vh',
          backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9998,
          border: '1px solid rgba(0,0,0,0.05)', animation: 'slideUp 0.3s ease-out'
        }}>
          
          {/* Header */}
          <div style={{ padding: '1.2rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '35px', height: '35px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🤖</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>CuraAI</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Symptom Checker Assistant</span>
              </div>
            </div>
            <button onClick={resetChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }} title="Restart Session">🔄</button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {msg.type === 'text' ? (
                  <div style={{
                    padding: '0.8rem 1rem', borderRadius: '12px', fontSize: '0.95rem',
                    backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'white',
                    color: msg.sender === 'user' ? 'white' : 'var(--text)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                    borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px'
                  }}>
                    {msg.content}
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '1.2rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--primary)'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 700 }}>AI Analysis Result</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{msg.data.disease}</h4>
                      <span style={{ backgroundColor: msg.data.confidence > 75 ? '#d1fae5' : msg.data.confidence > 50 ? '#fef3c7' : '#fee2e2', color: msg.data.confidence > 75 ? '#065f46' : msg.data.confidence > 50 ? '#92400e' : '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {msg.data.confidence}% Match
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      <strong>Advice:</strong> {msg.data.advice}
                    </div>
                    
                    <div style={{ margin: '1rem 0', padding: '0.8rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px dashed #bae6fd' }}>
                      <div style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '4px' }}>Recommended Specialist:</div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>👨‍⚕️ {msg.data.specialty}</div>
                    </div>

                    <button 
                      onClick={() => navigate('/book')}
                      style={{ width: '100%', padding: '0.8rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
                    >
                      Book Appointment Now
                    </button>
                    
                    {/* Alternatives mapping removed since Python model just gives main prediction */}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '0.8rem 1.2rem', borderRadius: '12px', borderBottomLeftRadius: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <span style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Analyzing symptoms...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
            
            {/* Symptom Tag Selector */}
            {availableSymptoms.length > 0 && (
              <div style={{ marginBottom: '0.8rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'thin' }}>
                {availableSymptoms.map(sym => (
                  <button 
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: '16px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap',
                      backgroundColor: selectedSymptoms.includes(sym) ? 'var(--primary)' : '#f1f5f9',
                      color: selectedSymptoms.includes(sym) ? 'white' : 'var(--text)',
                      border: selectedSymptoms.includes(sym) ? '1px solid var(--primary)' : '1px solid #cbd5e1'
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Type additional symptoms..." 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem' }}
              />
              <button 
                onClick={handleAnalyze}
                disabled={isTyping || (selectedSymptoms.length === 0 && !inputText.trim())}
                style={{ 
                  padding: '0 1.2rem', backgroundColor: (selectedSymptoms.length === 0 && !inputText.trim()) ? '#cbd5e1' : 'var(--primary)', 
                  color: 'white', border: 'none', borderRadius: '8px', cursor: (selectedSymptoms.length === 0 && !inputText.trim()) ? 'not-allowed' : 'pointer', fontWeight: 600 
                }}
              >
                Analyze
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
              Disclaimer: Not a substitute for professional medical advice.
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </>
  );
};

export default SymptomChecker;
