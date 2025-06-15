import { String } from "@/utils/string";

export default async function getUserByPhoneOrEmail(identifier: string) {
    if (!identifier) {
      throw 'identifier required';
    }

    const response = await fetch(`/api/profiles?${String.isEmail(identifier) ? 'email' : 'phone'}=`+identifier, {
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