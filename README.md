# MedReview Pro

A comprehensive clinical assessment Action App designed for medical organizations to streamline patient evaluation workflows. Built with React, TypeScript, and seamless UiPath Orchestrator integration.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/swati354/nucleus-action-app)

## Overview

MedReview Pro features a professional three-tab interface that guides healthcare professionals through a structured review process. The application displays patient criteria, medical history, and assessment guidelines with expandable sections for detailed clinical parameters. Enhanced with AI-generated summaries that highlight key findings and potential concerns, it provides a structured decision-making interface with outcome selection and automated correspondence generation.

## Key Features

- **Clinical Review Tab**: Displays patient clinical criteria, medical history, assessment guidelines, and relevant clinical parameters in an organized, expandable format
- **Medical Records Tab**: Comprehensive view of patient medical documentation including test results, imaging reports, previous consultations, and AI-generated summaries highlighting key findings
- **Decision & Correspondence Tab**: Structured decision-making interface with outcome selection, detailed comment fields, and correspondence generation capabilities
- **UiPath Integration**: Seamless integration with UiPath Orchestrator for receiving patient data and processing assessment results
- **Professional Medical Interface**: Clean, neutral design with strategic accent colors for status indicators and actions
- **Responsive Design**: Optimized for desktop and mobile devices with touch-friendly interactions

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Icons**: Lucide React
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **UiPath Integration**: UiPath TypeScript SDK
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **Package Manager**: Bun

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for compatibility)
- UiPath Orchestrator access (for production use)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medreview-pro
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your UiPath Orchestrator settings in `.env`:
```env
VITE_UIPATH_BASE_URL=https://your-orchestrator-url.com
VITE_UIPATH_ORG_NAME=your-org-name
VITE_UIPATH_TENANT_NAME=your-tenant-name
VITE_UIPATH_CLIENT_ID=your-client-id
```

## Development

Start the development server:
```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint

## Usage

### Action Center Integration

MedReview Pro is designed to work as a UiPath Action App. When deployed and configured in UiPath Action Center:

1. Healthcare professionals receive patient assessment tasks
2. The app loads with patient data (name, fax, email) pre-populated
3. Users navigate through the three tabs to review clinical information
4. Assessment is documented and submitted back to UiPath Orchestrator

### Development Mode

In development mode, the app displays mock data for testing and preview purposes. A yellow banner indicates "Preview Mode" when not connected to Action Center.

### Tab Navigation

- **Clinical Review**: Review structured clinical criteria and patient history
- **Medical Records**: Examine patient documentation with AI summaries
- **Decision & Correspondence**: Document assessment and select outcomes

## Action Schema

The application expects the following input/output schema:

### Inputs (from UiPath)
- `name` (string): Patient name
- `fax` (string): Fax number
- `email` (string): Email address

### Outputs (to UiPath)
- `comments` (string): Assessment comments
- `outcome` (string): "Correct" or "Incorrect"

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── action/         # Action Center specific components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Main application pages
└── types/              # TypeScript type definitions
```

## Deployment

### Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/swati354/nucleus-action-app)

This project is optimized for deployment on Cloudflare Pages:

1. Build the project:
```bash
bun run build
```

2. Deploy to Cloudflare Pages:
   - Connect your repository to Cloudflare Pages
   - Set build command: `bun run build`
   - Set build output directory: `dist`
   - Configure environment variables in Cloudflare dashboard

### Manual Deployment

1. Build the project:
```bash
bun run build
```

2. Upload the `dist` folder to your hosting provider

## UiPath Configuration

1. Create a new Action App in UiPath Action Center
2. Upload the built application
3. Configure the action schema with the required inputs/outputs
4. Deploy to your target environment

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Refer to UiPath documentation for Action Center integration