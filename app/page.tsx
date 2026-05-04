import EraTimeline from '@/components/EraTimeline';
import DishGraph from '@/components/DishGraph';
import DishPanel from '@/components/DishPanel';

export default function Home() {
  return (
    <div className="flex h-full overflow-hidden">
      <EraTimeline />
      <DishGraph />
      <DishPanel />
    </div>
  );
}
