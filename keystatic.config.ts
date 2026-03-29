import { config, collection, fields } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  ui: {
    brand: {
      name: "Portfolio CMS",
    },
  },
  collections: {
    posts: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "content/blog/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { length: { max: 120 } } },
        }),
        description: fields.text({
          label: "Description",
          multiline: true,
          validation: { length: { max: 300 } },
        }),
        date: fields.date({ label: "Publish Date", validation: { isRequired: true } }),
        updated: fields.date({ label: "Last Updated" }),
        published: fields.checkbox({ label: "Published", defaultValue: true }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        image: fields.image({
          label: "Cover Image",
          directory: "public/static/blog",
          publicPath: "/static/blog/",
        }),
        author: fields.text({
          label: "Author",
          defaultValue: "Themistoklis Baltzakis",
        }),
        content: fields.mdx({
          label: "Content",
        }),
      },
    }),
  },
});
