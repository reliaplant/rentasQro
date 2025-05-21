import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'introduccion', title: '1. Introducción' },
  { id: 'que-son', title: '2. ¿Qué son las Cookies?' },
  { id: 'tipos', title: '3. Tipos de Cookies que utilizamos' },
  { id: 'para-que', title: '4. ¿Para qué utilizamos Cookies?' },
  { id: 'administrar', title: '5. ¿Cómo administrar las Cookies?' },
  { id: 'cambios', title: '6. Cambios en esta Política de Cookies' },
  { id: 'contacto', title: '7. Contacto' },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Política de Cookies" />
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
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">Política de Cookies</h1>
                <p className="text-sm text-gray-500">Última actualización: 21 de mayo de 2025</p>
              </div>
              
              <section id="introduccion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Introducción</h2>
                <p className="text-gray-600 mb-4">
                  Grupo Pizo S. de R.L. de C.V., mejor conocido como "Pizo", utiliza cookies y tecnologías similares en su sitio web para mejorar la experiencia de navegación de los usuarios, entender el uso que hacen del sitio y optimizar los servicios ofrecidos.
                </p>
                <p className="text-gray-600 mb-4">
                  Al utilizar nuestro sitio web, usted acepta el uso de cookies conforme a esta política y a nuestros <a href="/legal/tyc" className="text-violet-600 hover:underline">Términos y Condiciones</a>.
                </p>
              </section>
              
              <section id="que-son">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. ¿Qué son las Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  Las cookies son pequeños archivos de texto almacenados en su navegador o dispositivo que permiten a los sitios web recordar información sobre su visita, como preferencias de navegación y datos para mejorar la experiencia del usuario.
                </p>
              </section>
              
              <section id="tipos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Tipos de Cookies que utilizamos</h2>
                <p className="text-gray-600 mb-2">
                  <strong>Cookies esenciales:</strong> Son necesarias para el funcionamiento básico del sitio web, permitiendo el acceso a áreas seguras y funciones esenciales.
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Cookies analíticas:</strong> Nos permiten analizar el comportamiento del usuario y cómo interactúa con el sitio para mejorar nuestra plataforma y servicios.
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Cookies publicitarias:</strong> Son utilizadas para mostrar anuncios relevantes a los intereses del usuario, basados en su navegación anterior en nuestro sitio web.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Cookies de terceros:</strong> Algunas funcionalidades en nuestro sitio web provienen de terceros, como mapas interactivos o contenido incrustado (ej.: reseñas de Google, videos de YouTube, mapas de Mapbox, etc.). Estos terceros pueden usar cookies para recopilar información sobre su visita.
                </p>
              </section>
              
              <section id="para-que">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. ¿Para qué utilizamos Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  Utilizamos cookies para:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li>Recordar preferencias de usuario, como idioma o configuración del sitio.</li>
                  <li>Analizar el tráfico y comportamiento en nuestro sitio para optimizar la experiencia del usuario.</li>
                  <li>Realizar marketing dirigido utilizando inteligencia artificial para personalizar el contenido y publicidad.</li>
                  <li>Administrar leads y datos relacionados generados a través del sitio web.</li>
                </ul>
              </section>
              
              <section id="administrar">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. ¿Cómo administrar las Cookies?</h2>
                <p className="text-gray-600 mb-4">
                  Usted puede controlar o eliminar cookies según lo desee. Puede eliminar todas las cookies que ya están en su equipo y configurar la mayoría de los navegadores para evitar que se instalen nuevas cookies. Sin embargo, si bloquea las cookies, es posible que algunas funcionalidades del sitio web no funcionen adecuadamente.
                </p>
                <p className="text-gray-600 mb-4">
                  Consulte las instrucciones específicas para gestionar cookies según su navegador:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-1">
                  <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Chrome</a></li>
                  <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Firefox</a></li>
                  <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Safari</a></li>
                  <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Edge</a></li>
                </ul>
              </section>
              
              <section id="cambios">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Cambios en esta Política de Cookies</h2>
                <p className="text-gray-600 mb-4">
                  Pizo se reserva el derecho a modificar esta Política en cualquier momento y sin previo aviso. Las modificaciones entrarán en vigor inmediatamente después de su publicación en nuestro sitio web.
                </p>
                <p className="text-gray-600 mb-4">
                  Esta política complementa nuestro <a href="/legal/privacidad" className="text-violet-600 hover:underline">Aviso de Privacidad</a>, que contiene información adicional sobre cómo protegemos sus datos personales.
                </p>
              </section>
              
              <section id="contacto">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Contacto</h2>
                <p className="text-gray-600 mb-4">
                  Para cualquier consulta, queja o solicitud relacionada con el uso de cookies, puede contactarnos al correo electrónico: <a href="mailto:info@pizo.mx" className="text-violet-600 hover:underline">info@pizo.mx</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
