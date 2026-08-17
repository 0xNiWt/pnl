import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import gerb from "@/public/gerb.png";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh flex flex-col bg-background">
            <header className="px-6 py-4 border-b border-primary/10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors text-sm font-semibold">
                        <ArrowLeft size={16} />
                        На сайт
                    </Link>

                    <Link href="/profile" className="inline-flex items-center gap-2">
                        <Image src={gerb} alt="Герб ліцею" className="h-9 w-auto" />
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}