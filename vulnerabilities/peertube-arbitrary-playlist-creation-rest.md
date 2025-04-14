---
description: CVE-2025-32945 Medium severity. PeerTube Arbitrary Playlist Creation via REST API
title: PeerTube Arbitrary Playlist Creation via REST API
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-32945
cvss: 4.3
severity: medium
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows an existing user to add playlists to a different user’s channel using the REST API.

## Component

[PeerTube](https://github.com/Chocobozzz/PeerTube)



## Affected versions

(, 7.1.1)



## Description

The server listens for POST requests to the **/api/v1/video-playlists** path. This path is used for adding a playlist to the PeerTube instance. The **createVideoPlaylist** function receives the request parameters and is in charge of creating the playlist. The following code sets all the parameters of the playlist:

```js
const videoPlaylist = new VideoPlaylistModel({
    name: videoPlaylistInfo.displayName,
    description: videoPlaylistInfo.description,
    privacy: videoPlaylistInfo.privacy || VideoPlaylistPrivacy.PRIVATE,
    ownerAccountId: user.Account.id
}) as MVideoPlaylistFull

videoPlaylist.url = getLocalVideoPlaylistActivityPubUrl(videoPlaylist) // We use the UUID, so set the URL after building the object

if (videoPlaylistInfo.videoChannelId) {
  const videoChannel = res.locals.videoChannel

  videoPlaylist.videoChannelId = videoChannel.id
  videoPlaylist.VideoChannel = videoChannel
}

```

This code sets the owner of the new playlist to be the user who performed the request, and then sets the associated channel to the channel ID supplied by the request, without checking if it belongs to the user. This will allow any user to create a playlist in any existing channel on the server. The playlist will be owned by the attacking user, thus only the attacking user will be able to add and remove videos or change the properties of the playlist, while it will be listed in the web interface as belonging to a different user’s channel.



## PoC

This PoC assumes that there is a PeerTube instance on the machine listening on ports 3000 (client) and 9000 (server). We also assume that there are 2 existing users on the instance: the default root user and a low privileged user.
1. First, using a browser, log in to the PeerTube instance with the low privileged user’s credentials, and use the inspection screen to copy the authorization token of the user.

1. Browse to [**http://localhost:3000/api/v1/video-channels**](http://localhost:3000/api/v1/video-channels) and find a video-channel to attack. If there is none, add one to the root user using the web interface. The ID number of the channel will be needed for the next step.

1. Run the following command (insert the user token and channel ID in the proper places):

   ```
   curl 'http://localhost:3000/api/v1/video-playlists' -H 'Authorization: Bearer user_token' -F "displayName=playlist" -F "videoChannelId=channel_id" -F "privacy=1"
   ```

   

1. Browse to [**http://localhost:3000/api/v1/video-playlists**](http://localhost:3000/api/v1/video-playlists). The new playlist will be listed there with the attacking user listed as the owner and the attacked channel listed as the playlist’s channel.

1. Using the web interface it will be possible to see the playlist listed in the attacked channel. The attacked user will not see it listed in the “My Library” page, nor will they be able to add or remove videos from it. The attacking user will see it listed under the “My Library” page, and will be able to add or remove videos to it.



## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix release](https://github.com/Chocobozzz/PeerTube/releases/tag/v7.1.1)
