import { seedAllCategories } from "../src/lib/agents/query-bank";

async function main() {
  const force = process.argv.includes("--force");
  console.log(`Seeding query bank...${force ? " (force re-seed)" : ""}`);
  await seedAllCategories(force);
  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
