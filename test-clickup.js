const fs = require('fs');
const path = require('path');

// Simple helper to load environment variables from .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found in the project root.');
    console.log('Please copy .env.local.example to .env.local and add your real keys.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    // Remove comments
    const cleanLine = line.split('#')[0].trim();
    const match = cleanLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
  return env;
}

async function testClickUp() {
  const env = loadEnv();
  const token = env.CLICKUP_API_TOKEN;
  const listId = env.CLICKUP_LIST_ID;

  if (!token || !listId || token.includes('your_') || listId.includes('your_')) {
    console.error('Error: Please populate CLICKUP_API_TOKEN and CLICKUP_LIST_ID in .env.local with real values.');
    process.exit(1);
  }

  console.log(`Attempting to reach ClickUp List ID: ${listId}...`);

  try {
    const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task?include_closed=true&subtasks=true`, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`\n❌ ClickUp API Error: ${response.status} ${response.statusText}`);
      const errData = await response.text();
      console.error('Response details from ClickUp:', errData);
      console.log('\nDouble-check that:');
      console.log('1. Your CLICKUP_API_TOKEN is active and correct.');
      console.log('2. Your CLICKUP_LIST_ID is the correct numeric ID of the list.');
      process.exit(1);
    }

    const data = await response.json();
    console.log('\n🟢 Connection Successful!');
    console.log(`Successfully reached the ClickUp list. Found ${data.tasks ? data.tasks.length : 0} total tasks (including subtasks).`);
    
    if (data.tasks && data.tasks.length > 0) {
      console.log('\nFirst Task Sample:');
      console.log(`- ID: ${data.tasks[0].id}`);
      console.log(`- Name: ${data.tasks[0].name}`);
      console.log(`- Status: ${data.tasks[0].status?.status}`);
    } else {
      console.log('\nWarning: Connected successfully, but the list is empty.');
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testClickUp();
