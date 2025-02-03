export type Video = {
    id: number;
    title: string;
    author: string;
    canBeDownloaded: boolean;
    minAgeRestriction: null;
    createdAt: string;
    publicationDate: string;
    availableResolutions: string[];
};

export type DBType = {
    videos: Video[];
};

export const db: DBType = {
    videos: [{
        id: 1,
        title: "My First Video",
        author: "John Doe",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: (new Date().toISOString()),
        publicationDate: new Date().toISOString(),
        availableResolutions: ["P144", "P240", "P360"]
    }],
};
