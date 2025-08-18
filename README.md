# 🦕 Dino - Production Ready Restaurant Management System

A comprehensive, production-ready restaurant management application built with React, TypeScript, and Material-UI. Dino provides a complete solution for modern restaurants with QR code ordering, real-time notifications, workspace management, and role-based access control.

## 🌟 Features

### 🎯 Core Features
- **QR Code Ordering**: Customers scan QR codes to access digital menus and place orders
- **Real-time Notifications**: WebSocket-based live updates for orders and system alerts
- **Role-Based Access Control**: Comprehensive permission system with Superadmin, Admin, and Operator roles
- **Workspace Management**: Multi-cafe management with workspace switching
- **Responsive Design**: Mobile-first approach with seamless experience across all devices

### 👥 User Interfaces

#### Customer Interface
- **Digital Menu**: Interactive menu with search, filters, and categories
- **Cart Management**: Add/remove items with quantity controls
- **Order Tracking**: Real-time order status updates
- **Mobile Optimized**: Touch-friendly interface for smartphones and tablets

#### Admin Interface
- **Dashboard**: Analytics, sales reports, and key metrics
- **Order Management**: Real-time order processing and status updates
- **Menu Management**: Create, edit, and organize menu items and categories
- **Table Management**: QR code generation and table status tracking
- **User Management**: Create users, assign roles, and manage permissions
- **Workspace Management**: Multi-location support with cafe switching
- **Settings**: Cafe configuration and system preferences

### 🔐 Role-Based Access Control

#### Superadmin
- Full system access with workspace management
- Create and manage multiple workspaces
- Switch between cafes and workspaces
- User management across all locations
- System-wide analytics and reporting

#### Admin
- Full access to restaurant management features
- Menu and order management
- Table and user management
- Cafe settings and configuration
- Analytics and reporting for assigned cafe

#### Operator
- Limited access to order management only
- View and update order status
- Basic order processing capabilities

### 🏢 Workspace Management
- **Multi-cafe Support**: Manage multiple restaurant locations
- **Workspace Switching**: Easy switching between different workspaces
- **Cafe Activation**: Enable/disable cafe operations
- **Centralized Management**: Unified control panel for all locations

### 📱 Marketing Pages
- **Features Page**: Comprehensive feature showcase
- **Pricing Page**: Transparent pricing with plan comparison
- **Contact Page**: Contact form with department-specific routing
- **Responsive Design**: Professional marketing presence

## 🛠 Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with comprehensive interfaces
- **Material-UI (MUI)**: Professional UI components and theming
- **React Router**: Client-side routing with protected routes
- **Axios**: HTTP client with interceptors and error handling

### State Management
- **Context API**: Lightweight state management
- **Custom Hooks**: Reusable logic and state handling
- **Local Storage**: Persistent user preferences and cart data

### Real-time Features
- **WebSocket**: Real-time notifications and updates
- **Event-driven Architecture**: Reactive UI updates
- **Connection Management**: Automatic reconnection and error handling

### Development Tools
- **Create React App**: Development environment and build tools
- **Craco**: Configuration override for customization
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Footer, Navigation)
│   ├── ui/              # Basic UI components (Button, Card, etc.)
│   ├── UserPermissions.tsx
│   ├── NotificationCenter.tsx
│   └── ...
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── WorkspaceContext.tsx
│   └── NotificationContext.tsx
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── admin/          # Admin interface pages
│   ├── FeaturesPage.tsx
│   ├── PricingPage.tsx
│   ├── ContactPage.tsx
│   └── ...
├── services/            # API and business logic
│   ├── api.ts
│   ├── authService.ts
│   ├── menuService.ts
│   ├── workspaceService.ts
│   └── notificationService.ts
├── types/               # TypeScript type definitions
│   ├── auth.ts
│   └── index.ts
├── constants/           # Application constants
├── utils/               # Utility functions
└── theme/               # Material-UI theme configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dino-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api/v1
   REACT_APP_WS_URL=ws://localhost:8000/ws
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Demo Mode
The application includes a comprehensive demo mode with sample data:
- Demo restaurant: "Dino Cafe"
- Sample menu items with images and descriptions
- Mock user roles and permissions
- Simulated real-time notifications

## 🔧 Configuration

### API Integration
The application is designed to work with a Python backend API. Update the API endpoints in:
- `src/services/api.ts` - Base API configuration
- `src/services/*.ts` - Service-specific endpoints

### WebSocket Configuration
Real-time features require WebSocket connection:
- Configure WebSocket URL in environment variables
- Update `src/services/notificationService.ts` for custom WebSocket handling

### Theming
Customize the application appearance:
- `src/theme/cleanTheme.ts` - Material-UI theme configuration
- Update colors, typography, and component styles

## 📱 Responsive Design

The application is built with mobile-first approach:
- **Mobile (xs)**: Optimized for smartphones
- **Tablet (sm/md)**: Enhanced layout for tablets
- **Desktop (lg/xl)**: Full-featured desktop experience

### Key Responsive Features
- Collapsible navigation menu
- Touch-friendly buttons and controls
- Optimized typography and spacing
- Adaptive grid layouts
- Mobile-optimized forms

## 🔐 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Automatic token refresh
- Role-based route protection
- Permission-based component rendering

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection (when integrated with backend)
- Secure local storage handling

## 🧪 Testing

### Test Structure
```bash
src/
├── __tests__/           # Test files
├── components/__tests__/
├── pages/__tests__/
└── services/__tests__/
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WS_URL`: WebSocket server URL
- `REACT_APP_ENV`: Environment (development/production)

## 🎨 UI/UX Features

### Design System
- Consistent color palette and typography
- Material Design principles
- Accessible components (WCAG 2.1 compliant)
- Dark/light theme support (configurable)

### User Experience
- Intuitive navigation and workflows
- Loading states and error handling
- Toast notifications for user feedback
- Smooth animations and transitions

## 📊 Analytics & Monitoring

### Built-in Analytics
- Order tracking and metrics
- User activity monitoring
- Performance metrics
- Error tracking and reporting

### Integration Ready
- Google Analytics support
- Custom event tracking
- Performance monitoring
- Error boundary implementation

## 🔄 Real-time Features

### WebSocket Integration
- Live order updates
- Real-time notifications
- Connection status monitoring
- Automatic reconnection

### Event Types
- Order placed/updated
- Payment confirmations
- System alerts
- User notifications

## 🌐 Internationalization (i18n)

### Multi-language Support
- English (default)
- Extensible for additional languages
- RTL language support ready
- Currency and date localization

## 📈 Performance Optimization

### Code Splitting
- Route-based code splitting
- Component lazy loading
- Bundle size optimization

### Caching Strategy
- Service worker implementation
- API response caching
- Static asset caching

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Material-UI components consistently
3. Implement responsive design patterns
4. Add comprehensive error handling
5. Write unit tests for new features

### Code Style
- ESLint configuration for consistency
- Prettier for code formatting
- TypeScript strict mode enabled
- Component and hook naming conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- API documentation (when backend is available)
- Component documentation with Storybook
- User guides and tutorials

### Community
- GitHub Issues for bug reports
- Feature requests and discussions
- Community contributions welcome

## 🎯 Roadmap

### Upcoming Features
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Advanced reporting features

### Performance Improvements
- [ ] Bundle size optimization
- [ ] Image optimization and lazy loading
- [ ] Service worker implementation
- [ ] CDN integration

---

**Built with ❤️ for modern restaurants**

*Dino - Transforming restaurant operations with technology*