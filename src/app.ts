import express, { Request, Response } from 'express';
import cors from 'cors';
import { db, Video } from './db';


 const app = express();
app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
    let helloMessage = "Hello incubator. I could make it"
    res.send(helloMessage)

})
app.get('/videos', (req: Request, res: Response) => {
    res.status(200).json(db.videos);
});
app.post('/videos', (req: Request, res: Response) => {
    const { title, author, availableResolutions } = req.body;

    const errors: { message: string; field: string }[] = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push({ message: 'Title is required and must be a non-empty string', field: 'title' });
    } else if (title.length > 40) {
        errors.push({ message: 'Title must be no longer than 40 characters', field: 'title' });
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

    const newVideo: Video = {
        id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
        title,
        author,
        canBeDownloaded: false, // По умолчанию false, как в документации
        minAgeRestriction: null, // По умолчанию null
        createdAt: new Date().toISOString(),
        publicationDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // По умолчанию +1 день
        availableResolutions,
    };

    db.videos.push(newVideo);
    res.status(201).json(newVideo);
});
app.get('/videos/:id', (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id, 10);
    const video = db.videos.find(v => v.id === videoId);

    if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }

    res.status(200).json(video);
});
app.put('/videos/:id', (req: Request, res: Response) => {
    const videoId = parseInt(req.params.id, 10);
    const videoIndex = db.videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
        res.status(404).json({ message: 'Video not found' });
        return;
    }

    const { title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate } = req.body;

    const errors: { message: string; field: string }[] = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0 || title.length > 40) {
        errors.push({ message: 'Title is required, must be a non-empty string, and max 40 characters', field: 'title' });
    }
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push({ message: 'Author is required and must be a non-empty string', field: 'author' });
    } else if (author.length > 20) {
        errors.push({ message: 'Author must be no longer than 20 characters', field: 'author' });
    }
    if (publicationDate && isNaN(Date.parse(publicationDate))) {
        errors.push({ message: 'Publication date must be a valid date', field: 'publicationDate' });
    }
    if (!Array.isArray(availableResolutions) || availableResolutions.length === 0) {
        errors.push({ message: 'Available resolutions must be a non-empty array', field: 'availableResolutions' });
    }
    if (minAgeRestriction !== null && (typeof minAgeRestriction !== 'number' || minAgeRestriction < 1 || minAgeRestriction > 18)) {
        errors.push({ message: 'minAgeRestriction must be null or a number between 1 and 18', field: 'minAgeRestriction' });
    }
    if (typeof canBeDownloaded !== 'boolean') {
        errors.push({ message: 'canBeDownloaded must be a boolean', field: 'canBeDownloaded' });
    }





    if (errors.length > 0) {
        res.status(400).json({ errorsMessages: errors });
        return;
    }

    const updatedVideo: Video = {
        ...db.videos[videoIndex],
        title,
        author,
        availableResolutions,
        canBeDownloaded: canBeDownloaded || db.videos[videoIndex].canBeDownloaded,
        minAgeRestriction: minAgeRestriction || db.videos[videoIndex].minAgeRestriction,
        publicationDate: publicationDate || db.videos[videoIndex].publicationDate,
    };

    db.videos[videoIndex] = updatedVideo;
    res.status(204).send();
});
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
app.delete('/testing/all-data', (req: Request, res: Response) => {

    db.videos = [];

    res.status(204).send();
});

export default app;