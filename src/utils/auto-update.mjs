import { exec } from 'child_process';
import { simpleGit } from 'simple-git';

const run = async (cmd) => {
  const child = exec(cmd, (err) => {
    if (err) console.error(err);
  });
  child.stderr.pipe(process.stderr);
  child.stdout.pipe(process.stdout);
  await new Promise((resolve) => child.on('close', resolve));
};

export async function autoUpdate(restart = false, log = console.log) {
  log('Restart command confirmed');
  // configure the instance with a custom configuration property
  const git = simpleGit();
  // any command executed will be prefixed with this config
  // runs: git -c http.proxy=someproxy pull
  await git.pull();
  log('Code updated');
  await run('npm install --legacy-peer-deps');
  log('Dependencies installed');
  if (restart) {
    await run('pm2 restart all');
  }
}

autoUpdate();
