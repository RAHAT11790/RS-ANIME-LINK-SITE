import { LinkIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-black p-1.5 rounded-lg">
            <LinkIcon className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">RS Links</span>
        </div>
        <p className="text-neutral-500 text-sm text-center">
          Professional Link Shortener. Manage, track, and optimize your links.
        </p>
        <div className="mt-8 pt-8 border-t border-neutral-100 w-full text-center text-neutral-400 text-xs">
          &copy; {new Date().getFullYear()} RS Links. All rights reserved. Professional Grade.
        </div>
      </div>
    </footer>
  );
}
