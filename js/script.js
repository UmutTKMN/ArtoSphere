// Unsplash API yapılandırması
const config = {
    UNSPLASH_API_KEY: '',
    UNSPLASH_API_URL: 'https://api.unsplash.com'
};

// Kategori başına kaç resim çekileceği
const IMAGES_PER_CATEGORY = 9;

// Kategori bazlı arama terimleri
const categorySearchTerms = {
    painting: 'painting art',
    photo: 'landscape photography',
    digital: 'digital art'
};

// Modüller
const GalleryModule = {
    async loadGalleryItems(category = 'all') {
        const gallery = document.getElementById('gallery');
        const loadingSpinner = document.querySelector('.loading-spinner');
        
        loadingSpinner.style.display = 'block';
        gallery.innerHTML = '';

        try {
            let images = await this.fetchImages(category);
            this.displayImages(images, gallery);
        } catch (error) {
            console.error('Galeri yükleme hatası:', error);
            gallery.innerHTML = '<p class="error">Resimler yüklenirken bir hata oluştu.</p>';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    },

    async fetchImages(category) {
        if (category === 'all') {
            let allImages = [];
            for (const [cat, searchTerm] of Object.entries(categorySearchTerms)) {
                const categoryImages = await this.fetchUnsplashImages(searchTerm, IMAGES_PER_CATEGORY);
                allImages.push(...this.processImages(categoryImages, cat));
            }
            return allImages;
        } else {
            const searchTerm = categorySearchTerms[category];
            const categoryImages = await this.fetchUnsplashImages(searchTerm, IMAGES_PER_CATEGORY * 3);
            return this.processImages(categoryImages, category);
        }
    },

    async fetchUnsplashImages(query, count) {
        try {
            const response = await fetch(
                `${config.UNSPLASH_API_URL}/photos/random?query=${query}&count=${count}&client_id=${config.UNSPLASH_API_KEY}`
            );
            if (!response.ok) throw new Error('Resimler yüklenemedi');
            return await response.json();
        } catch (error) {
            console.error('API Hatası:', error);
            return [];
        }
    },

    processImages(images, category) {
        return images.map(img => ({
            id: img.id,
            category: category,
            src: img.urls.regular,
            title: img.description || img.alt_description || 'Untitled',
            photographer: img.user.name,
            photographerUrl: img.user.links.html
        }));
    },

    displayImages(images, gallery) {
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
            
            div.addEventListener('click', () => this.openModal(item));
            gallery.appendChild(div);
        });
    },

    openModal(item) {
        const modal = document.getElementById('modal');
        const modalImg = document.getElementById('modal-img');
        const caption = document.getElementById('caption');
        
        modal.style.display = 'block';
        modalImg.src = item.src;
        caption.innerHTML = `
            ${item.title}<br>
            <small>Fotoğrafçı: <a href="${item.photographerUrl}" target="_blank">${item.photographer}</a></small>
        `;
    }
};

const NavigationModule = {
    init() {
        this.initMobileMenu();
        this.initDropdowns();
        this.initScrollEvents();
    },

    initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const body = document.body;

        mobileMenuBtn?.addEventListener('click', () => {
            body.classList.toggle('mobile-menu-open');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links') && 
                !e.target.closest('.mobile-menu-btn')) {
                body.classList.remove('mobile-menu-open');
            }
        });
    },

    initDropdowns() {
        const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
        
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const dropdown = trigger.closest('.nav-dropdown');
                
                if (window.innerWidth <= 768) {
                    document.querySelectorAll('.nav-dropdown').forEach(d => {
                        if (d !== dropdown) d.classList.remove('active');
                    });
                    dropdown.classList.toggle('active');
                }
            });
        });
    },

    initScrollEvents() {
        const nav = document.querySelector('.main-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
};

const FormModule = {
    init() {
        const form = document.querySelector('.contact-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        
        if (!this.validateForm(form)) {
            return;
        }

        submitBtn.textContent = 'Gönderiliyor...';
        submitBtn.disabled = true;

        try {
            await this.submitForm(form);
            this.showSuccess(form, submitBtn);
        } catch (error) {
            this.showError(submitBtn);
        }
    },

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });

        if (!isValid) {
            alert('Lütfen tüm alanları doldurun.');
        }

        return isValid;
    },

    async submitForm(form) {
        // Form verilerini topla
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // API'ye gönder (örnek)
        await new Promise(resolve => setTimeout(resolve, 1500));
        return data;
    },

    showSuccess(form, submitBtn) {
        alert('Mesajınız başarıyla gönderildi!');
        form.reset();
        submitBtn.textContent = 'Gönder';
        submitBtn.disabled = false;
    },

    showError(submitBtn) {
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        submitBtn.textContent = 'Gönder';
        submitBtn.disabled = false;
    }
};

// Sayfa yüklendiğinde modülleri başlat
document.addEventListener('DOMContentLoaded', () => {
    // Sayfa geçiş efekti
    document.body.classList.add('page-transition');
    
    // Modülleri başlat
    NavigationModule.init();
    FormModule.init();
    
    // Galeri sayfasındaysa galeriyi yükle
    if (document.querySelector('.gallery')) {
        GalleryModule.loadGalleryItems();
    }
});

// Lazy loading için Intersection Observer
const LazyLoadModule = {
    init() {
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
    }
};

// Lazy loading'i başlat
LazyLoadModule.init();