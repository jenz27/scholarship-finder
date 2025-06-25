import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  title: String,
  provider: String,
  amount: String,
  type: String,
  description: String,
  deadline: Date,
  eligibility: [String],
  applicationLink: String,
});

// Check if model already exists, use it, else compile a new one
const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', scholarshipSchema);

export default Scholarship;