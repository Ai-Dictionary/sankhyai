
        const emailOrUserIdRegex = /^(?:[\w.-]+@[\w.-]+\.\w{2,}|(?:AID|UID)[A-Za-z](?=(?:\d*@\d*|\d*@\d*)$)[\d@]{10,15})$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

        const emailField = document.getElementById("useremail");
        const passwordField = document.getElementById("userpassword");
        const loginBtn = document.getElementById("login");

        function validateInput(field, regex) {
            const value = field.value.trim();
            const isValid = regex.test(value);
            field.classList.toggle("is-valid", isValid);
            field.classList.toggle("is-invalid", !isValid);
        }

        emailField.addEventListener("input", () => validateInput(emailField, emailOrUserIdRegex));
        passwordField.addEventListener("input", () => validateInput(passwordField, passwordRegex));

        // Instantiate external CAPTCHA object
        let captcha = new CAPTCHA();

        function refreshCaptcha(key) {
            document.getElementById('captcha-img').src = captcha.getCaptcha(document, key);
        }


        if (typeof window.captchaKey !== 'undefined') {
            refreshCaptcha(window.captchaKey);
        } else {
            window.captchaKey = "Sankhyai_default_key";
            refreshCaptcha(window.captchaKey);
        }

        document.getElementById('captcha-btn').addEventListener("click", () => refreshCaptcha(window.captchaKey));

        function login() {
            const validEmail = emailOrUserIdRegex.test(emailField.value.trim());
            const validPassword = passwordRegex.test(passwordField.value.trim());
            const captcha_text = document.getElementById("captcha-txt").value.trim();
            const errorBox = document.querySelector('.error');

            errorBox.style.display = "block";

            if (validEmail && validPassword) {
                if (captcha.vitals == captcha.tokenizer(captcha_text, window.captchaKey) && captcha_text !== '') {
                    errorBox.innerHTML = "<span style='color: var(--success-color);'>Authenticating, please wait...</span>";
                    loginBtn.style.pointerEvents = "none";
                    loginBtn.style.opacity = "0.7";

                    fetch('/auth', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: emailField.value.trim(),
                            password: passwordField.value.trim()
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data?.success) {
                            passwordField.value = "";
                            window.location.href = '/studentRegistry';
                        } else {
                            errorBox.textContent = ">> " + (data.message || "Invalid authentication credentials.");
                            refreshCaptcha(window.captchaKey);
                            loginBtn.style.pointerEvents = "auto";
                            loginBtn.style.opacity = "1";
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        errorBox.textContent = ">> Server error occurred. Please try again later.";
                        loginBtn.style.pointerEvents = "auto";
                        loginBtn.style.opacity = "1";
                    });
                } else {
                    errorBox.textContent = ">> Your entered captcha is incorrect. Please try again later!";
                }
            } else {
                errorBox.textContent = ">> Your entered credentials are in an incorrect format. Please check your user ID/email and password.";
            }
        }

        loginBtn.addEventListener("click", () => login());

