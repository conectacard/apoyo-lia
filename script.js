const LORENA_DATA = { titulo: "Lía Armendáriz Rivera" };

const CONFIG = { 
    whatsapp: "525544845808",
    web: "https://gofund.me/5203b2b31", 
    instagram: "https://www.instagram.com/lia_victoria_ar/",
    facebook: "https://www.facebook.com/guillermo.armendarizochoa",
    youtube: "https://www.youtube.com/watch?v=9KbxhUmQVws",
    allowedExt: ['.jpg', '.jpeg', '.png', '.webp', '.JPG'] 
};

const PATROCINADORES = [
    { nombre: "ROBOTOOLS", logo: "patrocinador1", link: "https://robotools.mx/" },
    { nombre: "VALORY", logo: "patrocinador2", link: "https://valory.mx/valory-leader/" },
    { nombre: "ALT PRO", logo: "patrocinador3", link: "https://demo-altpro.com/" }
];

let photoSources = [], recoSources = [], audioIniciado = false, himnoMutedManual = false;
let mainProfilePath = "";

let currentCarouselArray = [];
let currentCarouselIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lorena-title').textContent = LORENA_DATA.titulo;
    
    document.getElementById('link-yt').href = CONFIG.youtube;
    document.getElementById('link-web').href = CONFIG.web;
    document.getElementById('link-fb').href = CONFIG.facebook;
    document.getElementById('link-ig').href = CONFIG.instagram;
    document.getElementById('link-wa').href = `https://wa.me/${CONFIG.whatsapp}`;
    const waDirect = document.getElementById('link-wa-direct');
    if(waDirect) waDirect.href = `https://wa.me/${CONFIG.whatsapp}`;

    tryLoadAnyExt('1', (path) => { 
        mainProfilePath = path;
        document.getElementById('profile-pic-img').src = path; 
    });

    const qrImg = document.getElementById('qr-code-img');
    if(qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`;
    
    ['2','3','4','5'].forEach((name, index) => {
        tryLoadAnyExt(name, (src) => { 
            photoSources[index] = src; 
            renderGrid('grid-fotos-cliente', photoSources); 
        });
    });

    ['reconocimiento1','reconocimiento2','reconocimiento3','reconocimiento4'].forEach((name, index) => {
        tryLoadAnyExt(name, (src) => { 
            recoSources[index] = src; 
            renderGrid('grid-reconocimientos', recoSources); 
        });
    });

    renderPatrocinadores();
    initLightboxTouchSupport();

    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft') changeLightboxImage(-1);
            if (e.key === 'ArrowRight') changeLightboxImage(1);
            if (e.key === 'Escape') closeLightbox();
        }
    });
});

function renderPatrocinadores() {
    const container = document.getElementById('grid-patrocinadores');
    if(!container) return;
    container.innerHTML = '';

    PATROCINADORES.forEach(patro => {
        tryLoadAnyExt(patro.logo, (src) => {
            const card = document.createElement('div');
            card.className = 'card-patrocinador';
            card.innerHTML = `<img src="${src}" alt="${patro.nombre}">`;
            card.onclick = () => { playClick(); window.open(patro.link, '_blank'); };
            container.appendChild(card);
        });
    });

    const btnFinal = document.createElement('div');
    btnFinal.className = 'btn-tu-lugar';
    btnFinal.innerText = 'TU LUGAR ESTÁ AQUÍ';
    btnFinal.onclick = () => {
        playClick();
        const msg = "Hola Lía, nos interesa sumarnos como patrocinadores oficiales.";
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    };
    container.appendChild(btnFinal);
}

function tryLoadAnyExt(baseName, callback) {
    let extIdx = 0;
    const tryNext = () => {
        if (extIdx >= CONFIG.allowedExt.length) return;
        const path = `assets/imagenes/${baseName}${CONFIG.allowedExt[extIdx]}`;
        const img = new Image();
        img.onload = () => callback(path);
        img.onerror = () => { extIdx++; tryNext(); };
        img.src = path;
    };
    tryNext();
}

function renderGrid(containerId, sourceArray) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    sourceArray.forEach((src) => {
        if(!src) return;
        const div = document.createElement('div');
        div.className = 'premium-photo-item';
        div.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:10px;">`;
        div.onclick = () => openLightbox(src, sourceArray);
        container.appendChild(div);
    });
}

function openProfileZoom() { if(mainProfilePath) openLightbox(mainProfilePath); }

function openLightbox(src, contextArray = null) { 
    playClick(); 
    const lightbox = document.getElementById('lightbox');
    const imgElement = document.getElementById('lightbox-image');
    imgElement.src = src; 
    lightbox.style.display = 'flex'; 
    if (!contextArray || contextArray.filter(Boolean).length <= 1) {
        currentCarouselArray = [];
        currentCarouselIndex = 0;
        lightbox.classList.add('single-image');
    } else {
        currentCarouselArray = contextArray.filter(Boolean);
        currentCarouselIndex = currentCarouselArray.indexOf(src);
        lightbox.classList.remove('single-image');
    }
}

function closeLightbox() { document.getElementById('lightbox').style.display = 'none'; }

function changeLightboxImage(direction) {
    if (currentCarouselArray.length <= 1) return;
    playClick();
    currentCarouselIndex = (currentCarouselIndex + direction + currentCarouselArray.length) % currentCarouselArray.length;
    const imgElement = document.getElementById('lightbox-image');
    imgElement.style.opacity = 0;
    setTimeout(() => {
        imgElement.src = currentCarouselArray[currentCarouselIndex];
        imgElement.style.opacity = 1;
    }, 150);
}

function initLightboxTouchSupport() {
    const lightbox = document.getElementById('lightbox');
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, false);
    lightbox.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipeGesture(); }, false);
}

function handleSwipeGesture() {
    const swipeThreshold = 50; 
    if (touchEndX < touchStartX - swipeThreshold) changeLightboxImage(1);
    if (touchEndX > touchStartX + swipeThreshold) changeLightboxImage(-1);
}

function showAppContent(type) {
    playClick(); activarAudioFondo();
    document.getElementById('dynamic-content-layer').style.display = 'flex';
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    const target = document.getElementById(type + '-pane');
    if(target) target.style.display = 'flex';
}

function closeAppContent() { playClick(); document.getElementById('dynamic-content-layer').style.display = 'none'; }
function openMarketing() { playClick(); document.getElementById('marketing-modal').style.display = 'flex'; }
function closeMarketing() { document.getElementById('marketing-modal').style.display = 'none'; }

function toggleMuteHimno() { 
    const himno = document.getElementById('sndFondoLoop'); 
    activarAudioFondo(); 
    himnoMutedManual = !himnoMutedManual; 
    if(himno) himno.muted = himnoMutedManual; 
    document.getElementById('mute-icon').className = himnoMutedManual ? "fas fa-volume-mute" : "fas fa-music"; 
}

function activarAudioFondo() { 
    const himno = document.getElementById('sndFondoLoop'); 
    if (!audioIniciado && himno) { himno.play().then(() => audioIniciado = true).catch(() => {}); } 
}

function playClick() { 
    const snd = document.getElementById('sndFxClick'); 
    if (snd) { snd.currentTime = 0; snd.play().catch(()=>{}); } 
}

// ESTA FUNCIÓN RESUELVE EL PROBLEMA DE COMPARTIR EN PC
async function shareExperienceRobust() { 
    playClick(); 
    const urlCompartir = window.location.href;
    const shareData = {
        title: 'APOYA A LÍA ARMENDÁRIZ',
        text: '¡Representando a México desde los 4 años!',
        url: urlCompartir
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            throw new Error('Menú no disponible');
        }
    } catch (err) {
        // Si falla (como en PC), copiamos el link para que el usuario solo lo pegue
        navigator.clipboard.writeText(urlCompartir).then(() => {
            alert("✅ Enlace copiado al portapapeles. Ahora puedes pegarlo en Facebook o cualquier red social.");
        });
    }
}