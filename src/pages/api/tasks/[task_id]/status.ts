import { connectToDatabase } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { task_id } = req.query;

  if (!task_id) return res.status(400).json({ message: 'Task ID required' });

  if (req.method !== 'PUT') return res.status(405).end();

  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Status is required' });

  try {
    const db = await connectToDatabase();
    await db.query('UPDATE tasks SET status = ? WHERE task_id = ?', [status, task_id]);
    await db.end();

    return res.status(200).json({ message: 'Task status updated successfully' });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
