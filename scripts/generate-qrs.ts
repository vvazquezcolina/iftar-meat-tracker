import QRCode from "qrcode";
import * as fs from "fs";
import * as path from "path";

const OUTPUT_DIR = path.join(__dirname, "..", "qr-codes");
const TOTAL_QRS = 200;

async function generateQRCodes() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`Generating ${TOTAL_QRS} QR codes in: ${OUTPUT_DIR}`);

  for (let i = 1; i <= TOTAL_QRS; i++) {
    const id = `QR-${String(i).padStart(3, "0")}`;
    const filePath = path.join(OUTPUT_DIR, `${id}.png`);

    await QRCode.toFile(filePath, id, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    if (i % 50 === 0) {
      console.log(`Progress: ${i}/${TOTAL_QRS} QR codes generated`);
    }
  }

  console.log(`Done! ${TOTAL_QRS} QR codes saved to ${OUTPUT_DIR}`);
}

generateQRCodes().catch((err) => {
  console.error("Error generating QR codes:", err);
  process.exit(1);
});
