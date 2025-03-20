#!/bin/bash

# SRACOM_COMPTA_MANAGEMENT Development Setup Script
# This script helps set up and run the application for local development

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SRACOM_COMPTA_MANAGEMENT Development Setup ===${NC}"
echo "This script will help you set up and run the application locally."

# Check if .env file exists in server directory
if [ ! -f "./server/.env" ]; then
  echo -e "${YELLOW}Creating .env file in server directory...${NC}"
  cat > ./server/.env << EOL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sracom_compta?schema=public"
JWT_SECRET="your-super-secret-key-change-in-production"
PORT=3001
EOL
  echo -e "${GREEN}Created .env file in server directory.${NC}"
else
  echo -e "${GREEN}.env file already exists in server directory.${NC}"
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if PostgreSQL is running
check_postgres() {
  echo -e "${YELLOW}Checking if PostgreSQL is running...${NC}"
  if command_exists pg_isready; then
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
      echo -e "${GREEN}PostgreSQL is running.${NC}"
      return 0
    else
      echo -e "${RED}PostgreSQL is not running. Please start PostgreSQL and try again.${NC}"
      return 1
    fi
  else
    echo -e "${YELLOW}pg_isready command not found. Assuming PostgreSQL is running.${NC}"
    return 0
  fi
}

# Install dependencies
install_dependencies() {
  echo -e "${YELLOW}Installing server dependencies...${NC}"
  cd server && npm install
  echo -e "${GREEN}Server dependencies installed.${NC}"

  echo -e "${YELLOW}Installing client dependencies...${NC}"
  cd ../client && npm install
  echo -e "${GREEN}Client dependencies installed.${NC}"

  cd ..
}

# Setup database
setup_database() {
  echo -e "${YELLOW}Setting up database...${NC}"
  cd server

  echo -e "${YELLOW}Running Prisma migrations...${NC}"
  npx prisma migrate dev --name init

  echo -e "${YELLOW}Seeding database...${NC}"
  npx prisma db seed

  cd ..
  echo -e "${GREEN}Database setup complete.${NC}"
}

# Start the application
start_application() {
  echo -e "${YELLOW}Starting the application...${NC}"
  
  # Start the backend in a new terminal
  echo -e "${YELLOW}Starting the backend...${NC}"
  if command_exists gnome-terminal; then
    gnome-terminal -- bash -c "cd server && npm run start:dev; exec bash"
  elif command_exists xterm; then
    xterm -e "cd server && npm run start:dev" &
  elif command_exists cmd.exe; then
    start cmd.exe /k "cd server && npm run start:dev"
  else
    echo -e "${RED}Could not open a new terminal. Please start the backend manually:${NC}"
    echo -e "cd server && npm run start:dev"
  fi
  
  # Start the frontend in a new terminal
  echo -e "${YELLOW}Starting the frontend...${NC}"
  if command_exists gnome-terminal; then
    gnome-terminal -- bash -c "cd client && npm run dev; exec bash"
  elif command_exists xterm; then
    xterm -e "cd client && npm run dev" &
  elif command_exists cmd.exe; then
    start cmd.exe /k "cd client && npm run dev"
  else
    echo -e "${RED}Could not open a new terminal. Please start the frontend manually:${NC}"
    echo -e "cd client && npm run dev"
  fi
  
  echo -e "${GREEN}Application started.${NC}"
  echo -e "${GREEN}Backend running at: http://localhost:3001${NC}"
  echo -e "${GREEN}Frontend running at: http://localhost:3000${NC}"
}

# Main script
main() {
  if check_postgres; then
    install_dependencies
    setup_database
    start_application
    
    echo -e "${GREEN}=== Setup Complete ===${NC}"
    echo -e "You can now access the application at ${GREEN}http://localhost:3000${NC}"
    echo -e "API is available at ${GREEN}http://localhost:3001${NC}"
    echo -e "\nTest users:"
    echo -e "  Super Admin: ${YELLOW}superadmin@example.com${NC} / ${YELLOW}password123${NC}"
    echo -e "  Admin: ${YELLOW}admin@example.com${NC} / ${YELLOW}password123${NC}"
    echo -e "  Employee: ${YELLOW}employee@example.com${NC} / ${YELLOW}password123${NC}"
    echo -e "\nSee ${GREEN}TESTING_GUIDE.md${NC} for more details on testing the application."
  else
    echo -e "${RED}Setup failed. Please fix the issues and try again.${NC}"
    exit 1
  fi
}

# Run the main function
main
