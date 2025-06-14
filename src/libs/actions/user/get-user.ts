import { Validator } from "@/utils/validator";

export default async function getUser(userId: string) {
    if (!Validator.isValidUUID(userId)) {
      throw 'Invalid User ID';
    }

    const response = await fetch('/api/profiles?id='+userId, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
  
    if (response.ok) {
      return data;
    } else {
      throw data.error;
    }
  }