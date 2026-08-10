const ERROR_TRANSLATIONS: Record<string, string> = {
    'Invalid login credentials': 'Невірний email або пароль',
    'Email not confirmed': 'Підтвердіть email перед входом. Перевірте свою пошту',
    'User already registered': 'Користувач з такою поштою вже зареєстрований',
    'Password should be at least 6 characters': 'Пароль має містити щонайменше 6 символів',
    'Unable to validate email address: invalid format': 'Невірний формат email',
    'Email rate limit exceeded': 'Забагато спроб. Спробуйте пізніше',
    'Signup requires a valid password': 'Введіть коректний пароль',
    'User not found': 'Користувача не знайдено',
    'Token has expired or is invalid': 'Посилання застаріло або недійсне',
    'New password should be different from the old password':
        'Новий пароль має відрізнятися від попереднього',
};

const DEFAULT_MESSAGE = 'Сталася помилка. Спробуйте ще раз';

export function translateAuthError(message: string | undefined | null): string {
    if (!message) return DEFAULT_MESSAGE;

    if (ERROR_TRANSLATIONS[message]) {
        return ERROR_TRANSLATIONS[message];
    }

    const partialMatch = Object.keys(ERROR_TRANSLATIONS).find((key) =>
        message.toLowerCase().includes(key.toLowerCase())
    );
    if (partialMatch) {
        return ERROR_TRANSLATIONS[partialMatch];
    }

    return DEFAULT_MESSAGE;
}
