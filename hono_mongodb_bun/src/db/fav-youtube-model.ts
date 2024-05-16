import { Schema, model } from "mongoose";

export interface IFavYoutubeVideoSchema {
    title: string;
    description: string;
    thumbnailUrl?: string;
    watched: boolean;
    youtuberName: string;
}

const FavYoutubeVideoSchema = new Schema<IFavYoutubeVideoSchema>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: "https://img.freepik.com/free-vector/gradient-music-festival-twitch-background_23-2150610130.jpg?size=626&ext=jpg",
        required: false
    },
    watched: {
        type: Boolean,
        default: false,
        required: true
    },
    youtuberName: {
        type: String,
        required: true
    }
})

const FavYoutubeVideosModel = model("fav-youtube-videos", FavYoutubeVideoSchema);

export default FavYoutubeVideosModel;