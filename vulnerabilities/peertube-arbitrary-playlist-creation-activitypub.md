---
description: CVE-2025-32946 Medium severity. PeerTube Arbitrary Playlist Creation via ActivityPub Protocol
title: PeerTube Arbitrary Playlist Creation via ActivityPub Protocol
date_published: "2025-04-14"
last_updated: "2025-04-14"
xray_id:
vul_id: CVE-2025-32946
cvss: 5.3
severity: medium
discovered_by: Ori Hollander
type: vulnerability
---
## Summary
This vulnerability allows any attacker to add playlists to a different user’s channel using the ActivityPub protocol.

## Component

[PeerTube](https://github.com/Chocobozzz/PeerTube)



## Affected versions

(, 7.1.1)



## Description

If federation is enabled (which is the default), PeerTube listens for POST requests to the **/inbox** path. This path is used for receiving ActivityPub activities. One of the possible activities is the Create Activity, which creates different objects on the server. One of the objects that may be created is a playlist. The **createOrUpdateVideoPlaylist** function is in charge of creating the playlist. In it, the **setVideoChannel** function is called to set the video channel that the playlist will belong to:

```js
async function setVideoChannel (playlistObject: PlaylistObject, playlistAttributes: AttributesOnly<VideoPlaylistModel>) {
  ...

  const actor = await getOrCreateAPActor(getAPId(playlistObject.attributedTo[0]), 'all')

  ...

  playlistAttributes.videoChannelId = actor.VideoChannel.id
  playlistAttributes.ownerAccountId = actor.VideoChannel.Account.id
}
```

This code sets the owner of the new playlist to be the user who performed the request, and then sets the associated channel to the channel ID supplied by the request, without checking if it belongs to the user. This will allow any user to create a playlist in any existing channel on the server. The playlist will be owned by the attacking user, thus only the attacking user will be able to add and remove videos or change the properties of the playlist, while it will be listed in the web interface as belonging to a different user’s channel.



This code sets the channel ID of the playlist to the channel ID from the **attributedTo** attribute of the Playlist object passed in the Create Activity without checking if the channel is owned by the actor who signed the activity or belongs to the server that the activity came from. It then sets the owner of the playlist to the owner of the channel. This will allow any attacker to create a playlist in any existing channel on the server. The playlist will be owned by the attacked user, thus the attacked user will be able to add and remove videos or change the properties of the playlist, but as long as the attacked user didn’t notice the attack, the playlist will be listed in its channel.

It is also possible to trigger the attack by causing the server to actively fetch activities from a remote server. This can be done in different ways, for example by using the **/api/v1/search/video-channels** path, and passing the **search** argument with a URL that can be used for the attack. This can be done only if users have the ability to search remote URIs (**search.remote_uri** in the configuration), which by default is enabled for registered users.



## PoC

This PoC assumes that there is a PeerTube instance on the machine listening on ports 3000 (client) and 9000 (server). We also assume that there is a channel called **root_channel**, belonging to the root user. For simplifying the PoC, we set the **prevent_ssrf** configuration to **false**, allowing us to create an attacking server easily on the same machine.



1. Edit the file **malicious_rest_server.py**. There is a commented out line that says “INSERT VIDEO HERE”. Under that line, replace the URL with a url of a valid video on the PeerTube server. You can find one by surfing to [**http://localhost:3000/api/v1/videos**](http://localhost:3000/api/v1/videos) and copying the URL of one of the public videos.

1. In a terminal, run the following command (you will need to install the **flask** package for python if it is not installed on the system):

   ```
   python malicious_rest_server.py
   ```

   This will start a server listening on port 1234.

1. In another terminal, run the following command (you will need to install the **cryptography** and **requests** packages for python if they are not installed on the system):

   ```
   python send_inbox_activity.py
   ```

   This script will create, sign and send a Create Activity to **http://localhost:9000/inbox**.

1. If everything was configured correctly, a new playlist will be created in **root_channel**, containing one video, and with a picture of a cat as the playlist’s thumbnail.

## Vulnerability Mitigations

No mitigations are supplied for this issue



## References

[Fix release](https://github.com/Chocobozzz/PeerTube/releases/tag/v7.1.1)
