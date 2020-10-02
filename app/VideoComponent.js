import React from "react";
import Video from "twilio-video";
import axios from "axios";

import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import { Card, CardHeader, CardText } from "material-ui/Card";

export default class VideoComponent extends React.Component {
  constructor() {
    super();
    this.localMedia = React.createRef();
    this.state = {
      identity: null,
      token: null,
      roomName: "",
      roomNameErr: false,
      previousTracks: null,
      localMediaAvaialble: false,
      hasJoinedRoom: false,
      activeRoom: null,
    };

    this.joinRoom = this.joinRoom.bind(this);
    this.handleRoomNameChange = this.handleRoomNameChange.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
  }

  componentDidMount() {
    axios.get("/token").then((results) => {
      const { identity, token } = results.data;
      this.setState({ identity, token });
    });
  }

  handleRoomNameChange(e) {
    let roomName = e.target.value;
    this.setState({ roomName });
  }

  joinRoom() {
    const { roomName, previousTracks, token } = this.state;

    if (!roomName.trim()) {
      this.setState({ roomNameErr: true });
      return;
    }

    console.log(`Joining room ${roomName} ...`);

    let connectOptions = {
      name: roomName,
    };

    if (previousTracks) {
      connectOptions.tracks = previousTracks;
    }

    Video.connect(token, connectOptions).then(this.roomJoined, (error) => {
      alert(`Could not connect to Twilio ${error.message}`);
    });
  }

  attachTracks(tracks, container) {
    tracks.forEach((track) => {
      container.appendChild(track.attach());
    });
  }

  attachParticipantTracks(participant, container) {
    var tracks = Array.from(participant.tracks.values());
    this.attachTracks(tracks, container);
  }

  roomJoined(room) {
    const { identity } = this.state;
    console.log(`Joined as ${identity}`);
    this.setState({
      activeRoom: room,
      localMediaAvaialble: true,
      hasJoinedRoom: true, // remove join room button and add leave room button
    });

    

    // Attach LocalParticipant's tracks to the DOM, if not already attached.
    var previewContainer = this.localMedia.current;

    console.log(previewContainer, "*********");

    if (!previewContainer) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }
  }

  render() {
    const { localMediaAvaialble, hasJoinedRoom, roomNameErr } = this.state;

    let showLocalTrack = localMediaAvaialble ? (
      <div className="flex-item">
        <div ref={this.localMedia} />
      </div>
    ) : (
      ""
    );

    let joinOrLeaveRoomButton = hasJoinedRoom ? (
      <RaisedButton
        label="Leave Room"
        secondary={true}
        onClick={() => alert("Leave Room")}
      />
    ) : (
      <RaisedButton label="Join Room" primary={true} onClick={this.joinRoom} />
    );

    return (
      <Card>
        <CardText>
          <div className="flex-container">
            {showLocalTrack}
            <div className="flex-item">
              <TextField
                hintText="Room name"
                onChange={this.handleRoomNameChange}
                errorText={roomNameErr ? "Room name is required" : undefined}
              />
              <br />
              {joinOrLeaveRoomButton}
            </div>
            <div className="flex-item"></div>
          </div>
        </CardText>
      </Card>
    );
  }
}
