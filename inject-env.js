const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'js', 'config.js');

if (!fs.existsSync(configPath)) {
  console.error(`⚠️ config.js not found at ${configPath}`);
  process.exit(1);
}

let configContent = fs.readFileSync(configPath, 'utf8');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (url && key) {
  console.log('Inserting Supabase environment variables into config.js...');
  configContent = configContent.replace('REEMPLAZA_CON_TU_PROJECT_URL', url);
  configContent = configContent.replace('REEMPLAZA_CON_TU_ANON_KEY', key);
  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('✅ Supabase credentials successfully injected.');
} else {
  console.log('ℹ️ No SUPABASE_URL or SUPABASE_ANON_KEY environment variables found. Keeping defaults.');
}
