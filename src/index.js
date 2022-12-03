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
