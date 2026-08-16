'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('/api/v1/auth/logout', { method: 'POST' });
            router.push('/auth/login');
            router.refresh();
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full mt-2 rounded-xl border border-accent/30 bg-accent/5 py-3 px-4 text-sm font-bold text-accent tracking-wide hover:bg-accent/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <LogOut size={16} />
            {loading ? 'Виходимо...' : 'Вийти з акаунту'}
        </button>
    );
}