const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, 'server.js'),  // Ensure the entry point is correctly resolved
    output: {
        path: path.resolve(__dirname, 'dist'),    // Use absolute path for output directory
        publicPath: '/',
        filename: 'final.js',
    },
    target: 'node',
    resolve: {
        extensions: ['.js', '.json'],  // Resolve .js and .json files by default
    },
};