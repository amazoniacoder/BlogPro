import { pool } from './db';

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params)
};

export { pool };