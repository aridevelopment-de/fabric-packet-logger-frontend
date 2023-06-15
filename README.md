# ⚠️ Main Project no longer maintained (and what happens with the frontend)

> Since I don't have the time to work on the frontend and the backend, I will discontinue **this** PacketLogger project. But don't worry, the frontend won't be for nothing.  
Developing on both sides takes up a lot of time, especially if you want to implement cool new features on the frontend while the backend contains bugs that must be fixed as to aid users. It's been tough doing that at the same time and I do not wan't to do that anymore. I am mainly a web-developer and I want to continue this passion.  
That's why I will stop developing the mod.  
**But:** The frontend will be moved to [wisp-forest/gadget](https://github.com/wisp-forest/gadget/). At least that is the current idea. It might take up some weeks before everything is set in place, so I highly encourage you to switch over to gadget if you need an alternative atm.  
It has been a pleasent journey working on packetlogger. I learned much about minecraft modding in itself, minecraft packet structure and met wonderful people on the way. If you have some questions, hmu on [Twitter](https://twitter.com/@AriOnIce24) or [Discord](https://aridevelopment.de/dc)

I will create a seperate project, most likely a fork of this one, in the future when starting work again. You can receive updates about this one in the [Discord](https://aridevelopment.de/dc)


# Fabric Packet Logger

I use this for development at [thejocraft.net](https://thejocraft.net). Yes, the code may not be the best. If you want to improve it, do it and open a pull request.

# Packet-Logger Frontend

This project contains the frontend for the [fabric-packet-logger](https://github.com/aridevelopment-de/fabric-packet-logger) project. It's written in pure react using some [mantine](https://mantine.dev) components.


## Websocket

The web-ui connects to the websocket server started by the client. A url parameter `?wssPort` controls the port being used.

## Features

- List of packets
  - Timestamp
  - Wiki.vg name
  - Internal Name (mappings still missing, sorry)
  - Packet Data highlighting
- Packet Filter
  - Whitelist
  - Blacklist
- Packet inspector
  - URL to wiki.vg section
  - Description of packet
  - Description of each packet field
  - wiki.vg note
  - Meta information such as packet id, internal name (hopefully with mappings soon enough), direction, ...
  - Custom Adapters for certain packets (e.g. MapUpdateAdapter, see below)


## Previews

Overview:
![https://cdn.discordapp.com/attachments/598256161212596235/1093634774763065475/image.png](https://cdn.discordapp.com/attachments/598256161212596235/1093634774763065475/image.png)

MapUpdateAdapter:
![https://cdn.discordapp.com/attachments/598256161212596235/1093635306244280431/image.png](https://cdn.discordapp.com/attachments/598256161212596235/1093635306244280431/image.png)
