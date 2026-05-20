#!/usr/bin/env python3
"""
压缩博客图片脚本
用法: python3 scripts/compress_images.py [--quality 80] [--max-width 1200]
"""
import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("需要安装 Pillow: pip install Pillow")
    sys.exit(1)


def compress_image(input_path, output_path=None, quality=80, max_width=1200):
    """压缩单张图片"""
    try:
        img = Image.open(input_path)
    except Exception as e:
        print(f"跳过 {Path(input_path).name}: {e}")
        return None
    
    # 如果宽度超过 max_width，等比缩放
    if img.width > max_width:
        ratio = max_width / img.width
        new_size = (max_width, int(img.height * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)
    
    # 转为 RGB（如果是 RGBA 的 PNG，转成 RGB 后压缩效果更好）
    if img.mode == 'RGBA':
        bg = Image.new('RGB', img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg
    
    # 输出路径
    if output_path is None:
        p = Path(input_path)
        output_path = p.parent / f"{p.stem}_compressed{p.suffix}"
    
    # 保存压缩后的图片
    img.save(output_path, optimize=True, quality=quality)
    
    # 显示压缩结果
    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(output_path)
    ratio = (1 - compressed_size / original_size) * 100
    
    print(f"{Path(input_path).name}: {original_size//1024}KB -> {compressed_size//1024}KB (压缩 {ratio:.1f}%)")
    return output_path


def main():
    parser = argparse.ArgumentParser(description='压缩博客图片')
    parser.add_argument('--quality', type=int, default=80, help='压缩质量 (1-100)，默认 80')
    parser.add_argument('--max-width', type=int, default=1200, help='最大宽度，默认 1200')
    parser.add_argument('--input', '-i', help='输入图片路径')
    parser.add_argument('--all', action='store_true', help='压缩 source/img 目录下所有图片')
    args = parser.parse_args()
    
    img_dir = Path(__file__).parent.parent / 'source' / 'img'
    
    if args.all:
        # 压缩目录下所有 PNG/JPG
        for ext in ['*.png', '*.jpg', '*.jpeg']:
            for img_path in img_dir.glob(ext):
                if '_compressed' not in img_path.name:
                    compress_image(str(img_path), quality=args.quality, max_width=args.max_width)
    elif args.input:
        compress_image(args.input, quality=args.quality, max_width=args.max_width)
    else:
        print("用法:")
        print("  压缩单张: python3 scripts/compress_images.py -i source/img/xxx.png")
        print("  压缩全部: python3 scripts/compress_images.py --all")
        print("  自定义:   python3 scripts/compress_images.py --all --quality 70 --max-width 1000")


if __name__ == '__main__':
    main()
