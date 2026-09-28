/**
 * Himalaya Digital Marketplace - Footer Interactive Scripts
 * Handles newsletter subscription feedback and footer actions
 */

function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const submitBtn = document.getElementById('newsletterSubmitBtn');

    if (!emailInput || !emailInput.checkValidity()) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribed! ✓';
    submitBtn.classList.remove('bg-[#154a78]', 'hover:bg-[#0f385c]');
    submitBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');

    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
        submitBtn.classList.add('bg-[#154a78]', 'hover:bg-[#0f385c]');
        emailInput.value = '';
    }, 3000);
}
