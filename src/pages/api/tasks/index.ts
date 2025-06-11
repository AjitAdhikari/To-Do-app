import { connectToDatabase } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const user_id = req.query.user_id as string;
  console.log('Fetching tasks for user:', user_id);

  if (!user_id) return res.status(400).json({ message: 'User ID required' });

  try {
    const db = await connectToDatabase();
    const [tasks]: any = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY stored_date DESC',
      [user_id]
    );
    await db.end();
    res.status(200).json({ tasks });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
}
