import { useState } from 'react';
import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { Link2, Sparkles, Shield, BarChart3, ArrowRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function Home() {
  const { user, signIn } = useAuth();
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url) return;

    if (!user) {
      await signIn();
      return;
    }

    setLoading(true);
    try {
      const slug = customSlug.trim() || nanoid(7);
      
      // Check if slug exists
      const q = query(collection(db, 'links'), where('slug', '==', slug));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        throw new Error('This alias is already taken. Please try another one.');
      }

      const linkData = {
        slug,
        originalUrl: url.startsWith('http') ? url : `https://${url}`,
        userId: user.uid,
        createdAt: serverTimestamp(),
        clicks: 0,
        title: '',
        isPrivate: false
      };

      await addDoc(collection(db, 'links'), linkData);
      setResult(`${window.location.origin}/b/${slug}`);
      setUrl('');
      setCustomSlug('');
    } catch (error: any) {
      setError(error.message || "Error shortening link");
      console.error("Error shortening link:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center space-x-2 bg-neutral-100 px-3 py-1 rounded-full text-xs font-semibold text-neutral-600 mb-6 border border-neutral-200 uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              <span>Next Generation Link Management</span>
            </span>
            <h1 className="heading-display text-5xl md:text-7xl lg:text-8xl mb-6">
              Shorten links.<br />
              Grow massive <span className="text-neutral-400">reach.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-neutral-500 text-lg md:text-xl leading-relaxed">
              Professional-grade link shortener designed for performance and analytics. 
              Get custom aliases, track clicks in real-time, and manage everything in one sleek dashboard.
            </p>
          </motion.div>
        </div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <div className="bg-white p-3 rounded-3xl shadow-2xl shadow-neutral-200 border border-neutral-100">
            <form onSubmit={handleShorten} className="space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Paste your long link here..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-black transition-all outline-none"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="relative md:w-48">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium font-mono text-sm leading-none pt-0.5">/</span>
                  <input
                    type="text"
                    placeholder="custom-alias"
                    className="w-full pl-7 pr-4 py-4 rounded-2xl bg-neutral-50 border-none focus:ring-2 focus:ring-black transition-all outline-none text-sm font-mono"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 min-w-[140px]"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Shorten</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-red-500 text-sm font-medium text-center"
              >
                {error}
              </motion.p>
            )}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 bg-neutral-900 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl"
              >
                <div className="flex-1 mr-4 overflow-hidden">
                  <p className="text-neutral-400 text-xs mb-1 uppercase tracking-widest font-bold">Your Shortened Link</p>
                  <p className="text-lg font-mono truncate">{result}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all relative"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <FeatureCard 
            icon={<Shield className="h-6 w-6" />}
            title="Premium Bridge"
            description="Professional bridge pages with customizable timers and security checks before redirection."
          />
          <FeatureCard 
            icon={<BarChart3 className="h-6 w-6" />}
            title="Advanced Analytics"
            description="Track every click with detailed data on geography, referrers, and device types in real-time."
          />
          <FeatureCard 
            icon={<Sparkles className="h-6 w-6" />}
            title="Custom Aliases"
            description="Create memorable short links that match your brand identity and improve click-through rates."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-neutral-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="font-display font-bold text-xl mb-3">{title}</h3>
      <p className="text-neutral-500 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  );
}
