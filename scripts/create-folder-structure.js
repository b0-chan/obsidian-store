const fs = require("fs");
const path = require("path");

// Base directory for the knowledge base
const BASE_DIR = path.join(__dirname, "./structure");

// Function to create a folder and write an index.md file
const createFolder = (folderPath, indexContent) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, {recursive: true});
    }
    const indexPath = path.join(folderPath, "index.md");
    if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, indexContent, "utf8");
    }
};

// High-level folder structure
const structure = [
    {folder: "notes", content: "# notes\n\nTemporary or uncategorized notes."},
    {folder: "topics", content: "# topics\n\nCentralized knowledge by subject."},
    {folder: "goals", content: "# goals\n\nPersonal and professional objectives."},
    {folder: "processes", content: "# processes\n\nDocumented workflows and routines."},
    {
        folder: "projects",
        content: "# projects\n\nActive and completed project documentation.",
    },
    {folder: "work", content: "# work\n\nnotes related to your job or career."},
    {folder: "tools", content: "# tools\n\nDocumentation about tools and frameworks."},
    {
        folder: "resources",
        content: "# resources\n\nExternal links, articles, books, and videos.",
    },
    {folder: "archive", content: "# archive\n\nOutdated or unused notes."},
];

// Create base directory if it doesn't exist
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, {recursive: true});
}

// Generate folder structure
structure.forEach(({folder, content}) => {
    const folderPath = path.join(BASE_DIR, folder);
    createFolder(folderPath, content);
});

console.log("Knowledge base folder structure created or updated successfully.");
