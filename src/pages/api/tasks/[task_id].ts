import { connectToDatabase } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { task_id } = req.query;

  if (!task_id) return res.status(400).json({ message: 'Task ID required' });

  try {
    const db = await connectToDatabase();

    if (req.method === 'PUT') {
      const { title, description, finished_date, status } = req.body;

      if (!title && !description && !finished_date && !status) {
        await db.end();
        return res.status(400).json({ message: 'At least one field required to update' });
      }

      const fields = [];
      const values = [];

      if (title) {
        fields.push('title = ?');
        values.push(title);
      }
      if (description) {
        fields.push('description = ?');
        values.push(description);
      }
      if (finished_date) {
        fields.push('finished_date = ?');
        values.push(finished_date);
      }
      if (status) {
        fields.push('status = ?');
        values.push(status);
      }

      values.push(task_id);

      await db.query(`UPDATE tasks SET ${fields.join(', ')} WHERE task_id = ?`, values);
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
