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

On our WSL, as well as our droplets, we will be creating a few directories.
We will repeat these commands in WSL as well as both droplets:

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

And now that we have node installed, we're going to start a node project in the src directory we created:

```
cd src
npm init
## This will give you a basic template which you can press enter through...
npm i fastify
```

In our WSL, we will be creating an index.html as well as an index.js.

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



