# Solar Survey - Comprehensive Solar Survey Application

A modern, comprehensive solar survey application built with React, TypeScript, and Tailwind CSS. This application provides a complete field inventory system for solar installation surveys with advanced input types, GPS integration, and photo documentation.

## 🚀 Features

### 📋 Complete Survey Sections

#### Section 0 - General & Contact
- **Survey Date** - Date picker with current date default
- **Surveyor Name** - Text input with voice recording capability
- **Customer Full Name** - Text input with What Three Words location integration
- **Site Address** - Address input with manual override capability
- **Postcode** - Text input with UK postcode validation
- **Grid Reference** - GPS coordinates with automatic location capture
- **Phone** - Telephone keypad input
- **Email** - Email keyboard input
- **Secondary Contact** - Optional secondary contact information

#### Section 1 - Electricity Baseline
- **Annual Consumption** - Number input (500-20,000 kWh range)
- **MPAN/Supply Number** - Text input with regex validation (S\d{13}) + photo requirement
- **Current Electricity Provider** - Dropdown with 20 UK suppliers
- **Network Operator** - DNO dropdown list
- **Customer Permission** - Signature component for DNO contact authorization
- **Import/Export Rates** - Decimal inputs for day/night rates
- **Standing Charge** - Daily charge input
- **Tariff Type** - Dropdown (Fixed/Variable/EV/Agile)
- **Smart Meter Status** - Yes/No/Unknown
- **Export Tariff Availability** - Yes/No/Unknown

#### Section 2 - Property Overview
- **Property Type** - Dropdown (Detached, Semi, Terrace, Bungalow, Flat, Commercial, Other)
- **Property Age** - Age range dropdown
- **Listed Building** - Yes/No/Unknown
- **Conservation Area** - Yes/No
- **New Build Status** - Yes/No
- **Shared Roof/Party Wall** - Yes/No
- **Scaffold Access** - Yes/No with photo documentation
- **Storage Area** - Yes/No with photo documentation
- **Parking Restrictions** - Long text input for access notes

#### Section 3 - Roof Inspection (Repeatable)
- **Roof Face Management** - Add/remove multiple roof faces
- **Orientation** - Slider (-180° to +180°) with exact degree control
- **Pitch** - Slider (0-60°) with preset values for common roof pitches
- **Dimensions** - Width, length, and auto-calculated area
- **Roof Covering** - Material type dropdown
- **Condition Assessment** - Excellent/Good/Fair/Poor with photo requirement
- **Obstructions** - Multi-photo upload for chimneys, aerials, velux, vents
- **Shading Objects** - Multi-photo upload for trees, buildings, pylons
- **Gutter Height** - Measurement with photo documentation
- **Structural Details** - Rafter spacing, depth, batten depth
- **Membrane Assessment** - Type and condition with damage photo requirement
- **Structural Defects** - Long text input with photo documentation
- **Panel Planning** - Auto-suggested panel count based on area

#### Section 4 - Loft/Attic
- **Access Dimensions** - Hatch width and height measurements
- **Access Quality** - Easy/Restricted/None dropdown
- **Headroom** - Measurement in meters
- **Timber Condition** - Sound/Minor Rot/Major Rot/Unknown with photo requirement
- **Wall Space Assessment** - Inverter and battery space evaluation with photos
- **Insulation** - Thickness measurement
- **Existing Infrastructure** - Lighting and power socket assessment

### 🎯 Advanced Input Types

#### Voice Input Integration
- **Speech-to-Text** - All text inputs support voice recording
- **Real-time Transcription** - Live voice input with visual feedback
- **Recording Controls** - Start/stop recording with microphone icons

#### GPS & Location Services
- **Automatic GPS Capture** - One-tap location acquisition
- **Grid Reference Input** - Manual or GPS-assisted coordinate entry
- **What Three Words Integration** - Customer location capture
- **High Accuracy Mode** - Precise location for survey documentation

#### Photo Documentation
- **Multi-Photo Upload** - Support for multiple photos per field
- **Photo Requirements** - Mandatory photos for critical assessments
- **Damage Documentation** - Special photo requirements for defects
- **Location Verification** - GPS coordinates embedded in photos

#### Smart Validation
- **Real-time Validation** - Input validation with visual feedback
- **Range Checking** - Min/max values for numeric inputs
- **Format Validation** - Regex patterns for specific fields
- **Required Field Tracking** - Progress indicators and completion status

### 🎨 User Interface Features

#### Responsive Design
- **Mobile-First** - Optimized for field use on mobile devices
- **Tablet Support** - Enhanced layout for larger screens
- **Desktop Interface** - Full-featured desktop experience

#### Dark Mode Support
- **Theme Toggle** - Switch between light and dark modes
- **System Preference** - Automatic theme detection
- **Persistent Settings** - Theme preference saved

#### Progress Tracking
- **Section Completion** - Visual progress indicators
- **Field Validation** - Real-time completion status
- **Red Flag System** - Issue tracking and resolution workflow

#### Offline Capability
- **Offline Mode** - Continue working without internet
- **Data Sync** - Automatic synchronization when online
- **Local Storage** - Data persistence across sessions

### 🔧 Technical Features

#### TypeScript Integration
- **Type Safety** - Full TypeScript implementation
- **Interface Definitions** - Comprehensive type definitions
- **Error Prevention** - Compile-time error checking

#### Component Architecture
- **Modular Design** - Reusable input components
- **Custom Hooks** - Shared functionality across components
- **State Management** - Efficient form state handling

#### Performance Optimization
- **Lazy Loading** - Dynamic component loading
- **Memoization** - Optimized re-rendering
- **Bundle Optimization** - Efficient code splitting

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with GPS support

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Muhammad-Rayyan-Mohsin/Solar_Survey.git
cd Solar_Survey

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Configure API keys (for production)
VITE_WHAT_THREE_WORDS_API_KEY=your_api_key
VITE_GPS_ACCURACY=high
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Usage

### Field Survey Workflow
1. **Start Survey** - Create new survey with customer details
2. **General Information** - Complete contact and location details
3. **Electrical Assessment** - Document current electrical setup
4. **Property Overview** - Assess property characteristics
5. **Roof Inspection** - Detailed roof face analysis
6. **Loft Assessment** - Interior space evaluation
7. **Review & Submit** - Final validation and submission

### Input Best Practices
- **Use Voice Input** - Faster data entry in the field
- **Take Photos** - Document all critical findings
- **GPS Verification** - Ensure accurate location data
- **Complete All Fields** - Follow validation requirements

## 🔒 Data Security

### Privacy Protection
- **Local Storage** - Sensitive data stored locally
- **Encrypted Transmission** - Secure data sync
- **Access Controls** - User authentication and authorization

### Compliance
- **GDPR Compliance** - Data protection regulations
- **Industry Standards** - Solar installation best practices
- **Audit Trail** - Complete survey history

## 🚀 Future Enhancements

### Planned Features
- **Battery/Inverter Installation Section** - Additional survey sections
- **Real-time Collaboration** - Multi-user survey support
- **Advanced Analytics** - Survey data analysis and reporting
- **Integration APIs** - Third-party system connections

### Technical Roadmap
- **PWA Support** - Progressive web app capabilities
- **Offline Database** - Local SQLite integration
- **Cloud Sync** - Real-time data synchronization
- **Mobile App** - Native mobile applications

## 🤝 Contributing

### Development Guidelines
- **TypeScript First** - All new code in TypeScript
- **Component Testing** - Unit tests for all components
- **Accessibility** - WCAG 2.1 AA compliance
- **Performance** - Lighthouse score optimization

### Code Standards
- **ESLint Configuration** - Consistent code style
- **Prettier Formatting** - Automatic code formatting
- **Git Hooks** - Pre-commit validation
- **Documentation** - Comprehensive code comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **User Guide** - Complete usage instructions
- **API Reference** - Technical documentation
- **Troubleshooting** - Common issues and solutions

### Contact
- **Technical Support** - Development team contact
- **Feature Requests** - Enhancement suggestions
- **Bug Reports** - Issue reporting and tracking

---

**Built with ❤️ for the solar industry**
