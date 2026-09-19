/**
 * Підпис у двох мовах для меню й кнопок. Google Translate перекладає такі
 * короткі слова навмання («Вступ» → «Introduction»), тож англійський варіант
 * задаємо самі; показується той, що відповідає <html lang> (див. globals.css).
 */
export default function Bi({ uk, en }: { uk: string; en: string }) {
    return (
        <>
            <span className="i18n-uk">{uk}</span>
            <span className="i18n-en notranslate" translate="no">{en}</span>
        </>
    );
}
