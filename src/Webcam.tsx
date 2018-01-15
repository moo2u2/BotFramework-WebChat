import * as React from 'react';
import { ChatState, FormatState, SizeState } from './Store';
import { Dispatch, connect } from 'react-redux';
import { classList } from './Chat';
import * as konsole from './Konsole';
import { picTaken } from './Store';

export interface WebcamProps {
    shown: boolean,
    picTaken: (inputText: string) => void,
}

export class WebcamView extends React.Component<WebcamProps, {}> {
    private container: HTMLDivElement;
    private video: HTMLVideoElement;
    private stream: MediaStream = null;

    constructor(props: WebcamProps) {
        super(props);
        this.start();
    }
    
    start() {               
        if (this.stream == null && navigator.mediaDevices) {
            konsole.log("Getting media");
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => { this.startStream(stream) })
                .catch(function(error) {
                    konsole.log('Could not access the camera. Error: ' + JSON.stringify(error));
                });
        }
    }
    
    private startStream(stream : MediaStream) {
        konsole.log("Starting stream");
        this.stream = stream;
        this.video.src = window.URL.createObjectURL(this.stream);
        konsole.log("Setting video source to: " + this.video.src);
    }
    
    private takeSnapshot() {
        var img = document.createElement('img');
        var context;
        var width = this.video.offsetWidth, height = this.video.offsetHeight;

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext('2d');
        context.drawImage(this.video, 0, 0, width, height);

        this.props.picTaken(canvas.toDataURL('image/png'));
    }
    
    render() {
        konsole.log("Webcam props", this);

        const camClassName = classList(
            'webcam', 
            this.props.shown && 'active',
            !this.props.shown && 'inactive'
        );

        return (
            <div
                ref={ div => this.container = div || this.container }
                className={ camClassName }
                tabIndex={ 0 }
            >
                <video 
                    ref={ video => this.video = video || this.video }
                    onClick={ () => this.takeSnapshot() }
                >Your browser doesn't support the video tag.  Might be time for an upgrade.</video>
                <p>Click the video to take a picture</p>
            </div>
        );
    }
}

export const Webcam = connect(
    (state: ChatState) => ({
        shown: state.camera.shown,
        locale: state.format.locale,
        user: state.connection.user,
    }), {
        picTaken
    }, (stateProps: any, dispatchProps: any, ownProps: any): WebcamProps => ({
        picTaken: (image: string) => dispatchProps.picTaken(image, stateProps.user, stateProps.locale),
        shown: stateProps.shown
    }), {
        withRef: true
    }
)(WebcamView);
