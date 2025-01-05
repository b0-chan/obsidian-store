# Variables
BASE_DIR := knowledge-base
SCRIPTS_DIR := scripts
NODE := node

# Default target: create knowledge base
all: create-kb

# Target to create the folder structure
create-folder-structure:
	@echo "Creating folder structure"
	$(NODE) $(SCRIPTS_DIR)/create-folder-structure.js

lint:
	@echo "Linting Markdown files..."
	npx markdownlint "**/*.md"

# Help menu
help:
	@echo "Usage:"
	@echo "  make create-kb      - Create knowledge base structure"