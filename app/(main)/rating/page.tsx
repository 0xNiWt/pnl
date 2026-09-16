import { redirect } from "next/navigation";

// Рейтинг переїхав у кабінет (/profile/rating). Старі посилання й закладки
// ведемо туди; неавторизованого proxy.ts далі відправить на вхід.
export default function RatingRedirect() {
    redirect("/profile/rating");
}
