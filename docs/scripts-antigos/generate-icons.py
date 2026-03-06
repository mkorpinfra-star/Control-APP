#!/usr/bin/env python3
"""
Gera ícones PNG para o app J2S Obras
Requer: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Erro: Pillow nao instalado")
    print("Execute: pip install pillow")
    exit(1)

def create_icon(size, output_path):
    """Cria um ícone com fundo vermelho e texto J2S branco"""

    # Criar imagem com fundo vermelho
    img = Image.new('RGB', (size, size), color='#CE0201')
    draw = ImageDraw.Draw(img)

    # Tentar usar fonte melhor, senão usa padrão
    try:
        # Tamanho da fonte proporcional
        font_size = int(size * 0.375)
        # Tenta Arial/Inter/Helvetica
        for font_name in ['arial.ttf', 'Arial.ttf', 'Helvetica.ttf']:
            try:
                font = ImageFont.truetype(font_name, font_size)
                break
            except:
                pass
        else:
            # Se nenhuma funcionar, usa padrão
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Texto J2S
    text = "J2S"

    # Calcular posição centralizada
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2 - int(size * 0.05)  # Ajuste vertical

    # Desenhar texto branco
    draw.text((x, y), text, fill='white', font=font)

    # Salvar
    img.save(output_path, 'PNG')
    print(f"Criado: {output_path} ({size}x{size})")

def main():
    print("Gerando icones J2S Obras...")
    print()

    # Criar ícones
    create_icon(192, 'public/icon-192.png')
    create_icon(512, 'public/icon-512.png')

    print()
    print("Icones criados com sucesso!")
    print()
    print("Arquivos gerados:")
    print("   - public/icon-192.png")
    print("   - public/icon-512.png")
    print()
    print("Proximo passo:")
    print("   npm run build")

if __name__ == '__main__':
    main()
