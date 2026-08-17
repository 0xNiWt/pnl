import type { Metadata } from "next";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh flex flex-col bg-background">
            <Header />
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}