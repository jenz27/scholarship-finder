import React, { useState, useEffect, useRef } from "react";
import "./styles.css"; // Import your CSS styles

const ScholarshipFinder = () => {
  // State management
  const [currentScholarships, setCurrentScholarships] = useState([]);
  const [filteredScholarships, setFilteredScholarships] = useState([]); // Initialize as empty array
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    courseOfStudy: "",
    academicLevel: "",
    gpa: "",
    graduationYear: new Date().getFullYear() + 2,
    country: "",
    state: "",
    city: "",
    studyAbroad: "yes",
    incomeStatus: "",
    ethnicity: "",
    interests: "",
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [offset, setOffset] = useState(0);
  const [activeNav, setActiveNav] = useState("home");
  const [bookmarkedScholarships, setBookmarkedScholarships] = useState(
    new Set()
  );
  const [filters, setFilters] = useState({
    amount: "",
    deadline: "",
    type: "",
    sortBy: "relevance",
  });

  // Refs for smooth scrolling
  const profileRef = useRef(null);
  const scholarshipsRef = useRef(null);

  const getDeadlineClass = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 30) return "text-red-600";
    if (daysUntil <= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const scrollToSection = (sectionRef, navId) => {
    setActiveNav(navId);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle input changes for form controls
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        categories: checked
          ? [...prev.categories, value]
          : prev.categories.filter((cat) => cat !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Fetch scholarships from backend API based on profile data
  const fetchScholarshipsFromAPI = async (profile) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5002/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      setCurrentScholarships(data);
      setFilteredScholarships(data);
      setShowResults(true);
      setOffset(6); // Set offset for loading more
      return data; // <-- ADD THIS LINE
    } catch (error) {
      console.error("Error fetching scholarships:", error);
      return []; // <-- Return empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Load more scholarships
  const loadMoreScholarships = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5002/api/scholarships/load-more?offset=${offset}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const moreScholarships = await response.json();
      setFilteredScholarships((prev) => [...prev, ...moreScholarships]);
      setOffset((prev) => prev + 6); // Increment offset for next load
    } catch (error) {
      console.error("Error loading more scholarships:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleFindScholarships = async (e) => {
    e.preventDefault();
    setShowResults(false);
    const scholarships = await fetchScholarshipsFromAPI(formData);
    setCurrentScholarships(scholarships);
    setFilteredScholarships(scholarships);
    setShowResults(true);
    scrollToSection(scholarshipsRef, "scholarships");
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const toggleBookmark = (scholarshipId) => {
    setBookmarkedScholarships((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(scholarshipId)) {
        newSet.delete(scholarshipId);
      } else {
        newSet.add(scholarshipId);
      }
      return newSet;
    });
  };

  const clearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      courseOfStudy: "",
      academicLevel: "",
      gpa: "",
      graduationYear: new Date().getFullYear() + 2,
      country: "",
      state: "",
      city: "",
      studyAbroad: "yes",
      incomeStatus: "",
      ethnicity: "",
      interests: "",
      categories: [],
    });
    setShowResults(false);
  };

  const resetFilters = () => {
    setFilters({
      amount: "",
      deadline: "",
      type: "",
      sortBy: "relevance",
    });
  };

  // Apply filters and sorting on current scholarships
  useEffect(() => {
    let filtered = [...currentScholarships];

    if (filters.amount) {
      filtered = filtered.filter((scholarship) => {
        const amount = parseInt(scholarship.amount.replace(/[^\d]/g, ""));
        if (filters.amount === "full" && amount < 15000) return false;
        if (filters.amount === "partial" && (amount < 5000 || amount >= 15000))
          return false;
        if (filters.amount === "small" && amount >= 5000) return false;
        return true;
      });
    }

    if (filters.deadline) {
      filtered = filtered.filter((scholarship) => {
        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        const daysUntil = Math.ceil(
          (deadlineDate - today) / (1000 * 60 * 60 * 24)
        );

        if (filters.deadline === "urgent" && daysUntil > 30) return false;
        if (filters.deadline === "soon" && (daysUntil <= 30 || daysUntil > 60))
          return false;
        if (filters.deadline === "later" && daysUntil <= 60) return false;
        return true;
      });
    }

    if (filters.type) {
      filtered = filtered.filter(
        (scholarship) => scholarship.type === filters.type
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "deadline":
            return new Date(a.deadline) - new Date(b.deadline);
          case "amount":
            const amountA = parseInt(a.amount.replace(/[^\d]/g, ""));
            const amountB = parseInt(b.amount.replace(/[^\d]/g, ""));
            return amountB - amountA;
          case "relevance":
          default:
            return b.matchScore - a.matchScore;
        }
      });
    }

    setFilteredScholarships(filtered);
  }, [filters, currentScholarships]);

  return (
    <div className="scholarship-finder">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">
            <i className="fas fa-graduation-cap"></i>
            <h1>ScholarshipFinder</h1>
          </div>
          <nav className="nav-menu">
            {["home", "profile", "scholarships", "about"].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                className={`nav-link ${activeNav === section ? "active" : ""}`}
                onClick={() => setActiveNav(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <h2>Find Scholarships Tailored Just For You</h2>
            <p>
              Discover thousands of scholarship opportunities that match your
              profile, interests, and academic goals.
            </p>
            <button
              className="cta-btn"
              onClick={() => scrollToSection(profileRef, "profile")}
            >
              <i className="fas fa-search"></i>
              Start Finding Scholarships
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Active Scholarships</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Universities</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section id="profile" className="profile-section" ref={profileRef}>
        <div className="container">
          <div className="section-header">
            <h2>Create Your Student Profile</h2>
            <p>
              Tell us about yourself to get personalized scholarship
              recommendations
            </p>
          </div>
          <form
            className="profile-form"
            id="studentProfileForm"
            onSubmit={handleFindScholarships}
          >
            {/* Basic Information */}
            <div className="form-section">
              <h3>
                <i className="fas fa-user"></i> Basic Information
              </h3>
              <div className="form-grid">
                {[
                  {
                    label: "First Name *",
                    id: "firstName",
                    name: "firstName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Last Name *",
                    id: "lastName",
                    name: "lastName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Email Address *",
                    id: "email",
                    name: "email",
                    type: "email",
                    required: true,
                  },
                  {
                    label: "Phone Number",
                    id: "phone",
                    name: "phone",
                    type: "tel",
                    required: false,
                  },
                ].map(({ label, id, name, type, required }) => (
                  <div className="form-group" key={id}>
                    <label htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      name={name}
                      type={type}
                      required={required}
                      value={formData[name]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Information */}
            <div className="form-section">
              <h3>
                <i className="fas fa-book"></i> Academic Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="courseOfStudy">Course of Study *</label>
                  <select id="courseOfStudy" name="courseOfStudy" required>
                    <option value="">Select your field</option>
                    <option value="engineering">Engineering</option>
                    <option value="medicine">Medicine</option>
                    <option value="business">Business Administration</option>
                    <option value="computer-science">Computer Science</option>
                    <option value="arts">Arts & Humanities</option>
                    <option value="sciences">Natural Sciences</option>
                    <option value="social-sciences">Social Sciences</option>
                    <option value="law">Law</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="academicLevel">Academic Level *</label>
                  <select id="academicLevel" name="academicLevel" required>
                    <option value="">Select level</option>
                    <option value="high-school">High School</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="gpa">CPI/Grades *</label>
                  <select id="gpa" name="gpa" required>
                    <option value="">Select CPI range</option>
                    <option value="9.0-above">Above 9.0</option>
                    <option value="8.0-8.99">8.0 - 8.99</option>
                    <option value="7.0-7.99">7.0 - 7.99</option>
                    <option value="6.0-6.99">6.0 - 6.99</option>
                    <option value="5.0-5.99">5.0 - 5.99</option>
                    <option value="below-4.99">Below 5.0</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="graduationYear">
                    Expected Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    min="2024"
                    max="2030"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>
                <i className="fas fa-map-marker-alt"></i> Location Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <select id="country" name="country" required>
                    <option value="">Select country</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="canada">Canada</option>
                    <option value="australia">Australia</option>
                    <option value="india">India</option>
                    <option value="germany">Germany</option>
                    <option value="france">France</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="state">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="Enter your state/province"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="Enter your city"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="studyAbroad">Willing to Study Abroad?</label>
                  <select id="studyAbroad" name="studyAbroad">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="maybe">Maybe</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>
                <i className="fas fa-tags"></i> Additional Criteria
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="incomeStatus">
                    Family Income Status (Optional)
                  </label>
                  <select id="incomeStatus" name="incomeStatus">
                    <option value="">Prefer not to say</option>
                    <option value="low">Low Income (Under $30,000)</option>
                    <option value="middle-low">
                      Lower Middle (30,000 - 50,000)
                    </option>
                    <option value="middle">
                      Middle Income (50,000 - 100,000)
                    </option>
                    <option value="middle-high">
                      Upper Middle (100,000 - 200,000)
                    </option>
                    <option value="high">High Income (200,000+)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ethnicity">Ethnicity (Optional)</label>
                  <select id="ethnicity" name="ethnicity">
                    <option value="">Prefer not to say</option>
                    <option value="african-american">African American</option>
                    <option value="asian">Asian</option>
                    <option value="hispanic">Hispanic/Latino</option>
                    <option value="native-american">Native American</option>
                    <option value="white">White</option>
                    <option value="mixed">Mixed Race</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="interests">Interests & Activities</label>
                <textarea
                  id="interests"
                  name="interests"
                  rows="3"
                  placeholder="Enter your hobbies, extracurricular activities, volunteer work, etc."
                ></textarea>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="categories"
                    value="first-generation"
                  />
                  <span className="checkmark"></span>
                  First-generation college student
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" name="categories" value="veteran" />
                  <span className="checkmark"></span>
                  Military veteran or dependent
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" name="categories" value="disability" />
                  <span className="checkmark"></span>
                  Student with disability
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="categories"
                    value="single-parent"
                  />
                  <span className="checkmark"></span>
                  Single parent
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={clearForm}
              >
                Clear Form
              </button>
              <button type="submit" className="btn-primary">
                <i className="fas fa-search"></i>
                Find My Scholarships
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Filters Section */}
      <section
        id="filters"
        className="filters-section"
        style={{ display: showResults ? "block" : "none" }}
      >
        <div className="container">
          <div className="filters-header">
            <h3>Filter Scholarships</h3>
            <button className="reset-filters" onClick={resetFilters}>
              Reset All
            </button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="amountFilter">Scholarship Amount</label>
              <select
                id="amountFilter"
                value={filters.amount}
                onChange={(e) => handleFilterChange("amount", e.target.value)}
              >
                <option value="">All Amounts</option>
                <option value="full">Full Tuition</option>
                <option value="partial">Partial (5,000+)</option>
                <option value="small">Small Grants (Under 5,000)</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="deadlineFilter">Deadline</label>
              <select
                id="deadlineFilter"
                value={filters.deadline}
                onChange={(e) => handleFilterChange("deadline", e.target.value)}
              >
                <option value="">All Deadlines</option>
                <option value="urgent">Urgent (Within 30 days)</option>
                <option value="soon">Soon (Within 60 days)</option>
                <option value="later">Later (60+ days)</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="typeFilter">Scholarship Type</label>
              <select
                id="typeFilter"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="merit">Merit-based</option>
                <option value="need">Need-based</option>
                <option value="athletic">Athletic</option>
                <option value="creative">Creative/Arts</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Scholarships Section */}
      <section
        id="scholarships"
        className="scholarships-section"
        ref={scholarshipsRef}
        style={{ display: showResults ? "block" : "none" }}
      >
        <div className="container">
          <div className="results-header">
            <div className="results-info">
              <h2>Your Personalized Scholarships</h2>
              <p id="resultsCount">
                Found {filteredScholarships.length} scholarships matching your
                profile
              </p>
              {/* <ul>
                {filteredScholarships.map((scholarship) => (
                  <div key={scholarship.id} className="scholarship-card">
                    <li>
                      <h3>{scholarship.title}</h3>
                      <p>{scholarship.description}</p>
                      <p>Provider: {scholarship.provider}</p>
                      <p>Amount: {scholarship.amount}</p>
                      <a href={scholarship.applicationLink}>Apply Here</a>
                    </li>
                  </div>
                ))}
              </ul> */}
            </div>
            <div className="sort-options">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="deadline">Deadline</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>

          <div className="scholarships-grid" id="scholarshipsGrid">
            {filteredScholarships.length > 0 ? (
              filteredScholarships.map((scholarship) => (
                <div key={scholarship.id} className="scholarship-card">
                  <h3 className="scholarship-title">{scholarship.title}</h3>
                  <p className="scholarship-provider">{scholarship.provider}</p>
                  <p className="scholarship-description">
                    {scholarship.description}
                  </p>
                  <p className="scholarship-amount">{scholarship.amount}</p>
                  <p
                    className={`scholarship-deadline ${getDeadlineClass(
                      scholarship.deadline
                    )}`}
                  >
                    Deadline: {formatDeadline(scholarship.deadline)}
                  </p>
                  <button
                    className="apply-btn"
                    onClick={() =>
                      window.open(scholarship.applicationLink, "_blank")
                    }
                    aria-label={`Apply to ${scholarship.title}`}
                  >
                    Apply Now
                  </button>
                  <button
                    className={`bookmark-btn ${
                      bookmarkedScholarships.has(scholarship.id)
                        ? "bookmarked"
                        : ""
                    }`}
                    onClick={() => toggleBookmark(scholarship.id)}
                    aria-pressed={bookmarkedScholarships.has(scholarship.id)}
                    aria-label={`${
                      bookmarkedScholarships.has(scholarship.id)
                        ? "Remove"
                        : "Add"
                    } bookmark for ${scholarship.title}`}
                  >
                    {bookmarkedScholarships.has(scholarship.id)
                      ? "Unbookmark"
                      : "Bookmark"}
                  </button>
                </div>
              ))
            ) : (
              <p>No scholarships found matching your filters.</p>
            )}
          </div>

          <div className="load-more">
            <button
              className="btn-secondary"
              onClick={() => console.log("Load more scholarships")}
            >
              Load More Scholarships
            </button>
          </div>
        </div>
      </section>

      {/* Loading Spinner */}
      {isLoading && (
        <div
          className="loading-overlay"
          id="loadingOverlay"
          role="alert"
          aria-live="assertive"
        >
          <div className="spinner">
            <i className="fas fa-graduation-cap fa-spin" aria-hidden="true"></i>
            <p>Finding your perfect scholarships...</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>ScholarshipFinder</h4>
              <p>
                Helping students find their perfect scholarship matches through
                intelligent matching and comprehensive database search.
              </p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="#home">Home</a>
              <a href="#profile">Create Profile</a>
              <a href="#scholarships">Browse Scholarships</a>
              <a href="#about">About Us</a>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="#">Application Tips</a>
              <a href="#">Essay Guidelines</a>
              <a href="#">FAQ</a>
              <a href="#">Contact Support</a>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" aria-label="Facebook">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ScholarshipFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ScholarshipFinder;
