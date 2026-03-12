const hexInput = document.getElementById('hexInput');
const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');

const hSlider = document.getElementById('hSlider');
const sSlider = document.getElementById('sSlider');
const lSlider = document.getElementById('lSlider');

const hLabel = document.getElementById('hVal');
const sLabel = document.getElementById('sVal');
const lLabel = document.getElementById('lVal');

const preview = document.getElementById('colorPreview');
const mainHexLabel = document.getElementById('mainHexLabel');
const subRgbLabel = document.getElementById('subRgbLabel');
const hslCode = document.getElementById('hslCode');
const lumValue = document.getElementById('lumValue');
const historyGrid = document.getElementById('historyGrid');

let history = [];

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function rgbToHex(r, g, b) {
    const toHex = c => c.toString(16).padStart(2, '0');
    return toHex(r) + toHex(g) + toHex(b);
}

function updateUI(hex, r, g, b, h, s, l, source) {
    const color = `#${hex.toUpperCase()}`;
    preview.style.backgroundColor = color;
    mainHexLabel.textContent = color;
    subRgbLabel.textContent = `RGB(${r}, ${g}, ${b})`;
    hslCode.textContent = `hsl(${h}, ${s}%, ${l}%)`;
    
    // Fix: Always update the small labels above the sliders
    hLabel.textContent = `${h}°`;
    sLabel.textContent = `${s}%`;
    lLabel.textContent = `${l}%`;

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    lumValue.textContent = lum.toFixed(2);
    const textColor = lum > 0.5 ? '#0f172a' : '#ffffff';
    mainHexLabel.style.color = textColor;
    subRgbLabel.style.color = textColor;
    document.getElementById('copyMain').style.color = textColor;
    document.getElementById('copyMain').style.borderColor = lum > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';

    if (source !== 'hex') hexInput.value = hex.toUpperCase();
    if (source !== 'rgb') {
        rInput.value = r; gInput.value = g; bInput.value = b;
    }
    if (source !== 'hsl') {
        hSlider.value = h; 
        sSlider.value = s; 
        lSlider.value = l;
    }

    if (source !== 'init') saveHistory(hex);
}

function saveHistory(hex) {
    const clean = hex.toUpperCase();
    if (history[0] === clean) return;
    history = [clean, ...history.filter(x => x !== clean)].slice(0, 14);
    renderHistory();
}

function renderHistory() {
    historyGrid.innerHTML = '';
    history.forEach(hex => {
        const dot = document.createElement('div');
        dot.className = 'history-dot w-8 h-8 rounded-lg shadow-sm border border-white';
        dot.style.backgroundColor = `#${hex}`;
        dot.onclick = () => {
            const r = parseInt(hex.substring(0,2), 16);
            const g = parseInt(hex.substring(2,4), 16);
            const b = parseInt(hex.substring(4,6), 16);
            const hsl = rgbToHsl(r, g, b);
            updateUI(hex, r, g, b, hsl.h, hsl.s, hsl.l, 'history');
        };
        historyGrid.appendChild(dot);
    });
}

hexInput.addEventListener('input', (e) => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
    if (val.length === 6) {
        const r = parseInt(val.substring(0, 2), 16);
        const g = parseInt(val.substring(2, 4), 16);
        const b = parseInt(val.substring(4, 6), 16);
        const hsl = rgbToHsl(r, g, b);
        updateUI(val, r, g, b, hsl.h, hsl.s, hsl.l, 'hex');
    }
});

[rInput, gInput, bInput].forEach(el => {
    el.addEventListener('input', () => {
        const r = Math.min(255, Math.max(0, parseInt(rInput.value) || 0));
        const g = Math.min(255, Math.max(0, parseInt(gInput.value) || 0));
        const b = Math.min(255, Math.max(0, parseInt(bInput.value) || 0));
        const hex = rgbToHex(r, g, b);
        const hsl = rgbToHsl(r, g, b);
        updateUI(hex, r, g, b, hsl.h, hsl.s, hsl.l, 'rgb');
    });
});

[hSlider, sSlider, lSlider].forEach(el => {
    el.addEventListener('input', () => {
        const h = parseInt(hSlider.value);
        const s = parseInt(sSlider.value);
        const l = parseInt(lSlider.value);
        const [r, g, b] = hslToRgb(h, s, l);
        const hex = rgbToHex(r, g, b);
        updateUI(hex, r, g, b, h, s, l, 'hsl');
    });
});

document.getElementById('copyMain').onclick = () => {
    const hexText = `#${hexInput.value}`;
    const textArea = document.createElement("textarea");
    textArea.value = hexText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    const btn = document.getElementById('copyMain');
    const original = btn.innerText;
    btn.innerText = "COPIED!";
    setTimeout(() => btn.innerText = original, 1200);
};

document.getElementById('clearHistory').onclick = () => {
    history = [];
    renderHistory();
};

// Initialize with White
window.onload = () => updateUI("FFFFFF", 255, 255, 255, 0, 0, 100, 'init');
