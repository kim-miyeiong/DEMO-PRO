import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import apiRoutes from '../routes/api.js';
import connectDB from '../database/index.js';
import seed from '../seed.js';

const app = express();
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use('/api', apiRoutes);

let databasePromise;

async function ensureDatabase() {
	if (!databasePromise) {
		databasePromise = connectDB().then(async (connected) => {
			if (!connected) throw new Error('MongoDB connection failed');
			await seed();
		});
	}
	return databasePromise;
}

export default async function handler(req, res) {
	try {
		await ensureDatabase();
		return app(req, res);
	} catch (error) {
		console.error('Vercel API startup failed:', error.message);
		return res.status(503).json({ success: false, error: 'Database unavailable' });
	}
}