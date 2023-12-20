const path = require('path');

module.exports = {
    entry: './script.js', // Path to your main JavaScript file
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'main.js' // Output file name
    },
    // Add other configurations like loaders, plugins, etc.
};
