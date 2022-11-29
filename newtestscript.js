const videoContainer = document.getElementById('video_container');
const myVideo = document.createElement("video");
myVideo.muted = true;
const socket = io("/");
var myPeer = new Peer(undefined, {
	host: 'peerjs-server.herokuapp.com',
	secure: true,
	port: 443
});
let peers = {};

navigator.mediaDevices.getUserMedia({
	video: true,
	audio: false
}).then((stream) => {
	
	addVideoStream(myVideo, stream);
	
	myPeer.on('call', (call) => {
		call.answer(stream);
		let video = document.createElement('video');
		call.on('stream', (userVideoStream) => {
			addVideoStream(video, userVideoStream);
		});
	});
	
	socket.on('user-connected', (userId) => {
		connectToNewUser(userId, stream);
	});
});

myPeer.on('open', (id) => {
	socket.emit('join-room', ROOM_ID, id);
});

socket.on('user-disconnected', (userId) => {
	if(peers[userId]) peers[userId].close();
});
	
function connectToNewUser(userId, stream) {

	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
	call.on('close', () => {
		video.remove();
	});
	peers[userId] = call;
}

function addVideoStream(video, stream){
	
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.width = 213;
		video.height = 120;
		video.play();
	});
	videoContainer.append(video);
}
