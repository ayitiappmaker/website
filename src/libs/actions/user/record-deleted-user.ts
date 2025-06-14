export default async function recordDeletedUser({ first_name, last_name, email, reason } :{ 
  first_name: string;
  last_name: string;
  email: string;
  reason: string | null;
}) {
    const response = await fetch('/api/profiles', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
          first_name,
          last_name,
          email,
          reason
       }),
    });
  
    const data = await response.json();
  
    if (response.ok) {
      return data;
    } else {
      throw data.error;
    }
  }