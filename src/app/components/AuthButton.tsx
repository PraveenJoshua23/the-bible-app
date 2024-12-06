// src/components/AuthButton.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';
import Image from 'next/image';

export const AuthButton = () => {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <Button 
      onClick={user ? signOut : signInWithGoogle}
      variant="outline"
      className="gap-2"
    >
      {user ? (
        <>
          <Image 
            src={user.photoURL || ''} 
            alt={user.displayName || ''} 
            width={24}
            height={24}
            className="rounded-full"
          />
          <LogOut className="h-4 w-4" />
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" />
          Sign in
        </>
      )}
    </Button>
  );
};