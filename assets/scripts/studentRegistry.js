document.addEventListener('DOMContentLoaded', () => {
            // Step 1-4: Extractor & DOM Cleaner Logic
            const rawContainer = document.getElementById('user_raw_data');
            
            if (rawContainer && rawContainer.textContent.trim()) {
                try {
                    window.rawStudentsData = JSON.parse(rawContainer.textContent.trim());
                } catch (e) {
                    console.error("Failed to parse student data JSON:", e);
                    window.rawStudentsData = [];
                }
                rawContainer.remove();
            } else {
                window.rawStudentsData = [];
            }

            // Initial Execution
            calculateMetrics(window.rawStudentsData);
            applyFilters();
        });

        // Calculate Overview Cards
        function calculateMetrics(data) {
            const total = data.length;
            const converted = data.filter(s => String(s.converted).toLowerCase() === 'true' || String(s.converted).toLowerCase() === 'yes').length;
            const pending = data.filter(s => String(s.called).toLowerCase() === 'pending' || String(s.called).toLowerCase() === 'no').length;

            document.getElementById('metric-total').textContent = total;
            document.getElementById('metric-converted').textContent = converted;
            document.getElementById('metric-pending').textContent = pending;
        }

        // Helper: Badge Stylers
        function renderConvertedBadge(val) {
            const isTrue = String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'yes';
            return `<span class="badge ${isTrue ? 'badge-green' : 'badge-gray'}">${isTrue ? 'Yes' : 'No'}</span>`;
        }

        function renderCalledBadge(val) {
            const str = String(val).toLowerCase();
            if (str === 'true' || str === 'yes') return `<span class="badge badge-blue">Yes</span>`;
            return `<span class="badge badge-amber">Pending</span>`;
        }

        function renderStatusBadge(val) {
            const str = String(val).toLowerCase();
            if (str === 'active') return `<span class="badge badge-green">Active</span>`;
            if (str === 'in touch' || str === 'intouch') return `<span class="badge badge-amber">In Touch</span>`;
            if (str === 'dropped') return `<span class="badge badge-red">Dropped</span>`;
            return `<span class="badge badge-gray">${val || 'Unknown'}</span>`;
        }

        // Copy Helper
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text);
            alert('Copied to clipboard: ' + text);
        }

        function edit(feature){
            alert("This feature is not provided yet, wait or contact developers.");
        }

        // Filtering & Sorting Orchestrator
        function applyFilters() {
            const searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
            const sortVal = document.getElementById('sort-select').value;

            let filtered = window.rawStudentsData.filter(student => {
                const name = (student.name || '').toLowerCase();
                const email = (student.email || '').toLowerCase();
                const contact = (student.contact || '').toLowerCase();
                return name.includes(searchQuery) || email.includes(searchQuery) || contact.includes(searchQuery);
            });

            // Sorting
            filtered.sort((a, b) => {
                if (sortVal === 'name-asc') return (a.name || '').localeCompare(b.name || '');
                if (sortVal === 'name-desc') return (b.name || '').localeCompare(a.name || '');
                if (sortVal === 'date-asc') return new Date(a.dateOfRegistration) - new Date(b.dateOfRegistration);
                if (sortVal === 'date-desc') return new Date(b.dateOfRegistration) - new Date(a.dateOfRegistration);
                if (sortVal === 'converted-first') {
                    const aConv = String(a.converted).toLowerCase() === 'true' || String(a.converted).toLowerCase() === 'yes';
                    const bConv = String(b.converted).toLowerCase() === 'true' || String(b.converted).toLowerCase() === 'yes';
                    return bConv - aConv;
                }
                return 0;
            });

            renderTable(filtered);
            renderMobileCards(filtered);
        }

        // Desktop Table Renderer
        function renderTable(data) {
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = '';

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 24px; color: var(--text-muted);">No student records found.</td></tr>`;
                return;
            }

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.name || '-'}</strong></td>
                    <td>${item.parentName || '-'}</td>
                    <td>
                        ${item.contact || '-'}
                        ${item.contact ? `<button class="copy-btn" onclick="copyToClipboard('${item.contact}')"><i class="fa-regular fa-copy"></i></button>` : ''}
                    </td>
                    <td>
                        ${item.email || '-'}
                        ${item.email ? `<button class="copy-btn" onclick="copyToClipboard('${item.email}')"><i class="fa-regular fa-copy"></i></button>` : ''}
                    </td>
                    <td>${item.state || '-'}</td>
                    <td>${item.classSem || '-'}</td>
                    <td>${item.schoolCollege || '-'}</td>
                    <td>${item.boardUniv || '-'}</td>
                    <td>${item.preferredCourse || '-'}</td>
                    <td>
                        ${renderConvertedBadge(item.converted)}
                        ${item.converted ? `<button class="copy-btn" onclick="edit('${item.converted}')"><i class="fa-regular fa-edit"></i></button>` : ''}
                    </td>
                    <td>
                        ${renderCalledBadge(item.called)}
                        ${item.called ? `<button class="copy-btn" onclick="edit('${item.called}')"><i class="fa-regular fa-edit"></i></button>` : ''}
                    </td>
                    <td>
                        ${renderStatusBadge(item.status)}
                        ${item.status ? `<button class="copy-btn" onclick="edit('${item.status}')"><i class="fa-regular fa-edit"></i></button>` : ''}
                    </td>
                    <td>${item.dateOfRegistration || '-'}</td>
                    <td>${item.dateOfModified || '-'}</td>
                    <td>
                        <button class="btn-action" onclick="openUpdateModal('${item.id}')">
                               <i class="fa-solid fa-edit"></i> Update
                         </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Mobile Responsive Card Renderer
        function renderMobileCards(data) {
            const container = document.getElementById('mobile-cards-container');
            container.innerHTML = '';

            if (data.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding: 16px; color: var(--text-muted);">No records found.</div>`;
                return;
            }

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'student-card';
                card.innerHTML = `
                    <div class="card-header-row">
                        <span class="card-title">${item.name || 'N/A'}</span>
                        <div>${renderStatusBadge(item.status)}</div>
                    </div>
                    <div class="card-grid">
                        <div><span class="card-item-label">Parent:</span> <span class="card-item-value">${item.parentName || '-'}</span></div>
                        <div><span class="card-item-label">Contact:</span> <span class="card-item-value">${item.contact || '-'}</span></div>
                        <div><span class="card-item-label">Email:</span> <span class="card-item-value">${item.email || '-'}</span></div>
                        <div><span class="card-item-label">State:</span> <span class="card-item-value">${item.state || '-'}</span></div>
                        <div><span class="card-item-label">Class/Sem:</span> <span class="card-item-value">${item.classSem || '-'}</span></div>
                        <div><span class="card-item-label">Class/Sem:</span> <span class="card-item-value">${item.preferredCourse || '-'}</span></div>
                        <div><span class="card-item-label">Converted:</span> ${renderConvertedBadge(item.converted)}</div>
                        <div><span class="card-item-label">Called:</span> ${renderCalledBadge(item.called)}</div>
                        <div><span class="card-item-label">Reg. Date:</span> <span class="card-item-value">${item.dateOfRegistration || '-'}</span></div>
                        <button class="btn btn-lg btn-action" onclick="openUpdateModal('${item.id}')">
                             <i class="fa-solid fa-edit></i> Update
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

function toggleScheduleInput(value) {
    const timeGroup = document.getElementById('scheduled-time-group');
    if (value === 'Scheduled') {
        timeGroup.style.display = 'flex';
    } else {
        timeGroup.style.display = 'none';
    }
}


function openUpdateModal(studentId) {
    /*const student = window.rawStudentsData.find(s => s.id === studentId);
    if (!student) return alert("Student record not found!");*/
    let student = null;
    if (typeof window.rawStudentsData !== 'undefined' && Array.isArray(window.rawStudentsData)) {
        student = window.rawStudentsData.find(s => String(s.id).trim() === String(studentId).trim());
    }else{
        return alert("Student record not found!");
    }
            
    // Fallback: If not found in rawStudentsData, search current table elements/state
    if (!student && typeof studentsData !== 'undefined' && Array.isArray(studentsData)) {
        student = studentsData.find(s => String(s.id).trim() === String(studentId).trim());
    }
    const modal = document.getElementById('updateModal');
    if (!modal) {
        return console.error("Element with ID 'updateModal' not found in DOM.");
    }

    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('modalStudentId').textContent = "ID: " + student.id;
    document.getElementById('modal-info').textContent = "Name: " + student.name +"Email: " + student.email;

    // Set Converted Value
   /* const isConverted = String(student.converted).toLowerCase() === 'true' || String(student.converted).toLowerCase() === 'yes';
    document.getElementById('edit-converted').value = isConverted ? 'Yes' : 'No';

    // Set Called Value
    const calledVal = student.called || 'Pending';
    if (calledVal.startsWith('Scheduled')) {
        document.getElementById('edit-called').value = 'Scheduled';
        toggleScheduleInput('Scheduled');
        // Parse time if previously stored in format "Scheduled (YYYY-MM-DDTHH:MM)"
        const timeMatch = calledVal.match(/\((.*?)\)/);
        if (timeMatch) {
            document.getElementById('edit-scheduled-time').value = timeMatch[1];
        }
    } else {
        document.getElementById('edit-called').value = calledVal;
        toggleScheduleInput(calledVal);
    }

    // Set Status Value
    document.getElementById('edit-status').value = student.status || 'Active';

    // Show Overlay
    document.getElementById('updateModal').style.display = 'flex';*/
    if (student) {
        // Match converted status
        const isConverted = String(student.converted).toLowerCase() === 'true' || String(student.converted).toLowerCase() === 'yes';
        document.getElementById('edit-converted').value = isConverted ? 'Yes' : 'No';

        // Match called status
        const calledVal = student.called || 'Pending';
        if (calledVal.startsWith('Scheduled')) {
            document.getElementById('edit-called').value = 'Scheduled';
            toggleScheduleInput('Scheduled');
            const timeMatch = calledVal.match(/\((.*?)\)/);
            if (timeMatch) {
                document.getElementById('edit-scheduled-time').value = timeMatch[1];
            }
        } else {
            document.getElementById('edit-called').value = calledVal;
            toggleScheduleInput(calledVal);
        }

        // Match status
        document.getElementById('edit-status').value = student.status || 'Active';
    } else {
        // Defaults if student object isn't found in JS memory array
        document.getElementById('edit-converted').value = 'No';
        document.getElementById('edit-called').value = 'Pending';
        document.getElementById('edit-status').value = 'Active';
        toggleScheduleInput('Pending');
    }
    // Force modal display
    modal.style.setProperty('display', 'flex', 'important');
}


function closeUpdateModal() {
    document.getElementById('updateModal').style.display = 'none';
}


async function saveRecordChanges() {
    const studentId = document.getElementById('edit-student-id').value;
    const converted = document.getElementById('edit-converted').value;
    const calledStatus = document.getElementById('edit-called').value;
    const scheduledTime = document.getElementById('edit-scheduled-time').value;
    const status = document.getElementById('edit-status').value;

    let finalCalledVal = calledStatus;
    if (calledStatus === 'Scheduled') {
        if (!scheduledTime) {
            return alert("Please select a date and time for the scheduled follow-up.");
        }
        finalCalledVal = `Scheduled (${scheduledTime})`;
    }

    const payload = {
        id: studentId,
        update_info: {
            converted: converted,
            called: finalCalledVal,
            status: status
        }
    };

    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const response = await fetch('/update_profile_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
            alert(result.message || 'Student record updated successfully!');

            // Update local memory data and re-render without page reload
            //const index = window.rawStudentsData.findIndex(s => s.id === studentId);
            const targetArr = window.rawStudentsData || studentsData || [];
            const index = targetArr.findIndex(s => String(s.id).trim() === String(studentId).trim());
            if (index !== -1) {
                targetArr[index].converted = converted;
                targetArr[index].called = finalCalledVal;
                targetArr[index].status = status;
                targetArr[index].dateOfModified = new Date().toISOString().split('T')[0];
            }

            if (typeof applyFilters === 'function') {
                applyFilters();
            } else if (typeof renderTable === 'function') {
                renderTable(targetArr);
            }
            closeUpdateModal();
        } else {
            alert(`Error (${result.status || response.status}): \n${result.message || 'Failed to update student record, please check server logs for more details.'}`);
        }
    } catch (error) {
        console.error('Update Error:', error);
        alert('Network error occurred. Unable to process update request.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}


