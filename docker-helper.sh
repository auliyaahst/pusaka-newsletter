#!/bin/bash

# Pusaka Newsletter Docker Helper Script
# Provides convenient commands for Docker operations

set -e

COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="pusaka-newsletter"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_help() {
    print_header "Pusaka Newsletter Docker Helper"
    echo ""
    echo "Usage: ./docker-helper.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start        - Start all services (with logs)"
    echo "  start-bg     - Start all services in background"
    echo "  stop         - Stop all services"
    echo "  restart      - Restart all services"
    echo "  rebuild      - Rebuild and start (after package.json changes)"
    echo "  logs         - View logs from all services"
    echo "  logs-app     - View logs from app only"
    echo "  logs-db      - View logs from database only"
    echo "  shell        - Open shell in app container"
    echo "  db-shell     - Open PostgreSQL shell"
    echo "  migrate      - Run Prisma migrations"
    echo "  studio       - Open Prisma Studio"
    echo "  check-db     - Test database connection"
    echo "  check-payments - View payment records"
    echo "  clean        - Stop and remove all containers/volumes"
    echo "  status       - Show container status"
    echo "  help         - Show this help message"
    echo ""
}

case "$1" in
    start)
        print_header "Starting Pusaka Newsletter"
        docker-compose -f $COMPOSE_FILE up
        ;;
    
    start-bg)
        print_header "Starting Pusaka Newsletter (background)"
        docker-compose -f $COMPOSE_FILE up -d
        print_success "Services started!"
        echo ""
        echo "Access your app at: http://localhost:3000"
        echo "View logs with: ./docker-helper.sh logs"
        ;;
    
    stop)
        print_header "Stopping Services"
        docker-compose -f $COMPOSE_FILE down
        print_success "Services stopped!"
        ;;
    
    restart)
        print_header "Restarting Services"
        docker-compose -f $COMPOSE_FILE restart
        print_success "Services restarted!"
        ;;
    
    rebuild)
        print_header "Rebuilding Services"
        docker-compose -f $COMPOSE_FILE up --build
        ;;
    
    logs)
        print_header "Viewing Logs (Ctrl+C to exit)"
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    
    logs-app)
        print_header "Viewing App Logs (Ctrl+C to exit)"
        docker-compose -f $COMPOSE_FILE logs -f app
        ;;
    
    logs-db)
        print_header "Viewing Database Logs (Ctrl+C to exit)"
        docker-compose -f $COMPOSE_FILE logs -f postgres
        ;;
    
    shell)
        print_header "Opening Shell in App Container"
        docker-compose -f $COMPOSE_FILE exec app sh
        ;;
    
    db-shell)
        print_header "Opening PostgreSQL Shell"
        docker-compose -f $COMPOSE_FILE exec postgres psql -U postgres -d pusaka_newsletter
        ;;
    
    migrate)
        print_header "Running Prisma Migrations"
        docker-compose -f $COMPOSE_FILE exec app npx prisma migrate dev
        print_success "Migrations complete!"
        ;;
    
    studio)
        print_header "Opening Prisma Studio"
        echo "Prisma Studio will open at: http://localhost:5555"
        docker-compose -f $COMPOSE_FILE exec app npx prisma studio
        ;;
    
    check-db)
        print_header "Testing Database Connection"
        docker-compose -f $COMPOSE_FILE exec app npx tsx scripts/test-database.ts
        ;;
    
    check-payments)
        print_header "Checking Payment Records"
        docker-compose -f $COMPOSE_FILE exec app npx tsx scripts/check-payments.ts
        ;;
    
    clean)
        print_header "Cleaning Up Docker Resources"
        print_warning "This will remove all containers and volumes!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            docker-compose -f $COMPOSE_FILE down -v
            print_success "Cleanup complete!"
        else
            print_warning "Cleanup cancelled"
        fi
        ;;
    
    status)
        print_header "Container Status"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    
    help|--help|-h|"")
        show_help
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
