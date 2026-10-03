// Main JavaScript with Visual Editor Modal, Local Image Upload, and Contact/Working Hours Editor for PT Solusi Teknologi Nusantara

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                alert('Harap isi semua kolom yang wajib diisi!');
                return;
            }

            alert(`Terima kasih, ${name}! Pesan Anda telah terkirim. Tim kami akan segera menghubungi Anda melalui ${email}.`);
            contactForm.reset();
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                alert(`Terima kasih telah berlangganan buletin kami dengan email: ${emailInput.value}`);
                newsletterForm.reset();
            }
        });
    }

    // FAQ Accordion
    const faqButtons = document.querySelectorAll('.faq-toggle');
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('.faq-icon');

            content.classList.toggle('hidden');
            if (icon) {
                icon.classList.toggle('rotate-180');
            }
        });
    });

    // ==========================================
    // VISUAL EDITOR PANEL (Teks, Gambar, Kontak & Jam Kerja)
    // ==========================================
    const pageKey = 'pt_solusitek_working_edit_' + window.location.pathname;
    const globalContactKey = 'pt_solusitek_global_contact_hours';

    // Load saved global contact & working hours info
    const savedGlobalContact = localStorage.getItem(globalContactKey);
    if (savedGlobalContact) {
        try {
            const contactInfo = JSON.parse(savedGlobalContact);
            updateContactElements(contactInfo);
        } catch (e) {
            console.error('Error loading contact info', e);
        }
    }

    // Load saved page edits from localStorage
    const savedData = localStorage.getItem(pageKey);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (parsed.texts) {
                parsed.texts.forEach((html, idx) => {
                    const el = document.querySelectorAll('.editable-text-item')[idx];
                    if (el) el.innerHTML = html;
                });
            }
            if (parsed.images) {
                parsed.images.forEach((src, idx) => {
                    const img = document.querySelectorAll('.editable-img-item')[idx];
                    if (img) img.src = src;
                });
            }
        } catch (e) {
            console.error('Error loading saved edits', e);
        }
    }

    // Tag editable elements (headings, paragraphs)
    document.querySelectorAll('h1, h2, h3, h4, p').forEach((el, idx) => {
        if (!el.closest('#visual-editor-modal')) {
            el.classList.add('editable-text-item');
            el.setAttribute('data-text-id', idx);
        }
    });

    document.querySelectorAll('img').forEach((img, idx) => {
        if (!img.closest('#visual-editor-modal')) {
            img.classList.add('editable-img-item');
            img.setAttribute('data-img-id', idx);
        }
    });

    // Create Floating Edit Panel Trigger & Modal
    const editContainer = document.createElement('div');
    editContainer.innerHTML = `
        <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl border border-slate-700 font-medium text-sm">
            <span class="flex items-center gap-2"><i class="fa-solid fa-wand-magic-sparkles text-primary"></i> Panel Editor:</span>
            <button id="open-editor-modal" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow flex items-center gap-2">
                <i class="fa-solid fa-pen-to-square"></i> Buka Editor Lengkap
            </button>
        </div>

        <!-- Visual Editor Modal -->
        <div id="visual-editor-modal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden flex items-center justify-center p-4">
            <div class="bg-white text-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                <div class="bg-secondary text-white px-6 py-4 flex justify-between items-center">
                    <div class="flex items-center gap-2 font-bold text-lg">
                        <i class="fa-solid fa-sliders text-primary"></i> Panel Kontrol Editor (Teks, Gambar, Kontak & Jam Kerja)
                    </div>
                    <button id="close-editor-modal" class="text-slate-400 hover:text-white text-xl focus:outline-none">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
                    <div class="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3">
                        <i class="fa-solid fa-circle-info text-primary text-lg mt-0.5"></i>
                        <div>
                            <strong>Panduan Editor:</strong> Edit teks halaman, unggah gambar baru, serta perbarui kontak, hari kerja, dan jam operasional perusahaan dengan mudah.
                        </div>
                    </div>

                    <!-- Tabs Header -->
                    <div class="flex border-b border-slate-200 overflow-x-auto">
                        <button id="tab-texts-btn" class="px-5 py-3 font-bold text-sm text-primary border-b-2 border-primary focus:outline-none whitespace-nowrap">Edit Teks</button>
                        <button id="tab-images-btn" class="px-5 py-3 font-bold text-sm text-slate-500 hover:text-slate-800 focus:outline-none whitespace-nowrap">Upload Gambar</button>
                        <button id="tab-contact-btn" class="px-5 py-3 font-bold text-sm text-slate-500 hover:text-slate-800 focus:outline-none whitespace-nowrap">Kontak & Jam Kerja</button>
                    </div>

                    <!-- Tab Content: Texts -->
                    <div id="tab-texts-content" class="space-y-4">
                        <h4 class="font-bold text-secondary text-sm">Daftar Teks / Judul / Paragraf di Halaman Ini:</h4>
                        <div id="text-inputs-container" class="space-y-3"></div>
                    </div>

                    <!-- Tab Content: Images -->
                    <div id="tab-images-content" class="space-y-4 hidden">
                        <h4 class="font-bold text-secondary text-sm">Pilih Gambar dari Komputer untuk Diunggah:</h4>
                        <div id="image-inputs-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
                    </div>

                    <!-- Tab Content: Contact & Working Hours -->
                    <div id="tab-contact-content" class="space-y-4 hidden">
                        <h4 class="font-bold text-secondary text-sm">Informasi Kontak & Jam Kerja (Berlaku Global):</h4>
                        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-slate-600">Alamat Email Perusahaan:</label>
                                    <input type="email" id="edit-company-email" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" value="info@solusiteknologi.co.id">
                                </div>
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-slate-600">Nomor Telepon:</label>
                                    <input type="text" id="edit-company-phone" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" value="+62 (21) 555-0199">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-slate-600">Hari Kerja (Cth: Sen - Jum):</label>
                                    <input type="text" id="edit-working-days" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" value="Sen - Jum">
                                </div>
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-slate-600">Jam Operasional (Cth: 08:00 - 17:00 WIB):</label>
                                    <input type="text" id="edit-working-hours" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary" value="08:00 - 17:00 WIB">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                    <button id="reset-edits-btn" class="bg-rose-100 text-rose-700 hover:bg-rose-200 px-5 py-2.5 rounded-xl font-semibold text-xs transition">
                        Reset ke Default
                    </button>
                    <div class="flex gap-3">
                        <button id="cancel-editor-btn" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-xs transition">
                            Batal
                        </button>
                        <button id="save-all-edits-btn" class="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition shadow">
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(editContainer);

    const modal = document.getElementById('visual-editor-modal');
    const openBtn = document.getElementById('open-editor-modal');
    const closeBtn = document.getElementById('close-editor-modal');
    const cancelBtn = document.getElementById('cancel-editor-btn');
    const saveBtn = document.getElementById('save-all-edits-btn');
    const resetBtn = document.getElementById('reset-edits-btn');

    const tabTextsBtn = document.getElementById('tab-texts-btn');
    const tabImagesBtn = document.getElementById('tab-images-btn');
    const tabContactBtn = document.getElementById('tab-contact-btn');

    const tabTextsContent = document.getElementById('tab-texts-content');
    const tabImagesContent = document.getElementById('tab-images-content');
    const tabContactContent = document.getElementById('tab-contact-content');

    const textContainer = document.getElementById('text-inputs-container');
    const imageContainer = document.getElementById('image-inputs-container');

    openBtn.addEventListener('click', () => {
        populateEditorInputs();
        modal.classList.remove('hidden');
    });

    function closeModal() {
        modal.classList.add('hidden');
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    function switchTab(activeBtn, activeContent) {
        [tabTextsBtn, tabImagesBtn, tabContactBtn].forEach(btn => {
            btn.className = 'px-5 py-3 font-bold text-sm text-slate-500 hover:text-slate-800 focus:outline-none whitespace-nowrap';
        });
        [tabTextsContent, tabImagesContent, tabContactContent].forEach(content => {
            content.classList.add('hidden');
        });
        activeBtn.className = 'px-5 py-3 font-bold text-sm text-primary border-b-2 border-primary focus:outline-none whitespace-nowrap';
        activeContent.classList.remove('hidden');
    }

    tabTextsBtn.addEventListener('click', () => switchTab(tabTextsBtn, tabTextsContent));
    tabImagesBtn.addEventListener('click', () => switchTab(tabImagesBtn, tabImagesContent));
    tabContactBtn.addEventListener('click', () => switchTab(tabContactBtn, tabContactContent));

    function populateEditorInputs() {
        // Populate Texts
        textContainer.innerHTML = '';
        document.querySelectorAll('.editable-text-item').forEach((el, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2';
            wrapper.innerHTML = `
                <div class="flex justify-between items-center text-xs text-slate-500 font-semibold">
                    <span>Elemen #${idx + 1} (${el.tagName})</span>
                </div>
                <textarea data-text-index="${idx}" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary">${el.innerHTML.trim()}</textarea>
            `;
            textContainer.appendChild(wrapper);
        });

        // Populate Images
        imageContainer.innerHTML = '';
        document.querySelectorAll('.editable-img-item').forEach((img, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3';
            wrapper.innerHTML = `
                <div class="flex items-center gap-3">
                    <img id="preview-img-${idx}" src="${img.src}" class="w-16 h-16 rounded-lg object-cover border shadow-sm" alt="Preview">
                    <div class="flex-1 space-y-2">
                        <span class="text-xs font-semibold text-slate-600 block">Gambar #${idx + 1}</span>
                        <input type="file" accept="image/*" data-img-index="${idx}" class="image-upload-input w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer">
                    </div>
                </div>
            `;
            imageContainer.appendChild(wrapper);

            const fileInput = wrapper.querySelector('.image-upload-input');
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(uploadEvent) {
                        const base64Url = uploadEvent.target.result;
                        document.getElementById(`preview-img-${idx}`).src = base64Url;
                        fileInput.setAttribute('data-new-src', base64Url);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Populate Contact & Hours fields if saved
        const savedGlobal = localStorage.getItem(globalContactKey);
        if (savedGlobal) {
            try {
                const info = JSON.parse(savedGlobal);
                if (info.email) document.getElementById('edit-company-email').value = info.email;
                if (info.phone) document.getElementById('edit-company-phone').value = info.phone;
                if (info.days) document.getElementById('edit-working-days').value = info.days;
                if (info.hours) document.getElementById('edit-working-hours').value = info.hours;
            } catch(e) {}
        }
    }

    function updateContactElements(info) {
        document.querySelectorAll('body *').forEach(node => {
            if (node.children.length === 0 && node.textContent) {
                if (node.textContent.includes('info@solusiteknologi.co.id') && info.email) {
                    node.textContent = node.textContent.replace('info@solusiteknologi.co.id', info.email);
                }
                if (node.textContent.includes('+62 (21) 555-0199') && info.phone) {
                    node.textContent = node.textContent.replace('+62 (21) 555-0199', info.phone);
                }
                if (node.textContent.includes('Sen - Jum') && info.days) {
                    node.textContent = node.textContent.replace('Sen - Jum', info.days);
                }
                if (node.textContent.includes('08:00 - 17:00 WIB') && info.hours) {
                    node.textContent = node.textContent.replace('08:00 - 17:00 WIB', info.hours);
                }
            }
        });
    }

    saveBtn.addEventListener('click', () => {
        // Save Texts
        const texts = [];
        textContainer.querySelectorAll('textarea').forEach(textarea => {
            const idx = textarea.getAttribute('data-text-index');
            const val = textarea.value;
            texts[idx] = val;
            const targetEl = document.querySelectorAll('.editable-text-item')[idx];
            if (targetEl) targetEl.innerHTML = val;
        });

        // Save Images
        const images = [];
        document.querySelectorAll('.editable-img-item').forEach((img, idx) => {
            images[idx] = img.src;
        });

        imageContainer.querySelectorAll('.image-upload-input').forEach(input => {
            const idx = input.getAttribute('data-img-index');
            const newSrc = input.getAttribute('data-new-src');
            if (newSrc) {
                images[idx] = newSrc;
                const targetImg = document.querySelectorAll('.editable-img-item')[idx];
                if (targetImg) targetImg.src = newSrc;
            }
        });

        // Save Contact & Hours Info
        const contactInfo = {
            email: document.getElementById('edit-company-email').value,
            phone: document.getElementById('edit-company-phone').value,
            days: document.getElementById('edit-working-days').value,
            hours: document.getElementById('edit-working-hours').value
        };
        localStorage.setItem(globalContactKey, JSON.stringify(contactInfo));
        updateContactElements(contactInfo);

        const dataToSave = { texts, images };
        localStorage.setItem(pageKey, JSON.stringify(dataToSave));
        alert('Semua perubahan berhasil disimpan!');
        closeModal();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin mereset semua editan?')) {
            localStorage.removeItem(pageKey);
            localStorage.removeItem(globalContactKey);
            location.reload();
        }
    });
});
