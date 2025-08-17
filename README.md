# Serverly

**Serverly** is a lightweight monitoring dashboard for Linux servers.  
It provides system stats, uptime, disk usage, and service/docker status in a clean web UI.

- Real-time CPU, memory, disk, and uptime stats  
- Optional service monitoring (systemd)  
- Docker container list and logs  
- YAML-based configuration for flexibility

## Configuration

Serverly uses a YAML configuration file located at:
```bash 
~/.config/serverly.yaml
```
An example configuration file is provided in the repository as `serverly.yaml.example`.  
Copy or rename it to your config directory:

```bash
cp serverly.yaml.example ~/.config/serverly.yaml
```
EXAMPLE `serverly.yaml`
```bash
port: 3000
sections:
  uptime: true
  stats: true
  disk: true
  services:
    enabled: true
    filter:
      - ssh
      - bluetooth
  docker:
    enabled: false
    filter:
      - nginx
      - mysql
refreshInterval: 5
```
## Running the Backend

1. Navigate to the backend folder and start the server:

```bash
cd backend
node index.js
```
This will:
- Load configuration from ~/.config/serverly.yaml.
- Start an API server on the configured port.

2. Alternatively, you can set up a systemd service to run serverly in the background:

### Running as a systemd Service

You can set up **serverly** to run automatically in the background using `systemd`.

- Create a service file at `/etc/systemd/system/serverly.service`:

  ```ini
  [Unit]
  Description=Serverly Monitoring Service
  After=network.target

  [Service]
  ExecStart=/usr/bin/node </path/to/backend/index.js>
  WorkingDirectory=</path/to/backend>
  Restart=always
  User=<your-username>

  [Install]
  WantedBy=multi-user.target
  ```
<img width="1823" height="845" alt="image" src="https://github.com/user-attachments/assets/1ee8e662-ecfb-4b31-bea9-28c338a8aefa" />
