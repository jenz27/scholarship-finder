import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

// Define a schema for scholarships
const scholarshipSchema = new mongoose.Schema({
  title: String,
  provider: String,
  amount: String,
  type: String,
  description: String,
  deadline: Date,
  eligibility: [String],
  matchScore: Number,
  applicationLink: String,
});

// Create a model for scholarships
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

// Utility function to calculate match score based on user profile
function calculateMatchScore(scholarship, profile) {
  let score = 50; // Base score

  if (
    profile.courseOfStudy === "engineering" &&
    scholarship.title.toLowerCase().includes("engineering")
  ) {
    score += 20;
  } else if (
    profile.courseOfStudy === "computer-science" &&
    scholarship.title.toLowerCase().includes("stem")
  ) {
    score += 20;
  } else if (
    profile.courseOfStudy === "arts" &&
    scholarship.title.toLowerCase().includes("arts")
  ) {
    score += 20;
  }

  if (
    profile.gpa &&
    scholarship.eligibility.some((req) => req.includes("CPI"))
  ) {
    const gpaValue = parseFloat(profile.gpa.split("-")[0]);
    if (gpaValue >= 8.0) score += 15;
    else if (gpaValue >= 6.0) score += 10;
    else if (gpaValue >= 5.0) score += 5;
  }

  if (
    profile.categories?.includes("first-generation") &&
    scholarship.title.toLowerCase().includes("first generation")
  ) {
    score += 25;
  }

  if (
    profile.incomeStatus &&
    profile.incomeStatus.includes("low") &&
    scholarship.type === "need"
  ) {
    score += 15;
  }

  return Math.min(100, Math.max(0, score));
}

// POST /api/scholarships - expects JSON with student profile data, returns matched scholarships
router.post('/', async (req, res) => {
  const profile = req.body;

  if (!profile) {
    return res.status(400).json({ error: "Student profile data is required." });
  }

  try {
    // Fetch scholarships from the database
    const scholarships = await Scholarship.find();

    // Calculate match scores for scholarships
    let matchedScholarships = scholarships.map(scholarship => ({
      ...scholarship.toObject(), // Convert Mongoose document to plain object
      matchScore: calculateMatchScore(scholarship, profile),
    }));

    // Filter out scholarships with low match scores (e.g., below 20)
    matchedScholarships = matchedScholarships.filter(s => s.matchScore >= 20);

    // Sort scholarships by matchScore descending
    matchedScholarships.sort((a, b) => b.matchScore - a.matchScore);

    // Return only the first 6 matched scholarships
    return res.json(matchedScholarships.slice(0, 6));
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/scholarships/load-more - expects JSON with student profile data, returns more matched scholarships
router.post('/load-more', async (req, res) => {
  const profile = req.body;
  const { offset } = req.query; // Get the offset for pagination

  if (!profile) {
    return res.status(400).json({ error: "Student profile data is required." });
  }

  try {
    const scholarships = await Scholarship.find();

    let matchedScholarships = scholarships.map(scholarship => ({
      ...scholarship.toObject(),
      matchScore: calculateMatchScore(scholarship, profile),
    }));

    matchedScholarships = matchedScholarships.filter(s => s.matchScore >= 20);
    matchedScholarships.sort((a, b) => b.matchScore - a.matchScore);

    // Return the next set of matched scholarships based on the offset
    const moreScholarships = matchedScholarships.slice(offset, offset + 6);
    return res.json(moreScholarships);
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
