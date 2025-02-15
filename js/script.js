// Unsplash API yapılandırması
const UNSPLASH_API_KEY = 'FmrXfQCfIpdlznGAz-eld7HQUi6YenQh1qgDVsN1wvo'; // Buraya kendi API anahtarınızı yazın
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Kategori başına kaç resim çekileceği
const IMAGES_PER_CATEGORY = 9;

// Kategori bazlı arama terimleri
const categorySearchTerms = {
    painting: 'painting art',
    photo: 'landscape photography',
    digital: 'digital art'
};

async function fetchUnsplashImages(query, count) {
    try {
        const response = await fetch(
            `${UNSPLASH_API_URL}/photos/random?query=${query}&count=${count}&client_id=${UNSPLASH_API_KEY}`
        );
        if (!response.ok) throw new Error('Resimler yüklenemedi');
        return await response.json();
    } catch (error) {
        console.error('API Hatası:', error);
        return [];
    }
}

async function loadGalleryItems(category = 'all') {
    const gallery = document.getElementById('gallery');
    const loadingSpinner = document.querySelector('.loading-spinner');
    
    // Loading spinner'ı göster
    loadingSpinner.style.display = 'block';
    gallery.innerHTML = '';

    try {
        let images = [];

        if (category === 'all') {
            // Tüm kategorilerden resim çek
            for (const [cat, searchTerm] of Object.entries(categorySearchTerms)) {
                const categoryImages = await fetchUnsplashImages(searchTerm, IMAGES_PER_CATEGORY);
                images.push(...categoryImages.map(img => ({
                    id: img.id,
                    category: cat,
                    src: img.urls.regular,
                    title: img.description || img.alt_description || 'Untitled',
                    photographer: img.user.name,
                    photographerUrl: img.user.links.html
                })));
            }
        } else {
            // Sadece seçili kategoriden resim çek
            const searchTerm = categorySearchTerms[category];
            const categoryImages = await fetchUnsplashImages(searchTerm, IMAGES_PER_CATEGORY * 3);
            images = categoryImages.map(img => ({
                id: img.id,
                category: category,
                src: img.urls.regular,
                title: img.description || img.alt_description || 'Untitled',
                photographer: img.user.name,
                photographerUrl: img.user.links.html
            }));
        }

        // Resimleri göster
        images.forEach(item => {
            const div = document.createElement('div');
            div.className = 'gallery-item';
            div.innerHTML = `
                <img src="${item.src}" alt="${item.title}">
                <div class="image-info">
                    <h3>${item.title}</h3>
                    <p>Fotoğrafçı: <a href="${item.photographerUrl}" target="_blank">${item.photographer}</a></p>
                </div>
            `;
            
            div.addEventListener('click', () => {
                const modal = document.getElementById('modal');
                const modalImg = document.getElementById('modal-img');
                const caption = document.getElementById('caption');
                
                modal.style.display = 'block';
                modalImg.src = item.src;
                caption.innerHTML = `
                    ${item.title}<br>
                    <small>Fotoğrafçı: <a href="${item.photographerUrl}" target="_blank">${item.photographer}</a></small>
                `;
            });

            gallery.appendChild(div);
        });

    } catch (error) {
        console.error('Galeri yükleme hatası:', error);
        gallery.innerHTML = '<p class="error">Resimler yüklenirken bir hata oluştu.</p>';
    } finally {
        // Loading spinner'ı gizle
        loadingSpinner.style.display = 'none';
    }
}

// Filter button clicks
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadGalleryItems(btn.dataset.category);
    });
});

// Close modal
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none';
    }
});

// Sayfa yüklenme işlemi
document.addEventListener('DOMContentLoaded', () => {
    // Sayfa geçiş efekti
    document.body.classList.add('page-transition');
    
    // Navigasyon işlemleri
    initNavigation();
    initSmoothNavigation();
    setActiveMenuItem();
    initTouchDropdowns();
    
    // Eğer galeri sayfasındaysak
    if (document.querySelector('.gallery')) {
        loadGalleryItems();
    }
});

// Sayfa yüklendiğinde loading spinner'ı gizle
window.addEventListener('load', () => {
    document.querySelector('.loading-spinner').style.display = 'none';
});

// Lazy loading için Intersection Observer
const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
};

lazyLoadImages();

// İletişim formu kontrolü
if (document.querySelector('.contact-form')) {
    const form = document.querySelector('.contact-form');
    const submitBtn = form.querySelector('.submit-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const message = form.querySelector('textarea').value;

        if (!name || !email || !message) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        // Form gönderme animasyonu
        submitBtn.textContent = 'Gönderiliyor...';
        submitBtn.disabled = true;

        // Simüle edilmiş form gönderimi
        setTimeout(() => {
            alert('Mesajınız başarıyla gönderildi!');
            form.reset();
            submitBtn.textContent = 'Gönder';
            submitBtn.disabled = false;
        }, 1500);
    });
}

// Sayfa geçiş animasyonları
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 100);
});

// Geliştirilmiş Navigasyon Fonksiyonları
function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    const body = document.body;

    // Mobil menü toggle
    mobileMenuBtn?.addEventListener('click', () => {
        body.classList.toggle('mobile-menu-open');
    });

    // Dropdown menü işlemleri
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = trigger.closest('.nav-dropdown');
            
            // Mobil görünümde
            if (window.innerWidth <= 768) {
                // Diğer açık dropdownları kapat
                document.querySelectorAll('.nav-dropdown').forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                dropdown.classList.toggle('active');
            }
        });
    });

    // Sayfa dışına tıklandığında menüyü kapat
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-menu-btn')) {
            body.classList.remove('mobile-menu-open');
            // Tüm dropdown menüleri kapat
            document.querySelectorAll('.nav-dropdown').forEach(d => {
                d.classList.remove('active');
            });
        }
    });

    // ESC tuşuna basıldığında menüyü kapat
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            body.classList.remove('mobile-menu-open');
            document.querySelectorAll('.nav-dropdown').forEach(d => {
                d.classList.remove('active');
            });
        }
    });

    // Menü linklerine tıklandığında mobil menüyü kapat
    document.querySelectorAll('.nav-links a:not(.dropdown-trigger)').forEach(link => {
        link.addEventListener('click', () => {
            body.classList.remove('mobile-menu-open');
        });
    });

    // Aktif sayfayı işaretle
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Navbar Scroll Efekti
function initNavbarScroll() {
    const navbar = document.querySelector('.main-nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Scroll efekti
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initNavigation();
    initSmoothNavigation();
    setActiveMenuItem();
    initTouchDropdowns();
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.5s ease';
    }, 100);
});