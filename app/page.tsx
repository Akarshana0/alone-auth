import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root directly to dashboard (which handles its own auth routing)
  redirect('/dashboard');
}
