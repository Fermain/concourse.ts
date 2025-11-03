import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve(process.cwd(), 'dist')
const esmFile = path.join(distDir, 'index.js')
const cjsFile = path.join(distDir, 'index.cjs')

if (!fs.existsSync(distDir)) {
  process.exit(0)
}

// Duplicate ESM output to CJS extension for simple require() consumers.
if (fs.existsSync(esmFile)) {
  fs.copyFileSync(esmFile, cjsFile)
}

