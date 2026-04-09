export default function Messages() {
  const threads = [
    { name: "Aminata Jallow", msg: "Is this property still available?", time: "2h ago", unread: 2 },
    { name: "Lamin Dibba", msg: "Can we schedule a viewing tomorrow?", time: "Yesterday", unread: 0 },
    { name: "Fatou Ceesay", msg: "What is the minimum lease term?", time: "3d ago", unread: 1 },
  ];

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Messages</h1>
      <p className="text-stone-500 mb-8">Chat with buyers and sellers.</p>
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100 h-[500px]">
          {/* Thread list */}
          <div className="overflow-y-auto">
            {threads.map((t) => (
              <div key={t.name} className="flex items-start gap-3 px-4 py-4 hover:bg-stone-50 cursor-pointer transition-colors border-b border-stone-50 last:border-0">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-900 text-sm">{t.name}</span>
                    <span className="text-xs text-stone-400">{t.time}</span>
                  </div>
                  <p className="text-xs text-stone-500 truncate mt-0.5">{t.msg}</p>
                </div>
                {t.unread > 0 && (
                  <span className="w-5 h-5 bg-brand-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0">{t.unread}</span>
                )}
              </div>
            ))}
          </div>
          {/* Chat area */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center p-8">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-semibold text-stone-800 mb-2">Select a conversation</h3>
            <p className="text-sm text-stone-400">Choose a thread from the left to start chatting.</p>
            <p className="text-xs text-stone-300 mt-4 italic">Full chat functionality coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
