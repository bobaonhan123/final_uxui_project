import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LoadingScreen } from '../src/components';

export default function Index() {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return <Redirect href="/(tabs)" />;
}
