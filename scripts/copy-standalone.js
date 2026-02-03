/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const standalone = path.join(root, ".next", "standalone")
const staticSrc = path.join(root, ".next", "static")
const staticDst = path.join(standalone, ".next", "static")
const publicSrc = path.join(root, "public")
const publicDst = path.join(standalone, "public")

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dst, { recursive: true })
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name)
    const dstPath = path.join(dst, name)
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, dstPath)
    } else {
      fs.copyFileSync(srcPath, dstPath)
    }
  }
}

if (!fs.existsSync(standalone)) {
  console.error("Standalone folder not found. Run 'npm run build' first.")
  process.exit(1)
}

console.log("Copying static assets to standalone...")
if (fs.existsSync(staticSrc)) {
  copyRecursive(staticSrc, staticDst)
  console.log("  ✓ .next/static")
} else {
  console.log("  ⚠ .next/static not found")
}

if (fs.existsSync(publicSrc)) {
  copyRecursive(publicSrc, publicDst)
  console.log("  ✓ public")
} else {
  console.log("  ⚠ public folder not found")
}

console.log("Done.")
