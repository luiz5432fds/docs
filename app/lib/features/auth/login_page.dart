import 'package:flutter/material.dart';
import '../../services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool loading = false;
  String? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: SizedBox(
              width: 340,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('XPS-10 AI Workstation (PT-BR)', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  const Text('Entre com sua Conta Google para começar.'),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: loading
                        ? null
                        : () async {
                            setState(() {
                              loading = true;
                              error = null;
                            });
                            try {
                              await AuthService().signInWithGoogle();
                            } catch (_) {
                              setState(() => error = 'Falha ao entrar com Google. Tente novamente.');
                            } finally {
                              if (mounted) setState(() => loading = false);
                            }
                          },
                    icon: const Icon(Icons.login),
                    label: const Text('Entrar com Google'),
                  ),
                  if (error != null) ...[
                    const SizedBox(height: 12),
                    Text(error!, style: const TextStyle(color: Colors.redAccent)),
                  ]
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
