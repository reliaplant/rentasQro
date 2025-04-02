import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'recoleccion', title: '1. Recolección de Datos' },
  { id: 'uso', title: '2. Uso de la Información' },
  { id: 'proteccion', title: '3. Protección de Datos' }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Política de Privacidad" />
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <nav className="md:w-64 flex-shrink-0 border-r border-gray-100">
            <div className="sticky top-6 p-6">
              <p className="text-xs font-medium text-gray-400 mb-4">CONTENIDO</p>
              <ul className="space-y-3">
                {sections.map(section => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-gray-600 hover:text-violet-600 block py-1 transition-colors"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 max-w-3xl p-6 md:p-10">
            <div className="space-y-12">
              <section id="recoleccion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Recolección de Datos</h2>
                <p className="text-gray-600 mb-4">
                  En Rentas Qro, recopilamos información personal cuando:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600">
                  <li>Se registra en nuestra plataforma</li>
                  <li>Solicita información sobre una propiedad</li>
                  <li>Contacta a un propietario o agente</li>
                  <li>Se suscribe a nuestras notificaciones</li>
                </ul>
              </section>

              <section id="uso">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Uso de la Información</h2>
                <p className="text-gray-600 mb-4">
                  Utilizamos su información para:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600">
                  <li>Personalizar su experiencia de búsqueda</li>
                  <li>Procesar sus solicitudes de contacto</li>
                  <li>Enviar notificaciones relevantes</li>
                  <li>Mejorar nuestros servicios</li>
                </ul>
              </section>

              <section id="proteccion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Protección de Datos</h2>
                <p className="text-gray-600 mb-8">
                  Implementamos medidas de seguridad robustas para proteger su información
                  de acuerdo con la Ley Federal de Protección de Datos Personales en
                  Posesión de los Particulares.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
