export async function truncateAll(prisma: any): Promise<void> {
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
  try {
    const tables: Array<{ TABLE_NAME?: string; table_name?: string }> =
      await prisma.$queryRawUnsafe(
        "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME != '_prisma_migrations';"
      );

    for (const table of tables) {
      const tableName = table.TABLE_NAME || table.table_name;
      if (tableName) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);
      }
    }
  } finally {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  }
}
