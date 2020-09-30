import React, { useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/src/styles.scss';
import ProgressBar from 'react-bootstrap/ProgressBar'
/**
 * This File Shows the Input of Audio File .
 * @param {*} props 
 */
const AudioCard = (props) => {
    let [uploading, setUploading] = useState(false);

    const listOfExtension = "audio/* "
    const requestUpload = (e) => {
        const file = e.target.files[0];
        var metadata = {
            contentType: file.type
        };
        let uploadPath = props.id + "/" + file.name +"/"
        console.log("path sent from audio:", uploadPath)
        props.typeAPI.requestUpload(uploadPath, file, metadata, (uploadStatus) => {
            console.log(uploadStatus)
            if (uploadStatus === "complete") {
                setUploading("uploaded")
                props.typeAPI.requestDownload(
                    uploadPath,
                    (url, metadata) => props.typeAPI.saveContent(props.id, { url: url, metadata: metadata })
                )
            }
            else {
                setUploading(uploadStatus)
            }
        })
    }

    return (
        <div>

            {
                (typeof uploading === "number") ? 
                <ProgressBar animated now={uploading} label={`${Math.floor(uploading)}%`}></ProgressBar>  
                : null
            }
            <input
                type="file"
                accept={listOfExtension}
                onChange={(e) => requestUpload(e)}
            />
            { props.content.url ?
                <div key={props.content.metadata.name}>
                    File Name : {props.content.metadata.name}
                    <AudioPlayer
                        src={props.content.url}
                        showDownloadProgress="false"
                        preload="metadata"
                    />
                </div>
                : null
            }
        </div>

    )
}
export default React.memo(AudioCard);