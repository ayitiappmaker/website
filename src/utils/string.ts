export class String {
    static getInitials(input: string, maxLetters: number = 2): string {
        if (!input || typeof input !== 'string') {
          return '';
        }
      
        return input
          .trim()
          .split(/\s+/) // Split by whitespace
          .filter(word => word.length > 0) // Remove empty strings
          .slice(0, maxLetters) // Limit number of words
          .map(word => word.charAt(0).toUpperCase()) // Get first letter and uppercase
          .join('');
      }

    static isEmail(identifier: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    }

    static extractWord(str: string, position: number) {
      if(!str) return '';
      const _position = position <= -1 ? 0 : position; 
      return str.trim().split(/\s+/)[_position]
  }   
}