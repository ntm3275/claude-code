// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const optionsPanel = document.getElementById('optionsPanel');
const previewArea = document.getElementById('previewArea');
const loading = document.getElementById('loading');
const alert = document.getElementById('alert');

const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const qualityInput = document.getElementById('quality');
const formatSelect = document.getElementById('format');
const fitSelect = document.getElementById('fit');
const maintainAspectCheckbox = document.getElementById('maintainAspect');

const resizeBtn = document.getElementById('resizeBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');

const originalPreview = document.getElementById('originalPreview');
const resizedPreview = document.getElementById('resizedPreview');
const originalInfo = document.getElementById('originalInfo');
const resizedInfo = document.getElementById('resizedInfo');

// State
let selectedFile = null;
let resizedImageUrl = null;

// Show alert
function showAlert(message, type = 'error') {
    alert.textContent = message;
    alert.className = `alert alert-${type} active`;
    setTimeout(() => {
        alert.className = 'alert';
    }, 5000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Handle file selection
function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/avif', 'image/heic', 'image/heif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(tiff?|jpe?g|png|gif|webp|avif|heic|heif)$/i)) {
        showAlert('サポートされていないファイル形式です。JPEG, PNG, WebP, TIFF, AVIF, GIF, HEIC, HEIFに対応しています。');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalInfo.innerHTML = `
            ファイル名: ${file.name}<br>
            サイズ: ${formatFileSize(file.size)}
        `;
    };
    reader.readAsDataURL(file);

    // Show options panel
    optionsPanel.classList.add('active');

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
        originalInfo.innerHTML = `
            ファイル名: ${file.name}<br>
            サイズ: ${formatFileSize(file.size)}<br>
            寸法: ${img.width} × ${img.height}
        `;
    };
    img.src = URL.createObjectURL(file);

    // Hide preview area
    previewArea.classList.remove('active');
}

// Upload area click
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
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

// Resize button
resizeBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showAlert('画像ファイルを選択してください。');
        return;
    }

    const width = widthInput.value;
    const height = heightInput.value;

    if (!width && !height) {
        showAlert('幅または高さの少なくとも一方を指定してください。');
        return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('quality', qualityInput.value);
    formData.append('format', formatSelect.value);
    formData.append('fit', fitSelect.value);
    formData.append('maintainAspectRatio', maintainAspectCheckbox.checked);

    // Show loading
    loading.classList.add('active');
    resizeBtn.disabled = true;

    try {
        const response = await fetch('/api/resize', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'リサイズに失敗しました');
        }

        // Show result
        resizedImageUrl = data.outputUrl;
        resizedPreview.src = data.outputUrl;
        resizedInfo.innerHTML = `
            サイズ: ${formatFileSize(data.info.size)}<br>
            寸法: ${data.info.width} × ${data.info.height}<br>
            形式: ${data.info.format.toUpperCase()}
        `;

        previewArea.classList.add('active');
        showAlert('画像のリサイズが完了しました！', 'success');

        // Scroll to preview
        setTimeout(() => {
            previewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message || 'リサイズ中にエラーが発生しました。');
    } finally {
        loading.classList.remove('active');
        resizeBtn.disabled = false;
    }
});

// Reset button
resetBtn.addEventListener('click', () => {
    widthInput.value = '';
    heightInput.value = '';
    qualityInput.value = '80';
    formatSelect.value = '';
    fitSelect.value = 'inside';
    maintainAspectCheckbox.checked = true;
});

// Download button
downloadBtn.addEventListener('click', () => {
    if (!resizedImageUrl) return;

    const link = document.createElement('a');
    link.href = resizedImageUrl;
    link.download = 'resized-image.' + (formatSelect.value || 'jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// New image button
newImageBtn.addEventListener('click', () => {
    selectedFile = null;
    resizedImageUrl = null;
    fileInput.value = '';
    optionsPanel.classList.remove('active');
    previewArea.classList.remove('active');
    originalPreview.src = '';
    resizedPreview.src = '';
    originalInfo.innerHTML = '';
    resizedInfo.innerHTML = '';
    widthInput.value = '';
    heightInput.value = '';
    qualityInput.value = '80';
    formatSelect.value = '';
    fitSelect.value = 'inside';
    maintainAspectCheckbox.checked = true;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Check server health on load
fetch('/api/health')
    .then(response => response.json())
    .then(data => {
        console.log('Server status:', data);
    })
    .catch(error => {
        console.error('Server connection error:', error);
        showAlert('サーバーに接続できません。サーバーが起動しているか確認してください。');
    });
