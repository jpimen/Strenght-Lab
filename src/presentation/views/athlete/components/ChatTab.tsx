import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Video, File } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  id: string;
  text: string;
  sender: 'coach' | 'athlete';
  timestamp: string;
  type: 'text' | 'video' | 'file';
  url?: string;
  fileName?: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Form on the last set of squats looked a bit compromised at the bottom. Check this clip.',
    sender: 'coach',
    timestamp: '10:42 AM',
    type: 'text'
  },
  {
    id: '2',
    text: '',
    sender: 'coach',
    timestamp: '10:43 AM',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2019/08/17/26105-354316315_large.mp4' // placeholder
  },
  {
    id: '3',
    text: 'I felt my brace loosen up. I will try to stay tighter next time.',
    sender: 'athlete',
    timestamp: '11:05 AM',
    type: 'text'
  }
];

export default function ChatTab() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'coach', // active user is coach
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleFileUpload = (type: 'video' | 'file') => {
    // Mocking a file upload for demonstration
    const newMessage: Message = {
      id: Date.now().toString(),
      text: '',
      sender: 'coach',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: type,
      url: type === 'video' ? 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4' : undefined,
      fileName: type === 'file' ? 'Program_V3_Adjusted.pdf' : undefined
    };
    
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="panel h-[600px] flex flex-col p-0 fade-in duration-300">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h3 className="text-xs font-black tracking-widest text-iron-900 uppercase">
          COMMUNICATION_LINK
        </h3>
        <div className="text-[9px] font-mono tracking-widest text-iron-red font-bold uppercase animate-pulse">
          SECURE_CHANNEL // ACTIVE
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-white shrink">
        {messages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div key={msg.id} className={clsx("flex flex-col max-w-[80%]", isCoach ? "self-end items-end" : "self-start items-start")}>
              <span className="text-[9px] font-mono tracking-widest text-gray-400 mb-1 uppercase">
                {isCoach ? 'SYSTEM_COMMAND' : 'ATHLETE_RESPONSE'} // {msg.timestamp}
              </span>
              <div className={clsx(
                "p-4 border font-mono text-sm leading-relaxed",
                isCoach ? "bg-iron-900 text-white border-iron-900" : "bg-gray-50 text-iron-900 border-gray-200"
              )}>
                {msg.type === 'text' && (
                  <p>{msg.text}</p>
                )}
                
                {msg.type === 'video' && (
                  <div className="relative group cursor-pointer bg-black aspect-video flex items-center justify-center w-64 mt-1 border border-gray-700 overflow-hidden">
                    <Video className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 transition-opacity z-10 absolute" />
                    {msg.url && (
                      <video src={msg.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" muted />
                    )}
                    <div className="absolute top-2 right-2 bg-iron-red text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-widest z-10">
                      VIDEO_ATTACHMENT
                    </div>
                  </div>
                )}
                
                {msg.type === 'file' && (
                  <div className={clsx("flex items-center gap-3 p-3 border mt-1", isCoach ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white")}>
                    <File className={clsx("w-5 h-5", isCoach ? "text-gray-400" : "text-gray-500")} />
                    <span className="text-xs font-bold tracking-wider">{msg.fileName}</span>
                    <div className={clsx("ml-auto text-[9px] tracking-widest uppercase", isCoach ? "text-gray-500" : "text-gray-400")}>
                      FILE
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-gray-50 p-4 shrink-0">
        <div className="flex gap-2">
          <button 
            onClick={() => handleFileUpload('file')}
            className="p-3 text-gray-500 hover:text-iron-900 hover:bg-gray-200 transition-colors border border-transparent hover:border-gray-300"
            title="Attach Document"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleFileUpload('video')}
            className="p-3 text-gray-500 hover:text-iron-red hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
            title="Attach Video"
          >
            <Video className="w-5 h-5" />
          </button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="TRANSMIT_MESSAGE..." 
            className="flex-1 bg-white border border-gray-300 px-4 py-3 font-mono text-sm tracking-wide focus:outline-none focus:border-iron-900 focus:ring-1 focus:ring-iron-900 transition-all placeholder:text-gray-400 uppercase"
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="bg-iron-900 hover:bg-black text-white px-6 py-3 font-bold tracking-widest text-xs uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            SEND
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
