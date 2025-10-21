// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const progressSection = document.getElementById('progressSection');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const fileSelected = document.getElementById('fileSelected');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFileBtn = document.getElementById('removeFile');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newConversionBtn = document.getElementById('newConversionBtn');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const preserveFormattingCheckbox = document.getElementById('preserveFormatting');
const metadataDiv = document.getElementById('metadata');
const previewContent = document.getElementById('previewContent');
const progressText = document.getElementById('progressText');
const errorMessage = document.getElementById('errorMessage');

let selectedFile = null;
let convertedMarkdown = null;
let downloadFilename = 'converted.md';

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Handle file selection
function handleFileSelect(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
        showError('PDFファイルのみアップロード可能です。');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('ファイルサイズが10MBを超えています。');
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    uploadArea.style.display = 'none';
    fileSelected.style.display = 'block';
}

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
});

// Click to upload
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
});

// Remove file
removeFileBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    fileSelected.style.display = 'none';
});

// Convert file
convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show progress
    uploadSection.style.display = 'none';
    progressSection.style.display = 'block';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('pdf', selectedFile);
        formData.append('preserveFormatting', preserveFormattingCheckbox.checked);

        progressText.textContent = '変換中...';

        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || '変換に失敗しました');
        }

        // Store converted data
        convertedMarkdown = data.markdown;
        downloadFilename = data.filename;

        // Display results
        displayResults(data);

    } catch (error) {
        showError(error.message || '変換中にエラーが発生しました');
    }
});

// Display results
function displayResults(data) {
    progressSection.style.display = 'none';
    resultSection.style.display = 'block';

    // Display metadata
    metadataDiv.innerHTML = `
        <p><strong>タイトル:</strong> ${data.metadata.title}</p>
        <p><strong>著者:</strong> ${data.metadata.author}</p>
        <p><strong>ページ数:</strong> ${data.metadata.pages}</p>
        <p><strong>ファイルサイズ:</strong> ${formatFileSize(data.metadata.size)}</p>
    `;

    // Display preview (first 1000 characters)
    const preview = data.markdown.substring(0, 1000);
    previewContent.textContent = preview + (data.markdown.length > 1000 ? '\n\n... (続きはダウンロードしてご確認ください)' : '');
}

// Show error
function showError(message) {
    uploadSection.style.display = 'none';
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'block';
    errorMessage.textContent = message;
}

// Download markdown
downloadBtn.addEventListener('click', () => {
    if (!convertedMarkdown) return;

    const blob = new Blob([convertedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// New conversion
function resetApp() {
    selectedFile = null;
    convertedMarkdown = null;
    fileInput.value = '';
    uploadSection.style.display = 'block';
    progressSection.style.display = 'none';
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';
    uploadArea.style.display = 'block';
    fileSelected.style.display = 'none';
}

newConversionBtn.addEventListener('click', resetApp);
tryAgainBtn.addEventListener('click', resetApp);

// Check server health on load
window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('Server status:', data);
    } catch (error) {
        console.error('Failed to connect to server:', error);
    }
});
