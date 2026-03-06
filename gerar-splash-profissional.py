#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw
import os, sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ICONE = 'playstore-assets/graficos/j2s-hores-icon-512x512.png'
VERMELHO = (206, 2, 1)

TAMANHOS = {
    'drawable-port-mdpi': (320, 480), 'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280), 'drawable-port-xxhdpi': (1080, 1920),
    'drawable-port-xxxhdpi': (1440, 2560), 'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480), 'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1920, 1080), 'drawable-land-xxxhdpi': (2560, 1440),
    'drawable': (1080, 1080),
}

print("\n" + "="*70)
print("  SPLASH SCREENS PROFISSIONAIS J2S HORES")
print("="*70 + "\n")

icone = Image.open(ICONE).convert('RGBA')

for pasta, (w, h) in TAMANHOS.items():
    caminho = f'android/app/src/main/res/{pasta}'
    os.makedirs(caminho, exist_ok=True)
    
    print(f"🎨 {pasta} ({w}x{h})...")
    
    splash = Image.new('RGB', (w, h), VERMELHO)
    tam_logo = int(min(w, h) * 0.5)
    logo = icone.resize((tam_logo, tam_logo), Image.Resampling.LANCZOS)
    
    logo_rgb = Image.new('RGB', (tam_logo, tam_logo), VERMELHO)
    logo_rgb.paste(logo, (0, 0), logo)
    
    x, y = (w - tam_logo) // 2, (h - tam_logo) // 2
    splash.paste(logo_rgb, (x, y))
    
    splash.save(f'{caminho}/splash.png', 'PNG', quality=95, optimize=True)
    print(f"   ✅ splash.png\n")

print("="*70)
print("  ✅ CONCLUÍDO!")
print("="*70 + "\n")
