import { ScreenTransition } from '@/components/ScreenTransition';
import { HomeContent } from '@/components/screens/HomeContent';

export default function HomeScreen() {
  return (
    <ScreenTransition associatedPath="/">
      <HomeContent />
    </ScreenTransition>
  );
}
