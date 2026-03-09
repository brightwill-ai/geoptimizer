import { seedAllCategories } from "../src/lib/agents/query-bank";

async function main() {
  console.log("Seeding query bank...");
  await seedAllCategories();
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
