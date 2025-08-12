/**
 * FILE-NAMING-CONVENTIONS Validation
 * 
 * Files should follow naming conventions
 */
export default {
  id: 'file-naming-conventions',
  component: 'file-structure',
  level: 'info',
  fileTypes: ['*'],
  descriptionKey: 'validation.file.namingConventions.description',
  description: 'Files should follow naming conventions',
  
  async validate(filePath, content, context) {
    const fileName = this.getFileName(filePath);
    const issues = [];
    
    // Check for spaces in filename
    if (fileName.includes(' ')) {
      issues.push('contains spaces');
    }
    
    // Check for special characters that can cause issues
    if (/[<>:"|?*\\]/.test(fileName)) {
      issues.push('contains special characters (<>:"|?*\\)');
    }
    
    // Check for uppercase letters (prefer lowercase)
    if (/[A-Z]/.test(fileName) && !this.isAllowedMixedCase(fileName)) {
      issues.push('contains uppercase letters (prefer lowercase)');
    }
    
    // Check for very long names
    if (fileName.length > 100) {
      issues.push('filename is very long (>100 characters)');
    }
    
    // Check for non-ASCII characters
    if (!/^[\x00-\x7F]*$/.test(fileName)) {
      issues.push('contains non-ASCII characters');
    }
    
    // Check for leading/trailing dots or hyphens
    if (fileName.startsWith('.') && fileName !== '.gitignore' && fileName !== '.gitkeep') {
      issues.push('starts with dot (hidden file)');
    }
    
    if (fileName.startsWith('-') || fileName.endsWith('-')) {
      issues.push('starts or ends with hyphen');
    }
    
    // Check for consecutive special characters
    if (/[-_.]{2,}/.test(fileName)) {
      issues.push('contains consecutive special characters');
    }
    
    if (issues.length > 0) {
      return {
        message: `Filename convention issues: ${issues.join(', ')}`,
        suggestion: 'Use lowercase letters, numbers, hyphens, and underscores. Avoid spaces and special characters.',
        issues: issues,
        recommendedName: this.suggestFileName(fileName)
      };
    }
    
    return null; // Valid filename
  },
  
  getFileName(filePath) {
    return filePath.split('/').pop() || filePath;
  },
  
  isAllowedMixedCase(fileName) {
    // Allow mixed case for certain file types
    const mixedCaseAllowed = [
      'README.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      'Dockerfile'
    ];
    
    return mixedCaseAllowed.includes(fileName) ||
           fileName.endsWith('.md') ||
           fileName.endsWith('.txt') ||
           fileName.endsWith('.json') && fileName.includes('package');
  },
  
  suggestFileName(originalName) {
    return originalName
      .toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[<>:"|?*\\]/g, '')    // Remove special characters
      .replace(/[-_.]+/g, '-')        // Replace consecutive special chars with single hyphen
      .replace(/^-+|-+$/g, '')        // Remove leading/trailing hyphens
      .substring(0, 100);             // Limit length
  },
  
  metadata: {
    standard: 'File System Conventions',
    reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
    severity: 'low'
  }
};