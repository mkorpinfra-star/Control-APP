#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os, sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# CORES DA TELA DE LOGIN
PRETO = (0, 0, 0)
VERMELHO_J2S = (206, 2, 1)
BRANCO = (255, 255, 255)
CINZA = (128, 128, 128)

TAMANHOS = {
    'drawable-port-mdpi': (320, 480), 'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280), 'drawable-port-xxhdpi': (1080, 1920),
    'drawable-port-xxxhdpi': (1440, 2560), 'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480), 'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1920, 1080), 'drawable-land-xxxhdpi': (2560, 1440),
    'drawable': (1080, 1080),
}

def tentar_carregar_fonte(tamanho, bold=False):
    """Tenta carregar uma fonte do sistema"""
    if bold:
        fontes = [
            'C:/Windows/Fonts/arialbd.ttf',
            'C:/Windows/Fonts/calibrib.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        ]
    else:
        fontes = [
            'C:/Windows/Fonts/arial.ttf',
            'C:/Windows/Fonts/calibri.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        ]
    
    for fonte in fontes:
        try:
            if os.path.exists(fonte):
                return ImageFont.truetype(fonte, tamanho)
        except:
            pass
    return ImageFont.load_default()

print("\n" + "="*70)
print("  SPLASH SCREEN - IGUAL TELA DE LOGIN")
print("="*70 + "\n")

for pasta, (w, h) in TAMANHOS.items():
    caminho = f'android/app/src/main/res/{pasta}'
    os.makedirs(caminho, exist_ok=True)
    
    print(f"🎨 {pasta} ({w}x{h})...")
    
    # FUNDO PRETO
    splash = Image.new('RGB', (w, h), PRETO)
    draw = ImageDraw.Draw(splash)
    
    # LOGO "J2S" em vermelho - MAIOR e em cima
    tam_j2s = int(min(w, h) * 0.18)
    fonte_j2s = tentar_carregar_fonte(tam_j2s, bold=True)
    
    texto_j2s = "J2S"
    bbox = draw.textbbox((0, 0), texto_j2s, font=fonte_j2s)
    largura_j2s = bbox[2] - bbox[0]
    altura_j2s = bbox[3] - bbox[1]
    
    x_j2s = (w - largura_j2s) // 2
    y_j2s = int(h * 0.30)
    
    # Texto J2S vermelho
    draw.text((x_j2s, y_j2s), texto_j2s, font=fonte_j2s, fill=VERMELHO_J2S)
    
    # TÍTULO: "Enginyeria" em branco
    tam_titulo = int(min(w, h) * 0.065)
    fonte_titulo = tentar_carregar_fonte(tam_titulo, bold=False)
    
    texto_titulo = "Enginyeria"
    bbox_t = draw.textbbox((0, 0), texto_titulo, font=fonte_titulo)
    largura_t = bbox_t[2] - bbox_t[0]
    
    x_titulo = (w - largura_t) // 2
    y_titulo = y_j2s + altura_j2s + int(h * 0.02)
    
    draw.text((x_titulo, y_titulo), texto_titulo, font=fonte_titulo, fill=BRANCO)
    
    # SUBTÍTULO: "& Instal·lacions" em cinza
    tam_sub = int(min(w, h) * 0.045)
    fonte_sub = tentar_carregar_fonte(tam_sub, bold=False)
    
    texto_sub = "& Instal·lacions"
    bbox_s = draw.textbbox((0, 0), texto_sub, font=fonte_sub)
    largura_s = bbox_s[2] - bbox_s[0]
    
    x_sub = (w - largura_s) // 2
    y_sub = y_titulo + int(h * 0.05)
    
    draw.text((x_sub, y_sub), texto_sub, font=fonte_sub, fill=CINZA)
    
    splash.save(f'{caminho}/splash.png', 'PNG', quality=95, optimize=True)
    print(f"   ✅ splash.png\n")

print("="*70)
print("  ✅ SPLASH IGUAL TELA DE LOGIN GERADO!")
print("  • Fundo: Preto")
print("  • Logo: J2S vermelho (igual login)")
print("  • Texto: Enginyeria & Instal·lacions")
print("="*70 + "\n")
