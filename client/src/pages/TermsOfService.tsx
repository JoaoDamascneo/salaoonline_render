import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </Link>
          
          {/* Mobile Logo */}
          <div className="text-center lg:hidden mb-6">
            <img 
              src="/attached_assets/logo-mobile-light.png" 
              alt="Salão Online" 
              className="h-12 mx-auto block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-mobile-dark.png" 
              alt="Salão Online" 
              className="h-12 mx-auto hidden dark:block"
            />
          </div>

          {/* Desktop Logo */}
          <div className="text-center mb-8 hidden lg:block">
            <img 
              src="/attached_assets/logo-desktop-light.png" 
              alt="Salão Online" 
              className="h-16 mx-auto block dark:hidden"
            />
            <img 
              src="/attached_assets/logo-desktop-dark.png" 
              alt="Salão Online" 
              className="h-16 mx-auto hidden dark:block"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            📜 Termos de Uso — Salão Online
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Ao acessar e utilizar o sistema Salão Online, você concorda integralmente com estes Termos de Uso. 
                Caso não concorde, não deverá utilizar o sistema.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Descrição do Serviço
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                O Salão Online é um sistema de gestão voltado para estabelecimentos de beleza, oferecendo 
                funcionalidades como agendamento, controle de clientes, estoque, painel financeiro e outros 
                recursos descritos no site oficial. O serviço é oferecido em diferentes planos, cujas 
                funcionalidades e preços variam.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Responsabilidades do Usuário
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Manter seus dados de acesso em sigilo e não compartilhá-los com terceiros.</li>
                <li>Utilizar o sistema de forma ética e em conformidade com as leis vigentes.</li>
                <li>Garantir a veracidade das informações cadastradas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Limitação de Responsabilidade
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>
                  O Salão Online não se responsabiliza por perdas, danos ou prejuízos decorrentes do uso 
                  indevido do sistema.
                </li>
                <li>
                  O módulo de integração com WhatsApp utiliza tecnologia de terceiros e não é uma API 
                  oficial do WhatsApp, podendo estar sujeito a instabilidades ou bloqueio de contas pela Meta. 
                  O uso dessa integração é de responsabilidade do usuário.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Alterações nos Termos
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                O Salão Online pode alterar estes Termos de Uso a qualquer momento, sendo de responsabilidade 
                do usuário revisá-los periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Cancelamento e Rescisão
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                O usuário pode solicitar o cancelamento do serviço a qualquer momento. O Salão Online 
                reserva-se o direito de suspender ou encerrar contas que violem estes termos.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Versão 1.0 • Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/privacy-policy">
                  <Button variant="outline" size="sm">
                    Ver Política de Privacidade
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Voltar ao Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}