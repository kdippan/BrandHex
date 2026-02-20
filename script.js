// Only run the extractor logic if we are on the index.html page
const form = document.getElementById('extractForm');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const urlInput = document.getElementById('urlInput').value;
        const loader = document.getElementById('loader');
        const errorEl = document.getElementById('error');
        const resultCard = document.getElementById('resultCard');
        
        // UI Reset
        loader.style.display = 'block';
        errorEl.style.display = 'none';
        resultCard.style.display = 'none';

        try {
            // Fetch from Microlink with palette detection enabled
            const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(urlInput)}&palette=true`;
            
            const response = await fetch(apiUrl);
            const json = await response.json();

            loader.style.display = 'none';

            if (json.status === 'success' && json.data && json.data.logo) {
                const logo = json.data.logo;

                // Bind Data
                document.getElementById('logoImg').src = logo.url;
                document.getElementById('metaSource').href = logo.url;
                document.getElementById('metaFormat').textContent = (logo.type || 'N/A').toUpperCase();
                document.getElementById('metaDimensions').textContent = (logo.width && logo.height) ? `${logo.width}x${logo.height}` : 'Vector/Auto';
                document.getElementById('metaSize').textContent = logo.size_pretty || 'N/A';

                // Palette Logic
                const colorsContainer = document.getElementById('colorSwatches');
                colorsContainer.innerHTML = '';
                
                const rawColors = [];
                if (logo.background_color) rawColors.push(logo.background_color);
                if (logo.color) rawColors.push(logo.color);
                if (logo.alternative_color) rawColors.push(logo.alternative_color);
                if (logo.palette && Array.isArray(logo.palette)) rawColors.push(...logo.palette);
                
                // Deduplicate colors
                const uniqueColors = [...new Set(rawColors.filter(Boolean))];

                if (uniqueColors.length > 0) {
                    uniqueColors.forEach(hex => {
                        const swatch = document.createElement('div');
                        swatch.className = 'swatch';
                        swatch.style.backgroundColor = hex;
                        swatch.title = `Click to copy: ${hex.toUpperCase()}`;
                        
                        swatch.onclick = () => {
                            navigator.clipboard.writeText(hex.toUpperCase());
                            showToast();
                        };
                        
                        colorsContainer.appendChild(swatch);
                    });
                } else {
                    colorsContainer.innerHTML = '<span style="color: var(--text-muted)">No palette data detected.</span>';
                }

                // Show Results
                resultCard.style.display = 'grid';
            } else {
                throw new Error("No logo asset detected on this domain.");
            }
        } catch (err) {
            loader.style.display = 'none';
            errorEl.textContent = err.message || "Failed to establish connection. Please verify the URL.";
            errorEl.style.display = 'block';
        }
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}
