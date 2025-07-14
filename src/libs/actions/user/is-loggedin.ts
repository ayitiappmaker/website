export default async function isLoggedIn(): Promise<boolean> {
    const response = await fetch('/api/users/is-loggedin', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
  
    console.log('isLoggedIn', {data});
    
    if (response.ok) {
      return true;
    } else {
      throw data.error;
    }
  }