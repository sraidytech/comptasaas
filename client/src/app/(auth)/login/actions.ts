'use client';

// This is a client-side implementation since we're having issues with server actions
// In a real app, you would use server actions for authentication

interface LoginFormData {
  email: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  tenantId?: string;
}

export async function login(formData: LoginFormData): Promise<UserData> {
  // This is a mock implementation
  // In a real app, you would validate credentials against your backend API
  
  // Check if the user is the super admin
  const isSuperAdmin = formData.email === 'sracomconnect@gmail.com' && 
                       formData.password === 'SracomConnect@2025Sr';
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return user data
  return {
    id: '1',
    email: formData.email,
    username: formData.email.split('@')[0],
    role: isSuperAdmin ? 'SUPER_ADMIN' : 'ADMIN',
    tenantId: isSuperAdmin ? undefined : '1',
  };
}

export async function logout(): Promise<void> {
  // Clear user data from localStorage
  localStorage.removeItem('user');
  
  // In a real app, you would also invalidate the session on the server
  
  // Redirect is handled by the component that calls this function
}
