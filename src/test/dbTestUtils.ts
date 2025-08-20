import { db } from '../data/persistence/db';

export async function resetDb() {
    await db.transaction('rw', db.tables, async () => {
        for (const table of db.tables) {
            await table.clear();
        }
    });
}
