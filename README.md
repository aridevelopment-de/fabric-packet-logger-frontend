# Packet-Logger Frontend

This project contains the frontend for the [fabric-packet-logger](https://github.com/aridevelopment-de/fabric-packet-logger) project. It's written in pure react using some [mantine](https://mantine.dev) components.


## Websocket

The web-ui connects to the websocket server started by the client. A url parameter `?wssPort` controls the port being used.

## Features

- List of packets
  - Wiki.vg information on this packet and fields
  - Internal Name
  - Packet Data highlighting
- Packet Filter
- Packet inspector
  - All of list of packets
  - Custom Adapters for certain packets (e.g. MapUpdateAdapter, see below)


## Previews

*Previews may be outdated a bit*  

Overview:
![https://cdn.discordapp.com/attachments/598256161212596235/1093634774763065475/image.png](https://cdn.discordapp.com/attachments/598256161212596235/1093634774763065475/image.png)

MapUpdateAdapter:
![https://cdn.discordapp.com/attachments/598256161212596235/1093635306244280431/image.png](https://cdn.discordapp.com/attachments/598256161212596235/1093635306244280431/image.png)
