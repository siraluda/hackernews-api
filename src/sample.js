const { prisma } = require('../prisma/--/src/generated/prisma-client')

async function main() {

    // create a new link
    const newLink = await prisma.createLink({
        url: 'www.prisma.io',
        description: 'Prisma replaces traditional ORMs',
    })
    console.log(`Created new link: ${newLink.url} (ID: ${newLink.id})`)

    // Read all links from the database and print them to console
    const allLinks = await prisma.links()
    console.log(allLinks)
}

main().catch(e => console.error(e))