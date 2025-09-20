export { GitHubAuthenticationService } from './github-auth';
export { GitHubRepositoryService } from './github-repository';
export { GitHubUserService } from './github-user';
export { GitHubIssueService } from './github-issue';

export type {
  GitHubAuthResult,
  TokenPermissions,
  SecureTokenStorage
} from './github-auth';

export type {
  Repository,
  Branch,
  RepositoryPermissions,
  FileContent
} from './github-repository';

export type {
  User,
  Organization,
  RateLimit
} from './github-user';

export type {
  Issue,
  PullRequest,
  Comment
} from './github-issue';