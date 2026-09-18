import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Quote,
  FileText,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AssistantMessage, RAGCitation } from '../types';
import { askCaseAssistant } from '../api';

interface CaseAssistantDrawerProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectCitation?: (citation: RAGCitation) => void;
}

export const CaseAssistantDrawer: React.FC<CaseAssistantDrawerProps> = ({
  caseId,
  isOpen,
  onClose,
  onSelectCitation,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'I am TRACE Case Assistant. I answer questions strictly using retrieved case records (surveillance logs, transaction ledgers, call detail records, registry data, and OCR extractions). Ask about connections, conflicting statements, or newly integrated evidence.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const sampleQueries = [
    'What connects Arun Patel and Elena Rostova?',
    'What changed after the latest evidence was uploaded?',
    'Which documents mention vehicle V-7892?',
    'What contradictions exist in this case?',
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askCaseAssistant(caseId, q);
      setMessages(prev => [...prev, response]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Unable to retrieve case intelligence: ${err.message || 'Server error'}. Please verify query parameters.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="w-[420px] bg-white border-l border-[#DDDFD7] flex flex-col h-full shrink-0 shadow-xl z-30 fixed right-0 top-0 bottom-0">
      {/* Header */}
      <div className="h-14 px-4 border-b border-[#DDDFD7] flex items-center justify-between bg-[#F6F5F1]">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-[#355B4C] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#222824]">Case Assistant</div>
            <div className="text-[10px] text-[#626B65] font-mono">Grounded RAG Intelligence</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#626B65] hover:text-[#222824] hover:bg-[#EFEDE7] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-1.5 ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-[10px] text-[#626B65]">
              {msg.role === 'user' ? (
                <>
                  <span>Investigator</span>
                  <User className="w-3 h-3 text-[#626B65]" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-[#355B4C]" />
                  <span>TRACE Intelligence</span>
                </>
              )}
            </div>

            <div
              className={`p-3 rounded-lg text-xs leading-relaxed max-w-[92%] ${
                msg.role === 'user'
                  ? 'bg-[#355B4C] text-white'
                  : 'bg-[#F6F5F1] text-[#222824] border border-[#DDDFD7]'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Citations block */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#DDDFD7]/80 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-[#626B65] tracking-wider font-semibold">
                    Retrieved Evidence Citations ({msg.citations.length})
                  </div>
                  <div className="space-y-1">
                    {msg.citations.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSelectCitation && onSelectCitation(c)}
                        className="w-full text-left p-1.5 rounded bg-white hover:bg-[#E7EEE9] border border-[#DDDFD7] transition-colors group flex items-start justify-between space-x-2"
                      >
                        <div className="truncate text-[11px]">
                          <div className="font-semibold text-[#29483C] group-hover:underline flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-[#355B4C] shrink-0" />
                            <span className="truncate">{c.filename}</span>
                            <span className="text-[10px] font-mono text-[#626B65] shrink-0">
                              ({c.pageOrRow})
                            </span>
                          </div>
                          <div className="text-[10px] text-[#626B65] italic truncate mt-0.5">
                            "{c.quotation}"
                          </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-[#9DA39E] group-hover:text-[#355B4C] shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-[#626B65] p-2 bg-[#F6F5F1] rounded border border-[#DDDFD7]">
            <Sparkles className="w-3.5 h-3.5 text-[#355B4C] animate-spin" />
            <span>Scanning case records and graph paths...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts if few messages */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[#DDDFD7] bg-[#F6F5F1]/60">
          <div className="text-[10px] uppercase font-mono text-[#626B65] mb-1.5">
            Suggested Verification Prompts
          </div>
          <div className="flex flex-wrap gap-1">
            {sampleQueries.map(sq => (
              <button
                key={sq}
                onClick={() => handleSend(sq)}
                className="text-left text-[11px] px-2 py-1 bg-white hover:bg-[#E7EEE9] border border-[#DDDFD7] rounded text-[#222824] transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 border-t border-[#DDDFD7] bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask across case evidence..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-[#F6F5F1] border border-[#DDDFD7] rounded-md focus:bg-white focus:outline-none focus:border-[#355B4C] transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-2 rounded-md bg-[#355B4C] text-white hover:bg-[#29483C] disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[10px] text-[#626B65] mt-1.5 flex items-center justify-between">
          <span>Answers strictly grounded in case records</span>
          <span className="font-mono">RAG v2.1</span>
        </div>
      </div>
    </aside>
  );
};
