import Link from "next/link";
import { ShoppingCart } from "lucide-react";

// Кнопки набрані моношрифтом і мають волосяні межі замість жирних рамок:
// та сама мова, що й у решті інтерфейсу.
const BASE =
    "inline-flex items-center justify-center border px-4 py-2.5 font-plex text-[11px] uppercase tracking-[0.18em] transition-colors";

export default function AuthButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <div className="hidden md:flex items-center gap-2">
            {/* Магазин доступний і гостям: подивитися вітрину можна без входу,
                а купити за бали — вже ні. */}
            <Link
                href="/shop"
                aria-label="Магазин мерчу"
                title="Магазин мерчу"
                className="border border-primary/25 p-2.5 text-primary/70 transition-colors hover:border-primary hover:bg-primary hover:text-background"
            >
                <ShoppingCart size={17} />
            </Link>

            {isLoggedIn ? (
                <Link
                    href="/profile"
                    className={`${BASE} border-primary bg-primary text-background hover:bg-accent hover:border-accent hover:text-primary`}
                >
                    Кабінет
                </Link>
            ) : (
                <>
                    <Link
                        href="/auth/login"
                        className={`${BASE} border-primary/25 text-primary/70 hover:border-primary hover:text-primary`}
                    >
                        Вхід
                    </Link>
                    <Link
                        href="/auth/register"
                        className={`${BASE} border-primary bg-primary text-background hover:bg-accent hover:border-accent hover:text-primary`}
                    >
                        Реєстрація
                    </Link>
                </>
            )}
        </div>
    );
}
