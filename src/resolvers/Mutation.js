const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { APP_SECRET, getUserId } = require('../utils');


async function signup(parent, args, context, info) {
    // 1 encrypt user's password
    const password = await bcrypt.hash(args.password, 10)

    // 2 using prisma client instance to store new users in the database
    const user = await context.prisma.createUser({...args, password})

    // 3 generate a JWT for the new user created and sign it with an APP_SECRET
    const token = jwt.sign({ userId: user.id}, APP_SECRET)

    // 4 return token and the new   user which adheres to the shape of AuthPayload
    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {

    // 1 using prisma client instance to retrieve existing user record by email
    const user = await context.prisma.user({ email: args.email})
    if(!user) {
        throw new Error('No such user found')
    }

    // 2 compare entered password to the password of the user in database
    const valid = await bcrypt.compare(args.password, user.password)
        if (!valid) {
            throw new Error('Invalid password')
        }
    

    const token = jwt.sign({ userId: user.id }, APP_SECRET)

    return {
        token,
        user,
    }   
}

function post(parent, args, context, info) {
    
    
    // 1 validate the incoming JWT with the getUserId helper function
    const userId = getUserId(context);

    return context.prisma.createLink({
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    })
}

async function vote(parent, args, context, info) {

    // 1 validate the incoming JWT with the getUserId helper function
    const userId = getUserId(context); 

    /** 
     * 2. Prisma client API also generates one $exists function per model. The $exists function takes a where
     * filter object that allows to specify certain conditions about elements of that type. Only if the condition applies
     * to at least one element in the database, the $exists function returns true.  
     * 
     * If $exists returns false, the createVote method will be used to create a new Vote that’s connected to the User and the Link.
     * */  
    
    const voteExists = await context.prisma.$exists.vote({
        user: { id: userId },
        link: { id: args.linkId },
    })
    if (voteExists) {
        throw new Error(`Already voted for link: ${args.linkId}`)
    }

    // 3 If $exists returns false, the createVote method will be used to create a new Vote that’s connected to the User and the Link.
    return context.prisma.createVote({
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } },
    })
}

module.exports = {
    signup,
    login, 
    post,
    vote,
}