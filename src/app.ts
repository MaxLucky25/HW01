import express, { Request, Response } from 'express';
import cors from 'cors';
import { db, Video } from './db';

const app = express();
app.use(express.json());
app.use(cors());

const validResolutions = ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"];

// Проверка, что все элементы массива resolutions являются допустимыми значениями
const isValidResolutions = (resolutions: string[]): boolean => {
    return resolutions.every(res => validResolutions.includes(res));
};

// Проверка, что дата является валидной
const isValidDate = (date: string): boolean => {
    return !isNaN(Date.parse(date));
};

// Получить все видео
app.get('/videos', (req: Request, res: Response) => {
    res.status(200).json(db.videos);
});

// Создать новое видео
app.post('/videos', (req: Request, res: Response) => {
    const { title, author, availableResolutions } = req.body;

    const errors: { message: string; field: string }[] = [];

    // Проверка title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push({ message: 'Title is required and must be a non-empty string', field: 'title' });
    } else if (title.length > 40) {
        errors.push({ message: 'Title must be no longer than 40 characters', field: 'title' });
    }

    // Проверка author
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push({ message: 'Author is required and must be a non-empty string', field: 'author' });
    } else if (author.length > 20) {
        errors.push({ message: 'Author must be no longer than 20 characters', field: 'author' });
    }

    // Проверка availableResolutions
    if (!Array.isArray(availableResolutions) || availableResolutions.length === 0) {
        errors.push({ message: 'Available resolutions must be a non-empty array', field: 'availableResolutions' });
    } else if (!isValidResolutions(availableResolutions)) {
        errors.push({ message: 'Available resolutions contain invalid values', field: 'availableResolutions' });
    }

    // Если есть ошибки, возвращаем их
    if (errors.length > 0) {
        res.status(400).json({ errorsMessages: errors });
        return;
    }

    // Создаем новое видео
    const newVideo: Video = {
        id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
        title,
        author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: new Date().toISOString(),
        publicationDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        availableResolutions,
    };

    db.videos.push(newVideo);
    res.status(201).json(newVideo);
});

// Получить видео по ID
app.get('/videos/:id', (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id, 10);
    const video = db.videos.find(v => v.id === videoId);

    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }

    res.status(200).json(video);
});

// Обновить видео по ID
app.put('/videos/:id', (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id, 10);
    const videoIndex = db.videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }

    const { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body;
    const errors: { message: string; field: string }[] = [];

    // Проверка title
    if (typeof title !== 'string' || title.trim().length === 0 || title.length > 40) {
        errors.push({ message: 'Title is required, must be a non-empty string, and max 40 characters', field: 'title' });
    }

    // Проверка author
    if (typeof author !== 'string' || author.trim().length === 0 || author.length > 20) {
        errors.push({ message: 'Author is required and must be a non-empty string, max 20 characters', field: 'author' });
    }

    // Проверка availableResolutions
    if (!Array.isArray(availableResolutions) || availableResolutions.length === 0) {
        errors.push({ message: 'Available resolutions must be a non-empty array', field: 'availableResolutions' });
    } else if (!isValidResolutions(availableResolutions)) {
        errors.push({ message: 'Available resolutions contain invalid values', field: 'availableResolutions' });
    }

    // Проверка canBeDownloaded (если передан)
    if (canBeDownloaded !== undefined && typeof canBeDownloaded !== 'boolean') {
        errors.push({ message: 'canBeDownloaded must be a boolean', field: 'canBeDownloaded' });
    }

    // Проверка minAgeRestriction (если передан)
    if (minAgeRestriction !== undefined && (typeof minAgeRestriction !== 'number' || minAgeRestriction < 1 || minAgeRestriction > 18)) {
        errors.push({ message: 'minAgeRestriction must be a number between 1 and 18', field: 'minAgeRestriction' });
    }

    // Проверка publicationDate (должен быть строкой и валидной датой)
    if (publicationDate !== undefined) {
        if (typeof publicationDate !== 'string' || !isValidDate(publicationDate)) {
            errors.push({ message: 'Publication date must be a valid string date', field: 'publicationDate' });
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ errorsMessages: errors });
        return;
    }

    // Обновляем видео
    db.videos[videoIndex] = {
        ...db.videos[videoIndex],
        title,
        author,
        availableResolutions,
        canBeDownloaded: canBeDownloaded ?? db.videos[videoIndex].canBeDownloaded,
        minAgeRestriction: minAgeRestriction ?? db.videos[videoIndex].minAgeRestriction,
        publicationDate: publicationDate ?? db.videos[videoIndex].publicationDate,
    };

    res.status(204).send();
});


// Удалить видео по ID
app.delete('/videos/:id', (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id, 10);
    const videoIndex = db.videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }

    db.videos.splice(videoIndex, 1);
    res.status(204).send();
});

// Удалить все данные (для тестирования)
app.delete('/testing/all-data', (req: Request, res: Response) => {
    db.videos = [];
    res.status(204).send();
});

export default app;