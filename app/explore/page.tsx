import EraTimeline from '@/components/EraTimeline';
import DishGraph from '@/components/DishGraph';
import DishPanel from '@/components/DishPanel';

export const metadata = {
  title: 'La Table du Temps · 探索图谱',
};

export default function ExplorePage() {
  return (
    <div className="flex h-full overflow-hidden">
      <EraTimeline />
      <DishGraph />
      <DishPanel />
    </div>
  );
}
