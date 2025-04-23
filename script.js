document.addEventListener('DOMContentLoaded', () => {
    // 1. Détection langue initiale
    let currentLang = localStorage.getItem('lang') || 'en';
    const langBtn = document.getElementById('lang-btn');
    updateLangBtnText();

    setupPrintButton();

    // 2. Bascule langue au clic
    langBtn.addEventListener('click', () => {
        currentLang = (currentLang === 'en') ? 'fr' : 'en';
        localStorage.setItem('lang', currentLang);
        updateLangBtnText();
        loadAndPopulate();
    });

    // 3. Chargement initial des données et population
    loadAndPopulate();

    function updateLangBtnText() {
        // Affiche le code de la langue opposée pour indiquer ce qu’on va basculer
        langBtn.textContent = (currentLang === 'en') ? 'FR' : 'EN';
    }

    function loadAndPopulate() {
        fetch(`data_${currentLang}.json`)
            .then(res => {
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                // Les mêmes appels qu’avant, mais sur l’objet 'data'
                populatePageTitleAndMeta(data.personalInfo);
                populateSchemaData(data);
                populatePersonalInfo(data.personalInfo);
                populateExperience(data.experience);
                populateEducation(data.education);
                populateProjects(data.projects);
                populateSkills(data.skills);
                populateFooter(data.personalInfo);
            })
            .catch(err => {
                console.error('Erreur chargement CV:', err);
                document.body.innerHTML = `<div style="color:red; text-align:center; padding:50px;">
                    Échec du chargement des données. ${err.message}
                </div>`;
            });
    }
});


function populatePageTitleAndMeta(info) {
    // Update page title
    document.title = `${info.name} - CV | ${info.title.split('|')[0].trim()}`; // Use first part of title

    // Update meta description (optional but good)
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', `${info.name}'s professional CV showcasing skills and experience in ${info.title}. ${info.summary.substring(0, 100)}...`); // Use start of summary
    }
    // Update OG title (optional)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', `${info.name} - Curriculum Vitae`);
    }
    // Update OG description (optional)
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.setAttribute('content', `Professional CV detailing skills, experience, and projects for ${info.name}.`);
    }
    // Update profile meta tags
    const profileFirstName = document.querySelector('meta[property="profile:first_name"]');
    if (profileFirstName && info.name.includes(' ')) {
        profileFirstName.setAttribute('content', info.name.split(' ')[0]);
    }
    const profileLastName = document.querySelector('meta[property="profile:last_name"]');
    if (profileLastName && info.name.includes(' ')) {
        profileLastName.setAttribute('content', info.name.split(' ').slice(-1)[0]);
    }
}

function populateSchemaData(data) {
    const schemaScript = document.getElementById('schema-data');
    if (!schemaScript) return;

    try {
        const schema = JSON.parse(schemaScript.textContent);

        // Update Person details
        schema.name = data.personalInfo.name;
        schema.jobTitle = data.personalInfo.title.split('|')[0].trim(); // Primary title
        schema.email = `mailto:${data.personalInfo.email}`;
        schema.telephone = data.personalInfo.phone;
        if (data.personalInfo.location) {
            const locationParts = data.personalInfo.location.split(',');
            schema.address = {
                "@type": "PostalAddress",
                "addressLocality": locationParts[0]?.trim(),
                "addressCountry": locationParts[1]?.trim() || undefined // Handle cases with no country
            };
        } else {
            delete schema.address; // Remove if no location
        }
        // schema.url = window.location.href; // Or keep the hardcoded one if preferred
        schema.sameAs = [
            data.personalInfo.linkedin,
            data.personalInfo.github,
            data.personalInfo.portfolio
        ].filter(Boolean); // Filter out empty links

        // Update alumniOf (Education)
        schema.alumniOf = data.education.map(edu => ({
            "@type": "EducationalOrganization",
            "name": edu.institution
        }));

        // Update knowsAbout (Skills) - Keep it concise, maybe top 5-10 skills
        // Simple approach: take the first few skills listed
        schema.knowsAbout = data.skills.slice(0, 10); // Example: first 10 skills

        // Update the script tag content
        schemaScript.textContent = JSON.stringify(schema, null, 2); // Pretty print JSON

    } catch (e) {
        console.error("Failed to parse or update schema data:", e);
    }
}


function populatePersonalInfo(info) {
    document.getElementById('name').textContent = info.name;
    document.getElementById('title').textContent = info.title;
    document.getElementById('summary').textContent = info.summary;

    const contactDiv = document.getElementById('contact-info');
    contactDiv.innerHTML = ''; // Clear previous content

    let contactParts = [];
    if (info.email) {
        contactParts.push(`<span><a href="mailto:${info.email}" title="Send email">${info.email}</a></span>`);
    }
    if (info.phone) {
        // Make phone clickable
        contactParts.push(`<span><a href="tel:${info.phone.replace(/\s/g, '')}" title="Call phone">${info.phone}</a></span>`);
    }
    if (info.location) {
        contactParts.push(`<span>📍 ${info.location}</span>`); // Added icon for clarity
    }
    contactDiv.innerHTML += contactParts.join(' | ');

    let socialLinks = [];
    if (info.linkedin) {
        socialLinks.push(`<span><a href="${info.linkedin}" target="_blank" rel="noopener noreferrer" title="LinkedIn Profile">LinkedIn</a></span>`);
    }
    if (info.github) {
        socialLinks.push(`<span><a href="${info.github}" target="_blank" rel="noopener noreferrer" title="GitHub Profile">GitHub</a></span>`);
    }
    if (info.portfolio) {
        socialLinks.push(`<span><a href="${info.portfolio}" target="_blank" rel="noopener noreferrer" title="Blog">Blog</a></span>`);
    }
    if (socialLinks.length > 0) {
        contactDiv.innerHTML += `<br class="contact-separator">` + socialLinks.join(' | '); // Add line break only if social links exist
    }
}

function populateExperience(experience) {
    const list = document.getElementById('experience-list');
    list.innerHTML = '';
    experience.forEach(exp => {
        const item = document.createElement('div');
        item.className = 'experience-item item'; // Keep 'item' for consistency if needed
        // Use unique ID for ARIA linking
        const detailsId = `exp-details-${exp.company.replace(/\s+/g, '-')}-${exp.title.replace(/\s+/g, '-')}`;
        item.innerHTML = `
            <div class="experience-summary" role="button" tabindex="0" aria-expanded="false" aria-controls="${detailsId}">
                <h3>${exp.title} <span class="toggle-icon">+</span></h3>
                <p class="meta">
                    <span>${exp.company}</span> | <span>${exp.location}</span> | <span>${exp.years}</span>
                </p>
            </div>
            <div id="${detailsId}" class="experience-details" style="display: none;">
                <ul>
                    ${exp.description.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `;
        list.appendChild(item);
    });
    addExperienceToggleListeners();
}

function addExperienceToggleListeners() {
    const experienceSummaries = document.querySelectorAll('#experience-list .experience-summary');
    experienceSummaries.forEach(summary => {
        const details = summary.nextElementSibling;
        const icon = summary.querySelector('.toggle-icon');

        const toggleDetails = () => {
            const isExpanded = details.style.display === 'block';
            details.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? '+' : '-';
            summary.setAttribute('aria-expanded', !isExpanded);
        };

        summary.addEventListener('click', toggleDetails);
        // Allow toggling with Enter/Space key for accessibility
        summary.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); // Prevent page scroll on Space
                toggleDetails();
            }
        });
    });
}


function populateEducation(education) {
    const list = document.getElementById('education-list');
    list.innerHTML = '';
    education.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'item education-item'; // Added specific class
        item.innerHTML = `
            <h3>${edu.degree}</h3>
            <p class="meta">
                <span>${edu.institution}</span> | <span>${edu.location}</span> | <span>${edu.years}</span>
            </p>
            ${edu.details ? `<p class="description">${edu.details}</p>` : ''}
        `;
        list.appendChild(item);
    });
}

function populateProjects(projects) {
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    projects.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'item project-item';
        item.innerHTML = `
            <h3>${proj.name}</h3>
            <p class="description">${proj.description}</p>
            ${proj.technologies && proj.technologies.length > 0 ? `
                <p class="technologies">
                    <strong>Technologies:</strong> ${proj.technologies.map(tech => `<span>${tech}</span>`).join(' ')}
                </p>
            ` : ''}
            ${proj.link ? `<a href="${proj.link}" class="project-link" target="_blank" rel="noopener noreferrer" title="View ${proj.name}">View Project / Code</a>` : ''}
        `;
        list.appendChild(item);
    });
}

function populateSkills(skills) {
    const list = document.getElementById('skills-list');
    list.innerHTML = '';
    // Check if skills seem grouped (contain colons or are longer strings)
    const areSkillsGrouped = skills.some(skill => skill.includes(':') || skill.length > 30);

    if (areSkillsGrouped) {
        // If grouped, maybe display differently, e.g., with headings
        skills.forEach(skillGroup => {
            const item = document.createElement('div'); // Use div instead of li for groups
            item.className = 'skill-group';
            if (skillGroup.includes(':')) {
                const parts = skillGroup.split(':');
                item.innerHTML = `<strong>${parts[0].trim()}:</strong> ${parts[1].trim()}`;
            } else {
                item.textContent = skillGroup; // Fallback if no colon
            }
            list.appendChild(item);
        });
        list.classList.add('grouped-skills'); // Add class for specific styling
    } else {
        // Original bubble display
        skills.forEach(skill => {
            const item = document.createElement('li');
            item.textContent = skill;
            list.appendChild(item);
        });
        list.classList.remove('grouped-skills'); // Ensure class is removed
    }
}


function populateFooter(info) { // Now receives personalInfo object
    document.getElementById('current-year').textContent = new Date().getFullYear();
    document.getElementById('footer-name').textContent = info.name;

    const lastUpdatedElem = document.getElementById('last-updated');
    if (lastUpdatedElem) {
        if (info.lastUpdated) {
            try {
                // Format the date nicely (e.g., "April 23, 2025")
                const date = new Date(info.lastUpdated + 'T00:00:00'); // Ensure it's treated as local date
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                lastUpdatedElem.textContent = date.toLocaleDateString('en-US', options); // Adjust locale if needed
            } catch (e) {
                lastUpdatedElem.textContent = info.lastUpdated; // Fallback to raw date string
            }
        } else {
            lastUpdatedElem.parentElement.style.display = 'none'; // Hide if no date provided
        }
    }
}

// Renamed and simplified function for Print/Save PDF button
function setupPrintButton() {
    const printButton = document.getElementById('print-pdf-btn');
    if (printButton) {
        printButton.addEventListener('click', () => {
            console.log('Print button clicked');
            window.print(); // Trigger browser's print dialog
        });
    } else {
        console.error('Print button not found.');
    }
}