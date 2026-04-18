import { useEffect, useState } from 'react';
import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { 
  BarChart3, 
  Trash2, 
  ExternalLink, 
  MousePointer2, 
  Calendar, 
  Search, 
  Copy, 
  Check,
  TrendingUp,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLinks() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'links'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedLinks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLinks(fetchedLinks);
      } catch (error) {
        console.error("Error fetching links:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this link? This will also remove its analytics.')) {
      try {
        await deleteDoc(doc(db, 'links', id));
        setLinks(links.filter(link => link.id !== id));
      } catch (error) {
        console.error("Error deleting link:", error);
      }
    }
  };

  const copyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/b/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = links.filter(link => 
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClicks = links.reduce((acc, link) => acc + (link.clicks || 0), 0);

  if (loading) {
    return (
      <div className="pt-32 px-4 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-neutral-200 rounded-2xl w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-neutral-200 rounded-3xl" />
            <div className="h-32 bg-neutral-200 rounded-3xl" />
            <div className="h-32 bg-neutral-200 rounded-3xl" />
          </div>
          <div className="h-96 bg-neutral-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="heading-display text-4xl font-bold mb-2">Command Center</h1>
          <p className="text-neutral-500">Manage and track your shortened URLs performance.</p>
        </div>
        <div className="flex bg-white p-2 rounded-2xl border border-neutral-100 shadow-sm md:w-80">
          <Search className="h-5 w-5 text-neutral-400 ml-2 my-auto" />
          <input 
            type="text" 
            placeholder="Search links..." 
            className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard title="Total Links" value={links.length} icon={<Link2 className="h-5 w-5" />} />
        <StatCard title="Total Clicks" value={totalClicks} icon={<MousePointer2 className="h-5 w-5" />} />
        <StatCard title="Avg. Performance" value={links.length ? (totalClicks / links.length).toFixed(1) : 0} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-6 py-4 font-display font-bold text-xs uppercase tracking-widest text-neutral-500">Link Information</th>
                <th className="px-6 py-4 font-display font-bold text-xs uppercase tracking-widest text-neutral-500">Analytics</th>
                <th className="px-6 py-4 font-display font-bold text-xs uppercase tracking-widest text-neutral-500">Created</th>
                <th className="px-6 py-4 font-display font-bold text-xs uppercase tracking-widest text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <AnimatePresence>
                {filteredLinks.map((link) => (
                  <motion.tr 
                    key={link.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 mb-1 flex items-center gap-2">
                           /{link.slug}
                           <button 
                            onClick={() => copyLink(link.slug, link.id)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors text-neutral-400"
                           >
                             {copiedId === link.id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                           </button>
                        </span>
                        <span className="text-xs text-neutral-400 truncate max-w-xs">{link.originalUrl}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="bg-neutral-100 p-2 rounded-lg">
                          <BarChart3 className="h-4 w-4 text-neutral-600" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{link.clicks || 0}</p>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-tighter">Total Clicks</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2 text-neutral-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{link.createdAt ? format(link.createdAt.toDate(), 'MMM dd, yyyy') : 'Recently'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a 
                          href={`${window.location.origin}/b/${link.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded-xl transition-all"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => handleDelete(link.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredLinks.length === 0 && (
            <div className="py-24 text-center">
              <Link2 className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500">No links found. Start by creating one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center space-x-4">
      <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 italic">
        {icon}
      </div>
      <div>
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-display font-bold">{value}</p>
      </div>
    </div>
  );
}
