import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';
import {migrations} from '../src/data/db/migrations';

const outputDir = path.join(process.cwd(), 'schema');

const main = async () => {
  const SQL = await initSqlJs({});
  const db = new SQL.Database();

  for (const migration of migrations) {
    for (const statement of migration.sql) {
      db.run(`${statement};`);
    }
  }

  const result = db.exec(
    `SELECT sql FROM sqlite_master
     WHERE type IN ('table', 'index')
       AND sql IS NOT NULL
     ORDER BY name;`,
  );
  const rows = result[0]?.values ?? [];
  const schema = rows.map(row => `${row[0]};`).join('\n\n');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  const latestVersion = migrations[migrations.length - 1]?.version ?? 0;
  const outputFile = path.join(outputDir, `schema_v${latestVersion}.sql`);
  fs.writeFileSync(outputFile, schema, 'utf8');
  console.log(`Generated ${outputFile}`);
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
