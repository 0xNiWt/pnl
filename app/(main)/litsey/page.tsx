import { redirect } from "next/navigation";

// Сторінка про ліцей переїхала на головну. Стару адресу лишаємо робочою:
// на неї є посилання ззовні та в підменю розділів.
export default function LitseyPage() {
    redirect("/");
}
