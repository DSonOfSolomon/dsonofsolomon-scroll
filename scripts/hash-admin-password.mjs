import bcrypt from "bcryptjs";
import { stdout, stderr, exit } from "node:process";

const password = process.argv[2];

if (!password) {
  stderr.write("Usage: npm run hash:admin-password -- \"your-admin-password\"\n");
  exit(1);
}

const hash = await bcrypt.hash(password, 12);

stdout.write(`${hash}\n`);
