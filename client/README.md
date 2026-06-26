# UV System Calculator - Web Client

A modern React-based web application for UV system calculations including dose calculations, pathogen inactivation, Dechlorination, and system specifications. Built with React 19, Vite, and Chart.js.

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn
- Docker (for containerized deployment)
- Backend API server running (see [server README](../server/README.md))

### Configuration

Edit `config.json` to set the API endpoint:

```json
{
  "API_BASE_URL": "/api"
}
```

**Options:**
- `/api` - For production with Nginx proxy (default)
- `http://localhost:5000` - For local development with direct API access
- `http://your-server:5000` - For remote API server

> **Note**: For complete deployment instructions including Docker and systemd setup, see the [main project README](../README.md).

### Installation & Running

1. **Local Development:**
   ```bash
   npm install
   npm run dev
   ```
   The app will start on `http://localhost:5173` by default.

2. **Production Build:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Docker Build & Run:**
   ```bash
   # Build
   docker build -t uv-calculator-client .
   
   # Run
   docker run -p 80:80 uv-calculator-client
   ```

4. **Docker Compose (with backend):**
   ```bash
   # From project root
   docker-compose up
   ```

The application will be available at `http://localhost` (or `http://localhost:5173` in dev mode).

## Deployment

> **For complete deployment instructions** (Docker Compose, systemd service, Linux/Windows), see the [main project README](../README.md).

**Quick Docker Run:**

```bash
# Pull latest image
docker pull ghcr.io/atlantiumtechnologies/atl_web_calculator/client:latest

# Run
docker run -p 80:80 ghcr.io/atlantiumtechnologies/atl_web_calculator/client:latest
```

## Project Structure

```
client/
├── src/
│   ├── Components/          # React components
│   │   ├── CalculatorVersion.jsx    # Version display
│   │   ├── CheckBox.jsx             # Custom checkbox
│   │   ├── ChooseApplication.jsx    # Application selector
│   │   ├── Dechlorination.jsx       # Dechlorination calculator
│   │   ├── DraggableWindow.jsx      # Modal window component
│   │   ├── DropDown.jsx             # Custom dropdown
│   │   ├── FlowDosePrompt.jsx       # Flow calculation dialog
│   │   ├── HODSystem.jsx            # System selector
│   │   ├── LoginBox.jsx             # Authentication
│   │   ├── PasswordBox.jsx          # Password entry
│   │   ├── PathogenInactivation.jsx # Pathogen calculations
│   │   ├── PathogenReduction.jsx    # Reduction display
│   │   ├── PlotFigures.jsx          # Chart controls
│   │   ├── ProgressBar.jsx          # Loading indicator
│   │   ├── Results.jsx              # Calculation results
│   │   ├── SimpleChart.jsx          # Chart.js wrapper
│   │   ├── Slider.jsx               # Custom slider
│   │   ├── Specifications.jsx       # System specifications
│   │   ├── TableView.jsx            # Data tables
│   │   ├── Tooltip.jsx              # Tooltip component
│   │   ├── TreeView.jsx             # Hierarchical data view
│   │   └── UserDatabase.jsx         # User database management
│   ├── Styles/              # Component-specific CSS
│   ├── hooks/
│   │   └── useAppState.js   # Global state management hook
│   ├── apiService.js        # API client wrapper
│   ├── data.js              # Static data and configuration
│   ├── tooltips.js          # Tooltip text definitions
│   ├── App.jsx              # Main application component
│   ├── App.css              # Global application styles
│   ├── main.jsx             # React entry point
│   └── index.css            # Global CSS
├── public/                  # Static assets
│   ├── Fonts/               # Custom fonts
│   └── *.png, *.svg         # Images and icons
├── config.json              # API configuration
├── nginx.conf               # Nginx configuration for Docker
├── Dockerfile               # Multi-stage Docker build
├── vite.config.js           # Vite configuration
├── eslint.config.js         # ESLint configuration
└── package.json             # Dependencies and scripts
```

## Features

### Core Functionality

1. **UV System Selection**
   - Application type selection (Municipal EPA, Full Range, Dechlorination)
   - Module and model selection
   - System configuration (position, lamp type, branch)

2. **Dose Calculations**
   - Reduction Equivalent Dose (RED)
   - Real-time calculations based on flow rate, UVT, and system parameters
   - Power consumption and pressure drop calculations

3. **Pathogen Inactivation**
   - Log reduction calculations for various pathogens
   - Comprehensive pathogen database
   - Interactive pathogen table view

4. **Dechlorination**
   - Ozone and chlorine reduction calculations
   - Configurable input/output concentrations
   - D-0.5 dose parameters

5. **Flow-Dose Optimization**
   - Calculate optimal flow rate for target dose
   - Reverse calculation capability

6. **Interactive Charts**
   - Sensitivity analysis visualizations
   - RED vs Flow Rate curves
   - RED vs UVT curves
   - Chart.js-powered interactive graphs

7. **Responsive Design**
   - Draggable modal windows
   - Adaptive layout for different screen sizes
   - Custom UI components matching Atlantium branding

## API Integration

The client communicates with the FastAPI backend through `apiService.js`:

### API Service Methods

```javascript
import config from './config.json';
const API_BASE_URL = config.API_BASE_URL;

// Health check
await apiService.checkHealth();

// Get version
await apiService.getVersion();

// Calculate UV system parameters
await apiService.calculate(parameters);

// Get system ranges
await apiService.getSystemRanges(systemType);

// Get supported systems
await apiService.getSupportedSystems();

// Calculate pressure drop
await apiService.calculatePressureDrop(systemType, flowRate);

// Dechlorination calculation
await apiService.calculateDechlorination(params);

// Flow for target dose
await apiService.calculateFlowForDose(params);

// Chart data (sensitivity analysis)
await apiService.getChartData(systemType, params);

// User login
await apiService.login(username, password);
```

### Example API Usage

```javascript
// Calculate RED
const params = {
  "Application": "Municipal EPA",
  "Module": "RZ104",
  "Model": "11",
  "Branch": "1",
  "Position": "Vertical",
  "Lamp Type": "Regular",
  "Efficiency": 80.0,
  "Relative Drive": 90.0,
  "UVT-1cm@254nm": 85.0,
  "Flow Rate": 100.0,
  "Flow Units": "m3/h"
};

const result = await apiService.calculate(params);
console.log('RED:', result['Reduction Equivalent Dose']);
```

## Component Overview

### Main Components

#### App.jsx
Main application container that:
- Manages global application state
- Handles window resizing
- Controls modal windows (password, charts, tables)
- Orchestrates child components

#### ChooseApplication.jsx
Application type selector:
- Municipal EPA
- Full Range
- Dechlorination

#### HODSystem.jsx
System configuration panel:
- Module selection (RZ104, RZ163, RZM200, etc.)
- Model selection (11, 12)
- Branch and position configuration
- Lamp type selection

#### Specifications.jsx
Input parameters:
- Flow rate with unit conversion (m³/h, US GPM)
- UVT at 254nm and 215nm
- Lamp efficiency and relative drive
- Interactive sliders with real-time updates

#### Results.jsx
Calculation results display:
- Reduction Equivalent Dose (RED)
- Pressure drop
- Power consumption
- Expected Lamp Indicator (LI)

#### PathogenInactivation.jsx
Pathogen-specific calculations:
- Log reduction for selected pathogen
- D-1Log parameter input
- Real-time dose effectiveness

#### Dechlorination.jsx
Ozone and chlorine reduction:
- Input/output concentration calculations
- Configurable D-0.5 parameters
- Reduction percentage display

#### SimpleChart.jsx
Interactive charting:
- Chart.js integration
- RED vs Flow Rate
- RED vs UVT
- Sensitivity analysis

### UI Components

- **CheckBox.jsx**: Custom styled checkbox
- **DropDown.jsx**: Searchable dropdown with filtering
- **Slider.jsx**: Custom range slider with value display
- **DraggableWindow.jsx**: Movable modal windows
- **ProgressBar.jsx**: Loading indicator
- **TableView.jsx**: Data table with sorting
- **Tooltip.jsx**: Contextual tooltip component
- **TreeView.jsx**: Hierarchical data display
- **UserDatabase.jsx**: User database management

## State Management

The application uses the `useAppState` hook for global state management:

```javascript
const {
  appState,
  updateState,
  getChartSensitivity
} = useAppState();
```

**State Structure:**
- System configuration (module, model, position, lamp type)
- Calculation parameters (flow, UVT, efficiency, drive)
- Results (RED, pressure drop, power)
- UI state (selected application, pathogen, etc.)

## Styling

### CSS Architecture
- **index.css**: Global styles, CSS variables, fonts
- **App.css**: Main application layout
- **Component CSS**: One CSS file per component in `Styles/` directory

### Custom Fonts
- Inter (Light, Light Italic, Medium)
- Located in `public/Fonts/`

### Design System
- Custom Atlantium color palette
- Consistent spacing and typography
- Responsive breakpoints
- Dark theme support (partial)

## Scripts

```bash
# Development server with hot reload
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

The application uses `config.json` for configuration. For Docker deployment, you can override this with environment variables or volume mounts.

## Docker Configuration

### Multi-Stage Build

The Dockerfile uses a two-stage build:

1. **Stage 1 (builder)**: Build React app with Node.js
2. **Stage 2 (runtime)**: Serve with Nginx

### Nginx Configuration

The `nginx.conf` includes:
- Static file serving from `/usr/share/nginx/html`
- React Router support (all routes → index.html)
- API proxy to backend: `/api/` → `http://server:5000/`

**Example nginx.conf:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # React routes
    location / {
        try_files $uri /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://server:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Development

### Adding a New Component

1. Create component file in `src/Components/`
2. Create corresponding CSS in `src/Styles/`
3. Import and use in `App.jsx`

Example:
```jsx
// src/Components/MyComponent.jsx
import React from 'react';
import '../Styles/MyComponent.css';

const MyComponent = ({ data }) => {
  return (
    <div className="my-component">
      {data}
    </div>
  );
};

export default MyComponent;
```

### Adding a New API Endpoint

1. Add method to `apiService.js`:
```javascript
async myNewEndpoint(params) {
  try {
    const response = await fetch(`${API_BASE_URL}/my-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
}
```

2. Use in component:
```javascript
const result = await apiService.myNewEndpoint(data);
```

## Dependencies

### Production Dependencies
- **react**: ^19.1.0 - UI library
- **react-dom**: ^19.1.0 - React DOM rendering
- **axios**: ^1.13.5 - HTTP client (alternative to fetch)
- **chart.js**: ^4.5.0 - Charting library
- **lucide-react**: ^0.543.0 - Icon library

### Development Dependencies
- **vite**: ^7.0.4 - Build tool and dev server
- **@vitejs/plugin-react**: ^4.6.0 - React plugin for Vite
- **eslint**: ^9.30.1 - Code linting
- **eslint-plugin-react-hooks**: ^5.2.0 - React Hooks linting
- **eslint-plugin-react-refresh**: ^0.4.20 - React Refresh linting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues

**Problem:** Cannot connect to backend API

**Solution:**
1. Verify backend server is running: `curl http://localhost:5000/health`
2. Check `config.json` has correct `API_BASE_URL`
3. For Docker: ensure backend service is named correctly in nginx.conf
4. Check browser console for CORS errors

### Build Errors

**Problem:** `npm run build` fails

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### Chart Not Rendering

**Problem:** Charts don't display

**Solution:**
1. Check browser console for Chart.js errors
2. Verify chart data structure matches Chart.js requirements
3. Ensure canvas element exists in DOM
4. Check SimpleChart.jsx for errors

### Styling Issues

**Problem:** Components look unstyled

**Solution:**
1. Verify CSS files are imported correctly
2. Check browser console for 404 errors on CSS files
3. Clear browser cache
4. Verify public assets are copied to dist/ during build

### Docker Container Issues

**Problem:** Container runs but app doesn't load

**Solution:**
```bash
# Check nginx logs
docker logs <container-id>

# Verify nginx is running
docker exec <container-id> ps aux

# Check if files exist
docker exec <container-id> ls -la /usr/share/nginx/html

# Test nginx config
docker exec <container-id> nginx -t
```

## Testing

Currently, the project does not include automated tests. Recommended testing approach:

1. **Manual Testing:**
   - Test all calculation scenarios
   - Verify API integration
   - Check responsive design
   - Test all UI interactions

2. **Browser Testing:**
   - Test in Chrome, Firefox, Safari, Edge
   - Test on mobile devices
   - Verify touch interactions

3. **Integration Testing:**
   - Test with backend API
   - Verify all endpoints work correctly
   - Test error handling

## Performance Optimization

- **Code Splitting**: Vite automatically splits code by route
- **Tree Shaking**: Unused code is removed during build
- **Asset Optimization**: Images and fonts are optimized
- **Lazy Loading**: Consider lazy loading heavy components
- **Memoization**: Use React.memo for expensive renders

## Security Considerations

- **API Authentication**: Implement proper authentication flow
- **Input Validation**: Validate all user inputs
- **XSS Protection**: Sanitize user-generated content
- **HTTPS**: Always use HTTPS in production
- **Content Security Policy**: Configure CSP headers in nginx

## Future Enhancements

- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright
- [ ] Implement TypeScript for better type safety
- [ ] Add PWA support for offline functionality
- [ ] Implement state persistence with localStorage
- [ ] Add internationalization (i18n)
- [ ] Improve accessibility (WCAG compliance)
- [ ] Add dark mode toggle

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify backend API is healthy: GET `/health`
3. Check network tab for failed requests
4. Review component-specific logs

## Notes

- The application requires the backend API server to be running
- All calculations are performed server-side via API calls
- UI state is managed locally with React hooks
- Charts use Chart.js and require canvas support
- Custom fonts are loaded from `public/Fonts/`
- Images and icons are in `public/` directory

## License

Copyright © 2024-2026 Atlantium Technologies Ltd. All rights reserved.

---

## See Also

- [Main Project README](../README.md) - Project overview and deployment
- [Server README](../server/README.md) - Backend API documentation
- [Calculator Library README](../calculator_dll/README.md) - Native calculation library
