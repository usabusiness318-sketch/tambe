import React, { useEffect, useState } from "react";
import { fetchEmails, sendEmail, GmailMessage } from "../lib/gmail";
import { Mail, RefreshCw, Send, Plus, Inbox, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { useAI } from "../hooks/useAI";

export function InboxView() {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [isComposing, setIsComposing] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState("");

  const { generateInsight, loading: aiLoading } = useAI();

  const handleDraftAI = async () => {
    if (!draftPrompt) return;
    try {
      const draftContext = {
        to,
        subject,
        userPrompt: draftPrompt
      };
      const result = await generateInsight(draftContext, "email_draft");
      setMessage(result);
    } catch (e: any) {
      alert("Failed to generate draft: " + e.message);
    }
  };

  const loadEmails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchEmails(15);
      setEmails(data);
    } catch (err: any) {
      setError(err.message || "Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !message) return;
    
    // Check confirmation (destructive/modifying operation)
    const confirmed = window.confirm(`Send email to ${to}?`);
    if (!confirmed) return;

    try {
      setSending(true);
      await sendEmail(to, subject, message);
      setIsComposing(false);
      setTo("");
      setSubject("");
      setMessage("");
      alert("Email sent successfully!");
    } catch (err: any) {
      alert("Failed to send email: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col relative z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Inbox</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your business communication via Gmail.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadEmails}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all shadow-inner"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={() => setIsComposing(!isComposing)}
            className="flex items-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Compose
          </button>
        </div>
      </div>

      {isComposing && (
        <form onSubmit={handleSend} className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-4 flex-shrink-0 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <h3 className="text-sm font-semibold text-white mb-4 relative z-10">New Message</h3>
          <div className="space-y-4 relative z-10">
            <div>
              <input
                type="email"
                placeholder="To:"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full bg-black/20 border-b border-white/10 px-3 py-3 text-sm text-white focus:ring-0 focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-500 rounded-t-xl"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Subject:"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-black/20 border-b border-white/10 px-3 py-3 text-sm text-white focus:ring-0 focus:border-indigo-500 outline-none transition-colors placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Message body..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mt-2 placeholder:text-slate-500 transition-all"
                required
              />
            </div>

            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 mt-4 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Ask AI to draft this email... (e.g. 'Politely decline the vendor offer')"
                value={draftPrompt}
                onChange={e => setDraftPrompt(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-500 transition-all"
              />
              <button
                type="button"
                onClick={handleDraftAI}
                disabled={aiLoading || !draftPrompt}
                className="flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
              >
                {aiLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Draft with AI
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 relative z-10">
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      )}

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-400 text-sm shadow-inner">
          {error}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            {emails.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <Inbox className="w-8 h-8 text-indigo-400" />
                </div>
                <p>No messages found in your inbox.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {emails.map(email => (
                  <div
                    key={email.id}
                    className={cn(
                      "p-5 hover:bg-white/5 transition-colors flex gap-4 items-start cursor-default group",
                      email.isUnread ? "bg-indigo-500/5" : ""
                    )}
                  >
                    <div className="mt-1 w-10 h-10 rounded-full bg-white/10 border border-white/5 flex items-center justify-center flex-shrink-0 text-white font-medium text-sm shadow-inner">
                      {email.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={cn("text-sm truncate", email.isUnread ? "font-bold text-white" : "font-medium text-slate-300 group-hover:text-slate-200")}>
                          {email.from.split('<')[0].replace(/"/g, '').trim()}
                        </span>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-4 group-hover:text-slate-400 transition-colors">
                          {email.date.substring(0, 16)}
                        </span>
                      </div>
                      <h4 className={cn("text-sm mb-1 truncate", email.isUnread ? "font-semibold text-white" : "font-medium text-slate-300 group-hover:text-slate-200")}>
                        {email.subject}
                      </h4>
                      <p className="text-sm text-slate-400 truncate group-hover:text-slate-300 transition-colors">{email.snippet}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="p-12 text-center text-sm text-slate-400 flex justify-center items-center gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                    Loading emails...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
