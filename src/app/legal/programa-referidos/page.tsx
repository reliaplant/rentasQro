import LegalHeader from '../components/legalHeader';

const sections = [
  { id: 'introduccion', title: 'Introducción' },
  { id: 'participantes', title: '1. ¿Quién puede participar?' },
  { id: 'referidos', title: '2. ¿Qué se puede referir?' },
  { id: 'validacion', title: '3. ¿Cómo se valida un referido?' },
  { id: 'recompensas', title: '4. Recompensas del programa' },
  { id: 'condiciones', title: '5. Condiciones generales' },
  { id: 'exclusiones', title: '6. Exclusiones' },
  { id: 'modificaciones', title: '7. Modificaciones' },
  { id: 'contacto', title: '8. Contacto' },
];

export default function ReferralProgramPage() {
  return (
    <div className="min-h-screen bg-white">
      <LegalHeader title="Programa de Referidos" />
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-3">Términos y Condiciones – Programa de Referidos Pizo</h1>
                <p className="text-sm text-gray-500">Vigente a partir del 21 de mayo de 2025</p>
              </div>
              
              <section id="introduccion">
                <p className="text-gray-600 leading-relaxed">
                  El programa de referidos de Grupo Pizo S. de R.L. de C.V., mejor conocido como Pizo, busca recompensar a las personas que nos acerquen nuevas oportunidades inmobiliarias que se conviertan en operaciones exitosas.
                </p>
              </section>
              
              <section id="participantes">
                <h2 className="text-xl font-medium text-gray-900 mb-4">1. ¿Quién puede participar?</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Cualquier persona mayor de edad que:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Refiera directamente a una persona interesada a través de mensaje, llamada o contacto con un asesor de Pizo, o</li>
                  <li>Comparta enlaces de propiedades de Pizo utilizando parámetros UTM personalizados como promotor.</li>
                </ul>
              </section>
              
              <section id="referidos">
                <h2 className="text-xl font-medium text-gray-900 mb-4">2. ¿Qué se puede referir?</h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Personas interesadas en rentar para vivir.</li>
                  <li>Propietarios que desean rentar su casa.</li>
                  <li>Personas interesadas en comprar o vender una propiedad.</li>
                </ul>
              </section>
              
              <section id="validacion">
                <h2 className="text-xl font-medium text-gray-900 mb-4">3. ¿Cómo se valida un referido?</h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Un referido se considera válido cuando:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Se comunica al asesor de Pizo antes de cualquier contacto previo.</li>
                  <li>Se genera a través de un enlace con parámetros UTM personalizados del promotor y se concreta la operación.</li>
                  <li>La propiedad o el cliente referido no se encuentra previamente registrado en la base de datos de Pizo.</li>
                  <li>La operación se concreta exitosamente: en el caso de renta, se firma contrato y se recibe el pago inicial; en venta, se formaliza la operación y se liquida el monto correspondiente.</li>
                </ul>
              </section>
              
              <section id="recompensas">
                <h2 className="text-xl font-medium text-gray-900 mb-4">4. Recompensas del programa</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo de referencia</th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Recompensa (MXN)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Referido que quiere rentar para vivir</td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">$3,000</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Referido que quiere rentar su casa</td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">$3,000</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">Referido que quiere comprar o vender</td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">$10,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              
              <section id="condiciones">
                <h2 className="text-xl font-medium text-gray-900 mb-4">5. Condiciones generales</h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Solo aplica para nuevas oportunidades. Si el referido o propiedad ya se encontraba en contacto con Pizo, no se considerará válida la comisión.</li>
                  <li>Las recompensas se pagan en pesos mexicanos (MXN) vía transferencia electrónica en un plazo de hasta 15 días hábiles tras el cierre exitoso.</li>
                  <li>En el caso de referencias por UTM, la visita o contacto generado debe provenir de un enlace compartido por el promotor y contener los parámetros correctamente configurados.</li>
                  <li>Las recompensas solo se otorgan una vez por oportunidad, independientemente del canal (directo o digital).</li>
                </ul>
              </section>
              
              <section id="exclusiones">
                <h2 className="text-xl font-medium text-gray-900 mb-4">6. Exclusiones</h2>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Empleados, socios o familiares directos de colaboradores de Pizo no pueden participar.</li>
                  <li>No se reconocerán referencias duplicadas, incompletas o con fines fraudulentos.</li>
                </ul>
              </section>
              
              <section id="modificaciones">
                <h2 className="text-xl font-medium text-gray-900 mb-4">7. Modificaciones</h2>
                <p className="text-gray-600 leading-relaxed">
                  Pizo se reserva el derecho de modificar o cancelar este programa en cualquier momento, sin necesidad de previo aviso. La versión vigente estará disponible en el sitio web.
                </p>
              </section>
              
              <section id="contacto">
                <h2 className="text-xl font-medium text-gray-900 mb-4">8. Contacto</h2>
                <p className="text-gray-600 leading-relaxed">
                  Para cualquier duda o aclaración sobre el programa, escribe a <a href="mailto:info@pizo.mx" className="text-violet-600 hover:underline">info@pizo.mx</a> con el asunto "Programa de Referidos".
                </p>
              </section>
              
              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Estos términos y condiciones se complementan con nuestros <a href="/legal/tyc" className="text-violet-600 hover:underline">Términos y Condiciones generales</a> y <a href="/legal/privacidad" className="text-violet-600 hover:underline">Aviso de Privacidad</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
