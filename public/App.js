        // 1. Course Data Array
        const coursesData = [
            {
                id: 1,
                name: "API / Backend Development",
                badge: "Tech",
                type: "badge-tech",
                duration: "12 Weeks",
                price: "₹4,999",
                rating: "4.9",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "RESTful APIs, Node.js, Express, Microservices, MongoDB & PostgreSQL integration."
            },
            {
                id: 2,
                name: "AI / ML Development",
                badge: "Tech",
                type: "badge-tech",
                duration: "16 Weeks",
                price: "₹6,999",
                rating: "5.0",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Neural Networks, PyTorch, Scikit-Learn, Model Deployment, LLM Fine-tuning."
            },
            {
                id: 3,
                name: "AI Tools Expertise",
                badge: "Tech",
                type: "badge-tech",
                duration: "4 Weeks",
                price: "₹1,999",
                rating: "4.8",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Prompt Engineering, ChatGPT Workflows, Midjourney, Automation with Zapier/Make."
            },
            {
                id: 4,
                name: "C Language Foundation",
                badge: "Tech",
                type: "badge-tech",
                duration: "6 Weeks",
                price: "₹1,499",
                rating: "4.7",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Memory allocation, Pointers, Structures, Data Structures & Logic building."
            },
            {
                id: 5,
                name: "Python Basic",
                badge: "Tech",
                type: "badge-tech",
                duration: "6 Weeks",
                price: "₹1,999",
                rating: "4.8",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Syntax, Data Types, Control Structures, OOPs concepts, Module imports."
            },
            {
                id: 6,
                name: "Python Advanced",
                badge: "Tech",
                type: "badge-tech",
                duration: "8 Weeks",
                price: "₹3,499",
                rating: "4.9",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Decorators, Generators, AsyncIO, Web Scraping, Frameworks (FastAPI/Django)."
            },
            {
                id: 7,
                name: "Board Mathematics (JEE / NEET / IIT Level)",
                badge: "Academic",
                type: "badge-academic",
                duration: "6 Months",
                price: "₹7,999",
                rating: "5.0",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Calculus, Algebra, Coordinate Geometry, Trigonometry & Problem-solving."
            },
            {
                id: 8,
                name: "Physics (Class 10-12 / Competitive Level)",
                badge: "Academic",
                type: "badge-academic",
                duration: "6 Months",
                price: "₹7,999",
                rating: "4.9",
                syllabusUrl: "https://docs.google.com/document/u/0/",
                topics: "Mechanics, Electromagnetism, Optics, Modern Physics, Numerical Strategies."
            }
        ];

        // 2. Render Courses Dynamically
        function renderCourses() {
            const container = document.getElementById('courses-container');
            const selectDropdown = document.getElementById('preferredCourse');

            coursesData.forEach(course => {
                // Populate Cards
                const cardHTML = `
                    <div class="course-card">
                        <div>
                            <div class="course-header">
                                <span class="badge ${course.type}">${course.badge}</span>
                                <div class="course-rating"><i class="fa-solid fa-star"></i> ${course.rating}</div>
                            </div>
                            <h3 class="course-title">${course.name}</h3>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">${course.topics}</p>
                            <a href="${course.syllabusUrl}" target="_blank" class="syllabus-link">
                                <i class="fa-solid fa-file-pdf"></i> View Syllabus PDF
                            </a>
                        </div>
                        <div>
                            <div class="course-footer">
                                <div class="course-duration"><i class="fa-regular fa-clock"></i> ${course.duration}</div>
                                <div class="course-price">${course.price}</div>
                            </div>
                            <button onclick="selectCourseAndScroll('${course.name}')" class="btn btn-primary">Register Now</button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', cardHTML);

                // Populate Select Dropdown
                const option = document.createElement('option');
                option.value = course.name;
                option.textContent = course.name;
                selectDropdown.appendChild(option);
            });
        }

        // Helper: Select Course from Card Click
        function selectCourseAndScroll(courseName) {
            const selectDropdown = document.getElementById('preferredCourse');
            selectDropdown.value = courseName;
            document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
        }

        // 3. Mobile Navigation Toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // 4. Form Validation & Fetch Submission
        const form = document.getElementById('registration-form');
        const alertBox = document.getElementById('alert-box');
        const submitBtn = document.getElementById('submit-btn');
        const btnText = document.getElementById('btn-text');

        // Regex Patterns
        const nameRegex = /^(?=.{7,50}$)([a-zA-Z]{3,}\s+){1,2}[a-zA-Z]{3,}$/;
        const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
        const phoneRegex = /^[0-9]{10}$/;
        const textRegex = /^[A-Za-z0-9\s\-+,#@$&.:;!?]{5,250}$/;

        function showAlert(message, type) {
            alertBox.style.display = 'block';
            alertBox.textContent = message;
            if(type === 'success') {
                alertBox.className = 'alert-box alert-success';
            } else {
                alertBox.className = 'alert-box alert-error';
            }
            alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            alertBox.style.display = 'none';

            // Sanitize & Gather Data
            const formData = {
                studentName: document.getElementById('studentName').value.trim(),
                parentName: document.getElementById('parentName').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                email: document.getElementById('email').value.trim(),
                state: document.getElementById('state').value,
                classSem: document.getElementById('classSem').value.trim(),
                schoolCollege: document.getElementById('schoolCollege').value.trim(),
                boardUniv: document.getElementById('boardUniv').value.trim(),
                preferredCourse: document.getElementById('preferredCourse').value
            };

            // Basic Validation Tests
            if(!nameRegex.test(formData.studentName)) {
                showAlert('Please enter a valid Student name for register on our records..', 'error');
                return;
            }
            
            if(!nameRegex.test(formData.parentName)) {
                showAlert('Please enter a valid Parent name for register on our records..', 'error');
                return;
            }
            
            if(!phoneRegex.test(formData.phone)) {
                showAlert('Please enter a valid 10-digit phone/WhatsApp number.', 'error');
                return;
            }

            if(!emailRegex.test(formData.email)) {
                showAlert('Please enter a valid email address.', 'error');
                return;
            }
            
            if(!textRegex.test(formData.schoolCollege) || !textRegex.test(formData.boardUniv)) {
                showAlert('Please enter a valid Institute name for better student information analysis.', 'error');
                return;
            }

            // Set Loading State
            submitBtn.disabled = true;
            btnText.textContent = 'Submitting...';

            try {
                const response = await fetch('/reg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok || response.status === 200) {
                    showAlert('Registration Successful! Our admission team will contact you shortly.', 'success');
                    form.reset();
                } else {
                    showAlert('Failed to submit registration. Please try again or contact support.', 'error');
                }
            } catch (error) {
                console.error('Submission Error:', error);
                showAlert('Network error occurred. Please check your internet connection and try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                btnText.textContent = 'Complete Registration';
            }
        });

        // Initialize Page
        document.addEventListener('DOMContentLoaded', () => {
            renderCourses();
        });
