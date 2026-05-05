var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
/** GitHub Pages: deep links serve 404.html; copy SPA shell so client routing works */
function spa404() {
    return {
        name: 'spa-404-copy',
        closeBundle: function () {
            var idx = path.resolve(__dirname, 'dist/index.html');
            var dest = path.resolve(__dirname, 'dist/404.html');
            fs.copyFileSync(idx, dest);
        },
    };
}
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), '');
    var base = env.VITE_BASE_PATH ||
        (mode === 'production' ? '/kds-soccer/' : '/');
    return {
        base: base,
        plugins: __spreadArray([react()], (mode === 'production' ? [spa404()] : []), true),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },
    };
});
