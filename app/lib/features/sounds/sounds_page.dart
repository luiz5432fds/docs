import 'package:flutter/material.dart';
import '../common/section_scaffold.dart';

class SoundsPage extends StatelessWidget {
  const SoundsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionScaffold(
      title: 'Sounds · True Analog Emulation (TAE®)',
      children: [
        Text(
          'TAE® traduz o caráter vivo do analógico para o digital com análise de circuitos, componentes e sinais elétricos em cada etapa.',
        ),
        SizedBox(height: 12),
        Card(
          child: ListTile(
            title: Text('Osciladores sem aliasing e free-running'),
            subtitle: Text('PWM, FM e hard sync com comportamento orgânico e estável musicalmente.'),
          ),
        ),
        Card(
          child: ListTile(
            title: Text('Filtros com modelagem de circuito'),
            subtitle: Text('Resposta, auto-oscilação e não linearidades que preservam calor e presença.'),
          ),
        ),
        Card(
          child: ListTile(
            title: Text('Soft clipping musical'),
            subtitle: Text('Mais punch e controle de amplitude com saturação suave semelhante ao hardware analógico.'),
          ),
        ),
        SizedBox(height: 12),
        Text(
          'Como fazemos: modelos matemáticos + simulação física + escuta crítica para reproduzir nuances como instabilidade entre ciclos, variação térmica e curvas não ideais de forma de onda.',
        ),
      ],
    );
  }
}
