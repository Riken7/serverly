const express = require('express');
const YAML = require('yamljs');
const exec =  require('child_process').exec;
const os =  require('os');
const fs = require('fs');
const path = require('path');
const {listServices, getServiceLogs} = require('./services');
const configPath = path.resolve(process.env.HOME, ".config/serverly.yaml");

let config;
try {
  config = YAML.load(configPath);
} catch (e) {
  console.error('Failed to load config:', e);
  process.exit(2);
}

const app = express();
const port = config.port;
fs.watchFile(configPath, (curr, prev) => {
  try {
    config = YAML.load(configPath);
    console.log('Config reloaded...');
  } catch (e) {
    console.error('Failed to reload config:', e);
  }
});

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));


function format(bytes){
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return `${Number((bytes/Math.pow(1024,i)).toFixed(2))} ${sizes[i]}`;
}

function getStats() {
  return {
    cpuLoad: os.loadavg(),
    memory: {
      total: format(os.totalmem()),
      free: format(os.freemem()),
      used: format(os.totalmem() - os.freemem())
    }
  };
}
function getDiskStats() {
  return new Promise((resolve, reject) => {
    exec("df -h", (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

function getUptime() {
  return os.uptime();
}

app.get('/onepulse/api/config', (req, res) => {
    res.json(config);
});

app.get('/onepulse/api/stats', (req,res)=>{
  if(!config.sections.stats) return res.json({});
  const stats = getStats();
  res.json({ stats: stats });
})
app.get('/onepulse/api/disk', async (req, res) => {
  if (!config.sections.disk) return res.json({});
  try {
    const diskStats = await getDiskStats();
    res.json({ disk: diskStats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve disk stats' });
  }
});

app.get('/onepulse/api/uptime', (req, res) => {
  if (!config.sections.uptime) return res.json({});
  const uptime = getUptime();
  res.json({ uptime: uptime });
});

app.get('/onepulse/api/services', (req, res) => {
  listServices(config, res);
});

app.get('/onepulse/api/services/logs/:name', (req, res) => {
  getServiceLogs(req, res);
});

app.get("/onepulse/api/docker", (req, res) => {
  exec("docker ps -a --format '{{.Names}} {{.State}}'", (err, stdout) => {
    if (err) return res.status(500).json({ error: "Failed to list containers" });
    const containers = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, status] = line.split(" ");
        return { name, status: status === "running" ? "running" : "stopped" };
      });
    res.json({ containers });
  });
});

app.get("/onepulse/api/docker/logs/:name", (req, res) => {
  const { name } = req.params;
  exec(`docker logs --tail 100 ${name}`, (err, stdout) => {
    if (err) return res.status(500).send("Failed to get logs");
    res.type("text/plain").send(stdout);
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(port , () =>{
  console.log(`Server is running on ${port}`);
})
