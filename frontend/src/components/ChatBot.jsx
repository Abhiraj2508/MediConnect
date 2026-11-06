import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatBot = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I'm MediConnect AI, here to **solve your health problems**.

Tell me what's bothering you and I'll:
✅ Provide immediate relief solutions
✅ Suggest home remedies
✅ Recommend the right doctor
✅ Help you book an appointment

**What health issue can I help you with?**`,
            doctors: []
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions] = useState([
        "I have a headache",
        "Fever and cold",
        "Skin problem"
    ]);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Navigate to doctor's appointment page
    const handleBookDoctor = (doctorId) => {
        setIsOpen(false);
        navigate(`/appointment/${doctorId}`);
    };

    // Navigate to doctors page with specialty filter
    const handleViewSpecialty = (specialty) => {
        setIsOpen(false);
        navigate(`/doctors/${specialty}`);
    };

    // Format message content with markdown-like styling
    const formatMessage = (content) => {
        // Split content into lines
        const lines = content.split('\n');
        
        return lines.map((line, index) => {
            // Bold text
            let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Check for bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                    <div key={index} className="flex items-start gap-2 ml-2">
                        <span className="text-primary mt-1">•</span>
                        <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[•-]\s*/, '') }} />
                    </div>
                );
            }
            
            // Check for numbered lists
            if (/^\d+\./.test(line.trim())) {
                return (
                    <div key={index} className="ml-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
            }
            
            // Check for checkmarks
            if (line.includes('✅') || line.includes('👉') || line.includes('🚨')) {
                return (
                    <div key={index} className="my-1" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                );
            }
            
            // Regular paragraph
            if (line.trim() === '') {
                return <div key={index} className="h-2" />;
            }
            
            return (
                <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />
            );
        });
    };

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage = { role: 'user', content: messageText.trim(), doctors: [] };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const { data } = await axios.post(`${backendUrl}/api/chatbot/chat`, {
                message: messageText.trim(),
                conversationHistory: messages.slice(-8).map(m => ({
                    role: m.role,
                    content: m.content
                }))
            });

            if (data.success) {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.response,
                    doctors: data.doctors || [],
                    specialty: data.specialty,
                    actionType: data.actionType
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: "I'm sorry, I encountered an error. Please try again.",
                    doctors: []
                }]);
            }
        } catch (error) {
            console.log(error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I'm having trouble connecting. Please check your internet connection and try again.",
                doctors: []
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: `Hello! I'm MediConnect AI, here to **solve your health problems**.

Tell me what's bothering you and I'll:
✅ Provide immediate relief solutions
✅ Suggest home remedies
✅ Recommend the right doctor
✅ Help you book an appointment

**What health issue can I help you with?**`,
                doctors: []
            }
        ]);
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                    isOpen ? 'bg-gray-600 rotate-0' : 'bg-primary'
                }`}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    </div>
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
                    isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                style={{ maxHeight: 'calc(100vh - 150px)' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 px-4 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Health Assistant</h3>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Online - Ready to help
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            title="Clear chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="h-[380px] overflow-y-auto p-4 space-y-4 bg-gray-50 chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="chatbot-message">
                            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[90%] px-4 py-3 rounded-2xl ${
                                        msg.role === 'user'
                                            ? 'bg-primary text-white rounded-br-md'
                                            : 'bg-white text-gray-800 shadow-sm rounded-bl-md border border-gray-100'
                                    }`}
                                >
                                    <div className="text-sm leading-relaxed">
                                        {msg.role === 'user' ? msg.content : formatMessage(msg.content)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Doctor Cards */}
                            {msg.doctors && msg.doctors.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {msg.doctors.slice(0, 2).map((doctor, docIndex) => (
                                        <div 
                                            key={docIndex}
                                            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                                        >
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                {doctor.image ? (
                                                    <img src={doctor.image} alt={doctor.name} className="w-12 h-12 rounded-full object-cover" />
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">Dr. {doctor.name}</p>
                                                <p className="text-xs text-gray-500">{doctor.speciality}</p>
                                                <p className="text-xs text-primary font-medium">₹{doctor.fees} • {doctor.experience}</p>
                                            </div>
                                            <button
                                                onClick={() => handleBookDoctor(doctor._id)}
                                                className="px-3 py-1.5 bg-primary text-white text-xs rounded-full hover:bg-primary/90 transition-colors flex-shrink-0"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    ))}
                                    
                                    {/* View All Doctors Button */}
                                    {msg.specialty && (
                                        <button
                                            onClick={() => handleViewSpecialty(msg.specialty)}
                                            className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            View all {msg.specialty}s
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start chatbot-message">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length <= 2 && (
                    <div className="px-4 py-2 bg-white border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Common issues:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-full transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Describe your symptoms..."
                            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!inputMessage.trim() || isLoading}
                            className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                        For emergencies, call 108 immediately
                    </p>
                </div>
            </div>
        </>
    );
};

export default ChatBot;
