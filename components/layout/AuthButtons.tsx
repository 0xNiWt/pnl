import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Bi from "./Bi";
import { SHOW_SHOP } from "./siteConfig";

// Кнопки набрані моношрифтом і мають волосяні межі замість жирних рамок:
// та сама мова, що й у решті інтерфейсу.
const BASE =
    "inline-flex items-center justify-center border px-5 py-3 font-plex text-[14px] font-bold uppercase tracking-[0.16em] transition-colors";

export default function AuthButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {/* Магазин доступний і гостям: подивитися вітрину можна без входу,
                а купити за бали — вже ні. Зараз прихований (siteConfig.ts). */}
            {SHOW_SHOP && (
                <Link
                    href="/shop"
                    aria-label="Магазин мерчу"
                    title="Магазин мерчу"
                    className="border border-primary/25 p-3 text-primary/85 transition-colors hover:border-primary hover:bg-primary hover:text-background"
                >
                    <ShoppingCart size={20} />
                </Link>
            )}

            {isLoggedIn ? (
                <Link
                    href="/profile"
                    className={`${BASE} border-primary bg-primary text-background hover:bg-accent hover:border-accent hover:text-primary`}
                >
                    <Bi uk="Кабінет" en="My account" />
                </Link>
            ) : (
                <>
                    <Link
                        href="/auth/login"
                        className={`${BASE} border-primary/25 text-primary/85 hover:border-primary hover:text-primary`}
                    >
                        <Bi uk="Вхід" en="Log in" />
                    </Link>
                    <Link
                        href="/auth/register"
                        className={`${BASE} border-primary bg-primary text-background hover:bg-accent hover:border-accent hover:text-primary`}
                    >
                        <Bi uk="Реєстрація" en="Sign up" />
                    </Link>
                </>
            )}
        </div>
    );
}
