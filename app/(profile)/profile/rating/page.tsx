import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RatingBoard from "@/components/rating/RatingBoard";
import { getRatingSnapshot } from "@/lib/points";
import { getRatingVisibility } from "@/lib/ratingVisibility";
import { canManageRatingVisibility, getCurrentUserWithRoles } from "@/lib/roles";

// Рейтинг видно лише в кабінеті: сторінка лежить під /profile, а цей шлях
// proxy.ts закриває від неавторизованих. Вона залежить від ролі
// (адміністрація та модератор бачать приховані рейтинги), тож не кешується.
export const dynamic = 'force-dynamic';

export default async function ProfileRatingPage() {
    // Три запити до бази йдуть паралельно, таблиця приїжджає готовою
    // в HTML — браузеру не треба нічого доглядати після завантаження.
    const [snapshot, hidden, { roles }] = await Promise.all([
        getRatingSnapshot(),
        getRatingVisibility(),
        getCurrentUserWithRoles(),
    ]);

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col font-inter">
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 pt-10 md:pt-16">
                <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary/78 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Назад до профілю
                </Link>

                <div className="flex flex-col items-center md:items-start">
                    <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                        <span className="w-10 h-0.5 bg-secondary" />
                        Рейтинг
                    </span>
                    <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)]">
                        Рейтинг <span className="text-accent">ліцею</span>
                    </h1>
                    <p className="mt-5 text-base text-primary/85 max-w-[520px]">
                        Бали учнів і класів за активність у житті ліцею.
                    </p>
                </div>
            </section>

            <RatingBoard
                students={snapshot.students}
                classes={snapshot.classes}
                hidden={hidden}
                canSeeHidden={canManageRatingVisibility(roles)}
            />
        </main>
    );
}
