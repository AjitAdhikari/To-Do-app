// pages/api/tasks/add.ts
import { connectToDatabase } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id, title, description, finished_date } = req.body;

  if (!user_id || !title || !description || !finished_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const stored_date = new Date(); // UTC
  const status = 'Pending';

  try {
    const db = await connectToDatabase();
    await db.query(
      'INSERT INTO tasks (user_id, title, description, stored_date, finished_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, title, description, stored_date, finished_date, status]
    );
    await db.end();
    res.status(200).json({ message: 'Task added successfully' });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'Error adding task' });
  }
}
