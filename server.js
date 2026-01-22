/**
 * Simple development server for testing locally
 * Run with: node server.js
 */

import 'dotenv/config';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
};

// Import API handlers
import companyDataHandler from './api/company-data.js';
import analyzeHandler from './api/analyze.js';
import findVendorsHandler from './api/find-vendors.js';

const server = createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Handle API routes
    if (req.url.startsWith('/api/')) {
        return handleApiRoute(req, res);
    }

    // Serve static files
    let filePath = join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    try {
        const content = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('404 Not Found');
        } else {
            res.writeHead(500);
            res.end('500 Internal Server Error');
        }
    }
});

async function handleApiRoute(req, res) {
    // Parse URL and query params
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Parse body for POST requests
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        await new Promise(resolve => req.on('end', resolve));
        try {
            req.body = JSON.parse(body);
        } catch (e) {
            req.body = {};
        }
    }

    // Parse query params
    req.query = Object.fromEntries(url.searchParams);

    // Create Vercel-compatible response wrapper
    const vercelRes = {
        statusCode: 200,
        headers: {},
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.headers['Content-Type'] = 'application/json';
            res.writeHead(this.statusCode, this.headers);
            res.end(JSON.stringify(data));
        },
        end() {
            res.writeHead(this.statusCode, this.headers);
            res.end();
        }
    };

    // Route to appropriate handler
    try {
        if (pathname === '/api/company-data') {
            await companyDataHandler(req, vercelRes);
        } else if (pathname === '/api/analyze') {
            await analyzeHandler(req, vercelRes);
        } else if (pathname === '/api/find-vendors') {
            await findVendorsHandler(req, vercelRes);
        } else {
            vercelRes.status(404).json({ error: 'API endpoint not found' });
        }
    } catch (error) {
        console.error('API Error:', error);
        vercelRes.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

server.listen(PORT, () => {
    console.log(`\n🚀 AnalyzoBot development server running!`);
    console.log(`\n   Local: http://localhost:${PORT}`);
    console.log(`\n📝 Don't forget to set up your .env file with API keys!\n`);
});
