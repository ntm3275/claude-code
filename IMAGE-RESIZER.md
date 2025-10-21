# 画像縮小アプリケーション

TIFFファイルを含む様々な画像形式に対応した、シンプルで効率的な画像縮小ツールです。

## 機能

- 単一の画像ファイルを縮小
- 複数の画像ファイルを一括縮小
- **TIFFファイル対応** (入力・出力両方)
- JPEG, PNG, WebP, AVIF, GIF など主要な画像形式に対応
- アスペクト比の維持オプション
- 品質設定（1-100）
- 様々なフィット モード（cover, contain, fill, inside, outside）
- 出力形式の変換（例：TIFF → JPEG）

## 対応形式

### 入力対応
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- **TIFF (.tiff, .tif)**
- AVIF (.avif)
- GIF (.gif)
- SVG (.svg)
- HEIF/HEIC (.heif, .heic)

### 出力対応
- JPEG
- PNG
- WebP
- **TIFF**
- AVIF

## インストール

### 必要要件

- Node.js (v16以上)
- npm または yarn

### 依存関係のインストール

```bash
npm install
```

### プロジェクトのビルド

```bash
npm run build
```

## 使い方

### コマンドラインインターフェース

#### 単一の画像ファイルを縮小

```bash
# 基本的な縮小（幅を指定）
npm run dev:image -- resize input.jpg --width 800

# 高さを指定
npm run dev:image -- resize input.tiff --height 600

# 幅と高さを指定
npm run dev:image -- resize input.png --width 800 --height 600

# 出力パスを指定
npm run dev:image -- resize input.tiff --width 1024 --output output.jpg

# 出力形式を指定（TIFFから他の形式へ変換）
npm run dev:image -- resize input.tiff --width 800 --format jpeg

# 品質を指定
npm run dev:image -- resize input.jpg --width 800 --quality 90

# アスペクト比を維持しない
npm run dev:image -- resize input.png --width 800 --height 600 --no-aspect

# フィットモードを指定
npm run dev:image -- resize input.tiff --width 800 --height 600 --fit cover
```

ビルド後は以下のようにも使用できます:

```bash
node dist/image-cli.js resize input.tiff --width 800
```

#### 複数の画像ファイルを一括縮小

```bash
# ディレクトリ内のすべての画像を縮小
npm run dev:image -- batch ./images --width 800

# 出力ディレクトリを指定
npm run dev:image -- batch ./images --width 800 --output ./resized

# すべてのTIFFファイルをJPEGに変換して縮小
npm run dev:image -- batch ./tiff-images --width 1024 --format jpeg

# 高品質で縮小
npm run dev:image -- batch ./images --width 1920 --quality 95
```

#### 対応形式の確認

```bash
npm run dev:image -- formats
```

### CLIオプション

#### `resize` コマンド

- `<input>`: 入力画像ファイルのパス（必須）
- `-w, --width <number>`: 目標の幅（ピクセル）
- `-h, --height <number>`: 目標の高さ（ピクセル）
- `-o, --output <path>`: 出力画像ファイルのパス（オプション）
- `-f, --format <format>`: 出力形式（jpeg, png, webp, tiff, avif）
- `-q, --quality <number>`: 品質（1-100、デフォルト: 80）
- `--fit <mode>`: フィットモード（cover, contain, fill, inside, outside、デフォルト: inside）
- `--no-aspect`: アスペクト比を維持しない

**注意**: `--width` または `--height` のいずれか一方は必須です。

#### `batch` コマンド

- `<input-dir>`: 画像ファイルが含まれるディレクトリ（必須）
- `-w, --width <number>`: 目標の幅（ピクセル）
- `-h, --height <number>`: 目標の高さ（ピクセル）
- `-o, --output <dir>`: 縮小画像の出力ディレクトリ（オプション）
- `-f, --format <format>`: 出力形式（jpeg, png, webp, tiff, avif）
- `-q, --quality <number>`: 品質（1-100、デフォルト: 80）
- `--fit <mode>`: フィットモード（cover, contain, fill, inside, outside、デフォルト: inside）
- `--no-aspect`: アスペクト比を維持しない

**注意**: `--width` または `--height` のいずれか一方は必須です。

### フィットモードの説明

- **inside** (デフォルト): 画像を指定されたサイズ内に収める（はみ出さない）
- **outside**: 画像を指定されたサイズを覆うようにする（画像がはみ出る可能性がある）
- **cover**: アスペクト比を維持しながら、指定されたサイズを完全に覆う（画像がトリミングされる可能性がある）
- **contain**: アスペクト比を維持しながら、指定されたサイズ内に収める
- **fill**: アスペクト比を無視して、指定されたサイズにぴったり合わせる

### プログラマティックAPI

Node.js/TypeScriptプロジェクトで直接使用することもできます:

```typescript
import { ImageResizer } from './src/resizer';

const resizer = new ImageResizer();

// 単一ファイルの縮小
const info = await resizer.resize('input.tiff', {
  width: 800,
  height: 600,
  outputPath: 'output.jpg',
  format: 'jpeg',
  quality: 85,
  maintainAspectRatio: true,
  fit: 'inside'
});

console.log(`Resized to: ${info.width}x${info.height}`);

// 複数ファイルの縮小
await resizer.resizeMultiple(
  ['image1.tiff', 'image2.png', 'image3.jpg'],
  'output-directory',
  {
    width: 1024,
    format: 'jpeg',
    quality: 90
  }
);

// 対応形式の取得
const formats = resizer.getSupportedFormats();
console.log('Supported formats:', formats);
```

## 使用例

### TIFFファイルの縮小

```bash
# TIFFファイルを縮小（TIFF形式のまま）
npm run dev:image -- resize photo.tiff --width 1920

# TIFFファイルをJPEGに変換して縮小
npm run dev:image -- resize photo.tiff --width 1920 --format jpeg --quality 90

# TIFFファイルをPNGに変換して縮小
npm run dev:image -- resize scan.tiff --width 2048 --format png
```

### 高品質な画像の縮小

```bash
# 最高品質で縮小
npm run dev:image -- resize photo.jpg --width 3840 --quality 100

# WebP形式で高品質に変換
npm run dev:image -- resize photo.jpg --width 1920 --format webp --quality 95
```

### 一括処理

```bash
# TIFFファイルのディレクトリを一括縮小
npm run dev:image -- batch ./tiff-scans --width 2048 --format jpeg

# すべての画像を統一サイズに縮小
npm run dev:image -- batch ./photos --width 1920 --height 1080 --fit cover
```

## 技術詳細

### 使用ライブラリ

このアプリケーションは、高性能な画像処理ライブラリ [sharp](https://sharp.pixelplumbing.com/) を使用しています。sharpは：

- ネイティブコードで実装されており、非常に高速
- TIFF を含む多様な画像形式に対応
- メモリ効率が良い
- プロダクション環境で実証済み

### パフォーマンス

- 大きな画像でも高速に処理
- メモリ使用量を最小限に抑制
- ストリーミング処理により効率的

## トラブルシューティング

### "File not found" エラー

画像ファイルのパスが正しいことを確認してください。

### "At least one dimension must be specified" エラー

`--width` または `--height` のいずれか一方を指定する必要があります。

### TIFFファイルが正しく処理されない

- ファイルが破損していないか確認してください
- ファイルの拡張子が `.tiff` または `.tif` であることを確認してください

### インストールエラー

sharpライブラリはネイティブモジュールを使用しているため、インストール時にビルドツールが必要な場合があります：

**Windows**: Visual Studio Build Toolsをインストール
**macOS**: Xcodeコマンドラインツールをインストール
**Linux**: `build-essential` パッケージをインストール

```bash
# Linux (Debian/Ubuntu)
sudo apt-get install build-essential

# macOS
xcode-select --install
```

## ライセンス

MIT

## 貢献

貢献を歓迎します！プルリクエストをお気軽に送信してください。
