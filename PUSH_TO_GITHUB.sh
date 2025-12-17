#!/bin/bash

# IdeaFlux - Push to GitHub Script
# This script will help you push your project to GitHub

echo "🚀 IdeaFlux - GitHub Push Script"
echo "=================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "❌ Please run this script from the IdeaFlux root directory"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Step 1: Configure Git
echo "Step 1: Configure Git"
echo "====================="
read -p "Enter your GitHub username: " github_username
read -p "Enter your GitHub email: " github_email

git config --global user.name "$github_username"
git config --global user.email "$github_email"

echo "✅ Git configured"
echo ""

# Step 2: Initialize Git Repository
echo "Step 2: Initialize Git Repository"
echo "=================================="

if [ -d ".git" ]; then
    echo "⚠️  Git repository already exists"
else
    git init
    echo "✅ Git repository initialized"
fi

echo ""

# Step 3: Add Files
echo "Step 3: Adding Files"
echo "===================="
git add .
echo "✅ Files added to staging area"
echo ""

# Step 4: Create Initial Commit
echo "Step 4: Creating Initial Commit"
echo "==============================="
git commit -m "Initial commit: IdeaFlux social media platform"
echo "✅ Initial commit created"
echo ""

# Step 5: Add Remote Repository
echo "Step 5: Add Remote Repository"
echo "============================="
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/ideaflux.git): " repo_url

git remote add origin "$repo_url"
echo "✅ Remote repository added"
echo ""

# Step 6: Push to GitHub
echo "Step 6: Push to GitHub"
echo "====================="
git branch -M main
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your project is now on GitHub!"
    echo ""
    echo "Repository URL: $repo_url"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Add a description and topics"
    echo "3. Enable GitHub Pages (if needed)"
    echo "4. Set up branch protection rules"
    echo "5. Deploy your application"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your credentials and try again"
    exit 1
fi
