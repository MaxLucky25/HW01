"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.get('/videos', (req, res) => {
    res.status(200).json(db_1.db.videos);
});
exports.app.post('/videos', (req, res) => {
    const { title, author, availableResolutions } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push({ message: 'Title is required and must be a non-empty string', field: 'title' });
    }
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push({ message: 'Author is required and must be a non-empty string', field: 'author' });
    }
    if (!Array.isArray(availableResolutions) || availableResolutions.length === 0) {
        errors.push({ message: 'Available resolutions must be a non-empty array', field: 'availableResolutions' });
    }
    if (errors.length > 0) {
        res.status(400).json({ errorsMessages: errors });
        return;
    }
    const newVideo = {
        id: db_1.db.videos.length ? db_1.db.videos[db_1.db.videos.length - 1].id + 1 : 1,
        title,
        author,
        canBeDownloaded: false, // По умолчанию false, как в документации
        minAgeRestriction: null, // По умолчанию null
        createdAt: new Date().toISOString(),
        publicationDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // По умолчанию +1 день
        availableResolutions,
    };
    db_1.db.videos.push(newVideo);
    res.status(201).json(newVideo);
});
// Получить видео по ID
exports.app.get('/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id, 10);
    const video = db_1.db.videos.find(v => v.id === videoId);
    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    res.status(200).json(video);
});
exports.app.put('/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id, 10);
    const videoIndex = db_1.db.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    const { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body;
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push({ message: 'Title is required and must be a non-empty string', field: 'title' });
    }
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push({ message: 'Author is required and must be a non-empty string', field: 'author' });
    }
    if (!Array.isArray(availableResolutions) || availableResolutions.length === 0) {
        errors.push({ message: 'Available resolutions must be a non-empty array', field: 'availableResolutions' });
    }
    if (minAgeRestriction !== null && (typeof minAgeRestriction !== 'number' || minAgeRestriction < 1 || minAgeRestriction > 18)) {
        errors.push({ message: 'minAgeRestriction must be null or a number between 1 and 18', field: 'minAgeRestriction' });
    }
    if (errors.length > 0) {
        res.status(400).json({ errorsMessages: errors });
        return;
    }
    const updatedVideo = Object.assign(Object.assign({}, db_1.db.videos[videoIndex]), { title,
        author,
        availableResolutions, canBeDownloaded: canBeDownloaded || db_1.db.videos[videoIndex].canBeDownloaded, minAgeRestriction: minAgeRestriction || db_1.db.videos[videoIndex].minAgeRestriction, publicationDate: publicationDate || db_1.db.videos[videoIndex].publicationDate });
    db_1.db.videos[videoIndex] = updatedVideo;
    res.status(204).send();
});
exports.app.delete('/videos/:id', (req, res) => {
    const videoId = parseInt(req.params.id, 10);
    const videoIndex = db_1.db.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }
    db_1.db.videos.splice(videoIndex, 1);
    res.status(204).send();
});
exports.app.delete('/testing/all-data', (req, res) => {
    db_1.db.videos = [];
    res.status(204).send();
});
