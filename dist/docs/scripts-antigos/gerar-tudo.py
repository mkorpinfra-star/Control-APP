#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚀 GERAR TUDO PARA PLAY STORE - J2S HORES
Executa TODOS os passos automaticamente em um único comando
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

# Fix encoding no Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cores para output
VERDE = '\033[92m'
VERMELHO = '\033[91m'
AMARELO = '\033[93m'
AZUL = '\033[94m'
RESET = '\033[0m'

def print_header(texto):
    print(f"\n{'='*70}")
    print(f"{AZUL}{texto}{RESET}")
    print(f"{'='*70}\n")

def print_sucesso(texto):
    print(f"{VERDE}✓ {texto}{RESET}")

def print_erro(texto):
    print(f"{VERMELHO}✗ {texto}{RESET}")

def print_aviso(texto):
    print(f"{AMARELO}⚠ {texto}{RESET}")

def executar_comando(comando, descricao, shell=True):
    """Executa um comando e retorna True se sucesso"""
    print(f"\n{AZUL}➜{RESET} {descricao}...")
    try:
        resultado = subprocess.run(
            comando,
            shell=shell,
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        print_sucesso(f"{descricao} - Concluído")
        return True
    except subprocess.CalledProcessError as e:
        print_erro(f"{descricao} - Falhou")
        if e.stderr:
            print(f"Erro: {e.stderr}")
        return False
    except Exception as e:
        print_erro(f"{descricao} - Erro: {str(e)}")
        return False

def verificar_java():
    """Verifica se Java está instalado"""
    print_header("1/6 - Verificando Java JDK")

    # Verificar se existe JDK local na pasta
    jdk_local = Path("jdk-17.0.2/bin")
    if jdk_local.exists():
        # Adicionar ao PATH temporariamente
        java_bin = str(jdk_local.absolute())
        os.environ['PATH'] = f"{java_bin}{os.pathsep}{os.environ['PATH']}"
        os.environ['JAVA_HOME'] = str(jdk_local.parent.absolute())
        print_sucesso(f"Usando JDK local: {java_bin}")
        return True

    # Verificar se Java está no PATH
    try:
        resultado = subprocess.run(
            ['java', '-version'],
            capture_output=True,
            text=True
        )
        print_sucesso("Java JDK encontrado no sistema!")
        return True
    except:
        print_erro("Java JDK não encontrado!")
        print("\n📥 Instale o Java JDK:")
        print("   https://www.oracle.com/java/technologies/downloads/")
        print("\nOu descompacte openjdk.zip na pasta do projeto")
        return False

def criar_keystore():
    """Cria keystore se não existir"""
    print_header("2/6 - Criando/Verificando Keystore")

    keystore_path = Path("j2s-horas.keystore")

    if keystore_path.exists():
        print_sucesso("Keystore já existe! Usando existente.")
        return True

    print("🔐 Criando novo keystore...")
    print("📝 Senha padrão: J2S@Hores2026")

    comando = [
        'keytool',
        '-genkey',
        '-v',
        '-keystore', 'j2s-horas.keystore',
        '-alias', 'j2s',
        '-keyalg', 'RSA',
        '-keysize', '2048',
        '-validity', '10000',
        '-storepass', 'J2S@Hores2026',
        '-keypass', 'J2S@Hores2026',
        '-dname', 'CN=J2S Enginyeria, OU=Mobile, O=J2S, L=Andorra, ST=Andorra, C=AD'
    ]

    return executar_comando(comando, "Criando keystore", shell=False)

def inicializar_android():
    """Inicializa Capacitor Android se necessário"""
    print_header("3/6 - Inicializando Android")

    android_path = Path("android")

    if android_path.exists():
        print_sucesso("Pasta android/ já existe!")
        return True

    print("📱 Inicializando Capacitor Android...")
    return executar_comando("npx cap add android", "Adicionar plataforma Android")

def configurar_assinatura():
    """Configura assinatura no projeto Android"""
    print_header("4/6 - Configurando Assinatura")

    keystore_path = Path("j2s-horas.keystore").absolute()
    key_properties_path = Path("android/key.properties")

    # Criar pasta android se não existir
    key_properties_path.parent.mkdir(exist_ok=True)

    conteudo = f"""storePassword=J2S@Hores2026
keyPassword=J2S@Hores2026
keyAlias=j2s
storeFile={str(keystore_path).replace(os.sep, '/')}
"""

    try:
        key_properties_path.write_text(conteudo, encoding='utf-8')
        print_sucesso("Arquivo key.properties criado!")
        return True
    except Exception as e:
        print_erro(f"Erro ao criar key.properties: {e}")
        return False

def gerar_aab():
    """Gera AAB assinado"""
    print_header("5/6 - Gerando AAB Assinado")

    print("⏳ Isso pode levar 3-5 minutos...")
    print("   (Compilando e assinando o app)")

    # Navegar para pasta android
    os.chdir("android")

    # Executar gradlew bundleRelease
    if sys.platform == 'win32':
        comando = "gradlew.bat bundleRelease"
    else:
        comando = "./gradlew bundleRelease"

    sucesso = executar_comando(comando, "Compilar AAB assinado")

    # Voltar para pasta raiz
    os.chdir("..")

    if sucesso:
        aab_path = Path("android/app/build/outputs/bundle/release/app-release.aab")
        if aab_path.exists():
            tamanho_mb = aab_path.stat().st_size / (1024 * 1024)
            print_sucesso(f"AAB gerado com sucesso! ({tamanho_mb:.2f} MB)")
            return True

    return False

def gerar_graficos():
    """Gera gráficos Play Store"""
    print_header("6/6 - Gerando Gráficos Play Store")

    os.chdir("playstore-assets")

    sucesso = executar_comando(
        "python gerar-tudo.py",
        "Gerar ícone, feature graphic e screenshots"
    )

    os.chdir("..")
    return sucesso

def organizar_arquivos():
    """Organiza arquivos finais"""
    print_header("Organizando Arquivos Finais")

    # Criar pasta aab dentro de playstore-assets
    aab_dest_dir = Path("playstore-assets/aab")
    aab_dest_dir.mkdir(exist_ok=True)

    # Copiar AAB
    aab_source = Path("android/app/build/outputs/bundle/release/app-release.aab")
    aab_dest = aab_dest_dir / "j2s-hores-v1.0.aab"

    if aab_source.exists():
        shutil.copy2(aab_source, aab_dest)
        tamanho_mb = aab_dest.stat().st_size / (1024 * 1024)
        print_sucesso(f"AAB copiado para: playstore-assets/aab/j2s-hores-v1.0.aab ({tamanho_mb:.2f} MB)")
        return True
    else:
        print_erro("AAB não encontrado para copiar")
        return False

def mostrar_resumo():
    """Mostra resumo final"""
    print("\n" + "="*70)
    print(f"{VERDE}")
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                                                               ║")
    print("║                    ✅ TUDO PRONTO! 🎉                        ║")
    print("║                                                               ║")
    print("║  Todos os arquivos foram gerados automaticamente:            ║")
    print("║                                                               ║")
    print("║  📦 playstore-assets/                                        ║")
    print("║     ├── aab/                                                 ║")
    print("║     │   └── j2s-hores-v1.0.aab  ⬅️ UPLOAD NA PLAY STORE    ║")
    print("║     ├── graficos/ (2 arquivos)                              ║")
    print("║     ├── screenshots/ (6 arquivos)                           ║")
    print("║     ├── textos/ (6 arquivos)                                ║")
    print("║     └── PRONTO-PLAYSTORE.md  ⬅️ LEIA AGORA!                ║")
    print("║                                                               ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print(f"{RESET}")

    print("\n📖 PRÓXIMOS PASSOS:\n")
    print("1. Abra: playstore-assets/PRONTO-PLAYSTORE.md")
    print("2. Siga o guia passo a passo (10-15 minutos)")
    print("3. Faça upload na Play Console")

    print("\n⚠️  IMPORTANTE - BACKUP DO KEYSTORE:")
    print("   Copie o arquivo j2s-horas.keystore para 3 lugares seguros!")
    print("   (Se perder, nunca mais consegue atualizar o app)\n")

def main():
    """Função principal"""
    print(f"{AZUL}")
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                                                               ║")
    print("║          🚀 GERAR TUDO PARA PLAY STORE - J2S HORES          ║")
    print("║                                                               ║")
    print("║     Este script faz TUDO automaticamente:                    ║")
    print("║     ✅ Verifica Java                                         ║")
    print("║     ✅ Cria keystore (assinatura digital)                    ║")
    print("║     ✅ Inicializa Android                                    ║")
    print("║     ✅ Configura assinatura                                  ║")
    print("║     ✅ Gera AAB assinado                                     ║")
    print("║     ✅ Gera gráficos Play Store                              ║")
    print("║     ✅ Organiza tudo numa pasta pronta                       ║")
    print("║                                                               ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print(f"{RESET}")

    print("\n⏱️  Tempo estimado: 5-10 minutos\n")
    print("🚀 Iniciando automaticamente...\n")

    # Garantir que estamos na pasta correta
    script_dir = Path(__file__).parent
    os.chdir(script_dir)

    # Executar todos os passos
    etapas = [
        verificar_java,
        criar_keystore,
        inicializar_android,
        configurar_assinatura,
        gerar_aab,
        gerar_graficos,
        organizar_arquivos
    ]

    for etapa in etapas:
        if not etapa():
            print_erro("\n❌ Processo interrompido devido a erro!")
            print("\nVerifique os logs acima e tente novamente.")
            sys.exit(1)

    # Mostrar resumo final
    mostrar_resumo()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{AMARELO}⚠ Processo cancelado pelo usuário{RESET}")
        sys.exit(1)
    except Exception as e:
        print_erro(f"\n❌ Erro inesperado: {str(e)}")
        sys.exit(1)
