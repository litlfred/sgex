#!/usr/bin/env node
/**
 * Workflow Event Logger (JSON Format)
 * 
 * Logs workflow events in structured JSON format for better parsing and analysis.
 * 
 * Usage:
 *   node scripts/log-workflow-event-json.js --event <event-name> --stage <stage> [options]
 * 
 * Options:
 *   --event <name>       Event name (required)
 *   --stage <stage>      Stage name (required)
 *   --workflow <name>    Workflow name
 *   --run-id <id>        Workflow run ID
 *   --commit <sha>       Commit SHA
 *   --branch <name>      Branch name
 *   --pr <number>        PR number
 *   --status <status>    Status (success, failure, in_progress)
 *   --message <text>     Custom message
 *   --data <json>        Additional data as JSON string
 *   --output <file>      Output file (default: workflow-event.json)
 */

const fs = require('fs');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    event: null,
    stage: null,
    workflow: null,
    runId: null,
    commit: null,
    branch: null,
    pr: null,
    status: null,
    message: null,
    data: {},
    output: 'workflow-event.json',
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--event':
        parsed.event = value;
        break;
      case '--stage':
        parsed.stage = value;
        break;
      case '--workflow':
        parsed.workflow = value;
        break;
      case '--run-id':
        parsed.runId = value;
        break;
      case '--commit':
        parsed.commit = value;
        break;
      case '--branch':
        parsed.branch = value;
        break;
      case '--pr':
        parsed.pr = value;
        break;
      case '--status':
        parsed.status = value;
        break;
      case '--message':
        parsed.message = value;
        break;
      case '--data':
        try {
          parsed.data = JSON.parse(value);
        } catch (e) {
          console.error(`Warning: Failed to parse --data JSON: ${e.message}`);
        }
        break;
      case '--output':
        parsed.output = value;
        break;
    }
  }

  return parsed;
}

function main() {
  const args = parseArgs();

  if (!args.event || !args.stage) {
    console.error('Error: --event and --stage are required');
    console.error('Usage: node scripts/log-workflow-event-json.js --event <event> --stage <stage> [options]');
    process.exit(1);
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    event: args.event,
    stage: args.stage,
    workflow: args.workflow,
    runId: args.runId,
    commit: args.commit,
    branch: args.branch,
    pr: args.pr,
    status: args.status,
    message: args.message,
    ...args.data,
  };

  // Remove null/undefined values
  Object.keys(logEntry).forEach(key => {
    if (logEntry[key] === null || logEntry[key] === undefined) {
      delete logEntry[key];
    }
  });

  // Read existing log or create new array
  let logs = [];
  if (fs.existsSync(args.output)) {
    try {
      const content = fs.readFileSync(args.output, 'utf8');
      logs = JSON.parse(content);
      if (!Array.isArray(logs)) {
        logs = [logs]; // Wrap single object in array
      }
    } catch (e) {
      console.warn(`Warning: Could not parse existing log file, starting fresh: ${e.message}`);
      logs = [];
    }
  }

  // Append new log entry
  logs.push(logEntry);

  // Write updated logs
  fs.writeFileSync(args.output, JSON.stringify(logs, null, 2));

  console.log(`✅ Logged event: ${args.event} / ${args.stage}`);
  console.log(`📝 Output: ${args.output}`);
}

if (require.main === module) {
  main();
}

module.exports = { parseArgs };
