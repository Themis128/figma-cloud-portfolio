# Comprehensive Documentation

- **Automated Optimization**: AI-powered suggestions- **Comparative Analysis**: Benchmark comparisons- **Alert System**: Performance threshold alerts- **Historical Data**: Performance trend analysis## Future Enhancements- **Optimized Rendering**: Minimal re-renders- **Lazy Loading**: Component-based loading- **Real-time Monitoring**: Efficient data collection## Performance Considerations- **Clear Hierarchy**: Organized information display- **Back to Home**: Return navigation### Navigation- **Action Buttons**: Interactive testing controls- **Status Indicators**: Color-coded status displays- **Responsive Grid**: Adaptive layout for different screens### Dashboard Layout## User Experience- **CI/CD Integration**: Pipeline status monitoring- **Build Metrics**: Bundle size and optimization tracking- **Test Results**: Integration with test runners### Status Tracking- **Permission Handling**: User permission management- **VAPID Keys**: Secure notification authentication- **Service Worker Integration**: Background notification handling### Push Notifications- **Real-time Updates**: Live data streaming- **Performance Observer**: Browser performance API integration- **Web Vitals API**: Google's Core Web Vitals measurement### Performance Monitoring## Technical Implementation- **Icons**: ArrowLeft (Lucide React)- **Button**: Navigation button- **Card**: UI card components- **PushNotificationTester**: Push notification testing component- **PerformanceDashboard**: Custom performance monitoring component## Components Used- **Core Web Vitals**: Performance monitoring status- **Caching Strategy**: Cache implementation status- **Bundle Analysis**: Bundle size monitoring- **Code Splitting**: Dynamic imports and chunking- **Image Optimization**: Image compression and format optimization### Optimization Status Card- **Test Automation**: Automated testing status- **CI/CD Pipeline**: Continuous integration status- **Test Coverage**: Code coverage metrics- **Playwright Tests**: E2E test status- **Vitest Tests**: Unit test status### Test Status Card- **Code Splitting**: Bundle size minimization- **Caching Strategies**: Proper cache implementation- **Lazy Loading**: Image and component lazy loading- **TTFB Enhancement**: Time to First Byte improvements- **FCP Improvement**: First Contentful Paint optimization- **CLS Prevention**: Layout shift prevention tips- **LCP Optimization**: Largest Contentful Paint guidance### Performance Tips Card- **Permission Management**: Handle notification permissions- **Notification Sending**: Send test notifications- **Subscription Testing**: Test push notification subscriptions### Push Notification Tester- **Real-time Updates**: Live performance data visualization- **Performance Metrics**: Loading times, bundle sizes, resource usage- **Core Web Vitals Monitoring**: Real-time tracking of LCP, CLS, FCP, TTFB### Performance Dashboard## FeaturesThe Performance page provides real-time monitoring and testing tools for the portfolio application's performance metrics, Core Web Vitals, and push notification functionality.## OverviewThis file contains all documentation for the Baltzakis Themistoklis Portfolio project.

## Table of Contents

- [Main README](#main-readme)
- [Agents](#agents)
- [AI Agents](#ai-agents)
- [Figma Integration](#figma-integration)
- [Google Analytics Integration](#google-analytics-integration)
- [Image Optimization](#image-optimization)
- [PWA](#pwa)
- [ReCAPTCHA Integration](#recaptcha-integration)
- [Resume Generation](#resume-generation)
- [PDF Generation](#pdf-generation)
- [Resume Setup](#resume-setup)
- [Visual Progress](#visual-progress)
- [TODO Upgrades](#todo-upgrades)
- [Amplify README](#amplify-readme)
- [Amplify Hooks README](#amplify-hooks-readme)

---

## Main README

# Baltzakis Themistoklis Portfolio

A production-ready full-stack React application for a professional portfolio, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod, PWA capabilities, and Web Push API notifications.

## Tech Stack

- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **PWA**: Vite PWA plugin with service worker, offline caching, and installable features
- **Notifications**: Web Push API with VAPID keys (no external services required)
- **Testing**: Vitest + Playwright E2E
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons
- **Package Manager**: PNPM

## Project Structure

```
client/                   # React SPA frontend
  pages/                # Route components (Index.tsx = home)
  components/ui/        # Pre-built UI component library
  App.tsx               # App entry point with SPA routing setup
  global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
  index.ts              # Main server setup (express config + routes)
  routes/               # API handlers

shared/                   # Types used by both client & server
  api.ts                # Shared API interfaces

amplify/                  # AWS Amplify Gen 2 backend
  functions/            # Lambda functions
  backend/              # Amplify backend configuration

public/                   # Static assets and PWA files
scripts/                  # Build and utility scripts
```

## Key Features

- **SPA Routing**: React Router 6 with clean URL structure
- **PWA Ready**: Offline caching, installable, push notifications
- **Type Safety**: Full TypeScript throughout client, server, and shared code
- **Modern UI**: Radix UI components with TailwindCSS styling
- **Performance**: Optimized images, lazy loading, performance monitoring
- **Testing**: Comprehensive test suite with Vitest and Playwright
- **Deployment**: Multiple deployment options (Netlify, Vercel, AWS Amplify)

## Development

### Prerequisites

- Node.js 18+
- PNPM
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Themis128/new-portfolio.git
cd new-portfolio

# Install dependencies
pnpm install
```

### Running Development Servers

```bash
# Terminal 1: Start Vite dev server (frontend on port 8081)
pnpm dev

# Terminal 2: Start Express API server (backend on port 3000)
npx tsx server/node-build.ts
```

> **Note**: For push notifications to work in development, you need both servers running. The Vite dev server proxies `/api` requests to the Express server.

## Available Scripts

```bash
pnpm dev                        # Start Vite dev server (frontend)
npx tsx server/node-build.ts    # Start Express API server (backend)
pnpm build                      # Production build
pnpm start                      # Start production server
pnpm typecheck                  # TypeScript validation
pnpm test                       # Run Vitest tests
pnpm test:e2e                   # Run Playwright E2E tests
```

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/push-notifications?action=vapid-public-key` - Get VAPID public key
- `PUT /api/push-notifications` - Store push subscription
- `POST /api/push-notifications` - Send push notification
- `DELETE /api/push-notifications` - Remove subscription

## Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Cloud Deployment Options

- **Netlify**: Connect your GitHub repo for automatic deployments
- **Vercel**: Deploy with zero configuration
- **AWS Amplify**: Full-stack deployment with backend functions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Author

**Themistoklis Baltzakis**

- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn]
- Email: [Your Email]

---

## Agents

# Baltzakis Themistoklis Portfolio

A production-ready full-stack React application for a professional portfolio, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod, PWA capabilities, and Web Push API notifications.

While the starter comes with a express server, only create endpoint when strictly necessary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (spa) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **PWA**: Vite PWA plugin with service worker, offline caching, and installable features
- **Notifications**: Web Push API with VAPID keys (no external services required)
- **PDF Generation**: Puppeteer for headless browser PDF generation + Marked for markdown parsing
- **Testing**: Vitest + Playwright E2E
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
├── dev-server.ts         # Development server (API only, no static files)
├── node-build.ts         # Production server (serves static files + API)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

### Resume Download System

Dynamic PDF generation from markdown content:

- **Dynamic Generation**: Resume PDFs are generated on-demand from `public/resume-content.md`
- **Modern Design**: Professional HTML template with responsive design and animations
- **Headless Browser**: Uses Puppeteer for high-quality PDF rendering
- **Type-Safe Parsing**: Markdown content is parsed into structured TypeScript interfaces
- **API Endpoint**: `GET /api/resume/download` serves generated PDFs for download

### SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css`
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**:
  - Vite dev server runs on port **8081** (frontend)
  - Express API server runs on port **3000** (backend)
  - Vite proxies `/api` requests to the Express server automatically
- **Production**: Single port serves both frontend and API
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Running Development Servers

```bash
# Terminal 1: Start Vite dev server (frontend)
pnpm dev

# Terminal 2: Start Express API server (for VAPID keys and push notifications)
npx tsx server/dev-server.ts
```

#### Alternative Development Commands

```bash
pnpm dev:all                    # Start both Vite and Express servers concurrently
npx tsx server/node-build.ts    # Production-style server (serves static files)
```

#### Example API Routes

- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint
- `GET /api/resume/download` - Generate and download resume PDF from markdown content
- `GET /api/push-notifications?action=vapid-public-key` - Get VAPID public key for push notifications
- `PUT /api/push-notifications` - Store push subscription
- `POST /api/push-notifications` - Send push notification
- `DELETE /api/push-notifications` - Remove subscription

### Shared Types

Import consistent types in both client and server:

```typescript
import { DemoResponse } from '@shared/api'
```

Path aliases:

- `@shared/*` - Shared folder
- `@/*` - Client folder

## Development Commands

```bash
pnpm dev                        # Start Vite dev server (frontend on port 8081)
npx tsx server/dev-server.ts    # Start Express API server (backend on port 3000)
pnpm dev:all                    # Start both servers concurrently
pnpm build                      # Production build
pnpm start                      # Start production server (serves both frontend + API)
pnpm typecheck                  # TypeScript validation
pnpm test                       # Run Vitest tests
```

> **Note**: For push notifications and resume download to work in development, you need both servers running. The Vite dev server proxies `/api` requests to the Express server.

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route

1. **Optional**: Create a shared interface in `shared/api.ts`:

   ```typescript
   export interface MyRouteResponse {
     message: string
     // Add other response properties here
   }
   ```

2. Create a new route handler in `server/routes/my-route.ts`:

   ```typescript
   import { RequestHandler } from 'express'
   import { MyRouteResponse } from '@shared/api' // Optional: for type safety

   export const handleMyRoute: RequestHandler = (req, res) => {
     const response: MyRouteResponse = {
       message: 'Hello from my endpoint!',
     }
     res.json(response)
   }
   ```

3. Register the route in `server/index.ts`:

   ```typescript
   import { handleMyRoute } from './routes/my-route'

   // Add to the createServer function:
   app.get('/api/my-endpoint', handleMyRoute)
   ```

4. Use in React components with type safety:

   ```typescript
   import { MyRouteResponse } from '@shared/api' // Optional: for type safety

   const response = await fetch('/api/my-endpoint')
   const data: MyRouteResponse = await response.json()
   ```

### New Page Route

1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:

```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- **Development**: Two-server setup (Vite on 8081, Express on 3000) with API proxy
- **Production**: Single-port deployment with Express serving both frontend and API
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
- Web Push API for notifications (requires Express server for VAPID key handling)
- Dynamic PDF generation for resume downloads using Puppeteer and markdown parsing

---

## AI Agents

# AI Agents Implementation

This document describes the AI agent features implemented in the Baltzakis Themistoklis Portfolio application, leveraging Microsoft Agent Framework for streamlined AI agent and workflow development.

## Overview

The application includes advanced AI agent capabilities that enable users to create, debug, evaluate, and deploy AI-powered workflows. These features are fully integrated with Microsoft Foundry and utilize the Microsoft Agent Framework SDK.

## Key Features

### Agent Workflow Builder

- **Visual Workflow Creation**: Drag-and-drop interface for building complex agent workflows
- **Node-Based Architecture**: Modular components for different AI tasks (LLM calls, data processing, decision making)
- **Real-time Validation**: Immediate feedback on workflow configuration and potential issues

### AI Model Integration

- **Multiple Model Support**: Integration with various AI models including OpenAI, Azure OpenAI, and local models
- **Model Comparison**: Built-in tools for comparing model performance and selecting optimal models
- **Custom Model Configuration**: Flexible configuration options for model parameters and settings

### Tracing and Evaluation

- **Comprehensive Tracing**: Detailed logging of agent execution flows and decision points
- **Performance Evaluation**: Automated evaluation of agent responses against test datasets
- **Debugging Tools**: Interactive debugging interface for troubleshooting agent workflows

### Deployment Options

- **Local Testing**: Run agents locally for development and testing
- **Cloud Deployment**: Deploy agents to Azure for production use
- **Scalable Architecture**: Support for high-throughput agent deployments

## Architecture

### Microsoft Agent Framework Integration

The application uses Microsoft Agent Framework SDK for:

- Agent orchestration and management
- Workflow execution and monitoring
- Integration with Microsoft Foundry services

### Component Structure

```
client/
├── components/
│   ├── agents/
│   │   ├── AgentBuilder.tsx
│   │   ├── WorkflowCanvas.tsx
│   │   ├── ModelSelector.tsx
│   │   └── EvaluationPanel.tsx
│   └── ui/
server/
├── routes/
│   └── agents.ts
└── services/
    └── agentService.ts
```

## Usage

### Creating a New Agent

1. Navigate to the Agent Builder page
2. Select a template or start from scratch
3. Add nodes to the workflow canvas
4. Configure model settings and parameters
5. Test the agent locally
6. Deploy to production

### Workflow Configuration

```typescript
const workflow = {
  nodes: [
    {
      id: 'llm-node',
      type: 'llm',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      }
    },
    {
      id: 'decision-node',
      type: 'decision',
      conditions: [...]
    }
  ],
  connections: [...]
};
```

### Evaluation and Testing

- Use the evaluation panel to test agent responses
- Compare different model configurations
- Analyze performance metrics and accuracy

## API Endpoints

- `GET /api/agents` - List available agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent configuration
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/test` - Test agent workflow
- `POST /api/agents/:id/deploy` - Deploy agent to production

## Best Practices

### Model Selection

- Choose appropriate models based on task complexity
- Consider cost vs. performance trade-offs
- Test multiple models for optimal results

### Workflow Design

- Keep workflows modular and reusable
- Implement proper error handling
- Use tracing for debugging complex workflows

### Security Considerations

- Validate all inputs to prevent prompt injection
- Implement rate limiting for API calls
- Use secure storage for sensitive configuration

## Troubleshooting

### Common Issues

- **Model Connection Errors**: Check API keys and network connectivity
- **Workflow Validation Failures**: Review node configurations and connections
- **Performance Issues**: Optimize model parameters and workflow structure

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const agent = new Agent({
  debug: true,
  tracing: true,
})
```

## Future Enhancements

- Multi-agent collaboration
- Voice command integration
- Advanced analytics dashboard
- Third-party model integrations

## Dependencies

- `@microsoft/agent-framework`
- `@azure/ai-projects`
- `react-flow` (for workflow canvas)
- `openai` (for OpenAI integration)

## Contributing

When adding new agent features:

1. Follow the established patterns in the codebase
2. Add comprehensive tests
3. Update this documentation
4. Ensure compatibility with Microsoft Agent Framework

---

_Last Updated: January 20, 2026_

---

## Figma Integration

# Figma Integration

This document describes the Figma integration features in the Baltzakis Themistoklis Portfolio application, enabling seamless import and management of design assets from Figma Cloud.

## Overview

The application integrates with Figma's API to allow users to import design components, assets, and styles directly into their portfolio projects. This enables designers to maintain consistency between Figma designs and the live application.

## Key Features

### Design Asset Import

- **Component Import**: Import Figma components as React components
- **Asset Export**: Export images, icons, and graphics from Figma
- **Style Synchronization**: Sync design tokens and styles automatically

### Real-time Collaboration

- **Live Updates**: Receive real-time updates when Figma files change
- **Comment Integration**: Sync comments and feedback from Figma
- **Version Control**: Track design changes and versions

### Design System Management

- **Token Management**: Import and manage design tokens (colors, typography, spacing)
- **Component Library**: Maintain a library of reusable design components
- **Style Guide**: Generate style guides from Figma designs

## Architecture

### Figma API Integration

The application uses Figma's REST API for:

- File access and manipulation
- Asset export and download
- Real-time collaboration features

### Component Structure

```
client/
├── components/
│   ├── figma/
│   │   ├── FigmaImporter.tsx
│   │   ├── AssetViewer.tsx
│   │   ├── StyleSync.tsx
│   │   └── DesignTokens.tsx
│   └── ui/
server/
├── routes/
│   └── figma.ts
└── services/
    └── figmaService.ts
```

## Setup

### Figma API Configuration

1. Create a Figma account and obtain API token
2. Configure the API token in environment variables
3. Set up webhook endpoints for real-time updates

### Environment Variables

```env
FIGMA_ACCESS_TOKEN=your_figma_token_here
FIGMA_WEBHOOK_SECRET=your_webhook_secret
```

## Usage

### Importing Designs

1. Connect your Figma account in the application
2. Select Figma files or projects to import
3. Choose components or assets to import
4. Configure import settings (format, optimization)
5. Import and integrate into your project

### Asset Management

```typescript
import { FigmaImporter } from '@/components/figma/FigmaImporter'

// Import assets from Figma
const importer = new FigmaImporter({
  fileId: 'your-figma-file-id',
  accessToken: process.env.FIGMA_ACCESS_TOKEN,
})

const assets = await importer.importAssets({
  format: 'png',
  scale: 2,
  optimize: true,
})
```

### Style Synchronization

- Automatically sync design tokens from Figma
- Update component styles in real-time
- Maintain design consistency across the application

## API Endpoints

- `GET /api/figma/files` - List accessible Figma files
- `POST /api/figma/import` - Import assets from Figma
- `GET /api/figma/tokens` - Retrieve design tokens
- `POST /api/figma/webhook` - Handle Figma webhook events
- `PUT /api/figma/sync` - Sync styles and components

## Best Practices

### File Organization

- Use consistent naming conventions in Figma
- Organize components in frames and groups
- Use Figma's component system for reusability

### Performance Optimization

- Export assets in appropriate sizes and formats
- Use lazy loading for large design files
- Cache imported assets locally

### Collaboration

- Set up proper permissions for team access
- Use Figma's commenting system for feedback
- Maintain version history for design changes

## Troubleshooting

### Common Issues

- **API Rate Limits**: Figma has rate limits; implement retry logic
- **Authentication Errors**: Verify API token and permissions
- **File Access Issues**: Check file sharing settings in Figma

### Error Handling

```typescript
try {
  const result = await figmaAPI.importFile(fileId)
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Implement exponential backoff
    await delay(Math.pow(2, retryCount) * 1000)
    return retryImport()
  }
  throw error
}
```

## Security Considerations

- Store API tokens securely (environment variables, not in code)
- Validate all incoming webhook requests
- Implement proper CORS policies
- Use HTTPS for all API communications

## Future Enhancements

- Advanced component generation from Figma designs
- Real-time design preview in the application
- Automated design-to-code conversion
- Integration with design systems like Storybook

## Dependencies

- `figma-js` (Figma API client)
- `axios` (HTTP client for API calls)
- `react-dropzone` (for file uploads)
- `canvas` (for image processing)

## Contributing

When adding Figma integration features:

1. Follow Figma API best practices
2. Handle rate limits and errors gracefully
3. Update this documentation
4. Add tests for new functionality

---

_Last Updated: January 20, 2026_

---

## Google Analytics Integration

# Google Analytics 4 (GA4) Integration

This document describes the implementation of Google Analytics 4 in the Baltzakis Themistoklis portfolio application.

## Overview

Google Analytics 4 provides comprehensive web analytics and user behavior tracking. The implementation tracks page views, user interactions, and provides insights into site performance and user engagement.

## Architecture

### Client-Side Implementation

The client-side implementation uses the `react-ga4` library for seamless React integration with GA4.

#### Key Components

1. **GoogleAnalytics Component** (`client/components/GoogleAnalytics.tsx`)
   - Initializes GA4 with measurement ID from environment variables
   - Tracks page views on route changes using React Router
   - Handles GA4 initialization and configuration

2. **App Integration** (`client/App.tsx`)
   - Includes GoogleAnalytics component in the app layout
   - Positioned after router for proper route tracking

#### Code Example

```typescript
// GoogleAnalytics.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'

const GoogleAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    const measurementId =
      import.meta.env.VITE_GOOGLE_ANALYTICS_ID ||
      import.meta.env.GOOGLE_ANALYTICS_ID

    if (measurementId && !ReactGA.isInitialized) {
      ReactGA.initialize(measurementId)
    }
  }, [])

  useEffect(() => {
    if (ReactGA.isInitialized) {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname + location.search,
      })
    }
  }, [location])

  return null
}
```

### Configuration

GA4 is configured through environment variables and provides automatic tracking of:

- Page views on route changes
- User session data
- Traffic sources
- Device and browser information
- Geographic data

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Google Analytics Configuration
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GOOGLE_ANALYTICS_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Getting GA4 Measurement ID

1. Visit [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use existing one
3. Go to Admin → Property → Data Streams
4. Select your web stream
5. Copy the Measurement ID (format: G-XXXXXXXXXX)

## Implementation Details

### Automatic Tracking

The implementation automatically tracks:

1. **Page Views**: Every route change in the SPA
2. **User Sessions**: Session start and duration
3. **Traffic Sources**: How users found your site
4. **Device Data**: Browser, OS, screen resolution
5. **Geographic Data**: User location information

### Custom Events (Future Enhancement)

The foundation is in place for custom event tracking:

```typescript
// Example custom event tracking
ReactGA.event({
  category: 'engagement',
  action: 'contact_form_submit',
  label: 'contact_page',
})
```

### SPA Route Tracking

Since this is a Single Page Application, the implementation:

- Tracks route changes using React Router's `useLocation` hook
- Sends pageview events for each route change
- Maintains accurate page path reporting in GA4

## Testing

### Playwright Tests

Comprehensive tests are available in `playwright-tests/recaptcha-analytics.spec.ts`:

- GA4 script loading verification
- Page view tracking on navigation
- Error handling for GA4 failures
- SPA route tracking validation
- Configuration testing

### Running Tests

```bash
# Run Google Analytics tests
pnpm test:e2e --grep "Google Analytics"

# Run all integration tests
pnpm test:e2e
```

## Privacy and Compliance

### GDPR Considerations

1. **Cookie Consent**: Consider implementing cookie consent banner
2. **Data Processing**: GA4 processes data in accordance with Google's privacy policy
3. **IP Anonymization**: Automatically enabled in GA4
4. **Data Retention**: Configurable in GA4 settings

### Ad Blockers

The implementation gracefully handles ad blocker interference:

- Page continues to function normally if GA4 is blocked
- No console errors or broken functionality
- Fallback behavior ensures user experience is unaffected

## Performance Impact

- **Client-side**: ~15KB additional JavaScript (gzipped)
- **Network Requests**: 2-3 requests per page load
- **User Experience**: No visible impact on page load times

## Monitoring and Analytics

### GA4 Dashboard

Access your analytics data through the GA4 interface:

- **Real-time Reports**: Live user activity
- **Audience Reports**: User demographics and behavior
- **Acquisition Reports**: Traffic source analysis
- **Behavior Reports**: Page and content performance
- **Conversions**: Goal and conversion tracking

### Key Metrics to Monitor

1. **Users**: Total unique visitors
2. **Sessions**: Number of visits
3. **Page Views**: Total pages viewed
4. **Bounce Rate**: Percentage of single-page sessions
5. **Session Duration**: Average time on site
6. **Top Pages**: Most visited pages
7. **Traffic Sources**: Where visitors come from

## Troubleshooting

### Common Issues

1. **GA4 not loading**
   - Check measurement ID is correct
   - Verify network connectivity
   - Check browser console for errors

2. **Page views not tracking**
   - Ensure component is properly integrated
   - Check React Router integration
   - Verify GA4 property is active

3. **Data not appearing in GA4**
   - Wait 24-48 hours for data processing
   - Check timezone settings
   - Verify property configuration

### Debug Mode

Enable GA4 debug mode by adding parameter to URL:

```
https://yourdomain.com?gtag_debug=true
```

Check browser console for detailed GA4 logging.

## Best Practices

### Implementation

1. **Environment Variables**: Never hardcode measurement IDs
2. **Error Handling**: Graceful degradation when GA4 fails
3. **Performance**: Load GA4 after critical content
4. **Privacy**: Respect user privacy preferences

### Analytics Strategy

1. **Goals Setup**: Define conversion goals in GA4
2. **Custom Events**: Track important user interactions
3. **Segments**: Create user segments for analysis
4. **Reports**: Set up automated reports and alerts

### Maintenance

1. **Regular Review**: Monitor analytics data regularly
2. **Update IDs**: Keep measurement IDs current
3. **Privacy Compliance**: Stay updated with privacy regulations
4. **Performance Monitoring**: Track GA4 impact on site performance

## Migration from Universal Analytics

If migrating from Universal Analytics (UA):

1. **Create GA4 Property**: Set up new GA4 property
2. **Update Code**: Replace UA tracking code with GA4
3. **Update Goals**: Recreate goals in GA4 interface
4. **Data Comparison**: Use both systems during transition
5. **Update Documentation**: Update internal docs

## Dependencies

```json
{
  "react-ga4": "^2.1.0"
}
```

## Security Considerations

1. **Measurement ID Exposure**: Public in client-side code (acceptable)
2. **Data Transmission**: All data sent over HTTPS
3. **Cross-Site Scripting**: GA4 script is hosted by Google
4. **Data Privacy**: User data handled according to Google's policies

## Advanced Features (Future)

### Enhanced E-commerce Tracking

```typescript
ReactGA.gtag('event', 'view_item', {
  currency: 'USD',
  value: 9.99,
  items: [
    {
      item_id: 'portfolio_download',
      item_name: 'Resume Download',
    },
  ],
})
```

### Custom Dimensions and Metrics

Configure custom parameters for enhanced tracking:

```typescript
ReactGA.gtag('config', 'GA_MEASUREMENT_ID', {
  custom_map: {
    dimension1: 'user_type',
    metric1: 'form_submissions',
  },
})
```

### A/B Testing Integration

Integrate with Google Optimize for A/B testing:

```typescript
ReactGA.gtag('event', 'optimize.callback', {
  name: 'experiment_id',
  callback: (value) => {
    console.log('Experiment variation:', value)
  },
})
```

## Related Documentation

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [react-ga4 GitHub](https://github.com/codler/react-ga4)
- [GA4 Migration Guide](https://support.google.com/analytics/answer/10759417)
- [Playwright Testing Guide](./playwright-tests/recaptcha-analytics.spec.ts)

---

## Image Optimization

# 🖼️ Image Optimization Guide

This document outlines the comprehensive image optimization implementation for this portfolio project.

## 📋 Overview

The image optimization system provides:

- **Responsive Images**: Automatic format selection (WebP/AVIF with PNG/JPEG fallbacks)
- **Lazy Loading**: Intersection Observer-based loading for performance
- **Build-time Optimization**: Vite plugin for automatic compression
- **Runtime Optimization**: Custom React components with loading states

## 🛠️ Implementation Details

### 1. Build-time Optimization (Vite Plugin)

**Plugin**: `vite-plugin-image-optimizer`
**Location**: `vite.config.ts`

```typescript
ViteImageOptimizer({
  png: { quality: 80 },
  jpeg: { quality: 80 },
  jpg: { quality: 80 },
  webp: { quality: 85, effort: 6 },
  avif: { quality: 70, effort: 6 },
  include: /\.(png|jpe?g|webp|avif)$/i,
  exclude: /node_modules/,
})
```

**Features**:

- Automatic WebP/AVIF generation during build
- Quality optimization (80% for PNG/JPEG, 85% for WebP, 70% for AVIF)
- Excludes node_modules for faster builds

### 2. Runtime Components

#### OptimizedImage Component

**Location**: `client/components/OptimizedImage.tsx`

**Features**:

- Automatic format selection with `<picture>` element
- Lazy loading with Intersection Observer
- Loading states and skeleton placeholders
- Error handling and fallbacks

**Usage**:

```tsx
<OptimizedImage
  src="/logo.jpg"
  alt="Logo"
  width={200}
  height={100}
  priority={true} // For above-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### useLazyImage Hook

**Location**: `client/hooks/useLazyImage.ts`

**Features**:

- Intersection Observer for lazy loading
- Configurable root margin and threshold
- Loading state management

### 3. Navigation Integration

The Navigation component has been updated to use the OptimizedImage component:

```tsx
<OptimizedImage
  src="/logo.jpg"
  alt="Themistoklis Baltzakis Logo"
  width={40}
  height={40}
  className="w-8 h-8 md:w-10 md:h-10 rounded-lg transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-cyan-500/20"
  priority={true}
  fallbackSrc="/logo.jpg"
/>
```

## 📊 Performance Benefits

### Before Optimization

- Logo: 36.6 KB PNG
- No lazy loading
- No format optimization
- Synchronous loading

### After Optimization

- **Build-time**: Automatic WebP/AVIF generation (when Sharp is installed)
- **Runtime**: Lazy loading with intersection observer
- **Format**: `<picture>` element with fallbacks
- **Loading**: Skeleton placeholders and smooth transitions

## 🏃‍♂️ Usage Instructions

### Development

1. **Run optimization script**:

   ```bash
   npm run optimize-images
   ```

2. **Check image sizes**:
   - Script reports current image sizes
   - Identifies optimization opportunities

### Production Build

Images are automatically optimized during the Vite build process:

```bash
npm run build
```

The Vite Image Optimizer plugin will:

- Compress images based on configured quality settings
- Generate WebP and AVIF versions
- Maintain original files as fallbacks

## 🔧 Configuration

### Vite Plugin Settings

Located in `vite.config.ts`:

```typescript
ViteImageOptimizer({
  // PNG optimization
  png: {
    quality: 80, // 0-100
  },
  // JPEG optimization
  jpeg: {
    quality: 80,
    progressive: true,
  },
  // WebP generation
  webp: {
    quality: 85,
    effort: 6, // 0-6 (higher = better compression, slower)
  },
  // AVIF generation
  avif: {
    quality: 70,
    effort: 6,
  },
})
```

### Component Props

**OptimizedImage Props**:

- `src`: Image source path
- `alt`: Alt text for accessibility
- `className`: CSS classes
- `width/height`: Dimensions for aspect ratio
- `sizes`: Responsive sizes attribute
- `priority`: Load immediately (for above-the-fold)
- `placeholder`: Low-quality placeholder image
- `fallbackSrc`: Fallback image source

## 📈 Monitoring & Analytics

### Image Loading Performance

The implementation includes:

- Loading state tracking
- Error handling with fallbacks
- Performance monitoring hooks

### Build Analysis

Use the bundle analyzer to monitor image sizes:

```bash
npm run build:analyze
```

## 🚀 Future Enhancements

### Potential Improvements

1. **Advanced Lazy Loading**:
   - Blur-to-sharp transitions
   - Progressive JPEG loading
   - Content-aware cropping

2. **CDN Integration**:
   - Cloudinary, Imgix, or similar services
   - Automatic responsive image generation
   - Real-time optimization

3. **Advanced Formats**:
   - JPEG XL support
   - HEIC format support
   - Video formats for animated images

4. **Performance Monitoring**:
   - Largest Contentful Paint (LCP) tracking
   - Image loading performance metrics
   - Automated optimization suggestions

## 🐛 Troubleshooting

### Common Issues

1. **Sharp Not Installed**:
   - Script falls back to basic file size reporting
   - Install with: `pnpm add -D sharp`

2. **Build Performance**:
   - Large images slow down builds
   - Consider pre-optimizing large assets

3. **Browser Support**:
   - AVIF has limited browser support
   - WebP has good support (90%+)
   - PNG/JPEG fallbacks always available

### Debug Commands

```bash
# Check current image sizes
npm run optimize-images

# Analyze bundle with images
npm run build:analyze

# Test in development
npm run dev
```

## 📚 Resources

- [WebP Format Guide](https://developers.google.com/speed/webp)
- [AVIF Format Guide](https://aomediacodec.github.io/avif/)
- [Responsive Images Guide](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

**Last Updated**: January 19, 2026
**Status**: ✅ Complete

---

## PWA

# Progressive Web App (PWA) Implementation

This document describes the PWA implementation for the Baltzakis Themistoklis portfolio application.

## Overview

The application is configured as a Progressive Web App with offline capabilities, installable features, and push notifications.

## Key Features

### Service Worker

- **Offline Caching**: Cache static assets and API responses
- **Background Sync**: Sync data when connection is restored
- **Push Notifications**: Web Push API integration

### Web App Manifest

- **Installable**: Add to home screen functionality
- **Splash Screen**: Custom loading screen
- **App Icons**: Multiple sizes for different devices

### Offline Experience

- **Fallback Pages**: Graceful degradation when offline
- **Cache Strategies**: Network-first, cache-first, stale-while-revalidate
- **Background Updates**: Update cache in background

## Implementation

### Vite PWA Plugin

**Location**: `vite.config.ts`

```typescript
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
    ],
  },
  manifest: {
    name: 'Themistoklis Baltzakis Portfolio',
    short_name: 'TB Portfolio',
    description: 'Cloud Architect & Cybersecurity Specialist Portfolio',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    icons: [
      {
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
})
```

### Service Worker Registration

**Location**: `client/main.tsx`

```typescript
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update prompt
  },
  onOfflineReady() {
    // App is ready for offline use
  },
})
```

## Configuration

### Manifest File

**Location**: `public/manifest.json`

```json
{
  "name": "Themistoklis Baltzakis Portfolio",
  "short_name": "TB Portfolio",
  "description": "Cloud Architect & Cybersecurity Specialist Portfolio",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#0f172a",
  "icons": [
    {
      "src": "/logo-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/logo-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Environment Variables

```bash
# PWA Configuration
VITE_PWA_ENABLED=true
VITE_PWA_CACHE_NAME=tb-portfolio-v1
```

## Push Notifications

### VAPID Keys

The application uses VAPID (Voluntary Application Server Identification) for web push:

- **Public Key**: Used in client-side code
- **Private Key**: Used in server-side code (secure)

### Implementation

**Client-side** (`client/components/PushNotifications.tsx`):

```typescript
const subscribeToNotifications = async () => {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })

  await fetch('/api/push-notifications', {
    method: 'PUT',
    body: JSON.stringify(subscription),
  })
}
```

**Server-side** (`server/routes/push-notifications.ts`):

```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:example@example.com',
  vapidPublicKey,
  vapidPrivateKey,
)

app.post('/api/push-notifications', async (req, res) => {
  const { subscription, message } = req.body

  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: 'Portfolio Update',
      body: message,
    }),
  )
})
```

## Testing

### PWA Validation

Use Lighthouse to test PWA features:

```bash
# Run Lighthouse audit
npm run lighthouse
```

### Offline Testing

1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh the page
4. Verify offline functionality

### Push Notification Testing

1. Install the PWA
2. Subscribe to notifications
3. Send a test notification from server
4. Verify notification appears

## Performance Considerations

### Bundle Size

- **Service Worker**: ~5KB gzipped
- **Manifest**: ~1KB
- **Push Library**: ~10KB gzipped

### Cache Strategy

- **Static Assets**: Cache-first strategy
- **API Responses**: Network-first with fallback
- **Images**: Cache with expiration

## Browser Support

### PWA Features

- **Chrome/Edge**: Full support
- **Firefox**: Good support (some limitations)
- **Safari**: Basic support (iOS 11.3+)
- **Mobile Browsers**: Android Chrome, iOS Safari

### Push Notifications

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited support
- **Mobile**: Android Chrome, iOS Safari (with limitations)

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**:
   - Check HTTPS requirement
   - Verify service worker file exists
   - Check console for errors

2. **Cache Not Working**:
   - Clear application cache in DevTools
   - Check cache storage quota
   - Verify cache names match

3. **Push Notifications Not Working**:
   - Verify VAPID keys are correct
   - Check notification permissions
   - Test with different browsers

### Debug Commands

```bash
# Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log(registrations)
})

# Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

## Security Considerations

1. **HTTPS Required**: PWA features require secure context
2. **VAPID Keys**: Keep private keys secure on server
3. **Permission Requests**: Request notification permission appropriately
4. **Data Validation**: Validate all push notification payloads

## Future Enhancements

### Advanced Features

1. **Background Sync**: Sync user actions when offline
2. **Periodic Background Sync**: Update content in background
3. **Web Share API**: Native sharing capabilities
4. **Badging API**: Show notification counts on app icon
5. **File System Access**: Access local files

### Performance Improvements

1. **Service Worker Updates**: Automatic SW updates
2. **Cache Optimization**: Intelligent cache management
3. **Preloading**: Preload critical resources
4. **Compression**: Brotli compression for assets

## Dependencies

```json
{
  "vite-plugin-pwa": "^0.16.4",
  "web-push": "^3.6.4",
  "workbox": "^7.0.0"
}
```

## Related Documentation

- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

---

**Last Updated**: January 20, 2026
**Status**: ✅ Complete
