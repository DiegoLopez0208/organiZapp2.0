import { ScrollArea } from "@/components/ui/scroll-area";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-4xl  p-10 font-bold text-center text-green-500 mb-2">
              Política de Privacidad
            </h1>
            <p className="text-center text-gray-400">
              Última actualización: 13 de septiembre de 2023
            </p>
          </header>

          <section>
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              Introducción
            </h2>
            <p className="mb-4">
              Esta Política de Privacidad describe nuestras políticas y
              procedimientos sobre la recolección, uso y divulgación de su
              información cuando utiliza el Servicio y le informa sobre sus
              derechos de privacidad y cómo la ley lo protege.
            </p>
            <p>
              Utilizamos sus datos personales para proporcionar y mejorar el
              Servicio. Al usar el Servicio, usted acepta la recopilación y el
              uso de información de acuerdo con esta Política de Privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              Interpretación y Definiciones
            </h2>
            <h3 className="text-xl font-semibold mb-2">Interpretación</h3>
            <p className="mb-4">
              Las palabras cuya letra inicial está en mayúscula tienen
              significados definidos bajo las siguientes condiciones. Las
              siguientes definiciones tendrán el mismo significado
              independientemente de si aparecen en singular o en plural.
            </p>
            <h3 className="text-xl font-semibold mb-2">Definiciones</h3>
            <p className="mb-2">
              Para los propósitos de esta Política de Privacidad:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Cuenta</strong> significa una cuenta única creada para
                que usted acceda a nuestro Servicio o partes de nuestro
                Servicio.
              </li>
              <li>
                <strong>Compañía</strong> (referida como "la Compañía",
                "Nosotros", "Nos" o "Nuestro" en este Acuerdo) se refiere a
                OrganiZapp.
              </li>
              <li>
                <strong>País</strong> se refiere a: Argentina
              </li>
              <li>
                <strong>Dispositivo</strong> significa cualquier dispositivo que
                puede acceder al Servicio, como una computadora, un teléfono
                celular o una tableta digital.
              </li>
              <li>
                <strong>Datos Personales</strong> es cualquier información que
                se relaciona con un individuo identificado o identificable.
              </li>
              <li>
                <strong>Servicio</strong> se refiere al sitio web.
              </li>
              <li>
                <strong>Proveedor de Servicios</strong> significa cualquier
                persona natural o jurídica que procesa los datos en nombre de la
                Compañía. Se refiere a compañías de terceros o individuos
                empleados por la Compañía para facilitar el Servicio,
                proporcionar el Servicio en nombre de la Compañía, realizar
                servicios relacionados con el Servicio o ayudar a la Compañía a
                analizar cómo se utiliza el Servicio.
              </li>
              <li>
                <strong>Datos de Uso</strong> se refiere a los datos recopilados
                automáticamente, ya sea generados por el uso del Servicio o de
                la infraestructura del Servicio en sí (por ejemplo, la duración
                de una visita a una página).
              </li>
              <li>
                <strong>Sitio Web</strong> se refiere a OrganiZapp, accesible
                desde{" "}
                <a
                  href="https://organizapp-alpha.vercel.app/"
                  className="text-green-400 hover:underline"
                >
                  https://organizapp-alpha.vercel.app/
                </a>
              </li>
              <li>
                <strong>Usted</strong> significa el individuo que accede o usa
                el Servicio, o la compañía, u otra entidad legal en nombre de la
                cual dicho individuo está accediendo o usando el Servicio, según
                corresponda.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              Recopilación y Uso de sus Datos Personales
            </h2>
            <h3 className="text-xl font-semibold mb-2">
              Tipos de Datos Recopilados
            </h3>
            <h4 className="text-lg font-semibold mb-2">Datos Personales</h4>
            <p className="mb-2">
              Mientras usa Nuestro Servicio, podemos pedirle que nos proporcione
              cierta información de identificación personal que puede ser
              utilizada para contactarlo o identificarlo. La información de
              identificación personal puede incluir, pero no se limita a:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Dirección de correo electrónico</li>
              <li>Nombre y apellido</li>
            </ul>
            <h4 className="text-lg font-semibold mb-2">Datos de Uso</h4>
            <p>
              Los Datos de Uso se recopilan automáticamente cuando se utiliza el
              Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-green-400 mb-4">
              Contáctenos
            </h2>
            <p className="mb-2">
              Si tiene alguna pregunta sobre esta Política de Privacidad, puede
              contactarnos:
            </p>
            <ul className="list-disc pl-5">
              <li>
                Visitando esta página en nuestro sitio web:{" "}
                <a
                  href="https://organizapp-alpha.vercel.app/"
                  className="text-green-400 hover:underline"
                >
                  https://organizapp-alpha.vercel.app/
                </a>
              </li>
            </ul>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
