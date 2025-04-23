import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('===== TESTING UPLOAD DIRECTORIES =====');
console.log('Current directory:', __dirname);

const uploadsDir = path.resolve(__dirname, 'uploads');
const profilesDir = path.resolve(__dirname, 'uploads', 'profiles');
const postsDir = path.resolve(__dirname, 'uploads', 'posts');

console.log('\nChecking if directories exist:');
console.log(`uploads: ${fs.existsSync(uploadsDir)}`);
console.log(`profiles: ${fs.existsSync(profilesDir)}`);
console.log(`posts: ${fs.existsSync(postsDir)}`);

console.log('\nCreating directories if they don\'t exist...');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }
  
  if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
    console.log('Created profiles directory');
  }
  
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
    console.log('Created posts directory');
  }
  
  // Set permissions to ensure server can write to these directories
  fs.chmodSync(uploadsDir, 0o777);
  fs.chmodSync(profilesDir, 0o777);
  fs.chmodSync(postsDir, 0o777);
  
  console.log('\nChecking directory permissions:');
  console.log(`uploads: ${fs.statSync(uploadsDir).mode.toString(8)}`);
  console.log(`profiles: ${fs.statSync(profilesDir).mode.toString(8)}`);
  console.log(`posts: ${fs.statSync(postsDir).mode.toString(8)}`);
  
  // Create a test file to ensure write access
  const testFilePath = path.join(profilesDir, 'test.txt');
  fs.writeFileSync(testFilePath, 'Test file to verify write permissions');
  console.log('\nCreated test file:', testFilePath);
  console.log('Test file exists:', fs.existsSync(testFilePath));
  
  // Clean up test file
  fs.unlinkSync(testFilePath);
  console.log('Removed test file');
  
  console.log('\n✅ All directories are properly set up and writable.');
} catch (error) {
  console.error('\n❌ Error during directory setup:', error);
  console.error('Error details:', {
    code: error.code,
    path: error.path,
    errno: error.errno,
    syscall: error.syscall
  });
}

console.log('\n===== TEST COMPLETE ====='); 