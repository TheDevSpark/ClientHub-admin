import fs from "fs";
import path from "path";

export async function GET() {
  const dirPath = path.join(process.cwd(), "public/templates");
  const files = fs.readdirSync(dirPath);
  return new Response(JSON.stringify(files), { status: 200 });
}
