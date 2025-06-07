// Scholarship Finder JavaScript

// Sample scholarship data (in real app, this would come from your backend API)
const sampleScholarships = [
    {
        id: 1,
        title: "Merit Excellence Scholarship",
        provider: "State University Foundation",
        amount: "$15,000",
        type: "merit",
        description: "Awarded to outstanding students with exceptional academic performance and leadership qualities.",
        deadline: "2025-08-15",
        eligibility: ["GPA 3.5+", "Undergraduate", "US Citizen"],
        matchScore: 92,
        applicationLink: "https://example.com/apply/1"
    },
    {
        id: 2,
        title: "STEM Innovation Grant",
        provider: "Tech Companies Alliance",
        amount: "$25,000",
        type: "merit",
        description: "Supporting the next generation of innovators in Science, Technology, Engineering, and Mathematics.",
        deadline: "2025-07-20",
        eligibility: ["Engineering/CS", "GPA 3.0+", "Any Nationality"],
        matchScore: 88,
        applicationLink: "https://example.com/apply/2"
    },
    {
        id: 3,
        title: "First Generation College Support",
        provider: "Education Equity Foundation",
        amount: "$8,000",
        type: "need",
        description: "Dedicated to supporting first-generation college students in achieving their educational dreams.",
        deadline: "2025-09-30",
        eligibility: ["First Generation", "Any Field", "Income < $60K"],
        matchScore: 75,
        applicationLink: "https://example.com/apply/3"
    },
    {
        id: 4,
        title: "Creative Arts Excellence Award",
        provider: "National Arts Council",
        amount: "$12,000",
        type: "creative",
        description: "Recognizing exceptional talent and creativity in visual arts, music, theater, and creative writing.",
        deadline: "2025-06-30",
        eligibility: ["Arts Major", "Portfolio Required", "Any GPA"],
        matchScore: 65,
        applicationLink: "https://example.com/apply/4"
    },
    {
        id: 5,
        title: "Community Service Leadership Scholarship",
        provider: "Volunteer Impact Network",
        amount: "$10,000",
        type: "merit",
        description: "Honoring students who have made significant contributions to their communities through volunteer service.",
        deadline: "2025-08-01",
        eligibility: ["100+ Volunteer Hours", "Leadership Role", "Any Major"],
        matchScore: 82,
        applicationLink: "https://example.com/apply/5"
    },
    {
        id: 6,
        title: "Women in Engineering Scholarship",
        provider: "Society of Women Engineers",
        amount: "$20,000",
        type: "merit",
        description: "Empowering women to pursue and excel in engineering careers through financial support.",
        deadline: "2025-07-15",
        eligibility: ["Female", "Engineering Major", "GPA 3.2+"],
        matchScore: 70,
        applicationLink: "https://example.com/apply/6"
    }
];

// Global variables
let currentScholarships = [];
let filteredScholarships = [];
let studentProfile = {};

// DOM Elements
const profileForm = document.getElementById('studentProfileForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const filtersSection = document.getElementById('filters');
const scholarshipsSection = document.getElementById('scholarships');
const scholarshipsGrid = document.getElementById('scholarshipsGrid');
const resultsCount = document.getElementById('resultsCount');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    profileForm.addEventListener('submit', handleProfileSubmit);
    
    // Add filter event listeners
    document.getElementById('amountFilter')?.addEventListener('change', applyFilters);
    document.getElementById('deadlineFilter')?.addEventListener('change', applyFilters);
    document.getElementById('typeFilter')?.addEventListener('change', applyFilters);
    document.getElementById('sortBy')?.addEventListener('change', applySorting);
    
    // Smooth scrolling for navigation
    setupSmoothScrolling();
    
    // Set current year for graduation year field
    const graduationYearField = document.getElementById('graduationYear');
    if (graduationYearField) {
        graduationYearField.value = new Date().getFullYear() + 2;
    }
}

function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function scrollToProfile() {
    const profileSection = document.getElementById('profile');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = profileSection.offsetTop - headerHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

function handleProfileSubmit(e) {
    e.preventDefault();
    
    // Show loading overlay
    showLoading();
    
    // Collect form data
    studentProfile = collectFormData();
    
    // Simulate API call delay
    setTimeout(() => {
        // Find matching scholarships
        currentScholarships = findMatchingScholarships(studentProfile);
        filteredScholarships = [...currentScholarships];
        
        // Display results
        displayScholarships();
        showResults();
        hideLoading();
        
        // Scroll to results
        const scholarshipsSection = document.getElementById('scholarships');
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = scholarshipsSection.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }, 2000); // 2 second delay to simulate processing
}

function collectFormData() {
    const formData = new FormData(profileForm);
    const profile = {};
    
    // Basic information
    profile.firstName = formData.get('firstName');
    profile.lastName = formData.get('lastName');
    profile.email = formData.get('email');
    profile.phone = formData.get('phone');
    
    // Academic information
    profile.courseOfStudy = formData.get('courseOfStudy');
    profile.academicLevel = formData.get('academicLevel');
    profile.gpa = formData.get('gpa');
    profile.graduationYear = formData.get('graduationYear');
    
    // Location information
    profile.country = formData.get('country');
    profile.state = formData.get('state');
    profile.city = formData.get('city');
    profile.studyAbroad = formData.get('studyAbroad');
    
    // Additional criteria
    profile.incomeStatus = formData.get('incomeStatus');
    profile.ethnicity = formData.get('ethnicity');
    profile.interests = formData.get('interests');
    
    // Special categories
    profile.categories = formData.getAll('categories');
    
    return profile;
}

function findMatchingScholarships(profile) {
    // In a real application, this would be an API call to your backend
    // For demo purposes, we'll use the sample data and add some matching logic
    
    return sampleScholarships.map(scholarship => {
        // Calculate match score based on profile
        let matchScore = calculateMatchScore(scholarship, profile);
        return {
            ...scholarship,
            matchScore: matchScore
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
}

function calculateMatchScore(scholarship, profile) {
    let score = 50; // Base score
    
    // Course of study matching
    if (profile.courseOfStudy === 'engineering' && scholarship.title.toLowerCase().includes('engineering')) {
        score += 20;
    } else if (profile.courseOfStudy === 'computer-science' && scholarship.title.toLowerCase().includes('stem')) {
        score += 20;
    } else if (profile.courseOfStudy === 'arts' && scholarship.title.toLowerCase().includes('arts')) {
        score += 20;
    }
    
    // GPA matching
    if (profile.gpa && scholarship.eligibility.some(req => req.includes('GPA'))) {
        const gpaValue = parseFloat(profile.gpa.split('-')[0]);
        if (gpaValue >= 3.5) score += 15;
        else if (gpaValue >= 3.0) score += 10;
        else if (gpaValue >= 2.5) score += 5;
    }
    
    // Special categories matching
    if (profile.categories.includes('first-generation') && 
        scholarship.title.toLowerCase().includes('first generation')) {
        score += 25;
    }
    
    // Income-based matching
    if (profile.incomeStatus && profile.incomeStatus.includes('low') && 
        scholarship.type === 'need') {
        score += 15;
    }
    
    // Ensure score is within bounds
    return Math.min(100, Math.max(0, score));
}

function displayScholarships() {
    scholarshipsGrid.innerHTML = '';
    
    if (filteredScholarships.length === 0) {
        scholarshipsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No scholarships found</h3>
                <p>Try adjusting your filters or profile information.</p>
            </div>
        `;
        return;
    }
    
    filteredScholarships.forEach(scholarship => {
        const scholarshipCard = createScholarshipCard(scholarship);
        scholarshipsGrid.appendChild(scholarshipCard);
    });
    
    // Update results count
    resultsCount.textContent = `Found ${filteredScholarships.length} scholarships matching your profile`;
}

function createScholarshipCard(scholarship) {
    const card = document.createElement('div');
    card.className = 'scholarship-card fade-in';
    
    const matchScoreClass = getMatchScoreClass(scholarship.matchScore);
    const deadlineClass = getDeadlineClass(scholarship.deadline);
    const deadlineText = formatDeadline(scholarship.deadline);
    
    card.innerHTML = `
        <div class="match-score ${matchScoreClass}">${scholarship.matchScore}% Match</div>
        <div class="card-header">
            <div>
                <h3 class="scholarship-title">${scholarship.title}</h3>
                <p class="scholarship-provider">${scholarship.provider}</p>
            </div>
            <div class="scholarship-amount">${scholarship.amount}</div>
        </div>
        
        <p class="scholarship-description">${scholarship.description}</p>
        
        <div class="scholarship-details">
            <div class="detail-item">
                <i class="fas fa-calendar"></i>
                <span class="${deadlineClass}">Due: ${deadlineText}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-tag"></i>
                <span>${scholarship.type.charAt(0).toUpperCase() + scholarship.type.slice(1)}</span>
            </div>
        </div>
        
        <div class="eligibility-tags">
            ${scholarship.eligibility.map(req => `<span class="eligibility-tag">${req}</span>`).join('')}
        </div>
        
        <div class="card-actions">
            <a href="${scholarship.applicationLink}" class="apply-btn" target="_blank">
                <i class="fas fa-external-link-alt"></i>
                Apply Now
            </a>
            <button class="bookmark-btn" onclick="toggleBookmark(${scholarship.id})">
                <i class="fas fa-bookmark"></i>
            </button>
        </div>
    `;
    
    return card;
}

function getMatchScoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

function getDeadlineClass(deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 30) return 'deadline-urgent';
    if (daysUntil <= 60) return 'deadline-soon';
    return 'deadline-normal';
}

function formatDeadline(deadline) {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function applyFilters() {
    const amountFilter = document.getElementById('amountFilter').value;
    const deadlineFilter = document.getElementById('deadlineFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    filteredScholarships = currentScholarships.filter(scholarship => {
        // Amount filter
        if (amountFilter) {
            const amount = parseInt(scholarship.amount.replace(/[^\d]/g, ''));
            if (amountFilter === 'full' && amount < 15000) return false;
            if (amountFilter === 'partial' && (amount < 5000 || amount >= 15000)) return false;
            if (amountFilter === 'small' && amount >= 5000) return false;
        }
        
        // Deadline filter
        if (deadlineFilter) {
            const deadlineDate = new Date(scholarship.deadline);
            const today = new Date();
            const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
            
            if (deadlineFilter === 'urgent' && daysUntil > 30) return false;
            if (deadlineFilter === 'soon' && (daysUntil <= 30 || daysUntil > 60)) return false;
            if (deadlineFilter === 'later' && daysUntil <= 60) return false;
        }
        
        // Type filter
        if (typeFilter && scholarship.type !== typeFilter) return false;
        
        return true;
    });
    
    applySorting();
    displayScholarships();
}

function applySorting() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredScholarships.sort((a, b) => {
        switch (sortBy) {
            case 'deadline':
                return new Date(a.deadline) - new Date(b.deadline);
            case 'amount':
                const amountA = parseInt(a.amount.replace(/[^\d]/g, ''));
                const amountB = parseInt(b.amount.replace(/[^\d]/g, ''));
                return amountB - amountA;
            case 'relevance':
            default:
                return b.matchScore - a.matchScore;
        }
    });
    
    displayScholarships();
}

function resetFilters() {
    document.getElementById('amountFilter').value = '';
    document.getElementById('deadlineFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('sortBy').value = 'relevance';
    
    filteredScholarships = [...currentScholarships];
    applySorting();
}

function toggleBookmark(scholarshipId) {
    // In a real app, this would save to user's profile or database
    const bookmarkBtn = event.target.closest('.bookmark-btn');
    bookmarkBtn.classList.toggle('bookmarked');
    
    if (bookmarkBtn.classList.contains('bookmarked')) {
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    } else {
        bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
    }
}

function clearForm() {
    profileForm.reset();
    hideResults();
}

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showResults() {
    filtersSection.style.display = 'block';
    scholarshipsSection.style.display = 'block';
}

function hideResults() {
    filtersSection.style.display = 'none';
    scholarshipsSection.style.display = 'none';
}

function loadMoreScholarships() {
    // In a real app, this would load more results from the API
    alert('Load more functionality would fetch additional scholarships from the server.');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add animation to cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-up');
            }
        });
    }, observerOptions);
    
    // Observe scholarship cards when they're created
    const originalCreateCard = createScholarshipCard;
    createScholarshipCard = function(scholarship) {
        const card = originalCreateCard(scholarship);
        observer.observe(card);
        return card;
    };
});