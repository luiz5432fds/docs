import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_theme.dart';
import 'features/auth/auth_gate.dart';
import 'services/ai_router_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const Xps10App());
}

class Xps10App extends StatelessWidget {
  const Xps10App({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AiRouterService()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'XPS-10 AI Workstation (PT-BR)',
        theme: buildJunoTheme(),
        home: const AuthGate(),
      ),
    );
  }
}
