import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../community/community_page.dart';
import '../sounds/sounds_page.dart';
import '../store/store_page.dart';
import '../support/support_page.dart';
import '../decoder/decoder_page.dart';
import '../editor/editor_page.dart';
import '../generate/generate_page.dart';
import '../my_patches/my_patches_page.dart';
import '../recipes/recipes_page.dart';
import '../setlists/setlists_page.dart';
import '../settings/settings_page.dart';
import '../assistant/assistant_page.dart';
import '../kb/kb_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final cards = [
      ('Gerar Timbre', Icons.auto_awesome, const GeneratePage()),
      ('Meus Timbres', Icons.library_music, const MyPatchesPage()),
      ('Receitas XPS-10', Icons.auto_stories, const RecipesPage()),
      ('Editor Juno', Icons.tune, const EditorPage()),
      ('Assistente', Icons.smart_toy, const AssistantPage()),
      ('Base de Conhecimento', Icons.menu_book, const KbPage()),
      ('Setlists', Icons.queue_music, const SetlistsPage()),
      ('Decodificar Som', Icons.graphic_eq, const DecoderPage()),
      ('Sounds (TAE®)', Icons.graphic_eq, const SoundsPage()),
      ('Store', Icons.storefront, const StorePage()),
      ('Comunidade', Icons.public, const CommunityPage()),
      ('Support', Icons.support_agent, const SupportPage()),
      ('Configurações', Icons.settings, const SettingsPage()),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        actions: [
          IconButton(onPressed: () => AuthService().signOut(), icon: const Icon(Icons.logout), tooltip: 'Sair'),
        ],
      ),
      body: GridView.count(
        padding: const EdgeInsets.all(16),
        crossAxisCount: 2,
        children: cards
            .map((c) => Card(
                  child: InkWell(
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => c.$3)),
                    child: Center(
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        Icon(c.$2, size: 42),
                        const SizedBox(height: 8),
                        Text(c.$1, style: const TextStyle(fontSize: 18)),
                      ]),
                    ),
                  ),
                ))
            .toList(),
      ),
    );
  }
}
