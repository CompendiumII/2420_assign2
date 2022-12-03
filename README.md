# 2420_assign2

## Setting Up Infrastructure

We will begin by initializing some digital ocean infrastructure. 
We want to start by creating a VPC.

![vpc](https://user-images.githubusercontent.com/46077062/205429706-790b2b94-84c2-42d0-ae37-f21987e5520b.PNG)

Once this is created, we will create a firewall.

![firewall](https://user-images.githubusercontent.com/46077062/205429717-ae4d1d7c-d3e9-499d-ab9b-84e504254318.PNG)

After we have both the VPC and the firewall setup, we will initialize a loadbalancer.

![loadbalancer](https://user-images.githubusercontent.com/46077062/205429726-51a9930d-44af-4d4e-ae32-e2af88a05aa1.PNG)

## Creating New Users

Let's start with something simple. We're going to ensure our droplets are up-to-date.

```
sudo apt upgrade
sudo apt update
```

Next, we're going to create a new user and give it the proper permissions. We will also move over our ssh key so we can access the droplet.

```
useradd -ms /bin/bash kevin
usermod -aG sudo kevin
rsync --archive --chown=kevin:kevin ~/.ssh /home/kevin
```

Done!

## Installing Caddy

To install Caddy, we're going to use the following commands:

```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

It's that simple!

## Creating Web Application

We will now initialize a few directories and install some things.

We will be creating directories in WSL as well as **BOTH DROPLETS**!
We will repeat these commands for all 3:

```
mkdir 2420-assign-two
cd 2420-assign-two
mkdir html src
```

That's all for folder initialization...
In order for our web app to work, we need to install node and fastify:

```
curl https://get.volta.sh | bash
## After this first step we need to restart our terminal...
source ~/.bashrc
volta install node
```
Ensure node is installed.

![node_working](https://user-images.githubusercontent.com/46077062/205430790-06e21a6f-c7c6-4bde-98b5-1d1e1518a65e.png)

And now that we have node installed, we're going to start a node project in the src directory we created:

```
cd src
npm init
## This will give you a basic template which you can press enter through...
npm i fastify
```

Ensure volta is installed.

![volta](https://user-images.githubusercontent.com/46077062/205430798-64d1df4b-6556-4eb5-82a5-0b72fb36be7a.png)

## index.html and index.js Creation

The index.html belongs in the html directory and will look like:

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
	<p>Hello I like chocolate</p> 
</body>
</html>
```

And the index.js belongs in the src directory and will look like:

```
// Require framework
const fastify = require('fastify')({ logger: true })

// Declare route
fastify.get('/api', async (request, reply) => {
	return { hello: 'Server x' }
})

// Run server
const start = async () => {
	try {
		await fastify.listen({ port: 5050 })
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}

// Start
start()
```

Perfect, we will move these to the droplets later!

## Creating Caddyfile and Caddy Service File

We will create a Caddyfile in the 2420-assign-two directory of our WSL.

The Caddyfile will look like the following:

```
http://24.199.71.43 {
	root * /var/www
	reverse_proxy /api locahost:5050
	file_server
}
```

Additionally, we will create a caddy.service file that looks like the following:

```
[Unit]
Description=caddy.service to serve HTML
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/caddy run --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
KillMode-mixed

[Install]
WantedBy=multi-user.target
```

Done!

## Creating the hello_web Service File

We will create one more service file to ensure that our service restarts if it ever fails. This service file will execute node and index.js.

The service file looks like the following:

```
[Unit]
Description=Service file to restart node
After=network-online.target

[Service]
Type=notify
ExecStart=/home/kevin1/.volta/bin/node /home/kevin/2420-assign-two/src/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Great! Now we have all the required files to run our web app.

## Moving Files

The last step before we are able to test our web app is to move over all the files to the droplets.
We also need to ensure that the files are in the correct places so that we can run them.

On WSL, we will be utilizing SFTP to move our files over. We will be doing this on **BOTH DROPLETS**!

We can utilize the following to connect to our droplet:

```
sftp -i ~/.ssh/DO2_key kevin1@ip
```

And then we can put all of our files:

```
put Caddyfile
put caddy.service
put hello_web.service
```

To access the index files, we need to move into the directories before using SFTP:

```
## This is for the index.html file
cd 2420-assign-two
cd html
sftp -i ~/.ssh/DO2_key kevin1@ip
cd 2420-assign-two
cd html
put index.html
exit
## This is for the index.js file
cd ..
cd src
sftp -i ~/.ssh/DO2_key kevin1@ip
cd 2420-assign-two
cd src
put index.js
exit
```

And now that we have all of our files on our droplets, we need to ensure they are in the right place.

Let's start by moving our Caddyfile.
Move to where we put the Caddyfile, and we will use the following:

```
sudo cp Caddyfile /etc/caddy/
```

Next is the service files. We will be using the following:

```
sudo cp caddy.service /etc/systemd/system/
sudo cp hello_web.service /etc/systemd/system/
```

And finally we will be moving out HTML file from 2420-assign-two/html/:

```
sudo cp index.html /var/www/
```

Nice! We're done all the tedious work now...

## Enabling Services and Curl Testing

All we have to do now is to enable our services. Make sure we enable them on **BOTH DROPLETS**!
We can do this by using the following:

```
systemctl enable caddy.service
systemctl enable hello_web.service
systemctl start caddy.service
systemctl start hello_web.service
## Note that when we start hello_web.service, it will run endlessly, so we can ctrl + c out of this
```

And to test that the web app works, we can curl our ip:

```
curl 24.199.71.43
```

When we refresh, we should be able to see both droplets.

![curl](https://user-images.githubusercontent.com/46077062/205430766-d57e0c05-cb9e-4c3e-ba47-7cde0f98fd94.png)

That's all!


