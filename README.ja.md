# PDF to Markdown コンバーター & 画像縮小アプリ

ドキュメントと画像処理のためのシンプルで効率的なコマンドラインツール集です。

## 含まれるツール

### 1. PDF to Markdown コンバーター
PDFファイルをMarkdown形式に簡単に変換します。

### 2. 画像縮小アプリ（TIFF対応）
TIFFを含む様々な形式の画像を縮小します。
- **CLI版**: バッチ処理向けコマンドラインインターフェース
- **WEB版**: ドラッグ&ドロップ対応のブラウザインターフェース

## 機能

### PDF to Markdown
- 単一のPDFファイルをMarkdownに変換
- 複数のPDFファイルを一括変換
- フォーマット保持オプション
- PDFメタデータの抽出(タイトル、著者、日付)
- 自動見出し検出
- リスト形式のサポート
- コードブロックの検出

### 画像縮小アプリ
- 単一または複数の画像を縮小
- **TIFFファイル対応**（入力・出力両方）
- JPEG、PNG、WebP、AVIF、GIFなど多様な形式に対応
- アスペクト比の維持オプション
- 品質設定（1-100）
- 様々なフィットモード（cover、contain、fill、inside、outside）
- 形式変換（例：TIFF → JPEG）
- **WEBインターフェース**（ドラッグ&ドロップ、リアルタイムプレビュー対応）

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

#### 単一のPDFファイルを変換

```bash
# 基本的な変換 (出力は input-file.md として保存されます)
npm run dev -- convert path/to/file.pdf

# 出力パスを指定
npm run dev -- convert path/to/file.pdf -o output.md

# フォーマットを保持
npm run dev -- convert path/to/file.pdf -p
```

ビルド後は以下のようにも使用できます:

```bash
node dist/cli.js convert path/to/file.pdf
```

#### 複数のPDFファイルを一括変換

```bash
# ディレクトリ内のすべてのPDFを変換
npm run dev -- batch path/to/pdf-directory

# 出力ディレクトリを指定
npm run dev -- batch path/to/pdf-directory -o path/to/output

# フォーマットを保持
npm run dev -- batch path/to/pdf-directory -p
```

### CLIオプション

#### `convert` コマンド

- `<input>`: PDFファイルのパス (必須)
- `-o, --output <path>`: 出力するMarkdownファイルのパス (オプション)
- `-p, --preserve`: PDFのフォーマットを保持 (オプション)

#### `batch` コマンド

- `<input-dir>`: PDFファイルが含まれるディレクトリ (必須)
- `-o, --output <dir>`: Markdownファイルの出力ディレクトリ (オプション)
- `-p, --preserve`: PDFのフォーマットを保持 (オプション)

### プログラマティックAPI

Node.js/TypeScriptプロジェクトで直接使用することもできます:

```typescript
import { PDFToMarkdownConverter } from './src/converter';

const converter = new PDFToMarkdownConverter();

// 単一ファイルの変換
const markdown = await converter.convert('input.pdf', {
  outputPath: 'output.md',
  preserveFormatting: true
});

// 複数ファイルの変換
await converter.convertMultiple(
  ['file1.pdf', 'file2.pdf'],
  'output-directory',
  { preserveFormatting: false }
);
```

## 出力形式

生成されるMarkdownファイルには以下が含まれます:

1. **フロントマター**: ドキュメントのメタデータ (タイトル、著者、サブジェクト、日付)
2. **見出し**: PDF構造から自動検出
3. **段落**: 通常のテキストコンテンツ
4. **リスト**: 箇条書きと番号付きリスト
5. **コードブロック**: インデントされたテキストセクション

### 出力例

```markdown
---
title: サンプルドキュメント
author: 山田太郎
date: 2024-01-01
---

## はじめに

これはPDFドキュメントをMarkdown形式に変換したサンプルです。

## 機能

- 機能1
- 機能2
- 機能3

## コード例

```
function hello() {
  console.log("Hello, World!");
}
```
```

## 開発

### プロジェクト構造

```
.
├── src/
│   ├── converter.ts    # メインコンバータークラス
│   ├── cli.ts          # CLIインターフェース
│   └── index.ts        # エントリーポイント
├── dist/               # コンパイルされたJavaScript (生成される)
├── package.json        # 依存関係とスクリプト
├── tsconfig.json       # TypeScript設定
└── README.md          # このファイル
```

### スクリプト

- `npm run build`: TypeScriptをJavaScriptにコンパイル
- `npm run dev`: 開発モードでPDFコンバーターCLIを実行
- `npm run dev:image`: 開発モードで画像縮小アプリCLIを実行
- `npm run dev:web`: 開発モードで画像縮小WEBサーバーを実行
- `npm start`: コンパイルされたPDFコンバーターCLIを実行
- `npm run start:web`: コンパイルされた画像縮小WEBサーバーを実行

## 画像縮小アプリ

画像縮小アプリの詳細なドキュメント：
- CLI版: [IMAGE-RESIZER.md](IMAGE-RESIZER.md)
- WEB版: [WEB-VERSION.md](WEB-VERSION.md)

### クイックスタート

```bash
# 単一の画像を縮小
npm run dev:image -- resize photo.jpg --width 800

# TIFFファイルをJPEGに変換して縮小
npm run dev:image -- resize scan.tiff --width 1920 --format jpeg

# ディレクトリ内のすべての画像を一括縮小
npm run dev:image -- batch ./photos --width 1024

# 対応形式を確認
npm run dev:image -- formats
```

### WEB版 クイックスタート

```bash
# WEBサーバーを起動
npm run dev:web

# ブラウザで以下のURLにアクセス:
# http://localhost:3000

# 使い方:
# 1. 画像をドラッグ&ドロップ、またはクリックしてアップロード
# 2. リサイズオプションを設定（幅、高さ、品質、形式）
# 3. 「リサイズ実行」ボタンをクリック
# 4. プレビューを確認してダウンロード
```

WEB版の完全なドキュメントは [WEB-VERSION.md](WEB-VERSION.md) を参照してください。

## 仕組み

1. **PDF解析**: `pdf-parse`ライブラリを使用してPDFからテキストを抽出
2. **テキスト処理**: 抽出されたテキストを分析して構造を検出
3. **フォーマット**: 検出されたパターンに基づいてMarkdownフォーマットを適用
4. **出力**: フォーマットされたコンテンツをMarkdownファイルに保存

## 制限事項

- 複雑なPDFレイアウトは完璧に変換されない場合があります
- 画像は抽出されません(テキストのみ)
- 表は通常のテキストに変換されます
- フォントスタイル(太字、斜体)は保持されません
- ページ区切りは明示的にマークされません

## トラブルシューティング

### "File not found" エラー

PDFファイルのパスが正しいことを確認してください。

### "Failed to convert PDF" エラー

PDFが暗号化されているか破損している可能性があります。まずPDFリーダーで開けることを確認してください。

### 依存関係が見つからない

`npm install`を実行してすべての必要な依存関係をインストールしてください。

## ライセンス

MIT

## 貢献

貢献を歓迎します!プルリクエストをお気軽に送信してください。
