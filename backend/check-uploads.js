import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directories to check/create
const directories = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'profiles'),
  path.join(__dirname, 'uploads', 'posts')
];

console.log('Checking upload directories...');

// Check and create each directory
directories.forEach(dir => {
  console.log(`Checking directory: ${dir}`);
  
  try {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
      
      // Check permissions
      try {
        const testFile = path.join(dir, 'test.txt');
        fs.writeFileSync(testFile, 'Test file for permission check');
        console.log(`Successfully wrote test file: ${testFile}`);
        fs.unlinkSync(testFile);
        console.log(`Successfully deleted test file: ${testFile}`);
      } catch (permErr) {
        console.error(`Permission error on directory ${dir}:`, permErr);
      }
    }
  } catch (err) {
    console.error(`Error checking/creating directory ${dir}:`, err);
  }
});

console.log('Directory check complete.'); 