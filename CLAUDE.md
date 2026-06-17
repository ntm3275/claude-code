# PDF to Markdown Converter & Image Resizer

このプロジェクトは、PDFからMarkdownへの変換と、画像リサイズ機能を提供するTypeScript製のツールセットです。

## プロジェクト概要

### 含まれるツール

1. **PDF to Markdown コンバーター**
   - PDFファイルをMarkdown形式に変換
   - メタデータ抽出、見出し検出、リスト形式のサポート

2. **画像縮小アプリ（TIFF完全対応）**
   - **CLI版**: コマンドラインインターフェース
   - **WEB版**: ブラウザベースのインターフェース（Express + React風UI）

## プロジェクト構造

```
.
├── src/
│   ├── cli.ts              # PDF変換CLI
│   ├── converter.ts        # PDFコンバータークラス
│   ├── image-cli.ts        # 画像リサイズCLI
│   ├── resizer.ts          # 画像リサイザークラス
│   ├── web-server.ts       # Expressサーバー
│   └── index.ts            # エントリーポイント
├── public/
│   ├── index.html          # WEBインターフェース
│   └── app.js              # フロントエンドJavaScript
├── dist/                   # ビルド出力（生成される）
├── uploads/               # 一時アップロードファイル（自動削除）
├── output/                # リサイズ済み画像（自動削除）
├── test-images/           # テスト用画像（gitignore）
├── package.json
├── tsconfig.json
└── README.md
```

## 技術スタック

### コア技術
- **言語**: TypeScript 5.3+
- **ランタイム**: Node.js v16+
- **ビルドツール**: tsc (TypeScript Compiler)

### 主要ライブラリ

#### PDF処理
- `pdf-parse`: PDFファイルの解析とテキスト抽出

#### 画像処理
- `sharp`: 高性能な画像処理ライブラリ
  - TIFF, JPEG, PNG, WebP, AVIF, GIF, HEIC/HEIF対応
  - ネイティブコード実装で高速
  - メモリ効率的なストリーミング処理

#### WEBサーバー
- `express`: Webサーバーフレームワーク
- `multer`: マルチパートファイルアップロード処理

#### CLI
- `commander`: コマンドラインインターフェース構築

## 開発とビルド

### セットアップ

```bash
# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build
```

### 開発スクリプト

```bash
# PDF変換CLI（開発モード）
npm run dev -- convert input.pdf

# 画像リサイズCLI（開発モード）
npm run dev:image -- resize image.jpg --width 800

# WEBサーバー（開発モード）
npm run dev:web
```

### プロダクションスクリプト

```bash
# ビルド後の実行
npm run build

# PDF変換CLI
npm start -- convert input.pdf

# 画像リサイズCLI
node dist/image-cli.js resize image.jpg --width 800

# WEBサーバー
npm run start:web
```

## 画像リサイズ機能の詳細

### CLI版の使い方

```bash
# 単一画像のリサイズ
npm run dev:image -- resize <画像パス> --width <幅> [オプション]

# オプション
# -w, --width <number>       幅（ピクセル）
# -h, --height <number>      高さ（ピクセル）
# -o, --output <path>        出力パス
# -f, --format <format>      出力形式（jpeg, png, webp, tiff, avif）
# -q, --quality <number>     品質（1-100、デフォルト: 80）
# --fit <mode>               フィットモード（inside, cover, contain, fill, outside）
# --no-aspect                アスペクト比を維持しない

# 例: TIFFをJPEGに変換
npm run dev:image -- resize scan.tiff --width 1920 --format jpeg --quality 90

# 一括処理
npm run dev:image -- batch <ディレクトリ> --width <幅> [オプション]

# 対応形式の確認
npm run dev:image -- formats
```

### WEB版の仕組み

#### サーバー側（src/web-server.ts）

- **ポート**: 3000（環境変数PORTで変更可能）
- **バインド**: 0.0.0.0（すべてのネットワークインターフェース）
- **ファイルサイズ制限**: 最大50MB
- **自動クリーンアップ**: 30分ごとに1時間以上経過したファイルを削除

#### APIエンドポイント

1. **GET /api/health**
   - サーバーのヘルスチェック
   - レスポンス: `{"status": "ok", "message": "..."}`

2. **GET /api/formats**
   - 対応画像形式の一覧
   - レスポンス: `{"formats": ["jpeg", "jpg", "png", ...]}`

3. **POST /api/resize**
   - 画像のアップロードとリサイズ
   - Content-Type: multipart/form-data
   - フィールド:
     - `image`: 画像ファイル（必須）
     - `width`: 幅
     - `height`: 高さ
     - `quality`: 品質（1-100）
     - `format`: 出力形式
     - `fit`: フィットモード
     - `maintainAspectRatio`: アスペクト比維持（true/false）
   - レスポンス:
     ```json
     {
       "success": true,
       "outputUrl": "/output/resized-XXXXX.jpeg",
       "info": {
         "width": 800,
         "height": 600,
         "format": "jpeg",
         "size": 12345
       },
       "originalFile": {
         "name": "photo.jpg",
         "size": 123456
       }
     }
     ```

#### フロントエンド（public/index.html + app.js）

- **UI**: グラデーションデザイン、レスポンシブ対応
- **機能**:
  - ドラッグ&ドロップによる画像アップロード
  - リアルタイムプレビュー（元画像とリサイズ後を並べて表示）
  - リサイズオプションの設定
  - リサイズ実行とダウンロード
- **技術**: Vanilla JavaScript（フレームワークなし）

## TIFF対応について

### 重要な実装ポイント

1. **MIMEタイプ検証**（src/web-server.ts:38-59）
   - TIFFのMIMEタイプ: `image/tiff`
   - 拡張子: `.tiff`, `.tif`
   - multerのfileFilterで正しく検証

2. **Sharp設定**（src/resizer.ts:63-74）
   - TIFF入力: Sharpが自動的に処理
   - TIFF出力: `.tiff({ quality })` メソッド使用

### よくある問題と解決策

- **問題**: TIFFファイルのアップロードが拒否される
- **原因**: MIMEタイプ検証の不備
- **解決**: `allowedMimeTypes`に`'image/tiff'`を追加、または`file.mimetype.startsWith('image/')`でチェック

## テスト

### テスト用画像の作成

```bash
# test-imagesディレクトリにテスト画像を作成
cd test-images
node create-test-image.js
```

これにより以下が作成されます：
- `sample.jpg`: JPEG画像（2000x1500）
- `sample.tiff`: TIFF画像（1600x1200）

### 動作確認

```bash
# CLI版のテスト
npm run dev:image -- resize test-images/sample.jpg --width 800

# WEB版のテスト（サーバー起動後）
curl -X POST http://localhost:3000/api/resize \
  -F "image=@test-images/sample.tiff" \
  -F "width=800" \
  -F "format=jpeg"
```

## 環境要件

### システム要件
- Node.js v16以上
- npm または yarn

### Sharpのビルド要件

Sharpはネイティブモジュールを使用するため、以下が必要：

- **Windows**: Visual Studio Build Tools
- **macOS**: Xcode Command Line Tools（`xcode-select --install`）
- **Linux**: build-essential パッケージ
  ```bash
  # Debian/Ubuntu
  sudo apt-get install build-essential
  ```

## デプロイ

### プロダクション環境

```bash
# 1. ビルド
npm run build

# 2. 環境変数設定
export NODE_ENV=production
export PORT=3000

# 3. サーバー起動
npm run start:web
```

### Docker対応

サーバーは`0.0.0.0`でリッスンするため、Dockerコンテナ内で動作可能。

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:web"]
```

## セキュリティ

### 実装済みの対策

1. **ファイルサイズ制限**: 50MB上限
2. **ファイルタイプ検証**: 画像ファイルのみ受付
3. **自動クリーンアップ**: 古いファイルを定期削除
4. **パス検証**: path.join/path.resolveで安全なパス生成

### 推奨事項（プロダクション）

1. **レート制限**: express-rate-limitの導入
2. **HTTPS**: リバースプロキシ（Nginx）でSSL/TLS対応
3. **CORS設定**: 本番環境に応じて調整
4. **ファイルアップロード制限**: 必要に応じて追加の検証

## トラブルシューティング

### Sharp関連のエラー

```
Error: Could not load the "sharp" module
```

**解決策**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### ポートが使用中

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決策**:
```bash
# プロセスを終了
lsof -ti:3000 | xargs kill -9
# または別のポートで起動
PORT=8080 npm run start:web
```

### TIFFファイルが処理できない

**確認事項**:
1. Sharpが正しくインストールされているか
2. ファイル拡張子が`.tiff`または`.tif`か
3. ファイルが破損していないか

## 今後の拡張予定

- [ ] バッチ処理のWEBインターフェース
- [ ] 画像のクロップ機能
- [ ] 透かし追加機能
- [ ] より多くの画像形式のサポート（BMP, ICOなど）
- [ ] プログレスバーの実装

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します！

---

**最終更新**: 2025年10月21日
**バージョン**: 1.0.0
