import 'package:flutter/material.dart';

class SetlistsPage extends StatelessWidget {
  const SetlistsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setlists e Modo Performance')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text('Modo Palco: alto contraste, botões gigantes e lock de edição.'),
            const Spacer(),
            Row(
              children: [
                Expanded(child: SizedBox(height: 120, child: ElevatedButton(onPressed: () {}, child: const Text('<< PREV', style: TextStyle(fontSize: 28))))),
                const SizedBox(width: 12),
                Expanded(child: SizedBox(height: 120, child: ElevatedButton(onPressed: () {}, child: const Text('NEXT >>', style: TextStyle(fontSize: 28))))),
              ],
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
