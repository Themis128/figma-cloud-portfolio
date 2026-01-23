#!/usr/bin/env node

/**
 * Codacy MCP Server Configuration Helper
 * Shows the correct MCP server endpoint configuration for Codacy
 */

console.log('🔧 Codacy MCP Server Endpoint Configuration\n')

console.log('📍 Codacy MCP Server Endpoint URL:')
console.log('   https://api.codacy.com\n')

console.log('⚙️  VS Code Settings Configuration:')
console.log(`   "codacy.mcp.codacy.enabled": true,`)
console.log(`   "codacy.mcp.codacy.apiToken": "mJb73g9iJzu51wQ6JRC",`)
console.log(`   "codacy.mcp.codacy.projectId": "a88486da551443bf83db6d40385e4085",`)
console.log(`   "codacy.mcp.codacy.endpoint": "https://api.codacy.com"\n`)

console.log('🔍 What this enables:')
console.log('   • AI-powered code analysis through MCP')
console.log('   • Real-time issue detection in VS Code')
console.log('   • Integration with GitHub Copilot and other AI tools')
console.log('   • Automated code quality feedback\n')

console.log('📚 For self-hosted Codacy instances, use:')
console.log('   https://your-codacy-instance.com/api')
console.log('   (Replace with your actual Codacy server URL)\n')

console.log('✨ The MCP server endpoint connects your VS Code extension')
console.log("   to Codacy's AI analysis services for enhanced code quality.")
