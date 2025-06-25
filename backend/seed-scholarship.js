import mongoose from 'mongoose';
import Scholarship from './models/Scholarship.js'; // Your Mongoose scholarship model
// import scholarshipsData from './data/scholarships.json' assert {type: 'json'};
// const scholarshipsData = await import('./data/scholarships.json', { assert: { type: 'json' } });
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadScholarships() {
  const dataPath = path.join(__dirname, './data/scholarships.json');
  const jsonData = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(jsonData);
}

// Later use await loadScholarships();
const scholarshipsData = await loadScholarships();

const MONGO_URI = process.env.MONGO_URI;

export async function seed() {
    try {
        // await mongoose.connect(MONGO_URI);
        // await Scholarship.deleteMany({}); // Clear existing documents
        // await Scholarship.insertMany(scholarshipsData);
        for (const scholarship of scholarshipsData) {
            await Scholarship.updateOne(
                { title: scholarship.title }, // filter on unique field
                { $set: scholarship },
                { upsert: true }
            );
        }
        console.log('Seed data inserted successfully');
        // process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}