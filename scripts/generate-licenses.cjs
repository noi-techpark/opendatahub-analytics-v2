// Node.js script to generate .license files for each file in markers/icons and subfolders
// Uses the content of air-quality.svg.license as the template

const fs = require('fs')
const path = require('path')

const ICONS_DIR = path.join(__dirname, '../public/markers/icons')
const LICENSE_TEMPLATE_PATH = path.join(ICONS_DIR, 'air-quality.svg.license')

// Read the license template
const licenseTemplate = fs.readFileSync(LICENSE_TEMPLATE_PATH, 'utf8')

/**
 * Recursively walk a directory and return all file paths.
 * @param {string} dir - Directory to walk
 * @returns {string[]} - Array of file paths
 */
function walkDir(dir) {
   let results = []
   const list = fs.readdirSync(dir)
   list.forEach((file) => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat && stat.isDirectory()) {
         results = results.concat(walkDir(filePath))
      } else {
         results.push(filePath)
      }
   })
   return results
}

const allFiles = walkDir(ICONS_DIR)

allFiles.forEach((filePath) => {
   // Skip .license files
   if (filePath.endsWith('.license')) return
   const licensePath = filePath + '.license'
   // Only create if it doesn't exist
   if (!fs.existsSync(licensePath)) {
      fs.writeFileSync(licensePath, licenseTemplate, 'utf8')
      console.log('Created:', licensePath)
   }
})

console.log('License generation complete.')
