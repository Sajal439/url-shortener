import { useUrlShortener } from './hooks/useUrlShortener';

export default function App() {
  const {
    url,
    setUrl,
    loading,
    result,
    error,
    setError,
    copied,
    shorten,
    copyToClipboard
  } = useUrlShortener();

  return (
    <main className="w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center relative z-10">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
          Shorter.
        </h1>
        <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
          A blazing fast, horizontally scalable URL shortener backed by Redis and Postgres.
        </p>
      </header>

      <section className="glass-card w-full max-w-2xl">
        <form onSubmit={shorten} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="url" 
              placeholder="Paste your long link here..." 
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              required
              disabled={loading}
              className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !url}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-slate-700 disabled:active:scale-100 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="spinner"></div> Shortening...</>
              ) : (
                'Shorten URL'
              )}
            </button>
          </div>
          
          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}
        </form>

        {result && (
          <div className="mt-10 pt-8 border-t border-white/10 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Your shortened link is ready
            </div>
            <div className="bg-slate-900/80 border border-blue-500/50 border-dashed rounded-xl p-5 flex justify-between items-center gap-4">
              <a 
                href={result.shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium text-lg truncate hover:underline transition-colors"
              >
                {result.shortUrl}
              </a>
              <button 
                type="button" 
                onClick={copyToClipboard}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex gap-4 mt-6">
              <div className="flex-1 bg-white/5 rounded-lg p-4 flex flex-col gap-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clicks</div>
                <div className="text-2xl font-bold text-white">{result.clicks || 0}</div>
              </div>
              <div className="flex-1 bg-white/5 rounded-lg p-4 flex flex-col gap-1">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</div>
                <div className="text-2xl font-bold text-white">Just now</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
