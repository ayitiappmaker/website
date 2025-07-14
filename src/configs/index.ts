export class Configs {
    static appName = 'SanteNow';
    static appDescription = 'The app aims to bridge the healthcare accessibility gap in Haiti by providing immediate, AI-powered medical guidance while respecting cultural context and language preferences.';
    static ENVIRONMENT = process.env.NODE_ENV;
    static IS_LOCAL = Configs.ENVIRONMENT === 'development';
    static IS_PROD = Configs.ENVIRONMENT === 'production';
    static MONGODB_URI = process.env.MONGODB_URI!;
    static API_KEY = process.env.SANTENOW_API_KEY!;
    static WEBSITE_URL = Configs.IS_LOCAL ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_WEBSITE_URL!;
}