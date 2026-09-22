const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");
const productStore = require("../data/products");

// Client asks for EXACTLY the fields it needs -> no over-fetching.
const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    price: { type: GraphQLFloat },
    category: { type: GraphQLString },
    stock: { type: GraphQLInt },
    description: { type: GraphQLString },
    vendor: { type: GraphQLString },
    rating: { type: GraphQLFloat }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    product: {
      type: ProductType,
      args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
      resolve(parent, args) {
        return productStore.getById(args.id);
      }
    },
    products: {
      type: new GraphQLList(ProductType),
      args: {
        category: { type: GraphQLString },
        limit: { type: GraphQLInt }
      },
      resolve(parent, args) {
        let results = productStore.getAll();
        if (args.category) {
          results = results.filter(
            (p) => p.category.toLowerCase() === args.category.toLowerCase()
          );
        }
        if (args.limit) {
          results = results.slice(0, args.limit);
        }
        return results;
      }
    }
  }
});

module.exports = new GraphQLSchema({ query: RootQuery });
