import 'package:flutter/material.dart';

class CommunityPage extends StatelessWidget {
  const CommunityPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Comunidade / Public Library')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ListTile(
            title: const Text('Pad Worship Largo'),
            subtitle: const Text('likes: 124'),
            trailing: Wrap(spacing: 6, children: [
              OutlinedButton(onPressed: () {}, child: const Text('Copiar para meus timbres')),
              ElevatedButton(onPressed: () {}, child: const Text('Curtir')),
            ]),
          ),
        ],
      ),
    );
  }
}
