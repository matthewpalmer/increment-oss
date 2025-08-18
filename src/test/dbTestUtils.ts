import { db } from '../data/persistence/db';

export async function resetDb() {
    await db.transaction('rw', db.projects, async () => {
        await db.projects.clear();
    });
}
