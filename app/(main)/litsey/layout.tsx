import LitseyNav from "@/components/litsey/LitseyNav";

export default function LitseyLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <LitseyNav />
            {children}
        </>
    );
}
