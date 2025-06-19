# CareVault POC

> 🏥 Streamlined clinical workflow with AI-powered decision support

CareVault is a proof-of-concept frontend application that demonstrates how patient data, AI decision-support, and shareable digital artifacts can transform healthcare delivery when integrated into a single platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- Python 3.11 or higher
- pnpm 8.0.0 or higher
- uv (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carevault.git
   cd carevault
   ```

2. **Install dependencies**
   ```bash
   # Install pnpm globally if not already installed
   npm install -g pnpm@8.12.1

   # Install Node.js dependencies
   pnpm install

   # Install Python dependencies
   cd packages/api
   pip install uv
   uv pip install -e .

   # then run this script
   .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file for the API
   cp packages/api/.env.example packages/api/.env
   
   # Edit the .env file and add your OpenAI API key
   # OPENAI_API_KEY=your-key-here
   ```

4. **Run the development servers**
   ```bash
   pnpm dev
   ```

   This will start:
   - Next.js frontend at http://localhost:3000
   - FastAPI backend at http://localhost:8000

## 🔐 Demo Credentials

The application comes with pre-configured demo accounts:

- **Doctor Account**
  - Email: `doctor@carevault.com`
  - Password: `doctor123`

- **Patient Account**
  - Email: `patient@carevault.com`
  - Password: `patient123`

## 🏗️ Architecture

```
carevault/
├── packages/
│   ├── frontend/          # Next.js 15 frontend with React 19
│   │   ├── src/
│   │   │   ├── app/        # App router pages
│   │   │   ├── components/ # React components
│   │   │   ├── lib/        # Utilities and API client
│   │   │   └── hooks/      # Custom React hooks
│   │   └── public/         # Static assets
│   │
│   └── api/          # FastAPI backend
│       ├── app/
│       │   ├── api/        # API endpoints
│       │   ├── core/       # Core functionality
│       │   ├── db/         # Database configuration
│       │   ├── models/     # SQLAlchemy models
│       │   ├── schemas/    # Pydantic schemas
│       │   └── services/   # Business logic
│       └── tests/          # API tests
│
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

## 🌟 Features

### For Doctors
- **Smart Prescription Creation**: Auto-complete medications with dosage recommendations
- **AI Safety Checks**: Real-time drug interaction analysis powered by RxNav and GPT-4
- **Digital Workflows**: Generate QR codes and PDFs instantly
- **Patient Management**: Comprehensive appointment and prescription history

### For Patients
- **Health Records Access**: View complete medical history in one place
- **Privacy Control**: Revoke prescription sharing access instantly
- **Appointment Tracking**: See upcoming and past appointments
- **Secure Sharing**: Share prescriptions with QR codes

### For Pharmacies
- **Instant Verification**: Scan QR codes to verify prescriptions
- **No Account Required**: Access shared prescriptions without registration
- **Complete Information**: View all prescription details including AI safety analysis

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with Server Components
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful components
- **Framer Motion** for animations
- **React Query** for state management
- **TypeScript** for type safety

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy** ORM with SQLite
- **Alembic** for database migrations
- **JWT** authentication
- **OpenAI GPT-4** for AI summaries
- **RxNav API** for drug interactions

## 📱 Key User Flows

### Doctor Workflow
1. Login with doctor credentials
2. Create new appointment for patient
3. During visit, create prescription
4. AI checks for drug interactions
5. Review AI summary and finalize
6. Generate QR code/PDF for patient

### Patient Workflow
1. Login with patient credentials
2. View appointment history
3. Access prescriptions with QR codes
4. Share with pharmacy or revoke access
5. Track medication history

## 🧪 Testing

```bash
# Run frontend tests
cd packages/frontend
pnpm test

# Run backend tests
cd packages/api
pytest
```

## 🚢 Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

### Environment Variables

Required environment variables for production:

```env
# API
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=your-production-secret-key
OPENAI_API_KEY=your-openai-api-key
ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.carevault.com
```

## 📊 Success Metrics

- ✅ **Setup Time**: < 5 minutes from clone to running
- ✅ **Clinical Flow**: Complete doctor→AI→PDF/QR→patient journey
- ✅ **Data Integrity**: 1:1 mapping of prescriptions to PDFs and tokens
- ✅ **AI Performance**: < 1 second response time (with caching)
- ✅ **Privacy Control**: Instant token revocation

## 🤝 Contributing

This is a proof-of-concept project. For production deployment, consider:

1. **Security Hardening**
   - Implement proper HTTPS certificates
   - Add comprehensive audit logging
   - Enhance authentication with OAuth/biometrics
   - Implement HIPAA compliance measures

2. **Scalability**
   - Migrate from SQLite to PostgreSQL
   - Add Redis for caching
   - Implement horizontal scaling
   - Add CDN for static assets

3. **Features**
   - Multi-tenant support
   - Insurance integration
   - Appointment scheduling
   - Video consultations
   - Lab results integration

## 📄 License

This POC is for demonstration purposes. Contact the team for licensing information.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **API Documentation**: http://localhost:8000/docs
- **Issues**: Create an issue in the repository

---

Built with ❤️ for better healthcare