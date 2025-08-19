document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const gallery = document.getElementById('template-gallery');
    const imageUpload = document.getElementById('image-upload');
    const promptInput = document.getElementById('prompt-input');
    const languageSelect = document.getElementById('language-select');
    const fontSelect = document.getElementById('font-select');
    const generateBtn = document.getElementById('generate-btn');
    const loader = document.getElementById('loader');
    const canvas = document.getElementById('meme-canvas');
    const ctx = canvas.getContext('2d');
    const actionButtons = document.getElementById('action-buttons');
    const tryMoreBtn = document.getElementById('try-more-btn');
    const downloadBtn = document.getElementById('download-btn');

    // --- STATE ---
    let currentImage = null;
    let selectedTemplateUrl = null;

    // --- TEMPLATES ---
    const templates = [
        { name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" },
        { name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" },
        { name: "Woman Yelling at a Cat", url: "https://i.imgflip.com/3i7p.jpg" },
        { name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
        { name: "Change My Mind", url: "https://i.imgflip.com/24fxdx.jpg" },
        { name: "Sad Pablo Escobar", url: "https://i.imgflip.com/15wsm.jpg" }
    ];

    function loadTemplates() {
        templates.forEach(template => {
            const img = document.createElement('img');
            img.src = template.url;
            img.alt = template.name;
            img.crossOrigin = "anonymous"; // Important for loading images into canvas
            img.addEventListener('click', () => {
                // Clear file upload
                imageUpload.value = '';
                // Highlight selected template
                document.querySelectorAll('.gallery img').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');

                selectedTemplateUrl = template.url;
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = template.url;
                image.onload = () => {
                    currentImage = image;
                };
            });
            gallery.appendChild(img);
        });
    }

    // --- EVENT LISTENERS ---
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Unselect templates
            document.querySelectorAll('.gallery img').forEach(i => i.classList.remove('selected'));
            selectedTemplateUrl = null;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    currentImage = img;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    generateBtn.addEventListener('click', generateMeme);
    tryMoreBtn.addEventListener('click', generateMeme);

    downloadBtn.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        downloadBtn.href = dataUrl;
    });


    // --- CORE FUNCTIONS ---
    async function generateMeme() {
        if (!currentImage || !promptInput.value) {
            alert('Please select an image and provide a meme idea.');
            return;
        }

        loader.classList.remove('hidden');
        actionButtons.classList.add('hidden');
        canvas.style.display = 'none';

        // Convert the current image to base64
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = currentImage.width;
        tempCanvas.height = currentImage.height;
        tempCtx.drawImage(currentImage, 0, 0);
        const imageData = tempCanvas.toDataURL('image/jpeg');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageData,
                    userPrompt: promptInput.value,
                    language: languageSelect.value
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Something went wrong');
            }

            const data = await response.json();
            drawMeme(data.top_text, data.bottom_text);

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            loader.classList.add('hidden');
        }
    }

    function drawMeme(topText, bottomText) {
        canvas.width = currentImage.naturalWidth || currentImage.width;
        canvas.height = currentImage.naturalHeight || currentImage.height;
        ctx.drawImage(currentImage, 0, 0);

        const fontName = fontSelect.value;
        const fontSize = canvas.width / 10;
        ctx.font = `${fontSize}px ${fontName}`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = fontSize / 20;
        ctx.textAlign = 'center';

        // Draw top text
        if (topText) {
            ctx.fillText(topText, canvas.width / 2, fontSize * 1.2);
            ctx.strokeText(topText, canvas.width / 2, fontSize * 1.2);
        }

        // Draw bottom text
        if (bottomText) {
            ctx.fillText(bottomText, canvas.width / 2, canvas.height - (fontSize * 0.5));
            ctx.strokeText(bottomText, canvas.width / 2, canvas.height - (fontSize * 0.5));
        }
        
        canvas.style.display = 'block';
        actionButtons.classList.remove('hidden');
    }

    // --- INITIALIZATION ---
    loadTemplates();
});
