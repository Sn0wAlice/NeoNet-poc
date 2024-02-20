/**
 * This is a simple api web server
 */

const express = require('express');
const fs = require('fs');
const app = express();
const logger = require('../utils/logger');

app.use(express.json());
const routes = [];
const posts = [];

module.exports = {
    start: function (port) {
        app.listen(port, "0.0.0.0", () => {
            logger.logs(`Web server started on port ${port}`);
        });
    },
    route: function () {
        /**
         * Get all request from the path /amnesia and all sub paths
         */
        app.get('/amnesia/*', (req, res) => {
            logger.logs(`Request from ${req.ip} to ${req.path}`);

            const route = routes.find(route => route.path === req.path);
            if (route) {
                route.file(req, res);
            } else {
                res.status(404).send({
                    error: "Not found"
                });
            }
        });

        app.post('/amnesia/*', (req, res) => {
            logger.logs(`Request from ${req.ip} to ${req.path}`);

            const route = posts.find(route => route.path === req.path);
            if (route) {
                route.file(req, res);
            } else {
                res.status(404).send({
                    error: "Not found"
                });
            }
        });
    },
    loadRoutes: function () {
        this.readDirSync('./web/routes', true);
        logger.logs(`Loaded ${routes.length} web routes`);
        this.readDirSync("./web/posts", false);
        logger.logs(`Loaded ${posts.length} web posts`);
    },
    readDirSync(path, get=true) {
        const fileList = [];
        const folders = [];
        const files = fs.readdirSync(path);
        files.forEach(file => {
            // if folder, call function recursively
            if (fs.statSync(path + '/' + file).isDirectory()) {
                folders.push({
                    folder: file,
                    files: this.readDirSync(path + '/' + file, get)
                });   
            } else {
                fileList.push(path + '/' + file);
                (get ? routes : posts).push({
                    path: path.replace("./web/", "/").replace("/routes/", "/amnesia/").replace("/posts/", "/amnesia/") + '/' + file.replace(".js", ""),
                    file: require(path.replace("/web/", "/") + '/' + file)
                });
            }
        });
        return {
            path: path,
            files: fileList,
            folders: folders
        };
    },
    async checkUp(hostname) {
        const res = await fetch(`${hostname}/amnesia/hostname/checkUp`);
        const data = await res.json();
        if (data.status === "up") {
            logger.logs(`Hostname ${hostname} is up`);
            return true;
        } 
        logger.error(`Hostname ${hostname} is down`);
        return false;
    }
}