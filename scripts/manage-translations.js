#!/usr/bin/env node

/**
 * Translation Management Script for SGEX Workbench
 * 
 * This script helps manage translations by:
 * - Converting between JSON and .po formats
 * - Validating translation completeness
 * - Extracting new translation keys
 * - Generating translation reports
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'locales');
const TEMPLATES_DIR = path.join(__dirname, '..', 'locales', 'templates');

const SUPPORTED_LANGUAGES = {
  'en_US': 'English (US)',
  'fr_FR': 'Français',
  'es_ES': 'Español'
};

/**
 * Convert JSON translation file to .po format
 */
function jsonToPo(jsonData, language, metadata = {}) {
  const header = `# SGEX Workbench Translations - ${SUPPORTED_LANGUAGES[language] || language}
# Copyright (C) 2024 WHO
# This file is distributed under the same license as the SGEX package.
#
msgid ""
msgstr ""
"Project-Id-Version: SGEX Workbench 1.0.0\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: ${new Date().toISOString()}\\n"
"PO-Revision-Date: ${metadata.revisionDate || 'YEAR-MO-DA HO:MI+ZONE'}\\n"
"Last-Translator: ${metadata.translator || 'FULL NAME <EMAIL@ADDRESS>'}\\n"
"Language-Team: ${metadata.team || 'LANGUAGE <LL@li.org>'}\\n"
"Language: ${language.replace('_', '-')}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"

`;

  let poContent = header;

  function processObject(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        processObject(value, fullKey);
      } else {
        const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        poContent += `msgid "${fullKey}"\n`;
        poContent += `msgstr "${escapedValue}"\n\n`;
      }
    }
  }

  processObject(jsonData);
  return poContent;
}

/**
 * Convert .po file content to JSON format
 */
function poToJson(poContent) {
  const lines = poContent.split('\n');
  const json = {};
  let currentMsgid = null;
  let currentMsgstr = '';
  let inMsgstr = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('msgid "') && !trimmedLine.startsWith('msgid ""')) {
      if (currentMsgid && currentMsgstr) {
        setNestedProperty(json, currentMsgid, currentMsgstr);
      }
      currentMsgid = trimmedLine.slice(7, -1); // Remove 'msgid "' and '"'
      currentMsgstr = '';
      inMsgstr = false;
    } else if (trimmedLine.startsWith('msgstr "')) {
      currentMsgstr = trimmedLine.slice(8, -1); // Remove 'msgstr "' and '"'
      inMsgstr = true;
    } else if (inMsgstr && trimmedLine.startsWith('"') && trimmedLine.endsWith('"')) {
      currentMsgstr += trimmedLine.slice(1, -1);
    }
  }

  // Process the last entry
  if (currentMsgid && currentMsgstr) {
    setNestedProperty(json, currentMsgid, currentMsgstr);
  }

  return json;
}

/**
 * Set nested property in object using dot notation
 */
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value.replace(/\\"/g, '"').replace(/\\n/g, '\n');
}

/**
 * Get all translation keys from a nested object
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Validate translation completeness
 */
function validateTranslations() {
  console.log('🔍 Validating translation completeness...\n');
  
  // Get English (reference) keys
  const englishPath = path.join(LOCALES_DIR, 'en_US', 'translation.json');
  const englishData = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
  const referenceKeys = getAllKeys(englishData);
  
  console.log(`Reference language (en_US) has ${referenceKeys.length} keys\n`);
  
  for (const [langCode, langName] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (langCode === 'en_US') continue;
    
    const langPath = path.join(LOCALES_DIR, langCode, 'translation.json');
    
    if (!fs.existsSync(langPath)) {
      console.log(`❌ ${langName} (${langCode}): Translation file missing`);
      continue;
    }
    
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const langKeys = getAllKeys(langData);
    
    const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
    const extraKeys = langKeys.filter(key => !referenceKeys.includes(key));
    
    const completeness = ((langKeys.length - extraKeys.length) / referenceKeys.length * 100).toFixed(1);
    
    console.log(`${completeness === '100.0' ? '✅' : '⚠️'} ${langName} (${langCode}): ${completeness}% complete (${langKeys.length}/${referenceKeys.length} keys)`);
    
    if (missingKeys.length > 0) {
      console.log(`   Missing keys: ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? `... and ${missingKeys.length - 5} more` : ''}`);
    }
    
    if (extraKeys.length > 0) {
      console.log(`   Extra keys: ${extraKeys.slice(0, 3).join(', ')}${extraKeys.length > 3 ? `... and ${extraKeys.length - 3} more` : ''}`);
    }
    
    console.log('');
  }
}

/**
 * Convert JSON files to .po format
 */
function convertJsonToPo(language) {
  const jsonPath = path.join(LOCALES_DIR, language, 'translation.json');
  const poPath = path.join(LOCALES_DIR, language, 'translation.po');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    return;
  }
  
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const poContent = jsonToPo(jsonData, language);
  
  fs.writeFileSync(poPath, poContent, 'utf8');
  console.log(`✅ Converted ${language}: JSON → .po`);
}

/**
 * Convert .po files to JSON format
 */
function convertPoToJson(language) {
  const poPath = path.join(LOCALES_DIR, language, 'translation.po');
  const jsonPath = path.join(LOCALES_DIR, language, 'translation.json');
  
  if (!fs.existsSync(poPath)) {
    console.error(`❌ .po file not found: ${poPath}`);
    return;
  }
  
  const poContent = fs.readFileSync(poPath, 'utf8');
  const jsonData = poToJson(poContent);
  
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`✅ Converted ${language}: .po → JSON`);
}

/**
 * Generate translation statistics
 */
function generateStats() {
  console.log('📊 Translation Statistics\n');
  console.log('Language'.padEnd(20) + 'Keys'.padEnd(10) + 'Complete'.padEnd(15) + 'Status');
  console.log('─'.repeat(55));
  
  const englishPath = path.join(LOCALES_DIR, 'en_US', 'translation.json');
  const englishData = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
  const referenceKeys = getAllKeys(englishData);
  
  for (const [langCode, langName] of Object.entries(SUPPORTED_LANGUAGES)) {
    const langPath = path.join(LOCALES_DIR, langCode, 'translation.json');
    
    if (!fs.existsSync(langPath)) {
      console.log(`${langName}`.padEnd(20) + '0'.padEnd(10) + '0.0%'.padEnd(15) + '❌ Missing');
      continue;
    }
    
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const langKeys = getAllKeys(langData);
    const completeness = (langKeys.length / referenceKeys.length * 100).toFixed(1);
    const status = completeness === '100.0' ? '✅ Complete' : '⚠️ Incomplete';
    
    console.log(`${langName}`.padEnd(20) + `${langKeys.length}`.padEnd(10) + `${completeness}%`.padEnd(15) + status);
  }
}

/**
 * Main CLI handler
 */
function main() {
  const command = process.argv[2];
  const language = process.argv[3];
  
  switch (command) {
    case 'validate':
      validateTranslations();
      break;
      
    case 'json-to-po':
      if (!language) {
        console.error('❌ Please specify a language code (e.g., en_US)');
        process.exit(1);
      }
      convertJsonToPo(language);
      break;
      
    case 'po-to-json':
      if (!language) {
        console.error('❌ Please specify a language code (e.g., en_US)');
        process.exit(1);
      }
      convertPoToJson(language);
      break;
      
    case 'json-to-po-all':
      for (const langCode of Object.keys(SUPPORTED_LANGUAGES)) {
        convertJsonToPo(langCode);
      }
      break;
      
    case 'po-to-json-all':
      for (const langCode of Object.keys(SUPPORTED_LANGUAGES)) {
        convertPoToJson(langCode);
      }
      break;
      
    case 'stats':
      generateStats();
      break;
      
    default:
      console.log(`
SGEX Translation Management Tool

Usage:
  node scripts/manage-translations.js <command> [language]

Commands:
  validate            Validate translation completeness
  json-to-po <lang>   Convert JSON translation to .po format
  po-to-json <lang>   Convert .po translation to JSON format
  json-to-po-all      Convert all JSON translations to .po format
  po-to-json-all      Convert all .po translations to JSON format
  stats               Show translation statistics

Languages:
  ${Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => `${code.padEnd(8)} ${name}`).join('\n  ')}

Examples:
  node scripts/manage-translations.js validate
  node scripts/manage-translations.js json-to-po fr_FR
  node scripts/manage-translations.js stats
`);
      break;
  }
}

main();