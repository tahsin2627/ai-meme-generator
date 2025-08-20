document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const gallery = document.getElementById('template-gallery');
    const galleryLoader = document.getElementById('gallery-loader');
    const searchInput = document.getElementById('template-search');
    const moreBtn = document.getElementById('more-templates-btn');
    const imageUpload = document.getElementById('image-upload');
    const fileNameDisplay = document.getElementById('file-name');
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
    let localTemplates = [];
    let onlineTemplates = [];
    let currentLocalPage = 0;
    const templatesPerPage = 6;

    // --- HUGE CURATED LIST FOR OFFLINE/DEFAULT USE ---
    localTemplates = [ { name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" }, { name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" }, { name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" }, { name: "Woman Yelling at a Cat", url: "https://i.imgflip.com/3i7p.jpg" }, { name: "Change My Mind", url: "https://i.imgflip.com/24fxdx.jpg" }, { name: "UNO Draw 25", url: "https://i.imgflip.com/3l0thj.jpg" }, { name: "Bernie I Am Once Again Asking", url: "https://i.imgflip.com/3oevdk.jpg" }, { name: "Sad Pablo Escobar", url: "https://i.imgflip.com/15wsm.jpg" }, { name: "Expanding Brain", url: "https://i.imgflip.com/1jwhww.jpg" }, { name: "Surprised Pikachu", url: "https://i.imgflip.com/2kbn1e.jpg" }, { name: "Is This A Pigeon", url: "https://i.imgflip.com/1o00in.jpg" }, { name: "This is Fine Dog", url: "https://i.imgflip.com/1ur64m.jpg" }, { name: "Monkey Puppet", url: "https://i.imgflip.com/2gnnjh.jpg" }, { name: "Hide the Pain Harold", url: "https://i.imgflip.com/1j2oed.jpg" }, { name: "Panik Kalm Panik", url: "https://i.imgflip.com/3qqvft.jpg" }, { name: "Buff Doge vs Cheems", url: "https://i.imgflip.com/43a45p.jpg" }, { name: "Always Has Been", url: "https://i.imgflip.com/46e43q.jpg" }, { name: "Trade Offer", url: "https://i.imgflip.com/54hjww.jpg" }];

    function renderTemplates(templatesToRender) {
        gallery.innerHTML = ''; // Refresh the gallery
        if (templatesToRender.length === 0) {
            gallery.innerHTML = '<p style="color: #888; text-align: center;">No templates found.</p>';
        }
        templatesToRender.forEach(template => {
            const img = document.createElement('img');
            img.src = template.url;
            img.alt = template.name;
            img.crossOrigin = "anonymous";
            img.addEventListener('click', () => {
                imageUpload.value = '';
                fileNameDisplay.textContent = 'No file chosen';
                document.querySelectorAll('.gallery img').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = template.url;
                image.onload = () => { currentImage = image; };
            });
            img.onerror = () => { img.style.display = 'none'; };
            gallery.appendChild(img);
        });
    }

    async function handleSearch(term) {
        gallery.innerHTML = '';
        galleryLoader.classList.remove('hidden');
        moreBtn.classList.add('hidden');
        
        if (onlineTemplates.length === 0) { // Fetch only if we haven't already
            try {
                const response = await fetch('/api/search');
                onlineTemplates = await response.json();
            } catch (error) {
                console.error("Failed to fetch online templates", error);
                onlineTemplates = localTemplates; // Fallback to local list on error
            }
        }
        
        const filtered = onlineTemplates.filter(t => t.name.toLowerCase().includes(term));
        renderTemplates(filtered);
        galleryLoader.classList.add('hidden');
    }

    function showDefaultTemplates() {
        currentLocalPage = 0;
        const templatesToShow = localTemplates.slice(0, templatesPerPage);
        renderTemplates(templatesToShow);
        moreBtn.classList.remove('hidden');
    }

    // --- EVENT LISTENERS ---
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm.length > 2) {
            handleSearch(searchTerm);
        } else if (searchTerm.length === 0) {
            showDefaultTemplates();
        }
    });
    
    moreBtn.addEventListener('click', () => {
        currentLocalPage++;
        const start = currentLocalPage * templatesPerPage;
        const end = start + templatesPerPage;
        const newTemplates = localTemplates.slice(start, end);
        if (newTemplates.length > 0) {
            renderTemplates(newTemplates);
        }
        if (end >= localTemplates.length) {
            moreBtn.classList.add('hidden'); // Hide if no more local templates
        }
    });

    // ... (rest of the event listeners and core functions are the same)
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            document.querySelectorAll('.gallery img').forEach(i => i.classList.remove('selected'));
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => { currentImage = img; };
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
    async function generateMeme() {
        if (!currentImage || !promptInput.value) { alert('Please select an image and provide a meme idea.'); return; }
        loader.classList.remove('hidden'); actionButtons.classList.add('hidden'); canvas.style.display = 'none';
        const tempCanvas = document.createElement('canvas'); const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = currentImage.width; tempCanvas.height = currentImage.height; tempCtx.drawImage(currentImage, 0, 0);
        const imageData = tempCanvas.toDataURL('image/jpeg');
        try {
            const response = await fetch('/api/generate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageData, userPrompt: promptInput.value, language: languageSelect.value })
            });
            if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Something went wrong'); }
            const data = await response.json(); drawMeme(data.top_text, data.bottom_text);
        } catch (error) { console.error(error); alert(`Error: ${error.message}`);
        } finally { loader.classList.add('hidden'); }
    }
    function wrapText(context, text, x, y, maxWidth, lineHeight, fontStyle) {
        if (!text) return; context.font = `${lineHeight}px ${fontStyle}`; context.fillStyle = 'white'; context.strokeStyle = 'black'; context.lineWidth = lineHeight / 20; context.textAlign = 'center'; const words = text.split(' '); let line = ''; let lineY = y;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '; const metrics = context.measureText(testLine); const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, lineY); context.strokeText(line, x, lineY); line = words[n] + ' '; lineY += lineHeight;
            } else { line = testLine; }
        }
        context.fillText(line, x, lineY); context.strokeText(line, x, lineY);
    }
    function drawMeme(topText, bottomText) {
        canvas.width = currentImage.naturalWidth || currentImage.width; canvas.height = currentImage.naturalHeight || currentImage.height;
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height); const fontName = fontSelect.value;
        const fontSize = canvas.width / 12; const maxWidth = canvas.width * 0.9; const x = canvas.width / 2;
        const topY = fontSize * 1.2; wrapText(ctx, topText, x, topY, maxWidth, fontSize, fontName);
        const bottomY = canvas.height - (fontSize * 1.5); wrapText(ctx, bottomText, x, bottomY, maxWidth, fontSize, fontName);
        canvas.style.display = 'block'; actionButtons.classList.remove('hidden');
    }

    // --- INITIALIZATION ---
    showDefaultTemplates();
});
