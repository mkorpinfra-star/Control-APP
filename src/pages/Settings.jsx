import { IconSettings as SettingsIcon, IconInfoCircle as Info } from '@tabler/icons-react';

export default function Settings() {

    return (
        <div className="h-full bg-white">
            <div className="h-full overflow-y-auto px-4 pt-6 pb-6 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                {/* Aviso principal */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <div className="flex gap-3">
                        <Info stroke={1} className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                        <div className="text-sm text-blue-900">
                            <p className="font-semibold mb-2">Configuraciones movidas a nivel de Obra</p>
                            <p className="mb-3">
                                <strong>Faturamento</strong> (valores cobrados ao cliente) e <strong>impostos</strong> (IGI, CAS, IRPC)
                                agora são configurados individualmente para cada obra ao criar ou editar.
                            </p>
                            <p>
                                Isso permite que cada obra tenha valores e impostos diferentes conforme o país e contrato.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Aviso sobre custo individual */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex gap-3">
                        <Info stroke={1} className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                        <div className="text-sm text-amber-800">
                            <strong>Custo por funcionário</strong> — o valor pago a cada funcionário (salário base e custo/hora)
                            é configurado individualmente no cadastro de cada <strong>Empleado</strong>.
                        </div>
                    </div>
                </div>

                {/* Placeholder para futuras configurações globais */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                    <SettingsIcon stroke={1} className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                        Configurações globais do sistema aparecerão aqui.
                    </p>
                </div>
            </div>
        </div>
    );
}
