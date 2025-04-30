#!/bin/bash

# Automatically detect and install all project dependencies
# 1. If 'requirements.txt' exists, install using pip
if [ -f requirements.txt ]; then
    echo "Installing Python dependencies from requirements.txt..."
    pip install -r requirements.txt
fi

# 2. If 'environment.yml' exists (commonly for conda setups)
if [ -f environment.yml ]; then
    echo "Creating conda environment from environment.yml..."
    conda env create -f environment.yml
fi

# 3. If 'package.json' exists, install Node.js dependencies
if [ -f package.json ]; then
    echo "Installing Node.js dependencies from package.json..."
    npm install
fi

# 4. If 'pyproject.toml' exists (for Poetry or modern Python projects)
if [ -f pyproject.toml ]; then
    echo "Installing using pyproject.toml..."
    if command -v poetry &> /dev/null; then
        poetry install
    else
        echo "Poetry is not installed. Please install Poetry first."
    fi
fi

# 5. If you are using pipenv
if [ -f Pipfile ]; then
    echo "Installing using Pipenv..."
    pipenv install
fi

# Summary
echo "Dependency installation process completed." 