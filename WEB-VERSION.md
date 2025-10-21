# 画像縮小アプリ - WEB版

ブラウザから使える画像縮小アプリのWEB版です。ドラッグ&ドロップで画像をアップロードし、リアルタイムでリサイズできます。

## 特徴

- 🌐 **ブラウザで完結** - インストール不要、ブラウザだけで使える
- 🖱️ **ドラッグ&ドロップ対応** - 直感的な操作
- 👀 **リアルタイムプレビュー** - リサイズ前後を同時に確認
- **TIFF完全対応** - TIFFファイルの入出力に対応
- ⚡ **高速処理** - サーバーサイドでSharpを使用した高速処理
- 🎨 **美しいUI** - モダンでレスポンシブなデザイン

## 対応形式

### 入力
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- **TIFF (.tiff, .tif)**
- AVIF (.avif)
- GIF (.gif)
- HEIC/HEIF (.heic, .heif)

### 出力
- JPEG
- PNG
- WebP
- **TIFF**
- AVIF

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. サーバーの起動

#### 開発モード（推奨）

```bash
npm run dev:web
```

#### プロダクションモード

```bash
# ビルド
npm run build

# サーバー起動
npm run start:web
```

### 3. ブラウザでアクセス

サーバーが起動したら、ブラウザで以下のURLにアクセスします：

```
http://localhost:3000
```

## 使い方

### 基本的な使い方

1. **画像をアップロード**
   - ドラッグ&ドロップエリアに画像をドロップ
   - または、エリアをクリックしてファイルを選択

2. **リサイズ設定**
   - 幅（ピクセル）: 目標の幅を入力
   - 高さ（ピクセル）: 目標の高さを入力
   - 品質（1-100）: 出力画像の品質（デフォルト: 80）
   - 出力形式: JPEG, PNG, WebP, TIFF, AVIFから選択
   - フィットモード: リサイズの方法を選択
   - アスペクト比: 維持するかどうかを選択

3. **リサイズ実行**
   - 「リサイズ実行」ボタンをクリック
   - プレビューで結果を確認

4. **ダウンロード**
   - 「ダウンロード」ボタンでリサイズした画像を保存

### フィットモードの説明

- **Inside（収める）** - 指定サイズ内に収める（デフォルト）
- **Outside（覆う）** - 指定サイズを覆うようにする
- **Cover（カバー）** - アスペクト比を維持しながら完全に覆う（トリミングあり）
- **Contain（包含）** - アスペクト比を維持しながら完全に収める
- **Fill（埋める）** - アスペクト比を無視して指定サイズにぴったり合わせる

## 設定例

### TIFFをJPEGに変換

```
幅: 1920
高さ: （空欄）
品質: 90
出力形式: JPEG
フィットモード: Inside
アスペクト比: ✓ 維持する
```

### サムネイル作成

```
幅: 400
高さ: 400
品質: 85
出力形式: JPEG
フィットモード: Cover
アスペクト比: ✓ 維持する
```

### 高品質リサイズ

```
幅: 3840
高さ: （空欄）
品質: 100
出力形式: PNG
フィットモード: Inside
アスペクト比: ✓ 維持する
```

## API エンドポイント

WEB版はREST APIも提供しています。

### GET /api/health

サーバーのヘルスチェック

**レスポンス:**
```json
{
  "status": "ok",
  "message": "Image Resizer API is running"
}
```

### GET /api/formats

対応している画像形式の一覧を取得

**レスポンス:**
```json
{
  "formats": ["jpeg", "jpg", "png", "webp", "tiff", "tif", "avif", "gif", "heic", "heif"]
}
```

### POST /api/resize

画像をリサイズ

**リクエスト（multipart/form-data）:**
- `image`: 画像ファイル（必須）
- `width`: 幅（ピクセル）
- `height`: 高さ（ピクセル）
- `quality`: 品質（1-100）
- `format`: 出力形式（jpeg, png, webp, tiff, avif）
- `fit`: フィットモード（inside, outside, cover, contain, fill）
- `maintainAspectRatio`: アスペクト比を維持（true/false）

**レスポンス:**
```json
{
  "success": true,
  "outputUrl": "/output/resized-1234567890.jpeg",
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

### cURLでの使用例

```bash
# 画像をリサイズ
curl -X POST http://localhost:3000/api/resize \
  -F "image=@photo.jpg" \
  -F "width=800" \
  -F "quality=90" \
  -F "format=jpeg"

# 対応形式を確認
curl http://localhost:3000/api/formats
```

## 環境変数

サーバーのポート番号は環境変数で設定できます：

```bash
# デフォルト: 3000
PORT=8080 npm run dev:web
```

## セキュリティ

- **ファイルサイズ制限**: 最大50MBまで
- **ファイルタイプ検証**: 画像ファイルのみ受け付け
- **自動クリーンアップ**: 1時間以上経過したファイルを自動削除

## トラブルシューティング

### ポートがすでに使用されている

```bash
# 別のポートで起動
PORT=8080 npm run dev:web
```

### アップロードに失敗する

- ファイルサイズが50MB以下か確認
- 画像ファイル形式が対応しているか確認
- ブラウザのコンソールでエラーを確認

### サーバーが起動しない

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# ビルドし直す
npm run build
```

## プロジェクト構成

```
.
├── src/
│   ├── web-server.ts      # Expressサーバー
│   ├── resizer.ts         # 画像リサイズクラス
│   └── ...
├── public/
│   ├── index.html         # フロントエンドHTML
│   └── app.js            # フロントエンドJavaScript
├── uploads/              # アップロードされた画像（一時）
├── output/               # リサイズ後の画像（一時）
└── package.json
```

## パフォーマンス

- **処理速度**: Sharp.jsにより高速処理
- **メモリ効率**: ストリーミング処理で効率的
- **自動クリーンアップ**: 30分ごとに古いファイルを削除

## 本番環境での使用

本番環境にデプロイする場合：

1. **環境変数の設定**
   ```bash
   NODE_ENV=production
   PORT=3000
   ```

2. **ビルド**
   ```bash
   npm run build
   ```

3. **起動**
   ```bash
   npm run start:web
   ```

4. **リバースプロキシの設定**（推奨）
   - Nginx または Apache で SSL/TLS 対応
   - レート制限の設定
   - ファイルサイズ制限の調整

## ライセンス

MIT

## 貢献

貢献を歓迎します！プルリクエストをお気軽に送信してください。
