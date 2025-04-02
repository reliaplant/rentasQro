import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'aceptacion', title: '1. Aceptación de los términos' },
  { id: 'servicios', title: '2. Servicios Inmobiliarios' },
  { id: 'precision', title: '3. Precisión de la Información' },
  { id: 'responsabilidades', title: '4. Responsabilidades del Usuario' }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Términos y Condiciones" />
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
              <section id="aceptacion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Aceptación de los términos</h2>
                <p className="text-gray-600 leading-relaxed">
                  Al acceder y utilizar los servicios de Rentas Qro, usted acepta estar sujeto a estos términos y condiciones.
                  Este acuerdo constituye un contrato legalmente vinculante entre usted y nuestra plataforma.
                </p>
              </section>
              
              <section id="servicios">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Servicios Inmobiliarios</h2>
                <p className="text-gray-600 leading-relaxed">
                  Rentas Qro actúa como una plataforma de conexión entre propietarios y posibles inquilinos.
                  No somos responsables de las transacciones realizadas entre las partes.
                </p>
              </section>
              
              <section id="precision">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Precisión de la Información</h2>
                <p className="text-gray-600 leading-relaxed">
                  La información presentada en las propiedades está basada en los datos proporcionados por los propietarios.
                  Si bien nos esforzamos por verificar la información, no podemos garantizar su total exactitud.
                </p>
              </section>
              
              <section id="responsabilidades">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Responsabilidades del Usuario</h2>
                <p className="text-gray-600 leading-relaxed">
                  Los usuarios se comprometen a proporcionar información verídica y actualizada,
                  así como a mantener la confidencialidad de sus credenciales de acceso.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
