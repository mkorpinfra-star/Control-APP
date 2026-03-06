╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          📦 KIT PORTÁTIL - GERAR AAB PLAY STORE             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝


🎯 O QUE É ISTO?

Esta pasta contém TUDO que você precisa para gerar AAB
de qualquer app React + Capacitor para Google Play Store.


═══════════════════════════════════════════════════════════════


📂 CONTEÚDO DA PASTA:

tudo-playstore/
├── jdk-17.0.2/              ← Java 17 completo (portátil)
├── CONFIGURAR.bat           ← 1️⃣ WIZARD DE CONFIGURAÇÃO
├── CORRIGIR-JAVA.bat        ← 2️⃣ Corrige Java 21→17 automático
├── EXECUTAR-AGORA.bat       ← 3️⃣ Gera AAB assinado
├── gerar-graficos.py        ← 4️⃣ Gera gráficos multi-resolução
├── textos/                  ← Templates de descrições
├── README.txt               ← Este arquivo
└── COMO-USAR.txt            ← Guia passo a passo


═══════════════════════════════════════════════════════════════


⚡ COMO USAR EM OUTRO PROJETO:

1. Copie esta pasta para a RAIZ do seu projeto React
   Exemplo: C:\MeuProjeto\tudo-playstore\

2. Execute: CONFIGURAR.bat
   (Wizard interativo - define nome, cores, senhas)

3. Execute: CORRIGIR-JAVA.bat
   (Corrige automaticamente Android para Java 17)

4. Execute: EXECUTAR-AGORA.bat
   (Gera o AAB assinado com suas configurações)

5. Execute: python gerar-graficos.py
   (Gera ícone + screenshots para TODOS os dispositivos)

PRONTO! AAB em: playstore-assets/aab/seu-app-v1.0.aab


═══════════════════════════════════════════════════════════════


✅ PRÉ-REQUISITOS NO SEU PROJETO:

• React + Vite
• Capacitor instalado (npx cap add android)
• Pasta android/ existente


═══════════════════════════════════════════════════════════════


🔧 O QUE OS SCRIPTS FAZEM:

CONFIGURAR.bat (NOVO! 🎯):
• Wizard interativo inteligente
• Pergunta nome do app, ID, versão
• Pergunta senhas e cores personalizadas
• Salva tudo em config.txt
• EXECUTE UMA VEZ por projeto!

CORRIGIR-JAVA.bat:
• Corrige 6 arquivos Gradle
• Muda Java 21 → Java 17
• Automático e seguro

EXECUTAR-AGORA.bat:
• LÊ config.txt automaticamente
• Configura Java 17 local
• Cria keystore com SUAS senhas
• Compila AAB com SEU nome
• Copia para playstore-assets/

gerar-graficos.py (NOVO! Multi-resolução 📱):
• Gera ícone 512x512 com SUAS cores
• Gera feature graphic 1024x500
• Gera screenshots para:
  - Phone (2 resoluções): 12 screenshots
  - Tablet 7" (1 resolução): 6 screenshots
  - Tablet 10" (1 resolução): 6 screenshots
  - Android TV (1 resolução): 6 screenshots
  - Wear OS (1 resolução): 6 screenshots
• TOTAL: 2 gráficos + 36 screenshots!


═══════════════════════════════════════════════════════════════


📖 DOCUMENTAÇÃO COMPLETA:

Abra: COMO-USAR.txt


═══════════════════════════════════════════════════════════════


💡 DICA:

Guarde esta pasta num lugar seguro!
Você vai usar em TODOS os seus projetos React + Capacitor!


🎉
