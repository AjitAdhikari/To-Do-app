import { connectToDatabase } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { username, password } = req.body;

  try {
    const db = await connectToDatabase();

    const [rows]: any = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      await db.end();
      return res.status(401).json({ message: 'Invalid user' });
    }

    const user = rows[0];

    // Compare input password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await db.end();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await db.end();
    res.status(200).json({ user: { id: user.sn, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}