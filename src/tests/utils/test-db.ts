import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { execSync } from 'child_process'

let container: StartedTestContainer;

export const startTestDb = async () => {
  container = await new PostgreSqlContainer('postgres:15')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();

  // Apply Prisma migrations to the test DB
  execSync(`npx prisma migrate deploy`, {
    env: { ...process.env },
  });

  return container;
};

export const stopTestDb = async () => {
  if (container) {
    await container.stop();
  }
};

