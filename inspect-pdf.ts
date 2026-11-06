import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

async function test() {
  try {
    const parser = new PDFParse({ data: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Length 2 >>\nstream\nhi\nendstream\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF') });
    console.log("Parser instance created");
    console.log("parser fields:", Object.keys(parser));
    console.log("parser proto keys:", Object.keys(Object.getPrototypeOf(parser)));
    console.log("getText type:", typeof parser.getText);
    await parser.destroy();
  } catch (e: any) {
    console.log("Error during test:", e.message);
  }
}
test();
