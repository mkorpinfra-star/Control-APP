#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GERADOR INTELIGENTE DE GRÁFICOS PLAY STORE
Gera TODAS as resoluções necessárias automaticamente
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont

# Fix encoding no Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ============================================================================
# CARREGAR CONFIGURAÇÃO
# ============================================================================

def carregar_config():
    """Carrega configuração do projeto"""
    config = {}

    if not os.path.exists('config.txt'):
        print("⚠️  Configuração não encontrada!")
        print("Execute CONFIGURAR.bat primeiro!")
        sys.exit(1)

    with open('config.txt', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()

    return config

# ============================================================================
# RESOLUÇÕES GOOGLE PLAY STORE (TODAS)
# ============================================================================

RESOLUTIONS = {
    # OBRIGATÓRIAS (mínimo 2)
    'phone': [
        (1080, 1920, 'Phone 5.5"'),
        (1242, 2208, 'Phone 5.8"'),
    ],

    # TABLETS (recomendado)
    'tablet_7': [
        (1200, 1920, 'Tablet 7"'),
    ],

    'tablet_10': [
        (1600, 2560, 'Tablet 10"'),
    ],

    # TV (opcional mas bom ter)
    'tv': [
        (1920, 1080, 'Android TV'),
    ],

    # WEAR (opcional)
    'wear': [
        (320, 320, 'Wear OS'),
    ]
}

# ============================================================================
# FUNÇÕES DE GERAÇÃO
# ============================================================================

def hex_to_rgb(hex_color):
    """Converte HEX para RGB"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def gerar_icone(config):
    """Gera ícone 512x512"""
    print("\n📱 Gerando ícone 512x512...")

    size = (512, 512)
    cor_primaria = hex_to_rgb(config.get('COLOR_PRIMARY', '2196F3'))
    cor_secundaria = hex_to_rgb(config.get('COLOR_SECONDARY', '1976D2'))
    app_name = config.get('APP_NAME', 'Meu App')

    # Criar imagem
    img = Image.new('RGB', size, cor_primaria)
    draw = ImageDraw.Draw(img)

    # Gradiente simples (topo mais claro)
    for y in range(size[1]):
        alpha = y / size[1]
        cor = tuple(int(cor_primaria[i] * (1-alpha) + cor_secundaria[i] * alpha) for i in range(3))
        draw.line([(0, y), (size[0], y)], fill=cor)

    # Círculo central
    circle_size = 300
    circle_pos = ((size[0]-circle_size)//2, (size[1]-circle_size)//2)
    draw.ellipse([circle_pos, (circle_pos[0]+circle_size, circle_pos[1]+circle_size)],
                 fill=(255, 255, 255), outline=None)

    # Texto (iniciais)
    try:
        font = ImageFont.truetype("arial.ttf", 120)
    except:
        font = ImageFont.load_default()

    # Pegar iniciais
    iniciais = ''.join([word[0].upper() for word in app_name.split()[:2]])

    # Centralizar texto
    bbox = draw.textbbox((0, 0), iniciais, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    text_pos = ((size[0]-text_width)//2, (size[1]-text_height)//2 - 10)

    draw.text(text_pos, iniciais, fill=cor_primaria, font=font)

    # Salvar
    os.makedirs('../playstore-assets/graficos', exist_ok=True)
    img.save('../playstore-assets/graficos/icone-512x512.png')
    print("   ✅ Salvo: graficos/icone-512x512.png")

def gerar_feature_graphic(config):
    """Gera feature graphic 1024x500"""
    print("\n🎨 Gerando feature graphic 1024x500...")

    size = (1024, 500)
    cor_primaria = hex_to_rgb(config.get('COLOR_PRIMARY', '2196F3'))
    cor_secundaria = hex_to_rgb(config.get('COLOR_SECONDARY', '1976D2'))
    app_name = config.get('APP_NAME', 'Meu App')

    # Criar imagem
    img = Image.new('RGB', size, cor_primaria)
    draw = ImageDraw.Draw(img)

    # Gradiente horizontal
    for x in range(size[0]):
        alpha = x / size[0]
        cor = tuple(int(cor_primaria[i] * (1-alpha) + cor_secundaria[i] * alpha) for i in range(3))
        draw.line([(x, 0), (x, size[1])], fill=cor)

    # Título
    try:
        font_title = ImageFont.truetype("arial.ttf", 80)
        font_subtitle = ImageFont.truetype("arial.ttf", 40)
    except:
        font_title = font_subtitle = ImageFont.load_default()

    # Desenhar título
    bbox = draw.textbbox((0, 0), app_name, font=font_title)
    text_width = bbox[2] - bbox[0]
    text_pos = ((size[0]-text_width)//2, 150)
    draw.text(text_pos, app_name, fill=(255, 255, 255), font=font_title)

    # Subtítulo
    subtitle = config.get('COMPANY_NAME', 'Sua Empresa')
    bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
    text_width = bbox[2] - bbox[0]
    text_pos = ((size[0]-text_width)//2, 260)
    draw.text(text_pos, subtitle, fill=(255, 255, 255, 200), font=font_subtitle)

    # Salvar
    img.save('../playstore-assets/graficos/feature-graphic-1024x500.png')
    print("   ✅ Salvo: graficos/feature-graphic-1024x500.png")

def gerar_screenshots(config):
    """Gera screenshots para TODAS as resoluções"""
    print("\n📸 Gerando screenshots (TODAS as resoluções)...")

    cor_primaria = hex_to_rgb(config.get('COLOR_PRIMARY', '2196F3'))
    cor_bg = (245, 245, 245)
    app_name = config.get('APP_NAME', 'Meu App')

    screens = [
        ('Login', 'Tela de login'),
        ('Dashboard', 'Painel principal'),
        ('Lista', 'Lista de itens'),
        ('Detalhes', 'Detalhes do item'),
        ('Configurações', 'Configurações'),
        ('Perfil', 'Perfil do usuário'),
    ]

    total = 0

    for device_type, resolutions in RESOLUTIONS.items():
        device_folder = f'../playstore-assets/screenshots/{device_type}'
        os.makedirs(device_folder, exist_ok=True)

        print(f"\n   📱 {device_type.upper().replace('_', ' ')}:")

        for width, height, device_name in resolutions:
            for idx, (screen_name, screen_desc) in enumerate(screens, 1):
                # Criar imagem
                img = Image.new('RGB', (width, height), cor_bg)
                draw = ImageDraw.Draw(img)

                # Header (barra superior)
                header_height = int(height * 0.08)
                draw.rectangle([0, 0, width, header_height], fill=cor_primaria)

                # Título no header
                try:
                    font_header = ImageFont.truetype("arial.ttf", int(header_height * 0.4))
                    font_title = ImageFont.truetype("arial.ttf", int(height * 0.04))
                    font_subtitle = ImageFont.truetype("arial.ttf", int(height * 0.025))
                except:
                    font_header = font_title = font_subtitle = ImageFont.load_default()

                # App name no header
                bbox = draw.textbbox((0, 0), app_name, font=font_header)
                text_width = bbox[2] - bbox[0]
                text_pos = ((width-text_width)//2, header_height//4)
                draw.text(text_pos, app_name, fill=(255, 255, 255), font=font_header)

                # Conteúdo central
                content_y = int(height * 0.3)

                # Título da tela
                bbox = draw.textbbox((0, 0), screen_name, font=font_title)
                text_width = bbox[2] - bbox[0]
                text_pos = ((width-text_width)//2, content_y)
                draw.text(text_pos, screen_name, fill=cor_primaria, font=font_title)

                # Descrição
                bbox = draw.textbbox((0, 0), screen_desc, font=font_subtitle)
                text_width = bbox[2] - bbox[0]
                text_pos = ((width-text_width)//2, content_y + int(height * 0.06))
                draw.text(text_pos, screen_desc, fill=(100, 100, 100), font=font_subtitle)

                # Mockup de conteúdo (retângulos)
                padding = int(width * 0.1)
                item_height = int(height * 0.08)

                for i in range(3):
                    y = content_y + int(height * 0.15) + (i * item_height) + (i * 10)
                    draw.rectangle([padding, y, width-padding, y+item_height],
                                 fill=(255, 255, 255), outline=(200, 200, 200))

                # Nome do arquivo
                filename = f'screenshot-{idx:02d}-{screen_name.lower()}-{width}x{height}.png'
                filepath = os.path.join(device_folder, filename)

                # Salvar
                img.save(filepath)
                total += 1

        print(f"      ✅ {len(resolutions) * len(screens)} screenshots geradas")

    print(f"\n   ✅ TOTAL: {total} screenshots criadas!")

# ============================================================================
# MAIN
# ============================================================================

def main():
    print("═" * 67)
    print("     GERADOR INTELIGENTE DE GRÁFICOS - PLAY STORE")
    print("═" * 67)

    # Carregar config
    config = carregar_config()

    print(f"\n📱 App: {config.get('APP_NAME', 'Não configurado')}")
    print(f"🎨 Cor primária: #{config.get('COLOR_PRIMARY', '2196F3')}")
    print(f"🎨 Cor secundária: #{config.get('COLOR_SECONDARY', '1976D2')}")

    # Gerar tudo
    gerar_icone(config)
    gerar_feature_graphic(config)
    gerar_screenshots(config)

    print("\n" + "═" * 67)
    print("          ✅ TODOS OS GRÁFICOS GERADOS!")
    print("═" * 67)

    print("\n📦 Arquivos criados em: playstore-assets/")
    print("   • graficos/icone-512x512.png")
    print("   • graficos/feature-graphic-1024x500.png")
    print("   • screenshots/phone/ (12 imagens)")
    print("   • screenshots/tablet_7/ (6 imagens)")
    print("   • screenshots/tablet_10/ (6 imagens)")
    print("   • screenshots/tv/ (6 imagens)")
    print("   • screenshots/wear/ (6 imagens)")
    print("\n   TOTAL: 2 gráficos + 36 screenshots!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro: {str(e)}")
        sys.exit(1)
