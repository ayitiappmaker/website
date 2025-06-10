export default class Moment {
    static async delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    static year = new Date().getFullYear();
}