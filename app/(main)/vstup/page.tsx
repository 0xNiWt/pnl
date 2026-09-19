import VstupHero from "@/components/vstup/VstupHero";
import AdmissionRules from "@/components/vstup/AdmissionRules";
import ExamTopics from "@/components/vstup/ExamTopics";
import SampleTests from "@/components/vstup/SampleTests";
import PrepCourses from "@/components/vstup/PrepCourses";
import ContactWithData from "@/components/contact/ContactWithData";

export default function VstupPage() {
    return (
        <main className="paper-grid bg-background min-h-screen flex flex-col">
            <VstupHero />
            <AdmissionRules />
            <ExamTopics />
            <SampleTests />
            <PrepCourses />
            <ContactWithData />
        </main>
    )
}
