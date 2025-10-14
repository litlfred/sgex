/**
 * Commit Message Dialog Component
 * 
 * Dialog for entering commit message when saving to GitHub
 * Provides commit message input with validation, keyboard shortcuts, and cancel functionality
 * 
 * @module CommitMessageDialog
 */

import React, { useEffect, useRef } from 'react';

/**
 * Commit message dialog props
 * @example { isOpen: true, commitMessage: "", setCommitMessage: fn, onCommit: fn, onCancel: fn, isSaving: false, fileName: "actors.fsh" }
 */
export interface CommitMessageDialogProps {
  /** Whether dialog is open */
  isOpen?: boolean;
  /** Current commit message */
  commitMessage?: string;
  /** Callback to update commit message */
  setCommitMessage: (message: string) => void;
  /** Callback when commit is triggered */
  onCommit: (message: string) => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Whether currently saving */
  isSaving?: boolean;
  /** Name of file being committed */
  fileName?: string;
  /** Suggested commit message */
  suggestedMessage?: string;
}

/**
 * Dialog for entering commit message when saving to GitHub
 * Provides commit message input with validation, keyboard shortcuts, and cancel functionality
 * 
 * Features:
 * - Auto-focus on textarea when opened
 * - Suggested commit messages
 * - Keyboard shortcuts (Ctrl/Cmd+Enter to commit, Esc to cancel)
 * - Commit message guidelines
 * - Validation and disabled states
 * 
 * @param props - Component properties
 * @returns Commit message dialog component
 * 
 * @example
 * <CommitMessageDialog
 *   isOpen={showDialog}
 *   commitMessage={message}
 *   setCommitMessage={setMessage}
 *   onCommit={(msg) => saveToGitHub(msg)}
 *   onCancel={() => setShowDialog(false)}
 *   isSaving={isSaving}
 *   fileName="actors.fsh"
 * />
 */
const CommitMessageDialog: React.FC<CommitMessageDialogProps> = ({
  isOpen = false,
  commitMessage = '',
  setCommitMessage,
  onCommit,
  onCancel,
  isSaving = false,
  fileName = '',
  suggestedMessage = ''
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-focus and suggest message when dialog opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      
      // Set suggested message if none provided
      if (!commitMessage && !suggestedMessage && fileName) {
        const defaultMessage = `Update ${fileName}`;
        setCommitMessage(defaultMessage);
      } else if (suggestedMessage && !commitMessage) {
        setCommitMessage(suggestedMessage);
      }
    }
  }, [isOpen, commitMessage, suggestedMessage, fileName, setCommitMessage]);

  // Handle key presses
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape' && !isSaving) {
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      // Ctrl/Cmd + Enter to commit
      if (commitMessage.trim() && !isSaving) {
        onCommit(commitMessage.trim());
      }
    }
  };

  // Handle commit button click
  const handleCommit = (): void => {
    if (commitMessage.trim() && !isSaving) {
      onCommit(commitMessage.trim());
    }
  };

  // Handle overlay click to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget && !isSaving) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="commit-dialog-overlay" 
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div 
        className="commit-dialog" 
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="commit-dialog-title"
        aria-modal="true"
      >
        <div className="commit-dialog-header">
          <h3 id="commit-dialog-title">Commit Changes to GitHub</h3>
          <button 
            className="close-button"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        
        <div className="commit-dialog-content">
          {fileName && (
            <div className="file-info">
              <span className="file-icon">📄</span>
              <span className="file-name">{fileName}</span>
            </div>
          )}
          
          <div className="commit-message-section">
            <label htmlFor="commit-message" className="commit-message-label">
              Commit Message *
            </label>
            <textarea
              id="commit-message"
              ref={textareaRef}
              className="commit-message-input"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe the changes you made..."
              rows={4}
              disabled={isSaving}
              required
            />
            <div className="commit-message-help">
              <small>
                Describe what changes you made and why. This will be visible in the repository's commit history.
              </small>
            </div>
          </div>
          
          <div className="commit-guidelines">
            <details>
              <summary>Commit Message Guidelines</summary>
              <ul>
                <li>Use clear, descriptive language</li>
                <li>Start with a verb (Add, Update, Fix, Remove, etc.)</li>
                <li>Keep the first line under 72 characters</li>
                <li>Add details in additional lines if needed</li>
              </ul>
            </details>
          </div>
        </div>
        
        <div className="commit-dialog-footer">
          <div className="dialog-actions">
            <button 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCommit}
              disabled={!commitMessage.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
                  Committing...
                </>
              ) : (
                'Commit Changes'
              )}
            </button>
          </div>
          
          <div className="keyboard-shortcut">
            <small>
              Press <kbd>Ctrl+Enter</kbd> to commit or <kbd>Esc</kbd> to cancel
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitMessageDialog;
