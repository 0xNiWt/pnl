import VstupHero from "@/components/vstup/VstupHero";
import AdmissionRules from "@/components/vstup/AdmissionRules";
import ExamTopics from "@/components/vstup/ExamTopics";
import PrepCourses from "@/components/vstup/PrepCourses";
import ContactWithData from "@/components/contact/ContactWithData";

export default function VstupPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <VstupHero />
            <AdmissionRules />
            <ExamTopics />
            <PrepCourses />
            <ContactWithData />
        </main>
    )
}
