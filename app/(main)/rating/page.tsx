import ContactWithData from "@/components/contact/ContactWithData";
import RatingBoard from "@/components/rating/RatingBoard";
import { getRatingSnapshot } from "@/lib/points";
import { getRatingVisibility } from "@/lib/ratingVisibility";
import { canManageRatingVisibility, getCurrentUserWithRoles } from "@/lib/roles";

// Сторінка залежить від ролі (адміністрація та модератор бачать приховані
// рейтинги), тому кешувати її на весь ліцей не можна.
export const dynamic = 'force-dynamic';

export default async function RatingPage() {
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
                <div className="flex flex-col items-center md:items-start">
                    <span className="inline-flex items-center gap-2 font-plex text-[10px] uppercase tracking-[0.22em] text-primary/45 mb-4">
                        <span className="w-6 h-px bg-accent" />
                        Рейтинг
                    </span>
                    <h1 className="font-cormorant font-semibold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)]">
                        Рейтинг <span className="text-accent">ліцею</span>
                    </h1>
                    <p className="mt-5 text-base text-primary/70 max-w-[520px]">
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

            <div className="mt-auto">
                <ContactWithData />
            </div>
        </main>
    );
}
