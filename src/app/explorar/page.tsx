import FilterExplorador from '../components/filterExplorador';
import Explorador from '../components/explorador';

export default function ExplorarPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <FilterExplorador />
      <Explorador />
    </main>
  );
}