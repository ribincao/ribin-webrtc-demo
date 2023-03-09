'use strict';

/*   -button-   */
const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const exitButton = document.getElementById("exitButton");

callButton.disable = true;
exitButton.disable = true;

startButton.addEventListener("click", startAction)
callButton.addEventListener("click", callAction)
exitButton.addEventListener("click", exitAction)

function startAction() {
    startButton.disable = true;
    navigator.mediaDevices.getUserMedia({video: true})
        .then(getLocalMediaStream).catch(handleLocalMediaStreamError)
}

function callAction() {
    callButton.disable = true;
    exitButton.disable = false;
    startTime = window.performance.now();

    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();
    if (videoTracks.length > 0) {
        console.debug("Using Video Device");
    }
    if (audioTracks.length > 0) {
        console.debug("Using Auido Device");
    }

    const servers = null;
    localPeerConnection = new RTCPeerConnection(servers);
    localPeerConnection.addEventListener("icecandidate", handleConnection);
    localPeerConnection.addEventListener("iceconnectionstatechange", handleConnectionChanges);

    remotePeerConnection = new RTCPeerConnection(servers);
    remotePeerConnection.addEventListener("icecandidate", handleConnection);
    remotePeerConnection.addEventListener("iceconnectionstatechange", handleConnectionChanges);
    remotePeerConnection.addEventListener("addstream", getRemoteMediaStream);

    localPeerConnection.addStream(localStream);
    localPeerConnection.createOffer({offerToReceiveVideo: 1})
        .then(createdOffer).catch(setSessionDescriptionError);

}

function exitAction() {
    localPeerConnection.close();
    remotePeerConnection.close();

    localPeerConnection = null;
    remotePeerConnection = null;

    exitButton.disable = true;
    callButton.disable = false;
    console.log("ending");
}

/*   -stream-   */
let localStream;
let remoteStream;
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

function getLocalMediaStream(stream) {
    console.log("stream", stream, )
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disable = false;
}
function getRemoteMediaStream(event) {
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
    console.log("Remote peer connection received remote stream");
}

/*   -connection-   */
let startTime = null;
let localPeerConnection;
let remotePeerConnection;

function getPeerName(peerConnection) {
    return (peerConnection === localPeerConnection) ? "local" : "remote"
}
function getOtherPeer(peerConnection) {
    return (peerConnection === localPeerConnection) ? remotePeerConnection : localPeerConnection
}
function createdOffer(desc) {
    localPeerConnection.setLocalDescription(desc)
        .then(() => {setLocalDescriptionSuccess(localPeerConnection);})
        .catch(setSessionDescriptionError);

    remotePeerConnection.setRemoteDescription(desc)
        .then(() => {setRemoteDescriptionSuccess(remotePeerConnection);})
        .catch(setSessionDescriptionError);
    
    remotePeerConnection.createAnswer()
        .then(createdAnswer)
        .catch(setSessionDescriptionError)
}
function createdAnswer(desc) {
    remotePeerConnection.setLocalDescription(desc)
        .then(() => {setLocalDescriptionSuccess(remotePeerConnection);})
        .catch(setSessionDescriptionError);

    localPeerConnection.setRemoteDescription(desc)
        .then(() => {setRemoteDescriptionSuccess(localPeerConnection);})
        .catch(setSessionDescriptionError);
}


/*   -handler-   */
function setLocalDescriptionSuccess(peerConnection) {
    setDescriptionSuccess(peerConnection, "local");
}
function setRemoteDescriptionSuccess(peerConnection) {
    setDescriptionSuccess(peerConnection, "remote");
}
function setDescriptionSuccess(peerConnection, tag) {
    const peerName = getPeerName(peerConnection);
    console.log(peerName, "setDescriptionSuccess");
}
function setSessionDescriptionError() {
    console.error("setSessionDescriptionError");
}
function handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
        const newIceCandidate = new RTCIceCandidate(iceCandidate);
        const otherPeer = getOtherPeer(peerConnection);
        
        otherPeer.addIceCandidate(newIceCandidate)
            .then(() => {handleConnectionSuccess(peerConnection);})
            .catch((error) => {handleConnectionFailure(peerConnection, error);})
    }
}
function handleConnectionSuccess(peerConnection) {
    console.log("add icecandidate success");
}
function handleConnectionFailure(peerConnection, error) {
    console.error("failed to add ICE candidate error:", error);
}
function handleConnectionChanges(event) {
    const peerConnection = event.target;
    console.log("Ice state change event: ", event);
}
function handleLocalMediaStreamError(error) {
    console.error("getLocalStreamMedia error: ", error )
}


// navigator.mediaDevices.getUserMedia({video: true}).then(getLocalMediaStream).catch(streamError);

// async function setLocalStream(stream) {
//     localStream = stream;
//     localVideo.srcObject = stream;
// }

// async function getUserMedia(ifAudio, ifVideo) {
//     let stream;
//     try {
//         stream = await navigator.mediaDevices.getUserMedia({audio: ifAudio, video: ifVideo});
//     } catch(error) {
//         console.error("navigator.getUserMedia error=", error);
//     }
//     await setLocalStream(stream);
//     return stream
// }