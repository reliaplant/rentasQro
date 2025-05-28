import CondoIndexBuilder from './condo-index-builder';

export default function AdminTools() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Herramientas Administrativas</h1>
      
      <div className="grid gap-8">
        <CondoIndexBuilder />
        {/* Add other admin tools here as needed */}
      </div>
    </div>
  );
}
