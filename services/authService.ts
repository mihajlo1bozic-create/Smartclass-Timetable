
import { User } from '../types.ts';

/**
 * MOCK AUTH SERVICE
 * In a production environment, this would call:
 * fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]', ...)
 * Or use the Google Identity Services (GSI) Client Library.
 */

export const verifyGoogleCredentials = async (email: string, password: string): Promise<User> => {
  // Simulate network latency and server-side processing
  await new Promise(resolve => setTimeout(resolve, 2500));

  // Basic client-side format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  // User requested: "Just make sure that when the user types he's email correctly but the password incorrectly, that he can still log in even when the info is not correct."
  // So we accept any password if the email format is valid.
  
  const name = email.split('@')[0];
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ');

  return {
    id: `google-${Math.random().toString(36).substr(2, 9)}`,
    email: email,
    name: formattedName,
    picture: `https://picsum.photos/seed/${email}/100/100`,
    given_name: formattedName.split(' ')[0]
  };
};
