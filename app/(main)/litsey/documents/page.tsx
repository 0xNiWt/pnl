import DocumentsIntro from "@/components/litsey/DocumentsIntro";
import DocumentsList from "@/components/litsey/DocumentsList";
import ContactWithData from "@/components/contact/ContactWithData";

export default function DocumentsPage() {
    return (
        <main className="bg-background min-h-screen flex flex-col">
            <DocumentsIntro />
            <DocumentsList />
            <ContactWithData />
        </main>
    )
}
