
async function feed(root, args, context, info) {
  // In case there is a filter carried by the incoming args, you’re constructing a 'where' 
  // object that expresses two filter conditions.
  const where = args.filter ? {
    OR: [
      { description_contains: args.filter },
      { url_contains: args.filter },
    ],
  } : {}

  // Using filters, Limit-Offset pagination and Sorting
  const links = await context.prisma.links({ 
    where,  // use the where object to filter out link elements that dont adhere the specified conditions
    skip: args.skip, // The start index is called skip, since you’re skipping that many elements in the list before collecting the items to be returned. Default is 0, if not provided
    first: args.first, // The limit is called first, meaning you’re grabbing the first x elements after a provided start index
    orderBy: args.orderBy // sorting the links
  });

  // using the linksConnection query from the Prisma client API to retrieve the total number of Link elements currently stored in the database.
  const count = await context.prisma.linksConnection({
    where,
  }).aggregate().count()

  //  The links and count are then wrapped in an object to adhere to the Feed type
  return {
    links, 
    count
  };

};

module.exports = {
    feed,
}