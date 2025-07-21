#!/bin/bash

# ShopSwift Deployment Script
# This script handles the deployment of both frontend and backend components

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="shopswift-pwa"
BACKEND_DIR="server"
FRONTEND_DIR="client"
DEPLOY_ENV=${1:-production}

echo -e "${BLUE}🚀 Starting ShopSwift Deployment - Environment: ${DEPLOY_ENV}${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
echo -e "${BLUE}📋 Running pre-deployment checks...${NC}"

# Check if Node.js is installed
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if MongoDB is running (for development)
if [ "$DEPLOY_ENV" = "development" ]; then
    if ! command_exists mongod; then
        print_warning "MongoDB is not installed or not in PATH. Make sure MongoDB is running."
    fi
fi

# Check if required directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory '$BACKEND_DIR' not found!"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory '$FRONTEND_DIR' not found!"
    exit 1
fi

print_status "Pre-deployment checks passed"

# Backend deployment
echo -e "${BLUE}🔧 Deploying Backend...${NC}"

cd $BACKEND_DIR

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_warning ".env file not found. Creating from .env.example"
        cp .env.example .env
        print_warning "Please update .env file with your configuration before continuing"
        read -p "Press enter to continue after updating .env file..."
    else
        print_error ".env file not found and no .env.example available"
        exit 1
    fi
fi

# Install backend dependencies
print_info "Installing backend dependencies..."
npm ci --only=production

# Run database seeding for development
if [ "$DEPLOY_ENV" = "development" ]; then
    print_info "Seeding database with sample data..."
    if [ -f "scripts/seed.js" ]; then
        node scripts/seed.js || print_warning "Database seeding failed or skipped"
    fi
fi

# Run backend tests
if [ "$DEPLOY_ENV" != "production" ]; then
    print_info "Running backend tests..."
    npm test || print_warning "Some tests failed"
fi

print_status "Backend deployment completed"

# Frontend deployment
echo -e "${BLUE}🎨 Deploying Frontend...${NC}"

cd ../$FRONTEND_DIR

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm ci

# Run frontend tests
if [ "$DEPLOY_ENV" != "production" ]; then
    print_info "Running frontend tests..."
    npm test -- --watchAll=false || print_warning "Some tests failed"
fi

# Build frontend for production
if [ "$DEPLOY_ENV" = "production" ]; then
    print_info "Building frontend for production..."
    npm run build
    print_status "Frontend build completed"
fi

cd ..

# Start services
echo -e "${BLUE}🏃 Starting Services...${NC}"

if [ "$DEPLOY_ENV" = "development" ]; then
    print_info "Starting development servers..."
    
    # Create a simple process manager script
    cat > start_dev.sh << 'EOF'
#!/bin/bash

# Kill existing processes
pkill -f "node.*server" || true
pkill -f "react-scripts start" || true

# Start backend in background
cd server
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend in background
cd ../client
npm start &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs for later cleanup
echo $BACKEND_PID > ../backend.pid
echo $FRONTEND_PID > ../frontend.pid

echo "Development servers started!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:5000/api-docs"

# Wait for processes
wait
EOF

    chmod +x start_dev.sh
    print_status "Created development startup script: start_dev.sh"
    
elif [ "$DEPLOY_ENV" = "production" ]; then
    print_info "Starting production server..."
    
    # Create production startup script
    cat > start_prod.sh << 'EOF'
#!/bin/bash

# Kill existing processes
pkill -f "node.*server" || true

# Start backend in production mode
cd server
NODE_ENV=production npm start &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo $BACKEND_PID > ../backend.pid

echo "Production server started!"
echo "API: http://localhost:5000"
echo "API Docs: http://localhost:5000/api-docs"

# Wait for process
wait
EOF

    chmod +x start_prod.sh
    print_status "Created production startup script: start_prod.sh"
fi

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash

echo "Stopping ShopSwift services..."

# Kill processes using saved PIDs
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    kill $BACKEND_PID 2>/dev/null || true
    rm backend.pid
    echo "Backend stopped"
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    kill $FRONTEND_PID 2>/dev/null || true
    rm frontend.pid
    echo "Frontend stopped"
fi

# Fallback: kill by process name
pkill -f "node.*server" || true
pkill -f "react-scripts start" || true

echo "All services stopped"
EOF

chmod +x stop.sh

# Deployment summary
echo -e "${GREEN}🎉 Deployment Summary${NC}"
echo "=================================="
echo -e "Environment: ${YELLOW}$DEPLOY_ENV${NC}"
echo -e "Backend Directory: ${YELLOW}$BACKEND_DIR${NC}"
echo -e "Frontend Directory: ${YELLOW}$FRONTEND_DIR${NC}"
echo ""
echo -e "${BLUE}Available Scripts:${NC}"

if [ "$DEPLOY_ENV" = "development" ]; then
    echo "  ./start_dev.sh  - Start development servers"
    echo "  ./stop.sh       - Stop all services"
    echo ""
    echo -e "${BLUE}Development URLs:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo "  API Docs: http://localhost:5000/api-docs"
else
    echo "  ./start_prod.sh - Start production server"
    echo "  ./stop.sh       - Stop all services"
    echo ""
    echo -e "${BLUE}Production URLs:${NC}"
    echo "  API:      http://localhost:5000"
    echo "  API Docs: http://localhost:5000/api-docs"
    echo "  Frontend: Serve the 'client/build' directory with a web server"
fi

echo ""
echo -e "${BLUE}Next Steps:${NC}"
if [ "$DEPLOY_ENV" = "development" ]; then
    echo "1. Update server/.env with your configuration"
    echo "2. Make sure MongoDB is running"
    echo "3. Run ./start_dev.sh to start development servers"
else
    echo "1. Update server/.env with production configuration"
    echo "2. Set up MongoDB Atlas or production database"
    echo "3. Configure Stripe, Cloudinary, and email settings"
    echo "4. Set up SSL certificates and reverse proxy"
    echo "5. Run ./start_prod.sh to start production server"
    echo "6. Serve client/build directory with nginx or similar"
fi

print_status "Deployment completed successfully!"

echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "- Update environment variables"
echo "- Configure third-party services (Stripe, Cloudinary, Email)"
echo "- Set up monitoring and logging"
echo "- Configure backups for production"
echo "- Set up SSL certificates for production"