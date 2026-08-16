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
        <header className="sticky top-0 z-50 bg-background px-4 py-4 border-b border-gray-800/20">
            <div className="md:max-w-7xl mx-auto relative">
                <div className="flex items-center justify-between md:gap-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image src={gerb} alt="Герб ліцею" className="h-16 w-auto" priority />
                        <h1 className="text-primary/60 text-[clamp(1rem,0.7143rem_+_0.5952vw,1.25rem)] font-inter font-bold">
                            Природничо-науковий ліцей №145
                        </h1>
                    </Link>

                    <Nav isLoggedIn={!!user} />

                    <AuthButtons isLoggedIn={!!user} />
                </div>
            </div>
        </header>
    );
}