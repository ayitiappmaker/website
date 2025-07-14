import { Locale } from "@/types/internationalization";

export const translations = {
    en: {
        welcomeMessage: "Hello ***! I'm your AI doctor. I can help assess your symptoms and provide general health information. Please describe what you're experiencing.",
    },
    ht: {
        welcomeMessage: "Bonjou ***, mwen se doktè entèlijan ou. Mwen ka ede w evalye sentòm yo epi bay enfòmasyon sou sante. Tanpri dekri sa w ap santi.",
    },
    fr: {
        welcomeMessage: "Bonjour ***, je suis votre médecin IA. Je peux vous aider à évaluer vos symptômes et à fournir des informations générales sur la santé. Veuillez décrire ce que vous ressentez.",
    }
}

export const getWelcomeMessage = (locale: Locale) => {
    if (!translations[locale]) {
      return translations.en.welcomeMessage;
    }
    return translations[locale].welcomeMessage;
};