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
    let allTemplates = []; // Will hold the combined list of local + online templates
    
    // --- HUGE CURATED LIST (INCLUDES CLASSICS LIKE TROLLFACE) ---
    const localTemplates = [ { name: "Trollface", url: "https://i.imgflip.com/1Y8m.jpg"}, { name: "Distracted Boyfriend", url: "https://i.imgflip.com/1ur9b0.jpg" }, { name: "Drake Hotline Bling", url: "https://i.imgflip.com/30b1gx.jpg" }, { name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" }, { name: "Woman Yelling at a Cat", url: "https://i.imgflip.com/3i7p.jpg" }, { name: "Change My Mind", url: "https://i.imgflip.com/24fxdx.jpg" }, { name: "UNO Draw 25", url: "https://i.imgflip.com/3l0thj.jpg" }, { name: "Bernie I Am Once Again Asking", url: "https://i.imgflip.com/3oevdk.jpg" }, { name: "Sad Pablo Escobar", url: "https://i.imgflip.com/15wsm.jpg" }, { name: "Expanding Brain", url: "https://i.imgflip.com/1jwhww.jpg" }, { name: "Surprised Pikachu", url: "https://i.imgflip.com/2kbn1e.jpg" }, { name: "Is This A Pigeon", url: "https://i.imgflip.com/1o00in.jpg" }, { name: "This is Fine Dog", url: "https://i.imgflip.com/1ur64m.jpg" }, { name: "Monkey Puppet", url: "https://i.imgflip.com/2gnnjh.jpg" }, { name: "Hide the Pain Harold", url: "https://i.imgflip.com/1j2oed.jpg" }, { name: "Panik Kalm Panik", url: "https://i.imgflip.com/3qqvft.jpg" }, { name: "Buff Doge vs Cheems", url: "https://i.imgflip.com/43a45p.jpg" }, { name: "Always Has Been", url: "https://i.imgflip.com/46e43q.jpg" }, { name: "Trade Offer", url: "https://i.imgflip.com/54hjww.jpg" } ];

    function renderTemplates(templatesToRender) {
        gallery.innerHTML = '';
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

    async function initializeTemplates() {
        galleryLoader.classList.remove('hidden');
        moreBtn.classList.add('hidden'); // Hide more button initially
        try {
            const response = await fetch('/api/search');
            const onlineTemplates = await response.json();
            // Combine local and online lists, giving priority to local ones to avoid duplicates
            const templateMap = new Map();
            localTemplates.forEach(t => templateMap.set(t.name.toLowerCase(), t));
            onlineTemplates.forEach(t => {
                if (!templateMap.has(t.name.toLowerCase())) {
                    templateMap.set(t.name.toLowerCase(), t);
                }
            });
            allTemplates = Array.from(templateMap.values());
        } catch (error) {
            console.error("Could not fetch online templates, using local list only.", error);
            allTemplates = localTemplates; // Fallback to local list on error
        } finally {
            renderTemplates(localTemplates.slice(0, 6)); // Show first 6 by default
            galleryLoader.classList.add('hidden');
            // Do not show the "More" button by default anymore
        }
    }
    
    // --- EVENT LISTENERS ---
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        moreBtn.classList.add('hidden'); // Hide "more" button during search
        if (searchTerm.length > 1) {
            const filtered = allTemplates.filter(t => t.name.toLowerCase().includes(searchTerm));
            renderTemplates(filtered);
        } else if (searchTerm.length === 0) {
            renderTemplates(localTemplates.slice(0, 6)); // Revert to default
        }
    });
    
    // The "More" button is now hidden, but the logic can be repurposed if you want it back.
    // moreBtn.addEventListener('click', ...);

    // ... (rest of the event listeners and core functions are the same and correct)
    imageUpload.addEventListener('change', (e) => { /* ... */ });
    generateBtn.addEventListener('click', generateMeme);
    tryMoreBtn.addEventListener('click', generateMeme);
    downloadBtn.addEventListener('click', () => { /* ... */ });
    async function generateMame() { /* ... */ }
    function wrapText(context, text, x, y, maxWidth, lineHeight, fontStyle) { /* ... */ }
    function drawMeme(topText, bottomText) { /* ... */ }

    // --- COPYING THE UNCHANGED FUNCTIONS AGAIN FOR COMPLETENESS ---
    imageUpload.addEventListener('change', (e) => { const file = e.target.files[0]; if (file) { fileNameDisplay.textContent = file.name; document.querySelectorAll('.gallery img').forEach(i => i.classList.remove('selected')); const reader = new FileReader(); reader.onload = (event) => { const img = new Image(); img.onload = () => { currentImage = img; }; img.src = event.target.result; }; reader.readAsDataURL(file); } });
    downloadBtn.addEventListener('click', () => { const dataUrl = canvas.toDataURL('image/png'); downloadBtn.href = dataUrl; });
    async function generateMeme() { if (!currentImage || !promptInput.value) { alert('Please select an image and provide a meme idea.'); return; } loader.classList.remove('hidden'); actionButtons.classList.add('hidden'); canvas.style.display = 'none'; const tempCanvas = document.createElement('canvas'); const tempCtx = tempCanvas.getContext('2d'); tempCanvas.width = currentImage.width; tempCanvas.height = currentImage.height; tempCtx.drawImage(currentImage, 0, 0); const imageData = tempCanvas.toDataURL('image/jpeg'); try { const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageData, userPrompt: promptInput.value, language: languageSelect.value }) }); const data = await response.json(); if (!response.ok) { throw new Error(data.error || 'Something went wrong'); } drawMeme(data.top_text, data.bottom_text); } catch (error) { console.error(error); alert(`Error: ${error.message}`); } finally { loader.classList.add('hidden'); } }
    function wrapText(context, text, x, y, maxWidth, lineHeight, fontStyle) { if (!text) return; context.font = `${lineHeight}px ${fontStyle}`; context.fillStyle = 'white'; context.strokeStyle = 'black'; context.lineWidth = lineHeight / 20; context.textAlign = 'center'; const words = text.split(' '); let line = ''; let lineY = y; for (let n = 0; n < words.length; n++) { const testLine = line + words[n] + ' '; const metrics = context.measureText(testLine); const testWidth = metrics.width; if (testWidth > maxWidth && n > 0) { context.fillText(line, x, lineY); context.strokeText(line, x, lineY); line = words[n] + ' '; lineY += lineHeight; } else { line = testLine; } } context.fillText(line, x, lineY); context.strokeText(line, x, lineY); }
    function drawMeme(topText, bottomText) { canvas.width = currentImage.naturalWidth || currentImage.width; canvas.height = currentImage.naturalHeight || currentImage.height; ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height); const fontName = fontSelect.value; const fontSize = canvas.width / 12; const maxWidth = canvas.width * 0.9; const x = canvas.width / 2; const topY = fontSize * 1.2; wrapText(ctx, topText, x, topY, maxWidth, fontSize, fontName); const bottomY = canvas.height - (fontSize * 1.5); wrapText(ctx, bottomText, x, bottomY, maxWidth, fontSize, fontName); canvas.style.display = 'block'; actionButtons.classList.remove('hidden'); }

    // --- INITIALIZATION ---
    initializeTemplates();
});
