        function maskEmail(email) {
            if (!email || !email.includes('@')) return email;
            
            const parts = email.split('@');
            const username = parts[0];
            const domain = parts[1];

            if (username.length <= 2) {
                return username[0] + '*****@' + domain;
            }

            const visiblePrefix = username.slice(0, 5); 
            return visiblePrefix + '*****@' + domain;
        }

        document.addEventListener("DOMContentLoaded", function() {
            const emailElem = document.getElementById('masked-email');
            if (emailElem && emailElem.textContent.trim() !== 'N/A') {
                const rawEmail = emailElem.textContent.trim();
                emailElem.textContent = maskEmail(rawEmail);
            }
        });

function generatePDF() {
    const element = document.getElementById('reg_status');
    if (!element) {
        console.error("Target element '#reg_status' not found.");
        return;
    }

    const filename = `SankhyAi_reg_status_${Date.now()}.pdf`;

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

document.addEventListener('DOMContentLoaded', () => {
    const urlContainer = document.getElementById("my_url");
    if (urlContainer) {
        urlContainer.textContent = window.location.href;
    }

    setTimeout(() => {
        generatePDF();
    }, 1500);
});

                    
