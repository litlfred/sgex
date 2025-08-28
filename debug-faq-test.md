# Debugging FAQ sushi-config Detection

## Steps to Test and Debug:

1. **Open Browser Console** when accessing the FAQ tab
2. **Look for these debug messages**:
   - `GitHubStorage.fileExists: Checking if file exists: sushi-config.yaml`
   - `GitHubStorage.fileExists: Repository: litlfred/smart-ips-pilgrimage, Branch: main`
   - `GitHubStorage.readFile: Reading file sushi-config.yaml from litlfred/smart-ips-pilgrimage`

3. **Common Issues to Check**:
   - GitHub API authentication status
   - Repository parameter format (should be "litlfred/smart-ips-pilgrimage")
   - Branch parameter (should be "main")
   - Rate limiting or API errors

4. **Verification**:
   - The sushi-config.yaml file exists: ✅ Confirmed via curl
   - File content starts with: `id: smart.who.int.ips-pilgrimage`

## Expected Behavior:
- FAQ accordion loads with questions visible but not executed
- Click "What is the name of this DAK?" to expand
- Should show loading indicator, then display: "The name of this DAK is **SMART_WHO_INT_IPS_Pilgrimage**"

## If Still Failing:
- Check browser console for specific GitHub API error messages
- Verify authentication token has read permissions for the repository
- Confirm network connectivity to GitHub API
