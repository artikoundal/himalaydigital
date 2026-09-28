/**
 * Himalaya Digital Marketplace - Events Interactive Scripts (events.js)
 * Manages event filtering, live search, countdown, RSVP modal, and submission
 */

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initFilters();
    initFavorites();
});

// =========================================================================
// 1. COUNTDOWN TIMER FOR FEATURED EVENT
// =========================================================================
function initCountdown() {
    // Target: 24 days ahead or fixed event date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 24);
    targetDate.setHours(9, 30, 0, 0);

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    const secsEl = document.getElementById('countSecs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function update() {
        const now = new Date().getTime();
        const diff = targetDate.getTime() - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minsEl.textContent = String(m).padStart(2, '0');
        secsEl.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// =========================================================================
// 2. LIVE SEARCH & FILTER SYSTEM
// =========================================================================
let currentCategory = 'all';
let currentCity = 'all';
let currentSearch = '';

function initFilters() {
    const searchInput = document.getElementById('eventSearchInput');
    const citySelect = document.getElementById('cityFilterSelect');
    const filterPills = document.querySelectorAll('.filter-pill');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    if (citySelect) {
        citySelect.addEventListener('change', (e) => {
            currentCity = e.target.value;
            applyFilters();
        });
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCategory = pill.getAttribute('data-category');
            applyFilters();
        });
    });
}

function applyFilters() {
    const cards = document.querySelectorAll('.event-card-item');
    const timelineItems = document.querySelectorAll('.timeline-event-item');
    let visibleCount = 0;

    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const city = card.getAttribute('data-city');
        const title = card.getAttribute('data-title').toLowerCase();
        const desc = card.getAttribute('data-desc').toLowerCase();

        const matchesCat = (currentCategory === 'all' || cat === currentCategory);
        const matchesCity = (currentCity === 'all' || city === currentCity);
        const matchesSearch = !currentSearch || title.includes(currentSearch) || desc.includes(currentSearch) || city.toLowerCase().includes(currentSearch);

        if (matchesCat && matchesCity && matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    timelineItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        const city = item.getAttribute('data-city');
        const title = (item.getAttribute('data-title') || '').toLowerCase();

        const matchesCat = (currentCategory === 'all' || cat === currentCategory);
        const matchesCity = (currentCity === 'all' || city === currentCity);
        const matchesSearch = !currentSearch || title.includes(currentSearch);

        if (matchesCat && matchesCity && matchesSearch) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });

    // Handle no results message
    const noResultsEl = document.getElementById('noEventsNotice');
    if (noResultsEl) {
        if (visibleCount === 0) {
            noResultsEl.classList.remove('hidden');
        } else {
            noResultsEl.classList.add('hidden');
        }
    }

    // Update active count badge
    const activeCountEl = document.getElementById('resultsCount');
    if (activeCountEl) {
        activeCountEl.textContent = `${visibleCount} Event${visibleCount !== 1 ? 's' : ''} Found`;
    }
}

function resetAllFilters() {
    currentCategory = 'all';
    currentCity = 'all';
    currentSearch = '';

    const searchInput = document.getElementById('eventSearchInput');
    const citySelect = document.getElementById('cityFilterSelect');
    const filterPills = document.querySelectorAll('.filter-pill');

    if (searchInput) searchInput.value = '';
    if (citySelect) citySelect.value = 'all';

    filterPills.forEach(p => {
        if (p.getAttribute('data-category') === 'all') {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });

    applyFilters();
}

// =========================================================================
// 3. TOGGLE VIEW: GRID vs TIMELINE
// =========================================================================
function switchView(viewType) {
    const gridView = document.getElementById('eventsGridView');
    const timelineView = document.getElementById('eventsTimelineView');
    const btnGrid = document.getElementById('btnViewGrid');
    const btnTimeline = document.getElementById('btnViewTimeline');

    if (viewType === 'grid') {
        gridView?.classList.remove('hidden');
        timelineView?.classList.add('hidden');
        btnGrid?.classList.add('bg-[#154a78]', 'text-white');
        btnGrid?.classList.remove('bg-white', 'text-slate-700');
        btnTimeline?.classList.remove('bg-[#154a78]', 'text-white');
        btnTimeline?.classList.add('bg-white', 'text-slate-700');
    } else {
        gridView?.classList.add('hidden');
        timelineView?.classList.remove('hidden');
        btnTimeline?.classList.add('bg-[#154a78]', 'text-white');
        btnTimeline?.classList.remove('bg-white', 'text-slate-700');
        btnGrid?.classList.remove('bg-[#154a78]', 'text-white');
        btnGrid?.classList.add('bg-white', 'text-slate-700');
    }
}

// =========================================================================
// 4. FAVORITES / BOOKMARKS SYSTEM
// =========================================================================
function initFavorites() {
    const saved = JSON.parse(localStorage.getItem('himalaya_fav_events') || '[]');
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        const id = btn.getAttribute('data-event-id');
        if (saved.includes(id)) {
            btn.classList.add('is-saved');
        }
    });
}

function toggleFavorite(e, eventId) {
    e.stopPropagation();
    let saved = JSON.parse(localStorage.getItem('himalaya_fav_events') || '[]');
    const btn = document.querySelector(`.btn-favorite[data-event-id="${eventId}"]`);

    if (saved.includes(eventId)) {
        saved = saved.filter(item => item !== eventId);
        btn?.classList.remove('is-saved');
        showToast('Event removed from your saved list');
    } else {
        saved.push(eventId);
        btn?.classList.add('is-saved');
        showToast('Event saved to your bookmarks! ❤️');
    }

    localStorage.setItem('himalaya_fav_events', JSON.stringify(saved));
}

// =========================================================================
// 5. MODAL CONTROLS: RSVP & TICKET BOOKING
// =========================================================================
const eventsData = {
    'tech-summit': {
        title: 'Himalayan Tech & AI Summit 2025',
        date: 'November 14 - 16, 2025',
        time: '09:30 AM - 05:30 PM IST',
        venue: 'International Convention Centre, Dharamshala, HP',
        price: 'Free Pass (RSVP Required)',
        image: './images/event-tech-summit.jpg',
        host: 'PulsePlay Digital & Himalaya Tech Forum',
        description: 'Join 500+ innovators, researchers, and developers in Dharamshala exploring AI, Software Engineering, and the 5000 Jobs Mission for the Himalayan region.',
        speakers: ['Dr. Rohit Verma (AI Lead, TechX)', 'Ananya Sharma (VP Engineering)', 'Kunal Thakur (Himachal Tech Hub)'],
        mapUrl: 'https://maps.google.com/?q=Dharamshala+Himachal+Pradesh'
    },
    'culture-fest': {
        title: 'Himachal Cultural Heritage & Folk Music Utsav',
        date: 'December 05 - 07, 2025',
        time: '04:00 PM - 10:00 PM IST',
        venue: 'The Ridge Pavilion, Shimla, HP',
        price: 'Free Public Entry',
        image: './images/event-culture-fest.jpg',
        host: 'Himachal Arts & Tourism Council',
        description: 'Experience authentic Pahadi Nati, soulful flutes, traditional Kullu folk instruments, dance performances, and Himalayan culinary wonders under starry Shimla skies.',
        speakers: ['Pandit Somnath (Folk Virtuoso)', 'Sunita Devi (Nati Masterclass)', 'Shimla Youth Cultural Choir'],
        mapUrl: 'https://maps.google.com/?q=The+Ridge+Shimla'
    },
    'adventure-expo': {
        title: 'Bir Billing Himalayan Adventure & Eco-Trekking Expo',
        date: 'December 18 - 20, 2025',
        time: '08:00 AM - 06:00 PM IST',
        venue: 'Landing Ground, Bir Billing (Kangra Valley), HP',
        price: '₹499 (Includes Gear Trial Pass)',
        image: './images/event-adventure-summit.jpg',
        host: 'Himalayan Aviators & Eco-Trek League',
        description: 'The premier mountain adventure gathering at world-famous Bir Billing. Paragliding aerobatics, camping workshops, Leave No Trace environmental clinic, and trail runs.',
        speakers: ['Capt. Vijay Rana (Paragliding Champion)', 'Tenzing Norbu (High-Altitude Guide)', 'Dr. Meera Sen (Mountain Ecology)'],
        mapUrl: 'https://maps.google.com/?q=Bir+Billing+Himachal+Pradesh'
    },
    'startup-conclave': {
        title: 'Himalayan Angel Investors & Startup Conclave',
        date: 'January 10 - 11, 2026',
        time: '10:00 AM - 05:00 PM IST',
        venue: 'Cedar Woods Heritage Resort, Shimla, HP',
        price: '₹999 / Delegate Pass',
        image: './images/event-startup-conclave.jpg',
        host: 'Himalayas Digital Capital & Startups Hub',
        description: 'Connecting mountain startups in agro-tech, clean energy, eco-tourism, and handicrafts with angel investors and venture funds looking for high-growth Himalayan businesses.',
        speakers: ['Rajiv Malhotra (Angel Investor)', 'Pooja Kashyap (AgriTech Founder)', 'Vikram Dogra (Venture Partner)'],
        mapUrl: 'https://maps.google.com/?q=Shimla+Himachal+Pradesh'
    },
    'yoga-retreat': {
        title: 'McLeod Ganj Mindfulness, Yoga & Sound Retreat',
        date: 'January 24 - 26, 2026',
        time: '07:00 AM - 06:00 PM IST',
        venue: 'Upper Bhagsu Pine Meadows, Dharamshala, HP',
        price: '₹1,499 / 3-Day Pass',
        image: './images/event-yoga-retreat.jpg',
        host: 'Dhyan Himalayan Wellness Guild',
        description: 'Rejuvenate your soul with sunrise Pranayama, Tibetan singing bowl acoustics, meditation in pine forests, organic Sattvic Himalayan dining, and guided mountain walks.',
        speakers: ['Lobsang Dorje (Tibetan Sound Master)', 'Aaradhna Gill (Ashtanga Yoga Teacher)', 'Dr. Swati Katoch (Ayurvedic Healer)'],
        mapUrl: 'https://maps.google.com/?q=McLeod+Ganj+Dharamshala'
    },
    'handicraft-fair': {
        title: 'Kullu Shawl, Kangra Art & Handicrafts Fair',
        date: 'February 06 - 08, 2026',
        time: '10:00 AM - 07:00 PM IST',
        venue: 'Mall Road Crafts Pavilion, Manali, HP',
        price: 'Free Entry',
        image: './images/event-handicraft-expo.jpg',
        host: 'Himachal Weavers & Artisans Collective',
        description: 'Celebrate the timeless master crafts of Himachal. Live wooden handloom weaving demonstrations, miniature Kangra painting masterclasses, and direct-from-artisan exhibitions.',
        speakers: ['Master Weaver Ram Lal (State Awardee)', 'Sarla Devi (Kullu Shawl Guild)', 'Devraj Verma (Kangra Miniature Artist)'],
        mapUrl: 'https://maps.google.com/?q=Mall+Road+Manali'
    }
};

function openRsvpModal(eventId) {
    const data = eventsData[eventId] || eventsData['tech-summit'];
    const modal = document.getElementById('rsvpModal');
    if (!modal) return;

    document.getElementById('rsvpEventId').value = eventId;
    document.getElementById('rsvpModalTitle').textContent = data.title;
    document.getElementById('rsvpModalDate').textContent = `${data.date} • ${data.time}`;
    document.getElementById('rsvpModalVenue').textContent = data.venue;
    document.getElementById('rsvpModalPrice').textContent = data.price;

    // Reset form view
    document.getElementById('rsvpFormContainer').classList.remove('hidden');
    document.getElementById('rsvpSuccessContainer').classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeRsvpModal() {
    const modal = document.getElementById('rsvpModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

function handleRsvpSubmit(e) {
    e.preventDefault();
    const eventId = document.getElementById('rsvpEventId').value;
    const name = document.getElementById('rsvpName').value;
    const email = document.getElementById('rsvpEmail').value;
    const passes = document.getElementById('rsvpPasses').value;
    const data = eventsData[eventId] || eventsData['tech-summit'];

    // Generate random pass code
    const ticketId = 'HD-' + Math.floor(100000 + Math.random() * 900000);

    // Populate confirmation ticket
    document.getElementById('confirmTicketId').textContent = ticketId;
    document.getElementById('confirmTicketEvent').textContent = data.title;
    document.getElementById('confirmTicketDate').textContent = data.date;
    document.getElementById('confirmTicketVenue').textContent = data.venue;
    document.getElementById('confirmTicketHolder').textContent = `${name} (${passes} Pass${passes > 1 ? 'es' : ''})`;
    document.getElementById('confirmTicketEmail').textContent = email;

    // Toggle view
    document.getElementById('rsvpFormContainer').classList.add('hidden');
    document.getElementById('rsvpSuccessContainer').classList.remove('hidden');

    showToast('Registration Confirmed! Your Himalayan event pass is ready 🎉');
}

// =========================================================================
// 6. EVENT DETAILS QUICK VIEW MODAL
// =========================================================================
function openEventDetails(eventId) {
    const data = eventsData[eventId];
    if (!data) return;

    const modal = document.getElementById('eventDetailsModal');
    if (!modal) return;

    document.getElementById('detailImage').src = data.image;
    document.getElementById('detailImage').alt = data.title;
    document.getElementById('detailTitle').textContent = data.title;
    document.getElementById('detailHost').textContent = `Hosted by ${data.host}`;
    document.getElementById('detailDate').textContent = data.date;
    document.getElementById('detailTime').textContent = data.time;
    document.getElementById('detailVenue').textContent = data.venue;
    document.getElementById('detailPrice').textContent = data.price;
    document.getElementById('detailDesc').textContent = data.description;

    const speakersList = document.getElementById('detailSpeakers');
    speakersList.innerHTML = '';
    data.speakers.forEach(spk => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-2 text-slate-700 text-sm';
        li.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-[#154a78]"></span> ${spk}`;
        speakersList.appendChild(li);
    });

    const mapBtn = document.getElementById('detailMapBtn');
    if (mapBtn) mapBtn.href = data.mapUrl;

    const rsvpBtn = document.getElementById('detailRsvpBtn');
    if (rsvpBtn) {
        rsvpBtn.onclick = () => {
            closeEventDetails();
            openRsvpModal(eventId);
        };
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeEventDetails() {
    const modal = document.getElementById('eventDetailsModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// =========================================================================
// 7. SUBMIT EVENT MODAL
// =========================================================================
function openSubmitEventModal() {
    const modal = document.getElementById('submitEventModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeSubmitEventModal() {
    const modal = document.getElementById('submitEventModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

function handleEventSubmission(e) {
    e.preventDefault();
    const title = document.getElementById('postEventTitle').value;
    const city = document.getElementById('postEventCity').value;

    closeSubmitEventModal();
    showToast(`"${title}" submitted successfully! It will be live after quick review.`);
    e.target.reset();
}

// =========================================================================
// 8. UTILITY: SHARE & TOAST NOTIFICATION
// =========================================================================
function shareEvent(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title + ' | Himalaya Digital',
            text: `Check out this upcoming event: ${title}`,
            url: window.location.href
        }).catch(() => copyToClipboard(window.location.href));
    } else {
        copyToClipboard(window.location.href);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard! 📋');
    }).catch(() => {
        showToast('Share link copied!');
    });
}

function showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#154a78] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 toast-notice border border-sky-300/30';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    toast.classList.remove('hidden');

    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3500);
}

// Global modal dismiss on ESC key or clicking outside
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRsvpModal();
        closeEventDetails();
        closeSubmitEventModal();
    }
});
