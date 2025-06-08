import { connectToDatabase } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { task_id } = req.query;

  if (!task_id) return res.status(400).json({ message: 'Task ID required' });

  try {
    const db = await connectToDatabase();

    if (req.method === 'PUT') {
      const { title, description, finished_date } = req.body;
      if (!title || !description || !finished_date) {
        await db.end();
        return res.status(400).json({ message: 'All fields are required' });
      }
      await db.query(
        'UPDATE tasks SET title = ?, description = ?, finished_date = ? WHERE task_id = ?',
        [title, description, finished_date, task_id]
      );
      await db.end();
      return res.status(200).json({ message: 'Task updated successfully' });
    }

    if (req.method === 'DELETE') {
      await db.query('DELETE FROM tasks WHERE task_id = ?', [task_id]);
      await db.end();
      return res.status(200).json({ message: 'Task deleted successfully' });
    }

    await db.end();
    return res.status(405).end();
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}