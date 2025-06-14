import { Validator } from "@/utils/validator";

export default async function deleteUser(userId: string) {
    if (!Validator.isValidUUID(userId)) {
      throw 'Invalid User ID';
    }
  
    const response = await fetch('/api/profiles', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      return data;
    } else {
      throw data.error;
    }
  }