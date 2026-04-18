import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { LinkIcon, ArrowRight, ShieldCheck, Clock, ExternalLink, AlertCircle } from 'lucide-react';

export function Bridge() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkData, setLinkData] = useState<any>(null);
  const [seconds, setSeconds] = useState(5);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function fetchLink() {
      if (!slug) return;
      
      try {
        const q = query(collection(db, 'links'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError('Link not found or has been removed.');
          setLoading(false);
          return;
        }

        const docData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id;
        setLinkData({ ...docData, id: docId });

        // Record click stat lazily
        await updateDoc(doc(db, 'links', docId), {
          clicks: increment(1)
        });

        // Add detailed stat entry
        await addDoc(collection(db, 'links', docId, 'stats'), {
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          referer: document.referrer || 'direct',
          // More info could be collected here if using an IP/Geo service
        });

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError('An error occurred while fetching the link.');
        setLoading(false);
      }
    }

    fetchLink();
  }, [slug]);

  useEffect(() => {
    if (!loading && linkData && seconds > 0) {
      const timer = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (seconds === 0) {
      setIsReady(true);
    }
  }, [loading, linkData, seconds]);

  const handleContinue = () => {
    if (linkData?.originalUrl) {
      window.location.href = linkData.originalUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mb-4" />
          <p className="text-neutral-500 font-medium animate-pulse">Scanning link security...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-neutral-200 shadow-xl text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="heading-display text-2xl font-bold mb-4">Oops! Link Error</h2>
          <p className="text-neutral-500 mb-8">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        {/* Header decoration */}
        <div className="flex justify-center mb-8">
          <div className="bg-black p-3 rounded-2xl shadow-lg">
            <LinkIcon className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-2xl overflow-hidden relative">
          {/* Progress bar */}
          {!isReady && (
            <div className="absolute top-0 left-0 h-1 bg-black transition-all duration-1000 ease-linear" style={{ width: `${(1 - seconds/5) * 100}%` }} />
          )}

          <div className="text-center mb-10">
            <span className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-green-100">
              <ShieldCheck className="h-3 w-3" />
              <span>Security Check Passed</span>
            </span>
            <h2 className="heading-display text-3xl font-bold mb-2">Almost there!</h2>
            <p className="text-neutral-500">Your destination is verified and ready.</p>
          </div>

          {/* Ad Placeholder/Space */}
          <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl p-6 mb-10 text-center relative overflow-hidden group">
            <div className="relative z-10">
               <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-1">Sponsored Section</span>
               <p className="text-neutral-600 font-medium">Looking for professional hosting?</p>
               <p className="text-neutral-400 text-sm italic">Get 20% off with RSG-LINKS-PRO</p>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {!isReady ? (
                <motion.div 
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-neutral-100 py-6 px-8 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-6 w-6 text-neutral-400" />
                    <span className="font-bold text-neutral-600">Please wait...</span>
                  </div>
                  <div className="h-10 w-10 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center font-display font-bold text-xl">
                    {seconds}
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleContinue}
                  className="w-full bg-black text-white py-6 rounded-2xl font-bold text-xl hover:bg-neutral-800 transition-all flex items-center justify-center space-x-3 shadow-xl hover:shadow-neutral-200"
                >
                  <span>Continue to Destination</span>
                  <ArrowRight className="h-6 w-6" />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="pt-4 flex items-center justify-center space-x-2 text-neutral-400">
              <ExternalLink className="h-4 w-4" />
              <span className="text-xs">Destination: {new URL(linkData.originalUrl).hostname}</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-neutral-400 text-sm">
          Protected by <strong>RS Links</strong> Advanced Security Core
        </p>
      </motion.div>
    </div>
  );
}
