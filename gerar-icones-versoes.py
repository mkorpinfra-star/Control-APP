#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera 4 versões diferentes do ícone J2S Hores
para o cliente escolher a melhor
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

# Fix encoding no Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Cores
COR_VERMELHO = (206, 2, 1)
COR_VERMELHO_ESCURO = (138, 0, 0)
COR_BRANCO = (255, 255, 255)

def criar_gradiente(draw, width, height):
    """Gradiente vermelho"""
    for y in range(height):
        ratio = y / height
        r = int(COR_VERMELHO[0] + (COR_VERMELHO_ESCURO[0] - COR_VERMELHO[0]) * ratio)
        g = int(COR_VERMELHO[1] + (COR_VERMELHO_ESCURO[1] - COR_VERMELHO[1]) * ratio)
        b = int(COR_VERMELHO[2] + (COR_VERMELHO_ESCURO[2] - COR_VERMELHO[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

def desenhar_relogio(draw, x, y, radius):
    """Desenha um relógio"""
    # Círculo
    draw.ellipse(
        [(x - radius, y - radius), (x + radius, y + radius)],
        outline=COR_BRANCO,
        width=4
    )
    # Ponteiro das horas (10h)
    draw.line([(x, y), (x, y - radius*0.7)], fill=COR_BRANCO, width=3)
    # Ponteiro dos minutos (3h)
    draw.line([(x, y), (x + radius*0.8, y)], fill=COR_BRANCO, width=3)
    # Centro
    draw.ellipse([(x-4, y-4), (x+4, y+4)], fill=COR_BRANCO)

# ============================================================================
# VERSÃO 1: RELÓGIO ACIMA DO J2S
# ============================================================================
def versao1():
    print("\n📱 Gerando VERSÃO 1: Relógio acima do J2S...")

    img = Image.new('RGB', (512, 512), COR_VERMELHO)
    draw = ImageDraw.Draw(img)
    criar_gradiente(draw, 512, 512)

    try:
        font_j2s = ImageFont.truetype("arialbd.ttf", 140)
        font_hores = ImageFont.truetype("arialbd.ttf", 70)
    except:
        font_j2s = ImageFont.load_default()
        font_hores = ImageFont.load_default()

    # Relógio no topo centralizado
    desenhar_relogio(draw, 256, 100, 40)

    # J2S centralizado
    text_j2s = "J2S"
    bbox = draw.textbbox((0, 0), text_j2s, font=font_j2s)
    w = bbox[2] - bbox[0]
    draw.text((256 - w//2, 180), text_j2s, fill=COR_BRANCO, font=font_j2s)

    # HORES centralizado
    text_hores = "HORES"
    bbox2 = draw.textbbox((0, 0), text_hores, font=font_hores)
    w2 = bbox2[2] - bbox2[0]
    draw.text((256 - w2//2, 310), text_hores, fill=COR_BRANCO, font=font_hores)

    img.save("versao1-relogio-acima.png")
    print("   ✅ versao1-relogio-acima.png")

# ============================================================================
# VERSÃO 2: RELÓGIO SUBSTITUINDO O "O" DE HORES
# ============================================================================
def versao2():
    print("\n📱 Gerando VERSÃO 2: Relógio substituindo O de HORES...")

    img = Image.new('RGB', (512, 512), COR_VERMELHO)
    draw = ImageDraw.Draw(img)
    criar_gradiente(draw, 512, 512)

    try:
        font_j2s = ImageFont.truetype("arialbd.ttf", 140)
        font_hores = ImageFont.truetype("arialbd.ttf", 70)
    except:
        font_j2s = ImageFont.load_default()
        font_hores = ImageFont.load_default()

    # J2S centralizado
    text_j2s = "J2S"
    bbox = draw.textbbox((0, 0), text_j2s, font=font_j2s)
    w = bbox[2] - bbox[0]
    draw.text((256 - w//2, 140), text_j2s, fill=COR_BRANCO, font=font_j2s)

    # HORES com relógio no lugar do O
    # H
    bbox_h = draw.textbbox((0, 0), "H", font=font_hores)
    w_h = bbox_h[2] - bbox_h[0]
    x_h = 100
    y_hores = 280
    draw.text((x_h, y_hores), "H", fill=COR_BRANCO, font=font_hores)

    # Relógio (substituindo O)
    x_clock = x_h + w_h + 50
    desenhar_relogio(draw, x_clock, y_hores + 35, 30)

    # RES
    x_res = x_clock + 60
    draw.text((x_res, y_hores), "RES", fill=COR_BRANCO, font=font_hores)

    img.save("versao2-relogio-no-O.png")
    print("   ✅ versao2-relogio-no-O.png")

# ============================================================================
# VERSÃO 3: RELÓGIO AO LADO DO J2S
# ============================================================================
def versao3():
    print("\n📱 Gerando VERSÃO 3: Relógio ao lado do J2S...")

    img = Image.new('RGB', (512, 512), COR_VERMELHO)
    draw = ImageDraw.Draw(img)
    criar_gradiente(draw, 512, 512)

    try:
        font_j2s = ImageFont.truetype("arialbd.ttf", 140)
        font_hores = ImageFont.truetype("arialbd.ttf", 70)
    except:
        font_j2s = ImageFont.load_default()
        font_hores = ImageFont.load_default()

    # J2S
    text_j2s = "J2S"
    bbox = draw.textbbox((0, 0), text_j2s, font=font_j2s)
    w_j2s = bbox[2] - bbox[0]
    x_j2s = 80
    y_j2s = 140
    draw.text((x_j2s, y_j2s), text_j2s, fill=COR_BRANCO, font=font_j2s)

    # Relógio ao lado
    x_clock = x_j2s + w_j2s + 30
    desenhar_relogio(draw, x_clock, y_j2s + 70, 45)

    # HORES abaixo (alinhado com J2S)
    draw.text((x_j2s, 280), "HORES", fill=COR_BRANCO, font=font_hores)

    img.save("versao3-relogio-ao-lado.png")
    print("   ✅ versao3-relogio-ao-lado.png")

# ============================================================================
# VERSÃO 4: RELÓGIO EMBAIXO DE HORES
# ============================================================================
def versao4():
    print("\n📱 Gerando VERSÃO 4: Relógio embaixo de HORES...")

    img = Image.new('RGB', (512, 512), COR_VERMELHO)
    draw = ImageDraw.Draw(img)
    criar_gradiente(draw, 512, 512)

    try:
        font_j2s = ImageFont.truetype("arialbd.ttf", 140)
        font_hores = ImageFont.truetype("arialbd.ttf", 70)
    except:
        font_j2s = ImageFont.load_default()
        font_hores = ImageFont.load_default()

    # J2S centralizado
    text_j2s = "J2S"
    bbox = draw.textbbox((0, 0), text_j2s, font=font_j2s)
    w = bbox[2] - bbox[0]
    draw.text((256 - w//2, 120), text_j2s, fill=COR_BRANCO, font=font_j2s)

    # HORES centralizado
    text_hores = "HORES"
    bbox2 = draw.textbbox((0, 0), text_hores, font=font_hores)
    w2 = bbox2[2] - bbox2[0]
    draw.text((256 - w2//2, 260), text_hores, fill=COR_BRANCO, font=font_hores)

    # Relógio embaixo centralizado
    desenhar_relogio(draw, 256, 380, 45)

    img.save("versao4-relogio-embaixo.png")
    print("   ✅ versao4-relogio-embaixo.png")

# ============================================================================
# MAIN
# ============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("     GERANDO 4 VERSÕES DO ÍCONE J2S HORES")
    print("=" * 70)

    versao1()
    versao2()
    versao3()
    versao4()

    print("\n" + "=" * 70)
    print("          ✅ 4 VERSÕES GERADAS!")
    print("=" * 70)
    print("\n📦 Arquivos criados:")
    print("   1. versao1-relogio-acima.png")
    print("   2. versao2-relogio-no-O.png")
    print("   3. versao3-relogio-ao-lado.png")
    print("   4. versao4-relogio-embaixo.png")
    print("\n👀 Abra os arquivos e escolha o melhor!\n")
