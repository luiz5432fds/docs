import 'package:flutter/material.dart';

class MyPatchesPage extends StatelessWidget {
  const MyPatchesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meus Timbres')),
      body: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(decoration: InputDecoration(labelText: 'Buscar por nome, tag ou categoria')),
            SizedBox(height: 12),
            Expanded(child: Center(child: Text('Lista de timbres, favoritos e acesso rápido.'))),
          ],
        ),
      ),
    );
  }
}
