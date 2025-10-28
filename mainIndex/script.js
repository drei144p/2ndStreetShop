const navbar = document.getElementById('navbar');
const logo = document.getElementById('logo');
const navButtons = document.querySelectorAll('.nav-button');
const searchButton = document.getElementById('searchButton');
const searchModal = document.getElementById('searchModal');
const searchPanel = document.getElementById('searchPanel');
const closeSearch = document.getElementById('closeSearch'); 
const searchBackdrop = document.getElementById('searchBackdrop');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

let isScrolled = false;

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});

searchButton.addEventListener('click', function (e) {
    e.stopPropagation();
    searchModal.classList.remove('hidden');

    requestAnimationFrame(() => {
        searchPanel.classList.remove('translate-x-full');
        searchBackdrop.classList.remove('opacity-0');
        searchBackdrop.classList.add('opacity-100');
    });
    document.body.style.overflow = 'hidden';
});

function closeSearchModal() {
    searchPanel.classList.add('translate-x-full');
    searchBackdrop.classList.remove('opacity-100');
    searchBackdrop.classList.add('opacity-0');

    setTimeout(() => {
        searchModal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 200);
}

closeSearch.addEventListener('click', closeSearchModal);
searchBackdrop.addEventListener('click', closeSearchModal);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) {
        closeSearchModal();
    }
});

window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        isScrolled = true;
        navbar.classList.remove('bg-opacity-0');
        navbar.classList.add('bg-opacity-100');
        logo.src = 'assets/img_logos/text_logo.png';     
        
        navButtons.forEach(button => {
            button.classList.remove('text-white');
            button.classList.add('text-black');
        });

    } else {
        isScrolled = false;
        navbar.classList.remove('bg-opacity-100');
        navbar.classList.add('bg-opacity-0');
        logo.src = 'assets/img_logos/text_logo_plain.png';

        navButtons.forEach(button => {
            button.classList.remove('text-black');
        });
    }
    });

    logo.addEventListener('mouseenter', () => {
        if (!isScrolled) {
            logo.src = 'assets/img_logos/text_logo_hover.png';
        }
    });

    logo.addEventListener('mouseleave', () => {
        if (!isScrolled) {
            logo.src = 'assets/img_logos/text_logo_plain.png';
        }
    });

