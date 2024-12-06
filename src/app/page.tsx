
import { AuthProvider } from '@/contexts/AuthContext';
import BibleApp from "./BibleApp"

export default function Page() {
  return (
    <AuthProvider>
      <BibleApp />
    </AuthProvider>
  );
}