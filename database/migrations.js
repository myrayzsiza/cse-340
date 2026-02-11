const fs = require('fs')
const path = require('path')
const pool = require('./index')

/**
 * Run all database migrations in order
 */
async function runMigrations() {
  try {
    console.log('Starting database migrations...')
    
    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      try {
        await pool.query(sql)
        console.log(`✓ ${file}`)
      } catch (error) {
        // Log the error but continue with other migrations
        // This allows idempotent migrations - they can be run multiple times safely
        console.warn(`⚠ ${file}: ${error.message.split('\n')[0]}`)
      }
    }
    
    console.log('✓ All migrations processed')
    return true
  } catch (error) {
    console.error('Migration runner failed:', error.message)
    throw error
  }
}

module.exports = { runMigrations }
