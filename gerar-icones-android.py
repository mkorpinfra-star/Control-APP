#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GERA ÍCONES ANDROID EM TODOS OS TAMANHOS
A partir do ícone 512x512 da Play Store
"""

from PIL import Image
import os
import sys

# Fix encoding no Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Ícone original 512x512
ICONE_ORIGINAL = 'playstore-assets/graficos/j2s-hores-icon-512x512.png'

# Tamanhos para cada pasta mipmap
TAMANHOS = {
    'mipmap-mdpi': 48,      # 1x
    'mipmap-hdpi': 72,      # 1.5x
    'mipmap-xhdpi': 96,     # 2x
    'mipmap-xxhdpi': 144,   # 3x
    'mipmap-xxxhdpi': 192,  # 4x
}

def gerar_icones():
    print("=" * 70)
    print("     GERANDO ÍCONES ANDROID - TODOS OS TAMANHOS")
    print("=" * 70)

    # Verificar se ícone original existe
    if not os.path.exists(ICONE_ORIGINAL):
        print(f"\n❌ Erro: Ícone original não encontrado: {ICONE_ORIGINAL}")
        print("   Execute primeiro: python gerar-tudo.py")
        return

    # Abrir ícone original
    print(f"\n📱 Carregando ícone: {ICONE_ORIGINAL}")
    img_original = Image.open(ICONE_ORIGINAL)

    # Gerar para cada tamanho
    for pasta, tamanho in TAMANHOS.items():
        caminho_pasta = f'android/app/src/main/res/{pasta}'

        # Criar pasta se não existir
        os.makedirs(caminho_pasta, exist_ok=True)

        print(f"\n🔧 Gerando {pasta} ({tamanho}x{tamanho})...")

        # Redimensionar
        img_redimensionada = img_original.resize((tamanho, tamanho), Image.Resampling.LANCZOS)

        # Salvar 3 versões (normal, round, foreground)
        arquivos = [
            'ic_launcher.png',
            'ic_launcher_round.png',
            'ic_launcher_foreground.png'
        ]

        for arquivo in arquivos:
            caminho_completo = os.path.join(caminho_pasta, arquivo)
            img_redimensionada.save(caminho_completo, 'PNG')
            print(f"   ✅ {arquivo}")

    print("\n" + "=" * 70)
    print("          ✅ ÍCONES ANDROID GERADOS!")
    print("=" * 70)
    print("\n📦 Arquivos criados:")
    print("   • android/app/src/main/res/mipmap-mdpi/ (48x48)")
    print("   • android/app/src/main/res/mipmap-hdpi/ (72x72)")
    print("   • android/app/src/main/res/mipmap-xhdpi/ (96x96)")
    print("   • android/app/src/main/res/mipmap-xxhdpi/ (144x144)")
    print("   • android/app/src/main/res/mipmap-xxxhdpi/ (192x192)")
    print("\n🚀 Agora compile novamente o AAB:")
    print("   cd tudo-playstore")
    print("   EXECUTAR-AGORA.bat\n")

if __name__ == "__main__":
    try:
        gerar_icones()
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()
