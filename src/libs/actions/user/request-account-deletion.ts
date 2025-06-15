import { String } from "@/utils/string";

export default async function requestAccountDeletion(identifier: string) {
    if (!identifier) {
      throw 'identifier required';
    }

    const payload = String.isEmail(identifier) ? { email: identifier } : { phone: identifier }
    const response = await fetch('/api/profiles', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      return data;
    } else {
      throw data.error;
    }
  }