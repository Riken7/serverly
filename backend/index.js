const express = require('express');
const YAML = require('yamljs');
const exec =  require('child_process').exec;
const os =  require('os');

const config =  YAML.load('config.yaml');
const app = express();
const port = config.port;

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

app.listen(port , () =>{
  console.log(`Server is running on ${port}`);
})
