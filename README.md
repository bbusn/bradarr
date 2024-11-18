![Logo](https://cdn.busn.fr/bradarr/images/f25f629b-f698-4ba1-81b3-bf4e5d4f91ca.png)

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://www.gnu.org/licenses/gpl-3.0.fr.html) 

## Features

- Manage **jellyseerr** requests automatically
- Use plugins to **download movies** (You must have the rights to download each movie, bradarr assumes you own the film or bought it respectivly.)
- **Vpn** support with regular checks


## Screenshots

![App Screenshot](https://cdn.busn.fr/bradarr/images/885d782a-f3de-40e3-b4a5-46cda188e34f.png)

## Requirements

- [Jellyseerr](https://docs.jellyseerr.dev/)
- [1 or more download plugins](https://github.com/randy-march/)


## Environment Variables

Copy .env.example file and rename it to .env :

`PORT` Port on which the application will be running. Default is **6789**

## Installation

You can run bradarr locally by downloading source files but it's better to use it with **docker** by pulling the latest image :

### With docker

Make a docker-compose.yml file, or pull manually the image from **@bbusn/bradarr** :

```yaml


```
*coming soon*

### Without docker (Run locally)


Clone the project

```bash
  git clone https://github.com/bbusn/bradarr.git
```

Go to the project directory

```bash
  cd bradarr
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

Application is running by default here **http://localhost:6789**

You will be asked to setup the app, check below if you need help.

## Setup

When bradarr is runned for the first time it need some configuration.

## Feedback

If you have any feedback or issues, please send a message at benoit.busnardo@gmail.com