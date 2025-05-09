import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'responsable', title: '1. Responsable' },
  { id: 'datos', title: '2. Datos Recopilados' },
  { id: 'finalidades', title: '3. Finalidades del Tratamiento' },
  { id: 'finalidades-secundarias', title: '4. Finalidades Secundarias' },
  { id: 'cookies', title: '5. Uso de Cookies' },
  { id: 'transferencias', title: '6. Transferencias de Datos' },
  { id: 'derechos', title: '7. Derechos ARCO' },
  { id: 'modificaciones', title: '8. Modificaciones al Aviso' },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Aviso de Privacidad" />
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
              <section id="responsable">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. Responsable</h2>
                <p className="text-gray-600 mb-8">
                  PIZO.MX, con domicilio en Querétaro, México, es responsable del tratamiento 
                  de los datos personales que usted nos proporciona.
                </p>
              </section>

              <section id="datos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. Datos Recopilados</h2>
                <p className="text-gray-600 mb-4">
                  Recopilamos los siguientes datos personales de forma directa, por medio del sitio web, 
                  formularios o en interacción con nuestros agentes:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600">
                  <li>Nombre completo</li>
                  <li>Teléfono</li>
                  <li>Correo electrónico</li>
                  <li>Dirección</li>
                  <li>Información relacionada con propiedades (propietario, arrendatario o comprador)</li>
                  <li>Identificación oficial (en caso de contratos)</li>
                  <li>Información financiera para pagos o depósitos (en caso necesario)</li>
                </ul>
              </section>

              <section id="finalidades">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. Finalidades del Tratamiento</h2>
                <p className="text-gray-600 mb-4">
                  Los datos personales serán utilizados para las siguientes finalidades primarias:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600">
                  <li>Contactarlo en relación con propiedades en venta o renta.</li>
                  <li>Enviarle información de inmuebles de acuerdo a sus intereses.</li>
                  <li>Brindar asesoría inmobiliaria personalizada.</li>
                  <li>Celebrar contratos de compraventa, renta, exclusividad o comisión.</li>
                  <li>Verificar su identidad y capacidad legal.</li>
                  <li>Gestionar pagos o depósitos (si aplica).</li>
                </ul>
              </section>

              <section id="finalidades-secundarias">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Finalidades Secundarias</h2>
                <p className="text-gray-600 mb-4">
                  Finalidades secundarias (opcional):
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600">
                  <li>Enviar promociones, boletines y ofertas especiales.</li>
                  <li>Realizar encuestas de satisfacción.</li>
                </ul>
              </section>

              <section id="cookies">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Uso de Cookies</h2>
                <p className="text-gray-600 mb-8">
                  Nuestro sitio puede utilizar cookies y otras tecnologías de rastreo para mejorar su 
                  experiencia de navegación y ofrecerle contenido personalizado. Puede deshabilitarlas desde 
                  la configuración de su navegador.
                </p>
              </section>

              <section id="transferencias">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Transferencias de Datos</h2>
                <p className="text-gray-600 mb-4">
                  Sus datos pueden ser compartidos con:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-600">
                  <li>Notarías, bancos o instituciones relacionadas con trámites inmobiliarios.</li>
                  <li>Proveedores de servicios administrativos o legales bajo acuerdos de confidencialidad.</li>
                </ul>
                <p className="text-gray-600 mb-8">
                  No se transferirá su información a terceros sin su consentimiento, salvo las 
                  excepciones previstas en la ley.
                </p>
              </section>

              <section id="derechos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Derechos ARCO</h2>
                <p className="text-gray-600 mb-4">
                  Usted tiene derecho de acceder, rectificar y cancelar sus datos personales, así como 
                  oponerse al tratamiento de los mismos. Puede ejercer estos derechos enviando una 
                  solicitud al correo: administracion@pizo.mx, con el asunto "Derechos ARCO".
                </p>
                <p className="text-gray-600 mb-4">
                  La solicitud debe contener:
                </p>
                <ul className="list-disc pl-6 mb-8 text-gray-600">
                  <li>Nombre completo y datos de contacto.</li>
                  <li>Descripción clara de los datos y el derecho que desea ejercer.</li>
                  <li>Documentos que acrediten su identidad.</li>
                </ul>
              </section>

              <section id="modificaciones">
                <h2 className="text-xl font-medium text-gray-900 mb-4">8. Modificaciones al Aviso</h2>
                <p className="text-gray-600 mb-4">
                  Este aviso de privacidad puede ser modificado en cualquier momento. Las actualizaciones 
                  serán publicadas en nuestro sitio web: www.pizo.mx/legal/privacidad
                </p>
                <p className="text-gray-600 mb-8">
                  Fecha de última actualización: 05 de mayo de 2025
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
