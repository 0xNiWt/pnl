import ContactWithData from "@/components/contact/ContactWithData";
import StaffDirectory from "@/components/profile/StaffDirectory";
import { getStaffDepartments } from "@/lib/staffData";

// export const dynamic = 'force-dynamic';

export default async function PedagogyPage() {
    const departments = await getStaffDepartments();

    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <section className="w-full max-w-7xl mx-auto px-5 md:px-6 pt-10 md:pt-16 text-center md:text-left">
                <span className="inline-flex items-center gap-2 font-plex text-[clamp(1rem,0.7rem+1vw,1.5rem)] font-bold uppercase tracking-[0.14em] text-secondary-deep mb-4">
                    <span className="w-10 h-0.5 bg-secondary" />
                    Ліцей №145
                </span>
                <h1 className="font-cormorant font-bold text-primary leading-[0.95] tracking-[-0.02em] text-[clamp(2.3rem,1.4rem+3.6vw,4.6rem)]">
                    Педагогічний колектив
                </h1>
                <p className="mt-5 text-base text-primary/85 max-w-[560px] mx-auto md:mx-0">
                    Досвідчені вчителі, методисти та заслужені педагоги України, які щодня працюють
                    заради якісної освіти учнів ліцею.
                </p>
            </section>

            <StaffDirectory departments={departments} />

            <ContactWithData />
        </main>
    )
}
