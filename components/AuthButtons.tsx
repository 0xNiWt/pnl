import Link from "next/link";

export default function AuthButtons({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
                <Link
                    href="/profile"
                    className="rounded-xl border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2 px-4 active:scale-95 transition-transform"
                >
                    Кабінет
                </Link>
            ) : (
                <>
                    <Link
                        href="/auth/login"
                        className="rounded-xl border-2 border-primary font-inter font-bold text-sm text-primary tracking-wide py-2 px-4 hover:bg-primary hover:text-background active:scale-95 transition-all"
                    >
                        Вхід
                    </Link>
                    <Link
                        href="/auth/register"
                        className="rounded-xl border-2 border-primary bg-primary font-inter font-bold text-sm text-background tracking-wide py-2 px-4 active:scale-95 transition-transform"
                    >
                        Реєстрація
                    </Link>
                </>
            )}
        </div>
    );
}
