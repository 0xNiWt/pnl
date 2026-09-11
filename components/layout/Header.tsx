import Image from "next/image";
import Link from "next/link";
import gerb from '@/public/gerb.png';
import Nav from './Nav';
import AuthButtons from './AuthButtons';
import { createClient } from '@/lib/server';

export default async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 z-50 border-b border-primary/15 bg-background">
            <div className="mx-auto max-w-7xl px-5 md:px-10">
                <div className="flex items-center justify-between gap-6 py-3.5 md:gap-12">
                    <Link href="/" className="group flex items-center gap-3">
                        <Image src={gerb} alt="Герб ліцею" className="h-12 w-auto md:h-14" priority />

                        <span className="flex flex-col">
                            <span className="font-cormorant text-[clamp(1.05rem,0.8rem+0.7vw,1.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-primary">
                                Природничо-науковий ліцей
                            </span>
                            {/* Номер закладу винесено в технічний рядок — як вихідні дані. */}
                            <span className="mt-0.5 font-plex text-[9px] uppercase tracking-[0.22em] text-primary/40">
                                № 145 · Київ · з 1962
                            </span>
                        </span>
                    </Link>

                    <Nav isLoggedIn={!!user} />

                    <AuthButtons isLoggedIn={!!user} />
                </div>
            </div>
        </header>
    );
}
