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
